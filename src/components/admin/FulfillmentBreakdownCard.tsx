"use client";

import useSWR from "swr";
import { PieChart, Store, ShoppingBag, Truck, Loader2 } from "lucide-react";
import { FulfillmentResponse } from "@/lib/analytics/services";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FulfillmentBreakdownCard() {
  const { data, isLoading, error } = useSWR<FulfillmentResponse>(
    "/api/admin/analytics/fulfillment",
    fetcher,
    { refreshInterval: 10000 }
  );

  const totalOrders =
    (data?.counts?.dineIn || 0) + (data?.counts?.pickup || 0) + (data?.counts?.delivery || 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 flex flex-col gap-4 min-h-90 justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-dark/5 pb-3">
        <div className="w-8 h-8 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center font-extrabold">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
            Fulfillment Channels
          </h3>
          <p className="text-[11px] text-brand-dark/45 font-medium">
            Today&apos;s channel distribution
          </p>
        </div>
      </div>

      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-brand-dark/40 text-xs font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading fulfillment channels...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-brand-primary font-semibold py-6 text-center">
          Failed to load channel breakdown.
        </div>
      )}

      {!isLoading && data && (
        <div className="flex flex-col gap-5 my-auto">
          {/* Progress Bar Stack */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-brand-dark">
              <span>Channel Split</span>
              <span className="text-[11px] text-brand-dark/45 font-semibold">
                {totalOrders} Orders Today
              </span>
            </div>

            {/* Combined Segment Bar */}
            <div className="h-3.5 w-full bg-brand-light rounded-full overflow-hidden flex shadow-inner">
              {totalOrders > 0 ? (
                <>
                  <div
                    style={{ width: `${data.percentages.dineIn}%` }}
                    className="bg-brand-primary transition-all duration-500 h-full"
                    title={`Dine In: ${data.percentages.dineIn}%`}
                  />
                  <div
                    style={{ width: `${data.percentages.pickup}%` }}
                    className="bg-brand-gold transition-all duration-500 h-full"
                    title={`Pickup: ${data.percentages.pickup}%`}
                  />
                  <div
                    style={{ width: `${data.percentages.delivery}%` }}
                    className="bg-indigo-600 transition-all duration-500 h-full"
                    title={`Delivery: ${data.percentages.delivery}%`}
                  />
                </>
              ) : (
                <div className="w-full bg-brand-dark/10 h-full" />
              )}
            </div>
          </div>

          {/* Breakdown Items List */}
          <div className="flex flex-col gap-2.5">
            {/* Dine In */}
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0" />
                <Store className="w-4 h-4 text-brand-primary" />
                <span className="font-bold text-brand-dark">Dine In</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-brand-dark/50 font-medium">
                  {data.counts.dineIn} orders
                </span>
                <strong className="text-brand-dark font-extrabold w-10 text-right">
                  {data.percentages.dineIn}%
                </strong>
              </div>
            </div>

            {/* Pickup */}
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shrink-0" />
                <ShoppingBag className="w-4 h-4 text-brand-gold" />
                <span className="font-bold text-brand-dark">Takeout / Pickup</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-brand-dark/50 font-medium">
                  {data.counts.pickup} orders
                </span>
                <strong className="text-brand-dark font-extrabold w-10 text-right">
                  {data.percentages.pickup}%
                </strong>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-xl text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-brand-dark">Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-brand-dark/50 font-medium">
                  {data.counts.delivery} orders
                </span>
                <strong className="text-brand-dark font-extrabold w-10 text-right">
                  {data.percentages.delivery}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
