"use client";

import { motion } from "framer-motion";
import {
  User,
  Hash,
  Clock3,
  IndianRupee,
  ChefHat,
  CookingPot,
  Phone,
  MessageSquare,
  Truck,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import OrderTimer from "./OrderTimer";
import KitchenActions from "./KitchenActions";
import type { Order } from "./OrderList";

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, status: Order["status"]) => void | Promise<void>;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  let deliveryAddressLabel: string | null = null;
  if (order.orderType === "DELIVERY" && order.deliveryAddress) {
    try {
      const addr =
        typeof order.deliveryAddress === "string"
          ? JSON.parse(order.deliveryAddress)
          : order.deliveryAddress;
      deliveryAddressLabel = `${addr.street}, ${addr.city} ${addr.zip || ""}`.trim();
    } catch {
      deliveryAddressLabel = "Address on file";
    }
  }

  return (
    <motion.article
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative overflow-hidden rounded-3xl border border-brand-dark/5 bg-white shadow-xs"
    >
      <div className="relative p-6">

        {/* Header */}

        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-brand-dark/50 font-semibold">
              <Hash className="h-4 w-4" />
              Order
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-brand-dark">
              {order.orderNumber}
            </h2>
          </div>

          <StatusBadge status={order.status} orderType={order.orderType} />
        </div>

        {/* Customer + order type + phone */}

        <div className="space-y-2 rounded-2xl bg-brand-light p-4">

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-brand-dark font-bold">
              <User className="h-5 w-5 text-brand-primary" />
              <span>{order.customerName}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                order.orderType === "DELIVERY"
                  ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  : order.orderType === "TAKEAWAY"
                  ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                  : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              }`}
            >
              {order.orderType === "DELIVERY"
                ? "Delivery"
                : order.orderType === "TAKEAWAY"
                ? "Pickup"
                : "Dine-In"}
            </span>
          </div>

          {order.customerPhone && (
            <div className="flex items-center gap-2 text-brand-dark/70 text-sm">
              <Phone className="h-4 w-4 text-brand-primary" />
              <span>{order.customerPhone}</span>
            </div>
          )}

          {deliveryAddressLabel && (
            <div className="flex items-start gap-2 text-brand-dark/70 text-sm">
              <Truck className="h-4 w-4 text-brand-primary mt-0.5 shrink-0" />
              <span>{deliveryAddressLabel}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-brand-dark/70 text-sm">
            <CookingPot className="h-5 w-5 text-brand-primary" />
            <span>{itemCount} item(s)</span>
          </div>

        </div>

        {/* Items */}

        <div className="mt-5">

          <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-brand-dark/40">
            Order Items
          </h3>

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-brand-light px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-brand-dark text-sm">
                    {item.menuItem?.name ?? "Item"}
                  </span>

                  <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-extrabold text-brand-primary shrink-0">
                    x {item.quantity}
                  </span>
                </div>

                {item.customization && (
                  <div className="text-[11px] text-brand-dark/50 flex flex-col gap-0.5 mt-1.5">
                    <p>
                      {item.customization.size?.name} - {item.customization.crust?.name}
                    </p>
                    <p>Sauce: {item.customization.sauce?.name}</p>
                    {item.customization.toppings.length > 0 && (
                      <p>
                        Toppings: {item.customization.toppings.map((t) => t.topping.name).join(", ")}
                      </p>
                    )}
                    {item.customization.addons.length > 0 && (
                      <p>
                        Add-ons: {item.customization.addons.map((a) => a.addon.name).join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {item.notes && (
                  <div className="flex items-start gap-1 p-2 rounded bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-[11px] mt-2">
                    <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="italic leading-normal">Note: {item.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}

        <div className="mt-6 border-t border-brand-dark/5 pt-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-brand-dark/50">
                <Clock3 className="h-4 w-4" />
                Elapsed Time
              </p>

              <OrderTimer
                createdAt={order.createdAt}
                completedAt={order.completedAt}
              />
            </div>

            <div className="text-right">

              <p className="text-xs font-semibold text-brand-dark/50">
                Total
              </p>

              <p className="flex items-center justify-end text-2xl font-extrabold text-brand-primary">
                ${order.total.toFixed(2)}
              </p>

            </div>

          </div>

          <KitchenActions order={order} onStatusChange={onStatusChange} />

        </div>

      </div>
    </motion.article>
  );
}