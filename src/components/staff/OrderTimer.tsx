"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

interface OrderTimerProps {
  createdAt: string;
  completedAt?: string | null;
}
export default function OrderTimer({ createdAt, completedAt }: OrderTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

useEffect(() => {
  const updateTimer = () => {
    const created = new Date(createdAt).getTime();

    const endTime = completedAt
      ? new Date(completedAt).getTime()
      : Date.now();

    setElapsedSeconds(
      Math.max(0, Math.floor((endTime - created) / 1000))
    );
  };

  updateTimer();

  // Don't keep updating once completed
  if (completedAt) {
    return;
  }

  const interval = setInterval(updateTimer, 1000);

  return () => clearInterval(interval);
}, [createdAt, completedAt]);

  const totalMinutes = Math.floor(elapsedSeconds / 60);
  const hours = Math.floor(elapsedSeconds / 3600);
  const remainingMinutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const time =
    hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${totalMinutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

  const urgency = useMemo(() => {
    if (completedAt) {
      return {
        label: "Completed",
        text: "text-brand-dark/60",
        bg: "bg-brand-dark/5",
        border: "border-brand-dark/10",
        pulse: false,
      };
    }

    if (totalMinutes < 5) {
      return {
        label: "Fresh",
        text: "text-emerald-700",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        pulse: false,
      };
    }

    if (totalMinutes < 10) {
      return {
        label: "Preparing",
        text: "text-brand-gold",
        bg: "bg-brand-gold/10",
        border: "border-brand-gold/20",
        pulse: false,
      };
    }

    return {
      label: "Urgent",
      text: "text-brand-primary",
      bg: "bg-brand-primary/10",
      border: "border-brand-primary/25",
      pulse: true,
    };
  }, [totalMinutes, completedAt]);

  return (
    <motion.div
      animate={
        urgency.pulse
          ? {
              scale: [1, 1.04, 1],
            }
          : {}
      }
      transition={{
        duration: 1.2,
        repeat: Infinity,
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${urgency.bg} ${urgency.border}`}
    >
      <Clock3 className={`h-4 w-4 ${urgency.text}`} />

      <span
        className={`font-mono text-sm font-semibold tracking-wide ${urgency.text}`}
      >
        {time}
      </span>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgency.bg} ${urgency.text}`}
      >
        {urgency.label}
      </span>
    </motion.div>
  );
}