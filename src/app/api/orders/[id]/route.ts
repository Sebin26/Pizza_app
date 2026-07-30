import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { OrderStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
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

   // if (!Object.values(OrderStatus).includes(status)) {
//  return NextResponse.json(
 //   { error: "Invalid status" },
  //  { status: 400 }
//  );
//}

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
    const { status } = body as { status: OrderStatus };

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

    const validStatuses = ["RECEIVED", "PREPARING", "READY", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
  
}

