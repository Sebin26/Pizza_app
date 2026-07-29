"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";
import { ArrowLeft, Clock, Bell, ChefHat, CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface OrderTrackerProps {
  initialOrder: Order;
}

export default function OrderTracker({ initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState<Order>(initialOrder);

  // Poll order status every 4 seconds
  useEffect(() => {
    // If order is already completed, no need to poll anymore
    if (order.status === "COMPLETED") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${order.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.order) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order.id, order.status]);

  const getStepStatus = (step: string) => {
    const statuses = ["RECEIVED", "PREPARING", "READY", "COMPLETED"];
    const currentIndex = statuses.indexOf(order.status);
    const stepIndex = statuses.indexOf(step);

    if (stepIndex === currentIndex) return "active";
    if (stepIndex < currentIndex) return "completed";
    return "pending";
  };

  const getStepColor = (status: "active" | "completed" | "pending") => {
    if (status === "completed") return "bg-green-600 text-white border-green-600";
    if (status === "active") return "bg-brand-primary text-white border-brand-primary animate-pulse";
    return "bg-white text-brand-dark/30 border-brand-dark/15";
  };

  const getStepTextColor = (status: "active" | "completed" | "pending") => {
    if (status === "completed") return "text-green-600 font-bold";
    if (status === "active") return "text-brand-primary font-bold";
    return "text-brand-dark/40 font-semibold";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      
      {/* Thank you note */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-dark/5 flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left"
      >
        <div className="w-14 h-14 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Order Placed Successfully!</h1>
          <p className="text-sm text-brand-dark/50">
            Thank you for dining with us, <strong className="text-brand-dark/80 font-bold">{order.customerName}</strong>.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Token and Live Status card (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-brand-dark/5 flex flex-col gap-8">
            
            {/* Token Section */}
            <div className="flex flex-col items-center text-center border-b border-brand-dark/5 pb-6">
              <span className="text-xs font-extrabold tracking-wider text-brand-dark/40 uppercase">Your Token Number</span>
              <h2 className="text-6xl sm:text-7xl font-extrabold text-brand-primary tracking-tight my-2">
                {order.orderNumber}
              </h2>
              <p className="text-sm text-brand-dark/60 max-w-xs leading-relaxed">
                Please watch the kitchen display screens or wait at your table for this token to be called.
              </p>
            </div>

            {/* Progress Tracker stepper bar */}
            <div className="flex flex-col gap-6 px-2">
              <h4 className="text-sm font-extrabold text-brand-dark">Order Status</h4>
              
              <div className="relative flex items-center justify-between w-full">
                
                {/* Horizontal Progress Bar Background */}
                <div className="absolute left-0 right-0 h-1 bg-brand-dark/5 -translate-y-4"></div>
                
                {/* Horizontal Progress Bar Fill */}
                <div 
                  className="absolute left-0 h-1 bg-green-600 -translate-y-4 transition-all duration-500"
                  style={{
                    width:
                      order.status === "RECEIVED"
                        ? "0%"
                        : order.status === "PREPARING"
                        ? "33%"
                        : order.status === "READY"
                        ? "66%"
                        : "100%",
                  }}
                ></div>

                {/* Stepper points */}
                {[
                  { key: "RECEIVED", label: "Received", icon: <ShoppingBag className="w-4 h-4" /> },
                  { key: "PREPARING", label: "Preparing", icon: <ChefHat className="w-4 h-4" /> },
                  { key: "READY", label: "Ready", icon: <Bell className="w-4 h-4" /> },
                  { key: "COMPLETED", label: "Completed", icon: <CheckCircle2 className="w-4 h-4" /> }
                ].map((step) => {
                  const status = getStepStatus(step.key);
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getStepColor(status)}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[11px] sm:text-xs tracking-tight ${getStepTextColor(status)}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banners based on order status */}
            <div className="border-t border-brand-dark/5 pt-6 mt-2">
              {order.status === "READY" ? (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 text-brand-dark">
                  <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shrink-0 animate-bounce">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-extrabold text-[15px]">Your Order is Ready!</h4>
                    <p className="text-xs text-brand-dark/70 leading-relaxed">
                      Please head over to the counter to collect your fresh hot pizza. Enjoy!
                    </p>
                  </div>
                </div>
              ) : order.status === "COMPLETED" ? (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-green-50 border border-green-200 text-brand-dark">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-extrabold text-[15px] text-green-700">Order Collected</h4>
                    <p className="text-xs text-brand-dark/70 leading-relaxed">
                      Enjoy your meal! Thank you for dining with D Town Pizza.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-brand-light border border-brand-dark/5 text-brand-dark">
                  <div className="w-10 h-10 rounded-full bg-white text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-dark/50">Estimated Prep Time</span>
                    <h4 className="text-lg font-extrabold text-brand-dark">~{order.estimatedPrepMin} Minutes</h4>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Order Details card (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-dark/5 flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
              <h3 className="text-lg font-extrabold text-brand-dark">Order Summary Details</h3>
              <span className="text-[11px] font-mono text-brand-dark/40 break-all">ID: {order.id}</span>
            </div>
            
            {/* Scrollable Items List */}
            <div className="flex flex-col gap-4 max-h-75 overflow-y-auto pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4 text-sm border-b border-brand-dark/5 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex gap-2.5 items-start">
                    <span className="font-extrabold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-lg text-xs mt-0.5">
                      {item.quantity}x
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="font-bold text-brand-dark">{item.menuItem.name}</h4>
                      {item.customization && (
                        <div className="text-xs text-brand-dark/50 flex flex-col gap-0.5">
                          <p>{item.customization.size?.name} | {item.customization.crust?.name}</p>
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
                        <p className="text-xs italic text-brand-primary mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-brand-dark shrink-0">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals panel */}
            <div className="border-t border-brand-dark/5 pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-brand-dark/60">
                <span>Subtotal</span>
                <span className="font-bold">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-dark/60">
                <span>Taxes (10%)</span>
                <span className="font-bold">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-dark/5 pt-3 text-brand-dark">
                <span className="text-base font-extrabold">Total Paid</span>
                <span className="text-lg font-extrabold text-brand-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Bottom Return CTA Link */}
            <Link 
              href="/" 
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-light hover:bg-brand-dark hover:text-white text-brand-dark font-bold text-sm transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Order Something Else</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
