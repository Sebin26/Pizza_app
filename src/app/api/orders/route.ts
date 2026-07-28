import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma, OrderStatus } from "@prisma/client"; // FulfillmentType
import { z } from "zod";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.OrderWhereInput = {};

    if (status) {
  if (status === "ACTIVE") {
    where.status = {
      in: [
        OrderStatus.RECEIVED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
      ],
    };
  } else {
    where.status = status as OrderStatus;
  }
}

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { orderNumber: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}


const orderItemCustomizationSchema = z.object({
  sizeId: z.string().optional(),
  crustId: z.string().optional(),
  sauceId: z.string().optional(),
  toppingIds: z.array(z.string()).default([]),
  addonIds: z.array(z.string()).default([]),
});

const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
  customization: orderItemCustomizationSchema.optional(),
});

const createOrderSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().optional().nullable(),
  fulfillmentType: z
    .enum(["DINE_IN", "PICKUP", "DELIVERY"])
    .default("DINE_IN"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      fulfillmentType,
      items,
    } = result.data;    

    // Token generation moved inside the transaction to ensure atomic sequential ordering

    // 2. Calculate dynamic prep time
    const activeQueueCount = await prisma.order.count({
      where: {
        status: {
          in: [
            OrderStatus.RECEIVED,
            OrderStatus.PREPARING,
          ],
        },
      },
    });

    const basePrepConfig = await prisma.systemConfig.findUnique({ where: { key: "basePrepTime" } });
    const perOrderConfig = await prisma.systemConfig.findUnique({ where: { key: "prepTimePerActiveOrder" } });
    
    const basePrepTime = basePrepConfig ? parseInt(basePrepConfig.value) : 15;
    const prepTimePerOrder = perOrderConfig ? parseInt(perOrderConfig.value) : 5;
    const estimatedPrepMin = basePrepTime + (activeQueueCount * prepTimePerOrder);

    // 3. Resolve configurations and fetch items to verify prices server-side
    // Pre-fetch configs for validation speed
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) } },
    });

    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    // Fetch all needed customizer options
    const sizeIds = items.map((i) => i.customization?.sizeId).filter(Boolean) as string[];
    const crustIds = items.map((i) => i.customization?.crustId).filter(Boolean) as string[];
    const sauceIds = items.map((i) => i.customization?.sauceId).filter(Boolean) as string[];
    const toppingIds = items.flatMap((i) => i.customization?.toppingIds || []);
    const addonIds = items.flatMap((i) => i.customization?.addonIds || []);

    const [sizes, crusts, sauces, toppings, addons] = await Promise.all([
      prisma.pizzaSize.findMany({ where: { id: { in: sizeIds } } }),
      prisma.pizzaCrust.findMany({ where: { id: { in: crustIds } } }),
      prisma.pizzaSauce.findMany({ where: { id: { in: sauceIds } } }),
      prisma.pizzaTopping.findMany({ where: { id: { in: toppingIds } } }),
      prisma.pizzaAddon.findMany({ where: { id: { in: addonIds } } }),
    ]);

    const sizeMap = new Map(sizes.map((s) => [s.id, s]));
    const crustMap = new Map(crusts.map((c) => [c.id, c]));
    const sauceMap = new Map(sauces.map((s) => [s.id, s]));
    const toppingMap = new Map(toppings.map((t) => [t.id, t]));
    const addonMap = new Map(addons.map((a) => [a.id, a]));

    let orderSubtotal = 0;

    const validatedItems = items.map((item) => {
      const dbMenuItem = menuItemMap.get(item.menuItemId);
      if (!dbMenuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }

      let unitPrice = dbMenuItem.basePrice;

      if (dbMenuItem.isPizza && item.customization) {
        const cust = item.customization;
        const size = cust.sizeId ? sizeMap.get(cust.sizeId) : null;
        const crust = cust.crustId ? crustMap.get(cust.crustId) : null;
        const sauce = cust.sauceId ? sauceMap.get(cust.sauceId) : null;

        // Base pizza price factor
        if (size) {
          unitPrice = (unitPrice * size.priceFactor) + size.priceAdd;
        }
        if (crust) {
          unitPrice += crust.price;
        }
        if (sauce) {
          unitPrice += sauce.price;
        }

        // Add toppings
        for (const tId of cust.toppingIds) {
          const top = toppingMap.get(tId);
          if (top) unitPrice += top.price;
        }

        // Add addons
        for (const aId of cust.addonIds) {
          const add = addonMap.get(aId);
          if (add) unitPrice += add.price;
        }
      }

      unitPrice = parseFloat(unitPrice.toFixed(2));
      const itemTotalPrice = parseFloat((unitPrice * item.quantity).toFixed(2));
      orderSubtotal += itemTotalPrice;

      return {
        ...item,
        unitPrice,
        totalPrice: itemTotalPrice,
      };
    });

    const taxRateConfig = await prisma.systemConfig.findUnique({ where: { key: "taxRate" } });
    const taxRate = taxRateConfig ? parseFloat(taxRateConfig.value) : 0.10;
    
    orderSubtotal = parseFloat(orderSubtotal.toFixed(2));
    const taxAmount = parseFloat((orderSubtotal * taxRate).toFixed(2));
    const totalAmount = parseFloat((orderSubtotal + taxAmount).toFixed(2));

    // 4. Create the Order in a transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      let countToday = await tx.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
      });

      const month = String(startOfDay.getMonth() + 1).padStart(2, "0");
      const day = String(startOfDay.getDate()).padStart(2, "0");
      let tokenNumber = `${month}${day}-${String(countToday + 1).padStart(3, "0")}`;

      // Guarantee unique token validation to prevent race conditions or daily reset conflicts
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const existing = await tx.order.findUnique({
          where: { orderNumber: tokenNumber },
        });
        if (!existing) {
          isUnique = true;
        } else {
          countToday++;
          tokenNumber = `${month}${day}-${String(countToday + 1).padStart(3, "0")}`;
          attempts++;
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: tokenNumber,
          customerName,
          customerPhone,
          fulfillmentType,
          status: OrderStatus.RECEIVED,
          estimatedPrepMin,
          subtotal: orderSubtotal,
          tax: taxAmount,
          total: totalAmount,
        },
      });

      for (const item of validatedItems) {
        const createdItem = await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
          },
        });

        if (item.customization && menuItemMap.get(item.menuItemId)?.isPizza) {
          const cust = item.customization;
          const createdCust = await tx.orderItemCustomization.create({
            data: {
              orderItemId: createdItem.id,
              sizeId: cust.sizeId,
              crustId: cust.crustId,
              sauceId: cust.sauceId,
            },
          });

          if (cust.toppingIds.length > 0) {
            await tx.orderItemTopping.createMany({
              data: cust.toppingIds.map((tId) => ({
                orderItemCustomizationId: createdCust.id,
                toppingId: tId,
              })),
            });
          }

          if (cust.addonIds.length > 0) {
            await tx.orderItemAddon.createMany({
              data: cust.addonIds.map((aId) => ({
                orderItemCustomizationId: createdCust.id,
                addonId: aId,
              })),
            });
          }
        }
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        estimatedPrepMin: newOrder.estimatedPrepMin,
        total: newOrder.total,
        status: newOrder.status,
      },
    });
  } catch (error) {
    console.error("Create order transaction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to submit order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
