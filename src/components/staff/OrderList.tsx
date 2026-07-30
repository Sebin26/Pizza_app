"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import OrderCard from "./OrderCard";
import EmptyState from "./EmptyState";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string | null;
  status: "RECEIVED" | "PREPARING" | "READY" | "COMPLETED";
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
}

export default function OrderList({
  orders,
  loading = false,
}: OrderListProps) {
  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-orange-400" />

        <h2 className="text-xl font-semibold text-white">
          Loading Kitchen Queue
        </h2>

        <p className="mt-2 text-white/60">
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
            <OrderCard order={order} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}