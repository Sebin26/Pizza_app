"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

export type OrderStatus =
  | "ALL"
  | "RECEIVED"
  | "PREPARING"
  | "READY"
  | "COMPLETED";

interface QueueFiltersProps {
  search: string;
  selectedStatus: OrderStatus;

  onSearchChange: (value: string) => void;
  onStatusChange: (status: OrderStatus) => void;

  counts: {
    all: number;
    received: number;
    preparing: number;
    ready: number;
    completed: number;
  };
}

const filters = [
  {
    value: "ALL",
    label: "All",
    color: "bg-slate-500",
  },
  {
    value: "RECEIVED",
    label: "Received",
    color: "bg-sky-500",
  },
  {
    value: "PREPARING",
    label: "Preparing",
    color: "bg-orange-500",
  },
  {
    value: "READY",
    label: "Ready",
    color: "bg-emerald-500",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-purple-500",
  },
] as const;

export default function QueueFilters({
  search,
  selectedStatus,
  onSearchChange,
  onStatusChange,
  counts,
}: QueueFiltersProps) {
  return (
    <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />

          <input
            type="text"
            placeholder="Search order number, customer..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Filters */}

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => {
            const active = selectedStatus === filter.value;

            const count =
              filter.value === "ALL"
                ? counts.all
                : filter.value === "RECEIVED"
                ? counts.received
                : filter.value === "PREPARING"
                ? counts.preparing
                : filter.value === "READY"
                ? counts.ready
                : counts.completed;

            return (
              <motion.button
                key={filter.value}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                onClick={() => onStatusChange(filter.value)}
                className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all
                ${
                  active
                    ? "border-orange-500/50 bg-orange-500/15 text-white shadow-lg shadow-orange-500/10"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${filter.color}`}
                />

                <span className="font-medium">
                  {filter.label}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold
                  ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

      </div>
    </div>
  );
}