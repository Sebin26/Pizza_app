"use client";

import useSWR from "swr";
import { Store, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { KitchenResponse } from "@/lib/analytics/services";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function KitchenStatusCard() {
  const { data, isLoading, error } = useSWR<KitchenResponse>(
    "/api/admin/analytics/kitchen",
    fetcher,
    { refreshInterval: 10000 }
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "critical":
        return {
          label: "Critical Load",
          bg: "bg-red-500/10 text-red-600 border-red-500/20",
          bar: "bg-red-600",
        };
      case "high":
        return {
          label: "High Load",
          bg: "bg-orange-500/10 text-orange-600 border-orange-500/20",
          bar: "bg-orange-500",
        };
      case "busy":
        return {
          label: "Busy",
          bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          bar: "bg-amber-500",
        };
      default:
        return {
          label: "Normal",
          bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          bar: "bg-emerald-500",
        };
    }
  };

  const statusBadge = getStatusBadge(data?.status);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 flex flex-col gap-4 min-h-[360px] justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-dark/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-extrabold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
              Kitchen Status
            </h3>
            <p className="text-[11px] text-brand-dark/45 font-medium">
              Live preparation queue
            </p>
          </div>
        </div>

        {data && (
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${statusBadge.bg}`}
          >
            {statusBadge.label}
          </span>
        )}
      </div>

      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-brand-dark/40 text-xs font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading kitchen load...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-brand-primary font-semibold py-6 text-center">
          Failed to load kitchen status.
        </div>
      )}

      {!isLoading && data && (
        <div className="flex flex-col gap-4 my-auto">
          {/* Kitchen Load Bar */}
          <div className="flex flex-col gap-1.5 bg-brand-light/70 p-3.5 rounded-xl border border-brand-dark/5">
            <div className="flex justify-between items-center text-xs font-extrabold text-brand-dark">
              <span>Kitchen Capacity Load</span>
              <span className="text-brand-primary">{data.kitchenLoadPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-brand-dark/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${data.kitchenLoadPercent}%` }}
                className={`h-full transition-all duration-500 rounded-full ${statusBadge.bar}`}
              />
            </div>
            <span className="text-[10px] text-brand-dark/45 font-medium mt-0.5">
              Active cooking queue: {data.activeOrders} orders
            </span>
          </div>

          {/* Active Status Breakdown Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-brand-light rounded-xl flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-brand-dark/40 uppercase">
                Preparing
              </span>
              <strong className="text-base font-extrabold text-brand-primary">
                {data.preparing}
              </strong>
            </div>

            <div className="p-2.5 bg-brand-light rounded-xl flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-brand-dark/40 uppercase">
                Ready
              </span>
              <strong className="text-base font-extrabold text-brand-gold">
                {data.ready}
              </strong>
            </div>

            <div className="p-2.5 bg-brand-light rounded-xl flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-brand-dark/40 uppercase">
                Dispatched
              </span>
              <strong className="text-base font-extrabold text-indigo-600">
                {data.outForDelivery}
              </strong>
            </div>
          </div>

          {/* Kitchen Timing Info */}
          <div className="flex flex-col gap-2 pt-1 border-t border-brand-dark/5 text-xs font-semibold text-brand-dark/75">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-dark/60">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                <span>Avg Prep Time:</span>
              </div>
              <strong className="font-extrabold text-brand-dark">
                {data.avgPrepTimeMinutes} mins
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-dark/60">
                <AlertTriangle className="w-3.5 h-3.5 text-brand-gold" />
                <span>Longest Waiting:</span>
              </div>
              <strong className="font-extrabold text-brand-primary">
                {data.longestWaitingOrder
                  ? `Order #${data.longestWaitingOrder.orderId} (${data.longestWaitingOrder.waitingMinutes}m)`
                  : "None"}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
