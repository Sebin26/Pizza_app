"use client";

import { useState } from "react";
import useSWR from "swr";
import { TrendingUp, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { SalesResponse } from "@/lib/analytics/services";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SalesChart() {
  const [range, setRange] = useState<"today" | "7d" | "30d">("7d");

  const { data, isLoading, error } = useSWR<SalesResponse>(
    `/api/admin/analytics/sales?range=${range}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const chartData =
    data?.labels?.map((label, idx) => ({
      label,
      revenue: data.revenue[idx] ?? 0,
      orders: data.orders[idx] ?? 0,
    })) || [];

  const totalRevenue = data?.revenue?.reduce((sum, r) => sum + r, 0) || 0;
  const totalOrders = data?.orders?.reduce((sum, o) => sum + o, 0) || 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 flex flex-col gap-4 min-h-90 justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-extrabold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
              Sales Trend & Performance
            </h3>
            <p className="text-[11px] text-brand-dark/45 font-medium">
              Completed & Delivered Revenue
            </p>
          </div>
        </div>

        {/* Range Selector Pills */}
        <div className="flex items-center gap-1 bg-brand-light p-1 rounded-xl">
          {(
            [
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                range === item.id
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Totals Header */}
      <div className="grid grid-cols-2 gap-4 bg-brand-light/60 p-3 rounded-xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-brand-dark/40 uppercase">
            Period Revenue
          </span>
          <strong className="text-base font-extrabold text-brand-primary">
            ${totalRevenue.toFixed(2)}
          </strong>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-brand-dark/40 uppercase">
            Period Orders
          </span>
          <strong className="text-base font-extrabold text-brand-dark">
            {totalOrders}
          </strong>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-52 relative flex items-center justify-center">
        {isLoading && !data && (
          <div className="flex flex-col items-center gap-2 text-brand-dark/40 text-xs font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            <span>Loading sales data...</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-brand-primary font-semibold">
            Failed to load sales chart.
          </div>
        )}

        {!isLoading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E53935" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E53935" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#888888" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#888888" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                formatter={(val: unknown, name?: string | number) => [
                  name === "revenue" ? `$${Number(val || 0).toFixed(2)}` : String(val || 0),
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#E53935"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
