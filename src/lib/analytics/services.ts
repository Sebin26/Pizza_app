import { prisma } from "@/lib/db";

export type SalesResponse = {
  labels: string[];
  revenue: number[];
  orders: number[];
};

export type DeliveryResponse = {
  deliveriesToday: number;
  avgDeliveryTimeMinutes: number | null;
  activeDrivers: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  avgDriverLoad: number;
};

export type FulfillmentResponse = {
  counts: {
    dineIn: number;
    pickup: number;
    delivery: number;
  };
  percentages: {
    dineIn: number;
    pickup: number;
    delivery: number;
  };
};

export type KitchenResponse = {
  status: "normal" | "busy" | "high" | "critical";
  activeOrders: number;
  preparing: number;
  ready: number;
  outForDelivery: number;
  avgPrepTimeMinutes: number;
  longestWaitingOrder: {
    orderId: string;
    waitingMinutes: number;
  } | null;
  kitchenLoadPercent: number;
};

export type ActivityItem = {
  id: string;
  type:
    | "new_order"
    | "order_preparing"
    | "driver_assigned"
    | "order_delivered"
    | "pickup_completed"
    | "staff_login"
    | "menu_updated";
  message: string;
  timestamp: string;
};

export type ActivityResponse = {
  items: ActivityItem[];
};

/**
 * Computes sales metrics bucketed by hour (today) or day (7d / 30d).
 * Only includes COMPLETED and DELIVERED orders.
 */
export async function getSalesAnalytics(range: string = "7d"): Promise<SalesResponse> {
  const validRange = range === "today" || range === "30d" ? range : "7d";
  const now = new Date();

  if (validRange === "today") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["COMPLETED", "DELIVERED"] },
        createdAt: { gte: startOfToday },
      },
      select: { createdAt: true, total: true },
    });

    const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    const revenue = new Array(24).fill(0);
    const orderCounts = new Array(24).fill(0);

    for (const order of orders) {
      const hour = new Date(order.createdAt).getHours();
      if (hour >= 0 && hour < 24) {
        revenue[hour] += order.total;
        orderCounts[hour] += 1;
      }
    }

    return {
      labels,
      revenue: revenue.map((r) => Number(r.toFixed(2))),
      orders: orderCounts,
    };
  }

  const numDays = validRange === "30d" ? 30 : 7;
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (numDays - 1));

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["COMPLETED", "DELIVERED"] },
      createdAt: { gte: startDate },
    },
    select: { createdAt: true, total: true },
  });

  const labels: string[] = [];
  const dateKeys: string[] = [];
  const revenueMap: Record<string, number> = {};
  const ordersMap: Record<string, number> = {};

  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dateKeys.push(key);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    labels.push(label);
    revenueMap[key] = 0;
    ordersMap[key] = 0;
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toISOString().split("T")[0];
    if (revenueMap[key] !== undefined) {
      revenueMap[key] += order.total;
      ordersMap[key] += 1;
    }
  }

  const revenue = dateKeys.map((k) => Number((revenueMap[k] || 0).toFixed(2)));
  const ordersCountArr = dateKeys.map((k) => ordersMap[k] || 0);

  return {
    labels,
    revenue,
    orders: ordersCountArr,
  };
}

/**
 * Computes delivery analytics.
 */
export async function getDeliveryAnalytics(): Promise<DeliveryResponse> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [deliveriesToday, completedDeliveries, pendingDeliveries, activeDriversCount, completedTimes] =
    await Promise.all([
      prisma.delivery.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.delivery.count({
        where: { deliveredAt: { not: null } },
      }),
      prisma.delivery.count({
        where: {
          deliveredAt: null,
          order: { status: { not: "CANCELLED" } },
        },
      }),
      prisma.driver.count({
        where: { isActive: true },
      }),
      prisma.delivery.findMany({
        where: {
          deliveredAt: { not: null },
          departedAt: { not: null },
        },
        select: { departedAt: true, deliveredAt: true },
      }),
    ]);

  let avgDeliveryTimeMinutes: number | null = null;
  if (completedTimes.length > 0) {
    const totalDiffMinutes = completedTimes.reduce((acc, curr) => {
      if (curr.deliveredAt && curr.departedAt) {
        const diffMs = new Date(curr.deliveredAt).getTime() - new Date(curr.departedAt).getTime();
        return acc + Math.max(0, diffMs / (1000 * 60));
      }
      return acc;
    }, 0);
    avgDeliveryTimeMinutes = Number((totalDiffMinutes / completedTimes.length).toFixed(1));
  }

  const avgDriverLoad =
    activeDriversCount > 0 ? Number((pendingDeliveries / activeDriversCount).toFixed(1)) : 0;

  return {
    deliveriesToday,
    avgDeliveryTimeMinutes,
    activeDrivers: activeDriversCount,
    completedDeliveries,
    pendingDeliveries,
    avgDriverLoad,
  };
}

/**
 * Computes today's fulfillment breakdown.
 */
