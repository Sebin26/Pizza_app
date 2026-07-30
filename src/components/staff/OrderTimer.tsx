"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

interface OrderTimerProps {
  createdAt: string;
}

export default function OrderTimer({ createdAt }: OrderTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const created = new Date(createdAt).getTime();
      const now = Date.now();

      setElapsedSeconds(Math.max(0, Math.floor((now - created) / 1000)));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const time = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const urgency = useMemo(() => {
    if (minutes < 5) {
      return {
        label: "Fresh",
        text: "text-emerald-300",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/20",
        pulse: false,
      };
    }

    if (minutes < 10) {
      return {
        label: "Preparing",
        text: "text-amber-300",
        bg: "bg-amber-500/15",
        border: "border-amber-500/20",
        pulse: false,
      };
    }

    return {
      label: "Urgent",
      text: "text-red-300",
      bg: "bg-red-500/15",
      border: "border-red-500/20",
      pulse: true,
    };
  }, [minutes]);

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