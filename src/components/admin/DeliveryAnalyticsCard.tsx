"use client";

import useSWR from "swr";
import { Truck, Clock, UserCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { DeliveryResponse } from "@/lib/analytics/services";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DeliveryAnalyticsCard() {
  const { data, isLoading, error } = useSWR<DeliveryResponse>(
    "/api/admin/analytics/delivery",
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 flex flex-col gap-4 min-h-90 justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-dark/5 pb-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-extrabold">
          <Truck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
            Delivery Operations
          </h3>
          <p className="text-[11px] text-brand-dark/45 font-medium">
            Live fleet & dispatch performance
          </p>
        </div>
      </div>

      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-brand-dark/40 text-xs font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading delivery stats...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-brand-primary font-semibold py-6 text-center">
          Failed to load delivery analytics.
        </div>
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-2 gap-3 my-auto">
          {/* Deliveries Today */}
          <div className="p-3.5 bg-brand-light rounded-xl flex flex-col gap-1 border border-brand-dark/5">
            <div className="flex items-center justify-between text-brand-dark/50">
              <span className="text-[10px] font-bold uppercase">Deliveries Today</span>
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <strong className="text-lg font-extrabold text-brand-dark">
              {data.deliveriesToday}
            </strong>
          </div>

          {/* Pending Deliveries */}
          <div className="p-3.5 bg-brand-light rounded-xl flex flex-col gap-1 border border-brand-dark/5">
            <div className="flex items-center justify-between text-brand-dark/50">
              <span className="text-[10px] font-bold uppercase">In Transit / Pending</span>
              <AlertCircle className="w-3.5 h-3.5 text-brand-gold" />
            </div>
            <strong className="text-lg font-extrabold text-brand-gold">
              {data.pendingDeliveries}
            </strong>
          </div>

          {/* Completed Deliveries */}
          <div className="p-3.5 bg-brand-light rounded-xl flex flex-col gap-1 border border-brand-dark/5">
            <div className="flex items-center justify-between text-brand-dark/50">
              <span className="text-[10px] font-bold uppercase">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <strong className="text-lg font-extrabold text-emerald-600">
              {data.completedDeliveries}
            </strong>
          </div>

          {/* Active Drivers */}
          <div className="p-3.5 bg-brand-light rounded-xl flex flex-col gap-1 border border-brand-dark/5">
            <div className="flex items-center justify-between text-brand-dark/50">
              <span className="text-[10px] font-bold uppercase">Active Fleet</span>
              <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
            </div>
            <strong className="text-lg font-extrabold text-brand-dark">
              {data.activeDrivers} <span className="text-[10px] text-brand-dark/40 font-semibold">drivers</span>
            </strong>
          </div>

          {/* Avg Driver Load */}
          <div className="p-3.5 bg-brand-light rounded-xl flex flex-col gap-1 border border-brand-dark/5">
            <div className="flex items-center justify-between text-brand-dark/50">
              <span className="text-[10px] font-bold uppercase">Avg Driver Load</span>
              <Truck className="w-3.5 h-3.5 text-brand-dark/40" />
            </div>
            <strong className="text-lg font-extrabold text-brand-dark">
              {data.avgDriverLoad} <span className="text-[10px] text-brand-dark/40 font-semibold">orders/drv</span>
            </strong>
          </div>

          {/* Avg Delivery Time */}
          <div className="p-3.5 bg-brand-light rounded-xl flex flex-col gap-1 border border-brand-dark/5">
            <div className="flex items-center justify-between text-brand-dark/50">
              <span className="text-[10px] font-bold uppercase">Avg Delivery Time</span>
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
            </div>
            <strong className="text-lg font-extrabold text-brand-dark">
              {data.avgDeliveryTimeMinutes !== null ? `${data.avgDeliveryTimeMinutes}m` : "N/A"}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
