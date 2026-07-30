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
      className="relative overflow-hidden rounded-3xl border border-brand-dark/5 bg-white px-8 py-16 shadow-xs"
    >
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
          className="mb-8 rounded-full bg-brand-primary/10 p-6 ring-1 ring-brand-primary/20"
        >
          <Pizza className="h-16 w-16 text-brand-primary" />
        </motion.div>

        {/* Title */}

        <h2 className="text-3xl font-extrabold text-brand-dark">
          {title}
        </h2>

        {/* Description */}

        <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-dark/60">
          {description}
        </p>

        {/* Info Cards */}

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <div className="flex items-center gap-3 rounded-2xl border border-brand-dark/5 bg-brand-light px-5 py-3">
            <Clock3 className="h-5 w-5 text-brand-primary" />

            <span className="text-sm font-semibold text-brand-dark/70">
              Orders update automatically
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-brand-dark/5 bg-brand-light px-5 py-3">
            <Sparkles className="h-5 w-5 text-brand-gold" />

            <span className="text-sm font-semibold text-brand-dark/70">
              Ready for the next customer
            </span>
          </div>

        </div>

      </div>
    </motion.div>
  );
}