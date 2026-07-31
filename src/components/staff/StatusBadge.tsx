"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  ChefHat,
  CheckCircle2,
  PackageCheck,
  Truck,
} from "lucide-react";

export type OrderStatus =
  | "RECEIVED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    icon: React.ElementType;
    text: string;
    bg: string;
    border: string;
  }
> = {
  RECEIVED: {
    label: "Received",
    icon: Clock3,
    text: "text-sky-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: Clock3,
    text: "text-blue-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
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
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    icon: Truck,
    text: "text-indigo-600",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  DELIVERED: {
    label: "Delivered",
    icon: PackageCheck,
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
  CANCELLED: {
    label: "Cancelled",
    icon: Clock3,
    text: "text-red-600",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.RECEIVED;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${config.bg} ${config.border}`}
    >
      <motion.div
        animate={
          status === "PREPARING"
            ? { rotate: [0, -8, 8, 0] }
            : status === "OUT_FOR_DELIVERY"
            ? { x: [0, 2, -2, 0] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Icon className={`h-4 w-4 ${config.text}`} />
      </motion.div>

      <span className={`text-xs font-semibold uppercase tracking-wide ${config.text}`}>
        {config.label}
      </span>
    </motion.div>
  );
}