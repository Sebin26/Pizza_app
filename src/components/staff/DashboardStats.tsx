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
    color: "text-brand-primary",
    iconBg: "bg-brand-primary/10",
    accent: "bg-brand-primary",
  },
  {
    key: "preparing",
    title: "Preparing",
    icon: ChefHat,
    color: "text-orange-500",
    iconBg: "bg-orange-500/10",
    accent: "bg-orange-500",
  },
  {
    key: "ready",
    title: "Ready",
    icon: CheckCircle2,
    color: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    accent: "bg-emerald-500",
  },
  {
    key: "avg",
    title: "Avg. Prep Time",
    icon: Clock3,
    color: "text-brand-gold",
    iconBg: "bg-brand-gold/10",
    accent: "bg-brand-gold",
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
            className="group relative overflow-hidden rounded-3xl border border-brand-dark/5 bg-white shadow-xs"
          >
            <div className="relative flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-semibold text-brand-dark/50">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-brand-dark">
                  {values[stat.key as keyof typeof values]}
                </h2>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${stat.iconBg} transition-all duration-300 group-hover:scale-110`}
              >
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>

            {/* Bottom accent */}
            <div className={`h-1 w-full ${stat.accent} opacity-70`} />
          </motion.div>
        );
      })}
    </div>
  );
}