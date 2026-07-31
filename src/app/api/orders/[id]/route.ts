import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { OrderStatus, FulfillmentType, Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        delivery: true,
        items: {
          include: {
            menuItem: true,
            customization: {
              include: {
                size: true,
                crust: true,
                sauce: true,
                toppings: {
                  include: { topping: true },
                },
                addons: {
                  include: { addon: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Fetch single order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

// Explicit allowed state transitions enforced server-side
const ALLOWED_TRANSITIONS: Array<{
  from: OrderStatus;
  to: OrderStatus;
  allowedTypes: FulfillmentType[];
}> = [
  {
    from: OrderStatus.RECEIVED,
    to: OrderStatus.PREPARING,
    allowedTypes: [FulfillmentType.DINE_IN, FulfillmentType.PICKUP, FulfillmentType.DELIVERY],
  },
  {
    from: OrderStatus.PREPARING,
    to: OrderStatus.READY,
    allowedTypes: [FulfillmentType.DINE_IN, FulfillmentType.PICKUP, FulfillmentType.DELIVERY],
  },
  {
    from: OrderStatus.READY,
    to: OrderStatus.COMPLETED,
    allowedTypes: [FulfillmentType.DINE_IN, FulfillmentType.PICKUP],
  },
  {
    from: OrderStatus.READY,
    to: OrderStatus.OUT_FOR_DELIVERY,
    allowedTypes: [FulfillmentType.DELIVERY],
  },
  {
    from: OrderStatus.OUT_FOR_DELIVERY,
    to: OrderStatus.DELIVERED,
    allowedTypes: [FulfillmentType.DELIVERY],
  },
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, assignedDriverId, driverId } = body as {
      status?: OrderStatus;
      assignedDriverId?: string | null;
      driverId?: string | null;
    };

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { delivery: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle free-text driver assignment update if provided
    if (assignedDriverId !== undefined && currentOrder.delivery) {
      await prisma.delivery.update({
        where: { orderId: id },
        data: {
          assignedDriverId,
          assignedAt: currentOrder.delivery.assignedAt || new Date(),
        },
      });
    }

    // Handle relational driver assignment update if provided
    if (driverId !== undefined && currentOrder.delivery) {
      await prisma.delivery.update({
        where: { orderId: id },
        data: {
          driverId,
          assignedAt: new Date(),
        },
      });

      if (driverId) {
        await prisma.driver.update({
          where: { id: driverId },
          data: { isAvailable: false },
        });
      }
    }

    // Handle status update if provided
    if (status) {
      if (!Object.values(OrderStatus).includes(status)) {
        return NextResponse.json(
          { error: "Invalid order status enum" },
          { status: 400 }
        );
      }

      if (currentOrder.status !== status) {
        const transitionAllowed = ALLOWED_TRANSITIONS.some(
          (t) =>
            t.from === currentOrder.status &&
            t.to === status &&
            t.allowedTypes.includes(currentOrder.fulfillmentType)
        );

        if (!transitionAllowed) {
          return NextResponse.json(
            {
              error: `Invalid status transition from ${currentOrder.status} to ${status} for ${currentOrder.fulfillmentType} order.`,
            },
            { status: 400 }
          );
        }

        const updateData: Prisma.OrderUpdateInput = { status };

        switch (status) {
          case OrderStatus.PREPARING:
            updateData.preparingAt = new Date();
            break;
          case OrderStatus.READY:
            updateData.readyAt = new Date();
            break;
          case OrderStatus.COMPLETED:
            updateData.completedAt = new Date();
            break;
          case OrderStatus.OUT_FOR_DELIVERY:
            if (currentOrder.delivery) {
              await prisma.delivery.update({
                where: { orderId: id },
                data: { departedAt: new Date() },
              });
            }
            break;
          case OrderStatus.DELIVERED:
            updateData.completedAt = new Date();
            if (currentOrder.delivery) {
              await prisma.delivery.update({
                where: { orderId: id },
                data: { deliveredAt: new Date() },
              });

              const assignedDriverIdToFree =
                currentOrder.delivery.driverId || driverId;
              if (assignedDriverIdToFree) {
                await prisma.driver.update({
                  where: { id: assignedDriverIdToFree },
                  data: { isAvailable: true },
                });
              }
            }
            break;
        }

        await prisma.order.update({
          where: { id },
          data: updateData,
        });
      }
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        delivery: true,
        items: {
          include: {
            menuItem: true,
            customization: {
              include: {
                size: true,
                crust: true,
                sauce: true,
                toppings: { include: { topping: true } },
                addons: { include: { addon: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
