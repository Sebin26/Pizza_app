"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  CheckCircle2,
  PackageCheck,
} from "lucide-react";
import type { Order } from "./OrderList";

interface KitchenActionsProps {
  order: Order;
  loading?: boolean;
  onStatusChange?: (
    orderId: string,
    status: Order["status"]
  ) => void | Promise<void>;
}

export default function KitchenActions({
  order,
  loading = false,
  onStatusChange,
}: KitchenActionsProps) {
  const action = getNextAction(order.status);

  if (!action) {
    return null;
  }

  const Icon = action.icon;

  return (
    <motion.button
      whileHover={{
        scale: loading ? 1 : 1.02,
      }}
      whileTap={{
        scale: loading ? 1 : 0.98,
      }}
      disabled={loading}
      onClick={() =>
        onStatusChange?.(order.id, action.nextStatus)
      }
      className={`group flex w-full items-center justify-center gap-3 rounded-2xl py-3 font-semibold transition-all duration-300
        ${
          loading
            ? "cursor-not-allowed bg-white/10 text-white/40"
            : `${action.background} ${action.hover} text-white shadow-lg`
        }`}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" />

      {loading ? "Updating..." : action.label}
    </motion.button>
  );
}

function getNextAction(status: Order["status"]) {
  switch (status) {
    case "RECEIVED":
      return {
        label: "Start Preparing",
        nextStatus: "PREPARING" as const,
        icon: ChefHat,
        background:
          "bg-gradient-to-r from-orange-500 to-orange-600",
        hover:
          "hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/30",
      };

    case "PREPARING":
      return {
        label: "Mark as Ready",
        nextStatus: "READY" as const,
        icon: CheckCircle2,
        background:
          "bg-gradient-to-r from-emerald-500 to-green-600",
        hover:
          "hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-500/30",
      };

    case "READY":
      return {
        label: "Complete Order",
        nextStatus: "COMPLETED" as const,
        icon: PackageCheck,
        background:
          "bg-gradient-to-r from-blue-500 to-indigo-600",
        hover:
          "hover:from-blue-400 hover:to-indigo-500 hover:shadow-blue-500/30",
      };

    case "COMPLETED":
      return null;

    default:
      return null;
  }
}