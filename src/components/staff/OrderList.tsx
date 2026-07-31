"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import OrderCard from "./OrderCard";
import EmptyState from "./EmptyState";
import type { Order as RealOrder } from "@/types";

// Re-export the real, richer Order type (customization, notes, phone,
// orderType, delivery fields, etc.) so KitchenActions.tsx and OrderCard.tsx
// can keep importing `type { Order } from "./OrderList"` unchanged, while
// actually getting full data instead of the old simplified shape.
export type Order = RealOrder;
export type OrderItem = NonNullable<RealOrder["items"]>[number];

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  onStatusChange?: (
    orderId: string,
    status: Order["status"]
  ) => void | Promise<void>;

  onSelectOrder?: (order: Order) => void;

  onDriverChange?: (
    orderId: string,
    driverId: string
  ) => void | Promise<void>;
}

export default function OrderList({
  orders,
  loading = false,
  onStatusChange,
  onSelectOrder,
  onDriverChange,
}: OrderListProps) {
  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-brand-dark/5 bg-white shadow-xs">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-brand-primary" />

        <h2 className="text-xl font-extrabold text-brand-dark">
          Loading Kitchen Queue
        </h2>

        <p className="mt-2 text-brand-dark/50 text-sm font-semibold">
          Fetching the latest customer orders...
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div
      layout
      className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            layout
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
          >
            <OrderCard
              order={order}
              onStatusChange={onStatusChange}
              onSelectOrder={onSelectOrder}
              onDriverChange={onDriverChange}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}