export async function getFulfillmentAnalytics(): Promise<FulfillmentResponse> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ordersToday = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfToday },
    },
    select: { fulfillmentType: true },
  });

  let dineIn = 0;
  let pickup = 0;
  let delivery = 0;

  for (const order of ordersToday) {
    if (order.fulfillmentType === "DINE_IN") dineIn++;
    else if (order.fulfillmentType === "PICKUP") pickup++;
    else if (order.fulfillmentType === "DELIVERY") delivery++;
  }

  const total = dineIn + pickup + delivery;
  if (total === 0) {
    return {
      counts: { dineIn: 0, pickup: 0, delivery: 0 },
      percentages: { dineIn: 0, pickup: 0, delivery: 0 },
    };
  }

  const dineInPct = Math.round((dineIn / total) * 100);
  const pickupPct = Math.round((pickup / total) * 100);
  const deliveryPct = Math.max(0, 100 - dineInPct - pickupPct);

  return {
    counts: { dineIn, pickup, delivery },
    percentages: {
      dineIn: dineInPct,
      pickup: pickupPct,
      delivery: deliveryPct,
    },
  };
}

/**
 * Computes kitchen status metrics.
 * Kitchen load formula:
 * Kitchen load percentage is computed as active orders divided by maximum target kitchen capacity (15 orders),
 * capped at 100%. Historical completed orders (COMPLETED, DELIVERED, CANCELLED) are excluded.
 */
export async function getKitchenAnalytics(): Promise<KitchenResponse> {
  const activeOrdersList = await prisma.order.findMany({
    where: {
      status: { in: ["RECEIVED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const activeOrders = activeOrdersList.length;
  let preparing = 0;
  let ready = 0;
  let outForDelivery = 0;

  for (const o of activeOrdersList) {
    if (o.status === "PREPARING") preparing++;
    else if (o.status === "READY") ready++;
    else if (o.status === "OUT_FOR_DELIVERY") outForDelivery++;
  }

  // Target kitchen capacity for load calculations
  const TARGET_KITCHEN_CAPACITY = 15;
  const kitchenLoadPercent = Math.min(100, Math.round((activeOrders / TARGET_KITCHEN_CAPACITY) * 100));

  let status: "normal" | "busy" | "high" | "critical" = "normal";
  if (kitchenLoadPercent >= 85) {
    status = "critical";
  } else if (kitchenLoadPercent >= 60) {
    status = "high";
  } else if (kitchenLoadPercent >= 30) {
    status = "busy";
  }

  const now = Date.now();
  let longestWaitingOrder: { orderId: string; waitingMinutes: number } | null = null;

  if (activeOrdersList.length > 0) {
    // Oldest active order (RECEIVED or PREPARING preferably, or any active order)
    const oldest = activeOrdersList[0];
    const diffMs = now - new Date(oldest.createdAt).getTime();
    const waitingMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    longestWaitingOrder = {
      orderId: oldest.orderNumber || oldest.id.slice(0, 8),
      waitingMinutes,
    };
  }

  // Calculate average prep time for completed prep orders today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const completedPrepOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfToday },
      readyAt: { not: null },
    },
    select: { createdAt: true, preparingAt: true, readyAt: true },
  });

  let avgPrepTimeMinutes = 15; // default fallback if no prep metrics today
  if (completedPrepOrders.length > 0) {
    const totalPrepMs = completedPrepOrders.reduce((sum, o) => {
      const startTime = o.preparingAt ? new Date(o.preparingAt).getTime() : new Date(o.createdAt).getTime();
      const endTime = new Date(o.readyAt!).getTime();
      return sum + Math.max(0, endTime - startTime);
    }, 0);
    avgPrepTimeMinutes = Math.round(totalPrepMs / completedPrepOrders.length / (1000 * 60));
  }

  return {
    status,
    activeOrders,
    preparing,
    ready,
    outForDelivery,
    avgPrepTimeMinutes,
    longestWaitingOrder,
    kitchenLoadPercent,
  };
}

/**
 * Computes recent activity feed derived from order and delivery timestamps.
 * Maximum 20 newest entries.
 */
export async function getActivityAnalytics(): Promise<ActivityResponse> {
  const [recentOrders, recentDeliveries] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        fulfillmentType: true,
        status: true,
        createdAt: true,
        preparingAt: true,
        readyAt: true,
        completedAt: true,
      },
    }),
    prisma.delivery.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        assignedAt: true,
        departedAt: true,
        deliveredAt: true,
        order: {
          select: { orderNumber: true },
        },
      },
    }),
  ]);

  const items: ActivityItem[] = [];

  for (const o of recentOrders) {
    if (o.createdAt) {
      items.push({
        id: `new_${o.id}`,
        type: "new_order",
        message: `Order #${o.orderNumber} placed by ${o.customerName}`,
        timestamp: o.createdAt.toISOString(),
      });
    }
    if (o.preparingAt) {
      items.push({
        id: `prep_${o.id}`,
        type: "order_preparing",
        message: `Order #${o.orderNumber} is now being prepared`,
        timestamp: o.preparingAt.toISOString(),
      });
    }
    if (o.completedAt && o.fulfillmentType === "PICKUP") {
      items.push({
        id: `pickup_${o.id}`,
        type: "pickup_completed",
        message: `Pickup completed for Order #${o.orderNumber}`,
        timestamp: o.completedAt.toISOString(),
      });
    }
  }

  for (const d of recentDeliveries) {
    const orderNum = d.order?.orderNumber || "N/A";
    if (d.assignedAt) {
      items.push({
        id: `driver_${d.id}`,
        type: "driver_assigned",
        message: `Driver assigned to Order #${orderNum}`,
        timestamp: d.assignedAt.toISOString(),
      });
    }
    if (d.deliveredAt) {
      items.push({
        id: `deliv_${d.id}`,
        type: "order_delivered",
        message: `Order #${orderNum} delivered`,
        timestamp: d.deliveredAt.toISOString(),
      });
    }
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    items: items.slice(0, 20),
  };
}
