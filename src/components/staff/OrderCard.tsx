"use client";

import { motion } from "framer-motion";
import {
  User,
  Hash,
  Clock3,
  IndianRupee,
  ChefHat,
  CheckCircle2,
  CookingPot,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import OrderTimer from "./OrderTimer";
import KitchenActions from "./KitchenActions";
import type { Order } from "./OrderList";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <motion.article
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-6">

        {/* Header */}

        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-white/60">
              <Hash className="h-4 w-4" />
              Order
            </p>

            <h2 className="mt-1 text-3xl font-bold text-white">
              {order.orderNumber}
            </h2>
          </div>

          <StatusBadge status={order.status} />
        </div>

        {/* Customer */}

        <div className="space-y-2 rounded-2xl bg-white/5 p-4">

          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-orange-400" />
            <span>{order.customerName}</span>
          </div>

          {order.tableNumber && (
            <div className="flex items-center gap-2 text-white/70">
              <ChefHat className="h-5 w-5 text-orange-400" />
              <span>Table {order.tableNumber}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-white/70">
            <CookingPot className="h-5 w-5 text-orange-400" />
            <span>{itemCount} item(s)</span>
          </div>

        </div>

        {/* Items */}

        <div className="mt-5">

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
            Order Items
          </h3>

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
              >
                <span className="text-white">
                  {item.name}
                </span>

                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm font-semibold text-orange-300">
                  × {item.quantity}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}

        <div className="mt-6 border-t border-white/10 pt-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="mb-1 flex items-center gap-2 text-sm text-white/60">
                <Clock3 className="h-4 w-4" />
                Elapsed Time
              </p>

              <OrderTimer createdAt={order.createdAt} />
            </div>

            <div className="text-right">

              <p className="text-sm text-white/60">
                Total
              </p>

              <p className="flex items-center justify-end text-2xl font-bold text-orange-300">
                <IndianRupee className="mr-1 h-5 w-5" />
                {order.total.toFixed(2)}
              </p>

            </div>

          </div>

          <KitchenActions order={order} />

        </div>

      </div>
    </motion.article>
  );
}