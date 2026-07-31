"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  CheckCircle2,
  PackageCheck,
  Truck,
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
  const isDelivery = order.fulfillmentType === "DELIVERY";
  const action = getNextAction(order.status, isDelivery);

  if (!action) {
    return null;
  }

  const Icon = action.icon;

  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation(); // Stop card drawer click trigger
        onStatusChange?.(order.id, action.nextStatus);
      }}
      className={`group flex w-full items-center justify-center gap-3 rounded-2xl py-3 font-extrabold text-sm transition-all duration-300 cursor-pointer
        ${
          loading
            ? "cursor-not-allowed bg-brand-dark/10 text-brand-dark/40"
            : `${action.background} text-white shadow-md`
        }`}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" />
      {loading ? "Updating..." : action.label}
    </motion.button>
  );
}

function getNextAction(status: Order["status"], isDelivery: boolean) {
  switch (status) {
    case "RECEIVED":
      return {
        label: "Start Preparing",
        nextStatus: "PREPARING" as const,
        icon: ChefHat,
        background: "bg-brand-primary hover:bg-brand-primary-dark",
      };

    case "PREPARING":
      return {
        label: "Mark as Ready",
        nextStatus: "READY" as const,
        icon: CheckCircle2,
        background: "bg-emerald-600 hover:bg-emerald-700",
      };

    case "READY":
      if (isDelivery) {
        return {
          label: "Send Out for Delivery",
          nextStatus: "OUT_FOR_DELIVERY" as const,
          icon: Truck,
          background: "bg-indigo-600 hover:bg-indigo-700",
        };
      }
      return {
        label: "Complete Order",
        nextStatus: "COMPLETED" as const,
        icon: PackageCheck,
        background: "bg-brand-gold hover:bg-brand-gold/90",
      };

    case "OUT_FOR_DELIVERY":
      if (isDelivery) {
        return {
          label: "Mark as Delivered",
          nextStatus: "DELIVERED" as const,
          icon: PackageCheck,
          background: "bg-emerald-600 hover:bg-emerald-700",
        };
      }
      return null;

    case "COMPLETED":
    case "DELIVERED":
    case "CANCELLED":
    default:
      return null;
  }
}