"use client";

import { motion } from "framer-motion";
import {
  Pizza,
  Sparkles,
  Clock3,
} from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "Kitchen Queue is Empty",
  description = "There are currently no active orders. New customer orders will appear here automatically.",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-16 backdrop-blur-xl"
    >
      {/* Background Glow */}

      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />

      <div className="relative flex flex-col items-center text-center">

        {/* Animated Icon */}

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="mb-8 rounded-full bg-orange-500/10 p-6 ring-1 ring-orange-500/20"
        >
          <Pizza className="h-16 w-16 text-orange-400" />
        </motion.div>

        {/* Title */}

        <h2 className="text-3xl font-bold text-white">
          {title}
        </h2>

        {/* Description */}

        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/60">
          {description}
        </p>

        {/* Info Cards */}

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <Clock3 className="h-5 w-5 text-orange-400" />

            <span className="text-sm text-white/70">
              Orders update automatically
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <Sparkles className="h-5 w-5 text-yellow-400" />

            <span className="text-sm text-white/70">
              Ready for the next customer
            </span>
          </div>

        </div>

      </div>
    </motion.div>
  );
}