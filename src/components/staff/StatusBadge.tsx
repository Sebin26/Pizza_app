"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  ChefHat,
  CheckCircle2,
  PackageCheck,
} from "lucide-react";

export type OrderStatus =
  | "RECEIVED"
  | "PREPARING"
  | "READY"
  | "COMPLETED";

interface StatusBadgeProps {
  status: OrderStatus;
  orderType?: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
}

const statusConfig = {
  RECEIVED: {
    label: "Received",
    icon: Clock3,
    text: "text-sky-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },

  PREPARING: {
    label: "Preparing",
    icon: ChefHat,
    text: "text-brand-primary",
    bg: "bg-brand-primary/10",
    border: "border-brand-primary/20",
  },

  READY: {
    label: "Ready",
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },

  COMPLETED: {
    label: "Completed",
    icon: PackageCheck,
    text: "text-brand-dark/60",
    bg: "bg-brand-dark/5",
    border: "border-brand-dark/15",
  },
} satisfies Record<
  OrderStatus,
  {
    label: string;
    icon: React.ElementType;
    text: string;
    bg: string;
    border: string;
  }
>;

export default function StatusBadge({
  status,
  orderType,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isDelivery = orderType === "DELIVERY";

  const label =
    isDelivery && status === "READY"
      ? "Out for Delivery"
      : isDelivery && status === "COMPLETED"
      ? "Delivered"
      : config.label;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      whileHover={{
        scale: 1.05,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${config.bg} ${config.border}`}
    >
      <motion.div
        animate={
          status === "PREPARING"
            ? {
                rotate: [0, -8, 8, 0],
              }
            : {}
        }
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      >
        <Icon className={`h-4 w-4 ${config.text}`} />
      </motion.div>

      <span
        className={`text-xs font-semibold uppercase tracking-wide ${config.text}`}
      >
        {label}
      </span>
    </motion.div>
  );
}