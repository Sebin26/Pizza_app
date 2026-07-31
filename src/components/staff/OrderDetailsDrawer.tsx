"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  Truck,
  MapPin,
  Clock,
  CookingPot,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Order } from "./OrderList";

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onDriverChange?: (orderId: string, driverId: string) => void | Promise<void>;
}

export default function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  onDriverChange,
}: OrderDetailsDrawerProps) {
  const [driverInput, setDriverInput] = useState("");

  useEffect(() => {
    if (order?.delivery?.assignedDriverId) {
      setDriverInput(order.delivery.assignedDriverId);
    } else {
      setDriverInput("");
    }
  }, [order]);

  if (!order) return null;

  const isDelivery = order.fulfillmentType === "DELIVERY";

  const formatTimestamp = (ts?: string | Date | null) => {
    if (!ts) return null;
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timelineEntries = [
    { label: "Received", time: formatTimestamp(order.createdAt) },
    { label: "Preparing Started", time: formatTimestamp(order.preparingAt) },
    { label: "Marked Ready", time: formatTimestamp(order.readyAt) },
    ...(isDelivery
      ? [
          { label: "Departed for Delivery", time: formatTimestamp(order.delivery?.departedAt) },
          { label: "Delivered", time: formatTimestamp(order.delivery?.deliveredAt) },
        ]
      : []),
    { label: "Completed", time: formatTimestamp(order.completedAt) },
  ].filter((e) => e.time !== null);

  const handleDriverBlur = () => {
    if (onDriverChange && order) {
      onDriverChange(order.id, driverInput);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-brand-dark/40 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-dark/5 flex items-center justify-between bg-brand-light/50">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-dark/40 uppercase">Order Details</span>
                <h2 className="text-2xl font-extrabold text-brand-dark">{order.orderNumber}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-brand-dark/10 flex items-center justify-center text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Status and Fulfillment Badge */}
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={order.status} />
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
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

              {/* Delivery Address Section Prominently Near Top */}
              {isDelivery && order.delivery && (
                <div className="bg-brand-light p-4 rounded-2xl border border-brand-dark/5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-brand-dark">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-xs text-brand-dark/80 font-semibold leading-relaxed">
                    {order.delivery.addressLine1}
                    {order.delivery.addressLine2 ? `, ${order.delivery.addressLine2}` : ""},{" "}
                    {order.delivery.city} {order.delivery.postcode || ""}
                  </p>
                  {order.delivery.landmark && (
                    <p className="text-xs text-brand-dark/60">
                      <strong>Landmark:</strong> {order.delivery.landmark}
                    </p>
                  )}
                  {order.delivery.instructions && (
                    <p className="text-xs text-brand-primary italic bg-brand-primary/5 p-2 rounded-lg border border-brand-primary/10 mt-1">
                      <strong>Instructions:</strong> {order.delivery.instructions}
                    </p>
                  )}

                  {/* Driver Assignment Field */}
                  <div className="mt-2 border-t border-brand-dark/5 pt-3 flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-brand-primary" /> Driver
                    </label>
                    <input
                      type="text"
                      placeholder="Unassigned"
                      value={driverInput}
                      onChange={(e) => setDriverInput(e.target.value)}
                      onBlur={handleDriverBlur}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-brand-dark/15 text-xs text-brand-dark placeholder-brand-dark/30 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-brand-light/60 p-4 rounded-2xl flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-brand-dark">
                  <User className="w-4 h-4 text-brand-primary" />
                  <span>{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-brand-dark/70">
                    <Phone className="w-4 h-4 text-brand-primary" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-dark/40 flex items-center gap-1.5">
                  <CookingPot className="w-4 h-4" /> Order Items
                </h3>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="p-3 bg-brand-light rounded-xl text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-dark">{item.menuItem?.name || "Item"}</span>
                        <span className="font-extrabold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                          {item.quantity}x (${item.totalPrice.toFixed(2)})
                        </span>
                      </div>
                      {item.customization && (
                        <div className="text-[11px] text-brand-dark/60 flex flex-col gap-0.5">
                          <p>
                            {item.customization.size?.name} | {item.customization.crust?.name}
                          </p>
                          <p>Sauce: {item.customization.sauce?.name}</p>
                          {item.customization.toppings.length > 0 && (
                            <p>
                              Toppings:{" "}
                              {item.customization.toppings.map((t) => t.topping.name).join(", ")}
                            </p>
                          )}
                          {item.customization.addons.length > 0 && (
                            <p>
                              Add-ons:{" "}
                              {item.customization.addons.map((a) => a.addon.name).join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                      {item.notes && (
                        <div className="flex items-start gap-1 p-1.5 rounded bg-brand-primary/5 text-brand-primary text-[11px] italic mt-1">
                          <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>Note: {item.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-brand-dark/5 pt-4 flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-brand-dark/60">
                  <span>Subtotal</span>
                  <span className="font-bold">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-dark/60">
                  <span>Tax</span>
                  <span className="font-bold">${order.tax.toFixed(2)}</span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between text-brand-dark/60">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-brand-primary" /> Delivery Fee
                    </span>
                    <span className="font-bold">
                      {order.deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-extrabold">FREE</span>
                      ) : (
                        `$${order.deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-brand-dark/5 pt-2 text-sm text-brand-dark font-extrabold">
                  <span>Total</span>
                  <span className="text-brand-primary text-base">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-brand-dark/5 pt-4 flex flex-col gap-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-dark/40 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Timeline
                </h4>
                <div className="flex flex-col gap-2 border-l-2 border-brand-primary/20 pl-3">
                  {timelineEntries.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-dark/70">{t.label}</span>
                      <span className="text-brand-dark/50 text-[11px]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
