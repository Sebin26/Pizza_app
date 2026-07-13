"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { SessionUser } from "@/lib/session";
import { Search, LogOut, Check, ArrowRight, ShieldAlert, Sparkles, Phone, MessageSquare } from "lucide-react";
import styles from "./StaffDashboard.module.css";

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

  // Web Audio API beep synthesis (pure JS, no audio files needed, works offline)
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
        // Find if the new orders are RECEIVED orders
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
      case "RECEIVED": return styles.badgeReceived;
      case "PREPARING": return styles.badgePreparing;
      case "READY": return styles.badgeReady;
      case "COMPLETED": return styles.badgeCompleted;
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
    <div className={styles.wrapper}>
      {/* Top dashboard header info bar */}
      <header className={`${styles.header} glass-elevated`}>
        <div className={styles.headerLeft}>
          <div className={styles.crewTitle}>
            <Sparkles className={styles.sparkleIcon} />
            <h2>Kitchen Queue Dashboard</h2>
          </div>
          <span className={styles.userTag}>
            Welcome, <strong>{user.name}</strong> ({user.role})
          </span>
        </div>

        <div className={styles.headerRight}>
          {user.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin")}
              className="btn btn-secondary"
              style={{ borderColor: "rgba(255, 149, 0, 0.4)", color: "var(--warning)" }}
            >
              <ShieldAlert size={16} />
              <span>Admin Panel</span>
            </button>
          )}

          <button onClick={handleLogout} className={`${styles.logoutBtn} btn btn-secondary`}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <div className={styles.dashboardContent}>
        {/* Sidebar filters and controls */}
        <div className={`${styles.sidebar} glass`}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search token / name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersList}>
            <h4 className={styles.sidebarSectionTitle}>Order Status Filters</h4>
            {[
              { label: "Active Orders", value: "ACTIVE" },
              { label: "Received", value: "RECEIVED" },
              { label: "Preparing", value: "PREPARING" },
              { label: "Ready at Counter", value: "READY" },
              { label: "Completed", value: "COMPLETED" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`${styles.filterBtn} ${
                  statusFilter === f.value ? styles.filterBtnActive : ""
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Cards Grid */}
        <div className={styles.queueArea}>
          {errorMsg && (
            <div className={styles.errorAlert}>
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner}></div>
              <p>Syncing kitchen database...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className={styles.orderGrid}>
              {orders.map((order) => {
                // Calculate elapsed minutes since order creation
                const minutesElapsed = Math.floor(
                  (Date.now() - new Date(order.createdAt).getTime()) / 60000
                );
                
                return (
                  <div
                    key={order.id}
                    className={`${styles.orderCard} glass ${
                      order.status === "RECEIVED" ? styles.newOrderBorder : ""
                    }`}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.tokenCircle}>
                        <span>{order.orderNumber}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={styles.timeElapsed}>
                          {minutesElapsed === 0 ? "Just now" : `${minutesElapsed}m ago`}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardCustomer}>
                      <span className={styles.customerName}>{order.customerName}</span>
                      {order.customerPhone && (
                        <div className={styles.customerPhone}>
                          <Phone size={12} />
                          <span>{order.customerPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Items list */}
                    <div className={styles.cardItems}>
                      {order.items?.map((item) => (
                        <div key={item.id} className={styles.itemRow}>
                          <div className={styles.itemTitle}>
                            <span className={styles.itemQty}>{item.quantity}x</span>
                            <span className={styles.itemNameText}>{item.menuItem.name}</span>
                          </div>
                          
                          {item.customization && (
                            <div className={styles.itemCustomizations}>
                              <p>
                                {item.customization.size?.name} • {item.customization.crust?.name}
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
                            <div className={styles.notesBox}>
                              <MessageSquare size={12} className={styles.notesIcon} />
                              <span className={styles.notesText}>{item.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Card Footer actions */}
                    <div className={styles.cardFooter}>
                      <div className={styles.priceSection}>
                        <span>Total</span>
                        <strong>${order.total.toFixed(2)}</strong>
                      </div>

                      {order.status !== "COMPLETED" ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, order.status)}
                          className={`${styles.actionBtn} btn btn-primary`}
                        >
                          <span>{getActionLabel(order.status)}</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <div className={styles.completedIndicator}>
                          <Check size={14} />
                          <span>Collected</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`${styles.emptyState} glass`}>
              <h3>No Active Orders</h3>
              <p>Kitchen queue is clean! Sit back or check search parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
