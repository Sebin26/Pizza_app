"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Hash,
  Clock3,
  CookingPot,
  Phone,
  MessageSquare,
  MapPin,
  UserCheck,
  Maximize2,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import OrderTimer from "./OrderTimer";
import KitchenActions from "./KitchenActions";
import type { Order } from "./OrderList";
import type { Driver } from "@/types";

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, status: Order["status"]) => void | Promise<void>;
  onSelectOrder?: (order: Order) => void;
  onDriverChange?: (orderId: string, driverId: string) => void | Promise<void>;
}

export default function OrderCard({
  order,
  onStatusChange,
  onSelectOrder,
  onDriverChange,
}: OrderCardProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await fetch("/api/drivers");
        if (res.ok) {
          const data = await res.json();
          setDrivers(data.drivers || []);
        }
      } catch (e) {
        console.error("Failed to fetch drivers:", e);
      }
    }
    fetchDrivers();
  }, []);

  const itemCount = order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const isDelivery = order.fulfillmentType === "DELIVERY";
  const isTerminal = order.status === "COMPLETED" || order.status === "DELIVERED";

  let deliveryAddressLabel: string | null = null;
  if (isDelivery && order.delivery) {
    deliveryAddressLabel = `${order.delivery.addressLine1}, ${order.delivery.city}`.trim();
  }

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectOrder?.(order)}
      className="group relative overflow-hidden rounded-3xl border border-brand-dark/5 bg-white shadow-xs cursor-pointer hover:border-brand-primary/30 transition-colors"
    >
      <div className="relative p-6 flex flex-col justify-between h-full">
        {/* Top bar with Order Number and Badges */}
        <div>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-brand-dark/50 font-semibold uppercase tracking-wider">
                <Hash className="h-3.5 w-3.5" /> Order
              </p>
              <h2 className="mt-0.5 text-3xl font-extrabold text-brand-dark flex items-center gap-2">
                {order.orderNumber}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOrder?.(order);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-brand-light hover:bg-brand-primary hover:text-white text-brand-dark/50 transition-all cursor-pointer"
                  title="Open details drawer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </h2>
            </div>

            <StatusBadge status={order.status} />
          </div>

          {/* Customer + Fulfillment + Phone details card */}
          <div className="space-y-2.5 rounded-2xl bg-brand-light p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-brand-dark font-bold text-sm">
                <User className="h-4 w-4 text-brand-primary shrink-0" />
                <span className="truncate">{order.customerName}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  isDelivery
                    ? "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20"
                    : order.fulfillmentType === "PICKUP"
                    ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                    : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                }`}
              >
                {isDelivery ? "🚚 Delivery" : order.fulfillmentType === "PICKUP" ? "🥡 Pickup" : "🍽 Dine In"}
              </span>
            </div>

            {order.customerPhone && (
              <div className="flex items-center gap-2 text-brand-dark/70 text-xs font-medium">
                <Phone className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
            )}

            {isDelivery && deliveryAddressLabel && (
              <div className="flex flex-col gap-1 text-xs text-brand-dark/80 pt-1 border-t border-brand-dark/5">
                <div className="flex items-start gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary mt-0.5 shrink-0" />
                  <span>{deliveryAddressLabel}</span>
                </div>
                {order.delivery?.landmark && (
                  <p className="text-[11px] text-brand-dark/50 pl-5">
                    Landmark: {order.delivery.landmark}
                  </p>
                )}
                {order.delivery?.instructions && (
                  <p className="text-[11px] text-brand-primary italic pl-5">
                    Instructions: {order.delivery.instructions}
                  </p>
                )}

                {/* Driver Select - locked once the order is terminal
                    (DELIVERED/COMPLETED), since reassigning a driver after
                    the fact would be editing history, not live dispatch. */}
                <div
                  className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-dark/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="text-[11px] font-bold text-brand-dark/70 shrink-0 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-brand-primary" /> Driver:
                  </label>
                  <select
                    value={order.delivery?.driverId || ""}
                    disabled={isTerminal}
                    onChange={(e) => {
                      e.stopPropagation();
                      onDriverChange?.(order.id, e.target.value);
                    }}
                    className={`w-full px-2.5 py-1 rounded-lg bg-white border border-brand-dark/15 text-xs text-brand-dark focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 ${
                      isTerminal ? "opacity-60 cursor-not-allowed bg-brand-dark/5" : "cursor-pointer"
                    }`}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} {driver.vehicleType ? `(${driver.vehicleType})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-brand-dark/70 text-xs font-semibold pt-0.5">
              <CookingPot className="h-4 w-4 text-brand-primary shrink-0" />
              <span>{itemCount} item(s)</span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40">
              Order Items
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="rounded-xl bg-brand-light px-3.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-brand-dark text-xs truncate">
                      {item.menuItem?.name ?? "Item"}
                    </span>
                    <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-primary shrink-0">
                      x {item.quantity}
                    </span>
                  </div>

                  {item.customization && (
                    <div className="text-[10px] text-brand-dark/50 flex flex-col gap-0.5 mt-1">
                      <p>
                        {item.customization.size?.name} - {item.customization.crust?.name}
                      </p>
                      {item.customization.toppings.length > 0 && (
                        <p className="truncate">
                          Toppings: {item.customization.toppings.map((t) => t.topping.name).join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <div className="flex items-start gap-1 p-1 rounded bg-brand-primary/5 text-brand-primary text-[10px] mt-1 italic">
                      <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="truncate">Note: {item.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Timer, Total, and Action Button */}
        <div className="mt-6 border-t border-brand-dark/5 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-brand-dark/50 uppercase">
                <Clock3 className="h-3.5 w-3.5" /> Elapsed Time
              </p>
              <OrderTimer
                createdAt={order.createdAt}
                completedAt={order.completedAt}
              />
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold text-brand-dark/50 uppercase">Total</p>
              <p className="text-xl font-extrabold text-brand-primary">${order.total.toFixed(2)}</p>
            </div>
          </div>

          <KitchenActions order={order} onStatusChange={onStatusChange} />
        </div>
      </div>
    </motion.article>
  );
}
