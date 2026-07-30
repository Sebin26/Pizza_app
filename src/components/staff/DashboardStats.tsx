"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  ChefHat,
  CheckCircle2,
  Clock3,
} from "lucide-react";

interface DashboardStatsProps {
  activeOrders: number;
  preparingOrders: number;
  readyOrders: number;
  averagePrepTime: number;
}

const stats = [
  {
    key: "active",
    title: "Active Orders",
    icon: ClipboardList,
    color: "text-sky-400",
    glow: "from-sky-500/20 to-sky-500/5",
  },
  {
    key: "preparing",
    title: "Preparing",
    icon: ChefHat,
    color: "text-orange-400",
    glow: "from-orange-500/25 to-orange-500/5",
  },
  {
    key: "ready",
    title: "Ready",
    icon: CheckCircle2,
    color: "text-emerald-400",
    glow: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    key: "avg",
    title: "Avg. Prep Time",
    icon: Clock3,
    color: "text-amber-400",
    glow: "from-amber-500/20 to-amber-500/5",
  },
];

export default function DashboardStats({
  activeOrders,
  preparingOrders,
  readyOrders,
  averagePrepTime,
}: DashboardStatsProps) {
  const values = {
    active: activeOrders,
    preparing: preparingOrders,
    ready: readyOrders,
    avg: `${averagePrepTime} min`,
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
            }}
            whileHover={{
              y: -6,
              scale: 1.02,
            }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            {/* Glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            {/* Glass shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

            <div className="relative flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-white/60">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
                  {values[stat.key as keyof typeof values]}
                </h2>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110`}
              >
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>

            {/* Bottom accent */}
            <div
              className={`h-1 w-full bg-gradient-to-r ${stat.glow}`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}