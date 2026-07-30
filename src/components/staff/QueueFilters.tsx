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
    color: "bg-brand-dark/40",
  },
  {
    value: "RECEIVED",
    label: "Received",
    color: "bg-sky-500",
  },
  {
    value: "PREPARING",
    label: "Preparing",
    color: "bg-brand-primary",
  },
  {
    value: "READY",
    label: "Ready",
    color: "bg-emerald-500",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-brand-gold",
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
    <div className="mb-8 rounded-3xl border border-brand-dark/5 bg-white p-5 shadow-xs">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/30" />

          <input
            type="text"
            placeholder="Search order number, customer..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-transparent bg-brand-light py-3 pl-12 pr-4 text-brand-dark text-sm placeholder:text-brand-dark/40 outline-none transition focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 focus:bg-white"
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
                className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all cursor-pointer
                ${
                  active
                    ? "border-brand-primary/40 bg-brand-primary/10 text-brand-dark shadow-sm"
                    : "border-brand-dark/10 bg-brand-light text-brand-dark/60 hover:border-brand-dark/20 hover:bg-brand-dark/5"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${filter.color}`}
                />

                <span className="font-bold text-sm">
                  {filter.label}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-extrabold
                  ${
                    active
                      ? "bg-brand-primary text-white"
                      : "bg-brand-dark/10 text-brand-dark/60"
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