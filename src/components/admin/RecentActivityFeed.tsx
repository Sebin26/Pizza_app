"use client";

import useSWR from "swr";
import {
  Activity,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Store,
  UserCheck,
  Loader2,
} from "lucide-react";
import { ActivityResponse, ActivityItem } from "@/lib/analytics/services";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "new_order":
      return <ShoppingBag className="w-3.5 h-3.5 text-brand-primary" />;
    case "order_preparing":
      return <Clock className="w-3.5 h-3.5 text-brand-gold" />;
    case "driver_assigned":
      return <Truck className="w-3.5 h-3.5 text-indigo-600" />;
    case "order_delivered":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    case "pickup_completed":
      return <Store className="w-3.5 h-3.5 text-brand-gold" />;
    case "staff_login":
      return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
    default:
      return <Activity className="w-3.5 h-3.5 text-brand-dark/50" />;
  }
}

export default function RecentActivityFeed() {
  const { data, isLoading, error } = useSWR<ActivityResponse>(
    "/api/admin/analytics/activity",
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 flex flex-col gap-4 min-h-90 justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-dark/5 pb-3">
        <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-extrabold">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
            Live Activity Feed
          </h3>
          <p className="text-[11px] text-brand-dark/45 font-medium">
            Real-time store event updates
          </p>
        </div>
      </div>

      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-brand-dark/40 text-xs font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading activity stream...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-brand-primary font-semibold py-6 text-center">
          Failed to load recent activity.
        </div>
      )}

      {!isLoading && data && (
        <div className="flex flex-col gap-2 max-h-65 overflow-y-auto pr-1">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-brand-light rounded-xl text-xs font-semibold hover:bg-brand-light/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0 border border-brand-dark/5">
                  {getActivityIcon(item.type)}
                </div>
                <span className="font-bold text-brand-dark truncate">{item.message}</span>
              </div>
              <span className="text-[10px] text-brand-dark/45 font-semibold shrink-0">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          ))}

          {data.items.length === 0 && (
            <p className="text-xs text-brand-dark/40 italic py-8 text-center">
              No recent activity logs available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
