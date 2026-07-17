"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { SessionUser } from "@/lib/session";
import { Search, LogOut, Check, ArrowRight, ShieldAlert, Sparkles, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StaffDashboardContainerProps {
  user: SessionUser;
}

export default function StaffDashboardContainer({ user }: StaffDashboardContainerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const prevOrdersCount = useRef<number | null>(null);

  // Web Audio API beep synthesis (pure JS, no audio files needed)
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz (A5)
      gain1.gain.setValueAtTime(0.05, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      // Beep 2 (delayed)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1200, ctx.currentTime); // Higher pitch
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.2);
      }, 150);
    } catch (e) {
      console.warn("Could not play synthesized notification audio:", e);
    }
  };

  // Fetch orders function
  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append("status", statusFilter);
      if (searchQuery) query.append("search", searchQuery);

      const res = await fetch(`/api/orders?${query.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/staff");
          return;
        }
        throw new Error("Failed to fetch orders queue");
      }
      
      const data = await res.json();
      const nextOrders = data.orders || [];

      // Check if new orders arrived to play sound cue
      if (prevOrdersCount.current !== null && nextOrders.length > prevOrdersCount.current) {
        const receivedOrdersCount = nextOrders.filter((o: Order) => o.status === "RECEIVED").length;
        const prevReceivedCount = orders.filter((o: Order) => o.status === "RECEIVED").length;
        if (receivedOrdersCount > prevReceivedCount) {
          playNotificationSound();
        }
      }
      
      prevOrdersCount.current = nextOrders.length;
      setOrders(nextOrders);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Connection error. Failed to poll queue.");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll orders queue every 3.5 seconds
  useEffect(() => {
    fetchOrders(); // Initial full load

    const interval = setInterval(() => {
      fetchOrders(true); // Silent poll update
    }, 3500);

    return () => clearInterval(interval);
  }, [statusFilter, searchQuery]);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const statusWorkflow: Record<string, string> = {
      RECEIVED: "PREPARING",
      PREPARING: "READY",
      READY: "COMPLETED",
    };

    const nextStatus = statusWorkflow[currentStatus];
    if (!nextStatus) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        let errorText = "Failed to update order status";
        try {
          const data = await res.json();
          errorText = data.error || errorText;
        } catch (_) {}
        throw new Error(errorText);
      }

      // Optimistic locally updated state
      setOrders((prev) =>
        prev
          .map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
          .filter((o) => {
            if (statusFilter === "ACTIVE" && nextStatus === "COMPLETED") return false;
            if (statusFilter !== "ACTIVE" && o.status !== statusFilter) return false;
            return true;
          })
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEIVED": return "bg-brand-red/10 text-brand-red border-brand-red/20";
      case "PREPARING": return "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
      case "READY": return "bg-brand-green/10 text-brand-green border-brand-green/20";
      case "COMPLETED": return "bg-brand-dark/10 text-brand-dark/60 border-brand-dark/15";
      default: return "";
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case "RECEIVED": return "Start Preparing";
      case "PREPARING": return "Mark Ready";
      case "READY": return "Mark Collected";
      default: return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Top dashboard header bar */}
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-orange" />
            <h2 className="text-xl font-extrabold text-brand-dark">Kitchen Queue Dashboard</h2>
          </div>
          <span className="text-xs text-brand-dark/50 font-semibold">
            Signed in as: <strong className="text-brand-dark/80 font-bold">{user.name}</strong> ({user.role})
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {user.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin")}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-orange/20 hover:border-brand-orange text-brand-orange text-xs font-bold transition-[border-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          <button 
            onClick={handleLogout} 
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-dark/10 hover:bg-brand-dark hover:text-white text-brand-dark/70 hover:border-brand-dark text-xs font-bold transition-[background-color,color,border-color,transform] duration-200 ease-out cursor-pointer active:scale-[0.97]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar filters and controls (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col gap-6 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
            <input
              type="text"
              placeholder="Search token / name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/40 border border-transparent focus:border-brand-red/20 focus:ring-2 focus:ring-brand-red/10 focus:bg-white transition-[box-shadow,border-color,background-color] duration-200 ease-out"
            />
          </div>

          {/* Filter list */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40 mb-1 px-1">
              Order Status Filters
            </h4>
            {[
              { label: "Active Orders", value: "ACTIVE" },
              { label: "Received", value: "RECEIVED" },
              { label: "Preparing", value: "PREPARING" },
              { label: "Ready at Counter", value: "READY" },
              { label: "Completed", value: "COMPLETED" },
            ].map((f) => {
              const isActive = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`relative w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-[color] duration-200 ease-out active:scale-[0.97] cursor-pointer overflow-hidden ${
                    isActive
                      ? "text-white"
                      : "bg-brand-light text-brand-dark/70 hover:bg-brand-light/95 hover:text-brand-dark"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeStaffFilter"
                      className="absolute inset-0 bg-brand-red rounded-xl shadow-sm shadow-brand-red/20 z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Queue list (9 Columns) */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/25 text-brand-red text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-brand-dark/5 shadow-xs">
              <div className="w-8 h-8 rounded-full border-4 border-brand-red/20 border-t-brand-red animate-[spin_0.8s_linear_infinite] mb-3"></div>
              <p className="text-xs text-brand-dark/50 font-bold">Syncing kitchen database...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {orders.map((order) => {
                  const minutesElapsed = Math.floor(
                    (Date.now() - new Date(order.createdAt).getTime()) / 60000
                  );
                  const isNew = order.status === "RECEIVED";

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={order.id}
                      className={`bg-white rounded-2xl shadow-xs border-2 flex flex-col justify-between overflow-hidden ${
                        isNew ? "border-brand-red shadow-md shadow-brand-red/5" : "border-brand-dark/5"
                      }`}
                    >
                      {/* Header block */}
                      <div className="p-5 bg-brand-light border-b border-brand-dark/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-brand-red text-white flex items-center justify-center text-base font-extrabold shadow-sm shadow-brand-red/25 shrink-0">
                            {order.orderNumber}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-brand-dark truncate max-w-[120px] sm:max-w-none">
                              {order.customerName}
                            </span>
                            {order.customerPhone && (
                              <div className="flex items-center gap-1 text-[10px] text-brand-dark/45 mt-0.5 font-semibold">
                                <Phone className="w-3 h-3 text-brand-orange" />
                                <span>{order.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-[10px] font-semibold text-brand-dark/40">
                            {minutesElapsed === 0 ? "Just now" : `${minutesElapsed}m ago`}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="p-5 flex-1 flex flex-col gap-3.5 divide-y divide-brand-dark/5">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex flex-col gap-1 text-xs pt-3.5 first:pt-0 first:border-t-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-brand-red bg-brand-red/5 px-1.5 py-0.5 rounded text-[10px]">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-brand-dark leading-tight">
                                  {item.menuItem.name}
                                </span>
                              </div>
                            </div>

                            {item.customization && (
                              <div className="text-[10px] text-brand-dark/50 flex flex-col gap-0.5 pl-6 mt-1">
                                <p>{item.customization.size?.name} • {item.customization.crust?.name}</p>
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
                              <div className="flex items-start gap-1 p-2 rounded bg-brand-orange/5 border border-brand-orange/10 text-brand-orange text-[10px] mt-1.5 ml-6">
                                <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                <span className="italic leading-normal">Note: {item.notes}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="p-5 bg-brand-light border-t border-brand-dark/5 flex items-center justify-between gap-4 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-brand-dark/40">Total</span>
                          <strong className="text-sm font-extrabold text-brand-dark">
                            ${order.total.toFixed(2)}
                          </strong>
                        </div>

                        {order.status !== "COMPLETED" ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id, order.status)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-extrabold text-[11px] shadow-sm hover:shadow-md transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.97]"
                          >
                            <span>{getActionLabel(order.status)}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-brand-green bg-brand-green/5 px-3 py-1.5 rounded-lg border border-brand-green/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>Collected</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-brand-dark/5 shadow-xs">
              <h3 className="text-sm font-bold text-brand-dark">No active orders</h3>
              <p className="text-xs text-brand-dark/50 max-w-sm mt-1 leading-relaxed">
                Kitchen queue is clean! Sit back or check search parameters.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
