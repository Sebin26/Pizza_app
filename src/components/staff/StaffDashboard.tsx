"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { SessionUser } from "@/lib/session";
import { LogOut, ShieldAlert, Sparkles } from "lucide-react";
import DashboardStats from "@/components/staff/DashboardStats";
import QueueFilters, { OrderStatus } from "@/components/staff/QueueFilters";
import OrderList from "@/components/staff/OrderList";
import OrderDetailsDrawer from "@/components/staff/OrderDetailsDrawer";

interface StaffDashboardProps {
  user: SessionUser;
}

export default function StaffDashboard({ user }: StaffDashboardProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const prevReceivedCount = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Web Audio API beep synthesis (pure JS, no audio files needed)
  const playNotificationSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.05, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1200, ctx.currentTime);
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

  // Poll the full order queue every 3.5s. Deliberately fetched without a
  // status filter so DashboardStats/QueueFilters counts always reflect the
  // true state across every bucket at once, and filtering happens client
  // side. Note: for a single restaurant this is fine; if order history
  // grows very large later, this is the place to add date-windowing or
  // pagination on the API side.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (isInitialMount.current) {
          isInitialMount.current = false;
          setIsLoading(true);
        }

        const res = await fetch(`/api/orders`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?redirect=/staff");
            return;
          }
          throw new Error("Failed to fetch orders queue");
        }

        const data = await res.json();
        const nextOrders: Order[] = data.orders || [];

        const receivedCount = nextOrders.filter((o) => o.status === "RECEIVED").length;
        if (prevReceivedCount.current !== null && receivedCount > prevReceivedCount.current) {
          playNotificationSound();
        }
        prevReceivedCount.current = receivedCount;

        setOrders(nextOrders);
        setErrorMsg("");
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Connection error. Failed to poll queue.";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3500);
    return () => clearInterval(interval);
  }, [router]);

  // selectedOrder is derived directly from orders + selectedOrderId rather
  // than kept as its own duplicated state. This avoids needing an effect
  // that calls setState every time `orders` refreshes (every 3.5s poll),
  // which was previously causing an extra cascading render each cycle
  // whenever the drawer was open.
  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const handleStatusChange = async (orderId: string, nextStatus: Order["status"]) => {
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
        } catch {
          // Ignore parse failure
        }
        throw new Error(errorText);
      }

      // Optimistic local update. selectedOrder derives from `orders`, so
      // it updates automatically here too - no manual sync needed.
      const data = await res.json();

        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? data.order : o
        )
      );
      } catch (err) {
        const message =
        err instanceof Error ? err.message : "Failed to update status";
        alert(message);
      }
  };

  // Assigns a driver via the real Driver relation (driverId), NOT the
  // legacy free-text assignedDriverId field. Previously this sent
  // { assignedDriverId: driverId }, which wrote the driver's UUID into
  // the wrong field - OrderCard/OrderDetailsDrawer read from `driverId`,
  // so the assignment silently never showed up as expected.
  const handleDriverChange = async (
  orderId: string,
  driverId: string
) => {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId: driverId || null,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to assign driver");
    }

    const data = await res.json();

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? data.order : o))
    );
    } catch (err) {
        console.error(err);
        alert("Failed to update driver.");
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

  // Search is applied first (independent of status), then status filter is
  // layered on top. Counts reflect the search-filtered set so they stay
  // meaningful while someone is actively searching.
  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const counts = useMemo(
    () => ({
      all: searchFiltered.length,
      received: searchFiltered.filter((o) => o.status === "RECEIVED").length,
      preparing: searchFiltered.filter((o) => o.status === "PREPARING").length,
      ready: searchFiltered.filter((o) => o.status === "READY").length,
      completed: searchFiltered.filter((o) => o.status === "COMPLETED").length,
    }),
    [searchFiltered]
  );

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "ALL") return searchFiltered;
    return searchFiltered.filter((o) => o.status === selectedStatus);
  }, [searchFiltered, selectedStatus]);

  // Dashboard stats reflect the true overall kitchen queue state,
  // regardless of the current search/status filter selection.
  const dashboardStats = useMemo(() => {
    const activeOrders = orders.filter((o) =>
      ["RECEIVED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status)
    );
    const preparingOrders = orders.filter((o) => o.status === "PREPARING").length;
    const readyOrders = orders.filter((o) => o.status === "READY").length;

    const averagePrepTime =
      activeOrders.length > 0
        ? Math.round(
            activeOrders.reduce((sum, o) => sum + (o.estimatedPrepMin || 0), 0) /
              activeOrders.length
          )
        : 0;

    return {
      activeOrders: activeOrders.length,
      preparingOrders,
      readyOrders,
      averagePrepTime,
    };
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

      {/* Top dashboard header bar */}
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold" />
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
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-primary/20 hover:border-brand-primary text-brand-primary text-xs font-bold transition-[border-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <DashboardStats {...dashboardStats} />

      <QueueFilters
        search={searchQuery}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchQuery}
        onStatusChange={setSelectedStatus}
        counts={counts}
      />

     <OrderList
        orders={filteredOrders}
        loading={isLoading}
        onStatusChange={handleStatusChange}
        onSelectOrder={(order) => {
            setSelectedOrderId(order.id);
            setDrawerOpen(true);
        }}
        onDriverChange={handleDriverChange}
      />

      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedOrderId(null);
        }}
  onDriverChange={handleDriverChange}
/>

    </div>
  );
}
