"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Ember {
  id: number;
  size: number;
  delay: number;
  duration: number;
  xStart: number;
}

// Steam & Embers Option A
function EmbersEffect() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setEmbers(
        Array.from({ length: 12 }, (_, i) => ({
          id: i,
          size: Math.random() * 3 + 2,
          delay: Math.random() * 4,
          duration: Math.random() * 4 + 4,
          xStart: Math.random() * 70 + 15,
        }))
      );
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full bg-linear-to-t from-brand-gold to-brand-primary opacity-75 shadow-[0_0_6px_rgba(232,114,44,0.7)]"
          style={{
            width: ember.size,
            height: ember.size,
            left: `${ember.xStart}%`,
            bottom: "12%",
          }}
          animate={{
            y: [-10, -280],
            x: [0, Math.sin(ember.id) * 20, Math.sin(ember.id) * -15],
            opacity: [0, 0.9, 0.3, 0],
            scale: [1, 1.3, 0.7, 0.3],
          }}
          transition={{
            duration: ember.duration,
            repeat: Infinity,
            delay: ember.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function SteamWisp({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute w-12 h-12 rounded-full bg-white/20 blur-xl pointer-events-none mix-blend-screen opacity-10"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -80],
        x: [0, Math.sin(delay) * 15],
        scale: [0.6, 1.4, 2],
        opacity: [0, 0.7, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function Pizza3D() {
  const [isHovered, setIsHovered] = useState(false);

  // The slice pulls out towards the bottom-right (45 degrees)
  const sliceTranslationX = isHovered ? 40 : 0;
  const sliceTranslationY = isHovered ? 40 : 0;

  // Paths for three gooey cheese strings that stretch between the main body and the slice.
  const cheesePath1 = isHovered
    ? "M 195,195 Q 210,210 225,225"
    : "M 195,195 Q 198,198 200,200";

  const cheesePath2 = isHovered
    ? "M 240,160 Q 230,210 270,190"
    : "M 240,160 Q 240,160 240,160";

  const cheesePath3 = isHovered
    ? "M 180,225 Q 210,260 215,255"
    : "M 180,225 Q 180,225 180,225";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="relative w-full h-112.5 flex items-center justify-center cursor-pointer select-none overflow-hidden rounded-3xl bg-radial from-brand-primary/10 via-transparent to-transparent"
    >
      {/* Background hearth glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,114,44,0.06)_0%,transparent_65%)]" />

      {/* Embers */}
      <EmbersEffect />

      {/* Main Container */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center animate-float">

        {/* 1. THE MAIN PIZZA BODY (WITH 60-DEGREE WEDGE CUT OUT) */}
        <div
          className="absolute w-[92%] h-[92%] transition-transform duration-500 ease-out"
          style={{
            clipPath: "polygon(50% 50%, 100% 50%, 100% 0%, 0% 0%, 0% 100%, 50% 100%)",
          }}
        >
          <Image
            src="/pizza1.png"
            alt="Mouth-watering wood-fired pizza base"
            fill
            sizes="400px"
            priority
            className="object-contain"
          />
        </div>

        {/* 2. STRETCHY CHEESE STRINGS LAYER (SVG) */}
        <svg
          viewBox="0 0 400 400"
          className="absolute w-[92%] h-[92%] z-15 pointer-events-none"
        >
          {/* Cheese 1 */}
          <motion.path
            d={cheesePath1}
            stroke="#eab308"
            strokeWidth={isHovered ? 3.5 : 0}
            fill="none"
            strokeLinecap="round"
            className="drop-shadow-md"
            animate={{ d: cheesePath1, strokeWidth: isHovered ? 3.5 : 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 12 }}
          />
          <motion.path
            d={cheesePath1}
            stroke="#ffffff"
            strokeWidth={isHovered ? 1.5 : 0}
            fill="none"
            strokeLinecap="round"
            animate={{ d: cheesePath1, strokeWidth: isHovered ? 1.5 : 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 12 }}
          />

          {/* Cheese 2 */}
          <motion.path
            d={cheesePath2}
            stroke="#eab308"
            strokeWidth={isHovered ? 4.5 : 0}
            fill="none"
            strokeLinecap="round"
            className="drop-shadow-md"
            animate={{ d: cheesePath2, strokeWidth: isHovered ? 4.5 : 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
          />
          <motion.path
            d={cheesePath2}
            stroke="#fafaf9"
            strokeWidth={isHovered ? 2 : 0}
            fill="none"
            strokeLinecap="round"
            animate={{ d: cheesePath2, strokeWidth: isHovered ? 2 : 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
          />

          {/* Cheese 3 */}
          <motion.path
            d={cheesePath3}
            stroke="#eab308"
            strokeWidth={isHovered ? 5 : 0}
            fill="none"
            strokeLinecap="round"
            className="drop-shadow-md"
            animate={{ d: cheesePath3, strokeWidth: isHovered ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 10 }}
          />
          <motion.path
            d={cheesePath3}
            stroke="#fff"
            strokeWidth={isHovered ? 2 : 0}
            fill="none"
            strokeLinecap="round"
            animate={{ d: cheesePath3, strokeWidth: isHovered ? 2 : 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 10 }}
          />
        </svg>

        {/* Localized Steam rising off cheese pull gap */}
        {isHovered && (
          <>
            <SteamWisp x="52%" y="52%" delay={0} />
            <SteamWisp x="62%" y="48%" delay={1.5} />
          </>
        )}

        {/* 3. THE DETACHED PIZZA SLICE (WEDGE) */}
        <motion.div
          animate={{
            x: sliceTranslationX,
            y: sliceTranslationY,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 14,
          }}
          className="absolute w-[92%] h-[92%] z-10 pointer-events-none"
          style={{
            clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)",
          }}
        >
          <Image
            src="/pizza1.png"
            alt="Detached wood-fired pizza slice"
            fill
            sizes="400px"
            priority
            className="object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}
