"use client";

import { motion } from "framer-motion";

interface IngredientProps {
  name: string;
  className: string;
  delay: number;
  duration: number;
  yRange: number;
  xRange: number;
  rotationRange: number;
  scale?: number;
}

// Crisp SVGs for each ingredient
const SVGs: { [key: string]: React.ReactNode } = {
  basil: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-600 drop-shadow-md">
      <path
        d="M2 12C2 12 6 6 12 6C18 6 22 12 22 12C22 12 18 18 12 18C6 18 2 12 2 12Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M12 6C14 8 16 11 16 13C16 15 14 17 12 18M12 6C10 8 8 11 8 13C8 15 10 17 12 18"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      <path d="M2 12H22" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
    </svg>
  ),
  tomato: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-red-500 drop-shadow-md">
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="12" r="9" fill="#b91c1c" />
      {/* Tomato seeds segments */}
      <path d="M9 9C8 10.5 8 13.5 9 15" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 9C16 10.5 16 13.5 15 15" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10.5" cy="10.5" r="1" fill="#fef08a" />
      <circle cx="13.5" cy="10.5" r="1" fill="#fef08a" />
      <circle cx="10.5" cy="13.5" r="1" fill="#fef08a" />
      <circle cx="13.5" cy="13.5" r="1" fill="#fef08a" />
    </svg>
  ),
  mushroom: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-stone-300 drop-shadow-md">
      {/* Mushroom Cap */}
      <path d="M4 12C4 7 8 4 12 4C16 4 20 7 20 12H4Z" fill="currentColor" opacity="0.95" />
      {/* Mushroom Stem */}
      <path d="M10 12V18C10 19.5 11 20 12 20C13 20 14 19.5 14 18V12H10Z" fill="#a8a29e" />
      {/* Details */}
      <circle cx="8" cy="8" r="1.5" fill="#a8a29e" opacity="0.5" />
      <circle cx="15" cy="7" r="1.2" fill="#a8a29e" opacity="0.5" />
    </svg>
  ),
  olive: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-stone-900 drop-shadow-md">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="12" cy="12" r="4.5" fill="#f5f5f7" /> {/* Inner cutout */}
    </svg>
  ),
  jalapeno: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-700 drop-shadow-md">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="12" r="7.5" fill="#15803d" />
      <circle cx="12" cy="12" r="4" fill="#a3e635" opacity="0.4" />
      {/* Little seeds */}
      <circle cx="11" cy="9.5" r="1" fill="#fef08a" />
      <circle cx="14" cy="12" r="1" fill="#fef08a" />
      <circle cx="9.5" cy="13" r="1" fill="#fef08a" />
    </svg>
  ),
  cheese: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-300 drop-shadow-md">
      {/* Tilted Cheese Cube */}
      <path d="M6 10 L14 6 L20 10 L12 14 Z" fill="#fde047" />
      <path d="M6 10 L12 14 L12 20 L6 16 Z" fill="#eab308" />
      <path d="M12 14 L20 10 L20 16 L12 20 Z" fill="#ca8a04" />
    </svg>
  ),
  garlic: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-orange-50 drop-shadow-md">
      {/* Garlic Clove */}
      <path
        d="M12 2C10.5 6 7 9 7 13.5C7 16.5 9.2 19 12 19C14.8 19 17 16.5 17 13.5C17 9 13.5 6 12 2Z"
        fill="currentColor"
      />
      <path d="M12 2V19" stroke="#e4e4e7" strokeWidth="0.75" />
      <path d="M10 6C9 9 9.5 14 12 19" stroke="#e4e4e7" strokeWidth="0.5" />
      <path d="M14 6C15 9 14.5 14 12 19" stroke="#e4e4e7" strokeWidth="0.5" />
    </svg>
  ),
};

function FloatingIngredient({
  name,
  className,
  delay,
  duration,
  yRange,
  xRange,
  rotationRange,
  scale = 1,
}: IngredientProps) {
  return (
    <motion.div
      className={`absolute select-none pointer-events-none z-10 will-change-transform ${className}`}
      style={{ scale }}
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{
        y: [0, yRange, -yRange * 0.5, 0],
        x: [0, xRange, -xRange * 0.7, 0],
        rotate: [0, rotationRange, -rotationRange * 0.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {SVGs[name] || null}
    </motion.div>
  );
}

export default function IngredientsCanvas() {
  const ingredients: IngredientProps[] = [
    // Top-left area
    { name: "basil", className: "top-[15%] left-[10%] w-10 h-10 md:w-14 md:h-14", delay: 0, duration: 12, yRange: -20, xRange: 15, rotationRange: 25 },
    { name: "tomato", className: "top-[30%] left-[5%] w-12 h-12 md:w-16 md:h-16", delay: 2, duration: 15, yRange: 25, xRange: -10, rotationRange: -30, scale: 0.9 },
    { name: "cheese", className: "top-[10%] left-[30%] w-8 h-8 md:w-10 md:h-10", delay: 1, duration: 10, yRange: -15, xRange: 20, rotationRange: 45 },
    
    // Top-right area
    { name: "mushroom", className: "top-[12%] right-[15%] w-10 h-10 md:w-12 md:h-12", delay: 3, duration: 14, yRange: 20, xRange: -15, rotationRange: 20 },
    { name: "olive", className: "top-[25%] right-[8%] w-6 h-6 md:w-8 md:h-8", delay: 0.5, duration: 9, yRange: -10, xRange: 10, rotationRange: -40 },
    { name: "basil", className: "top-[40%] right-[3%] w-9 h-9 md:w-11 md:h-11", delay: 4, duration: 11, yRange: -18, xRange: 12, rotationRange: 15, scale: 0.8 },

    // Bottom-left area
    { name: "jalapeno", className: "bottom-[20%] left-[8%] w-8 h-8 md:w-10 md:h-10", delay: 5, duration: 13, yRange: 15, xRange: 15, rotationRange: 35 },
    { name: "garlic", className: "bottom-[35%] left-[2%] w-10 h-10 md:w-12 md:h-12", delay: 1.5, duration: 16, yRange: -22, xRange: -12, rotationRange: -15 },
    { name: "mushroom", className: "bottom-[8%] left-[25%] w-11 h-11 md:w-13 md:h-13", delay: 2.5, duration: 12, yRange: -15, xRange: 18, rotationRange: 25, scale: 0.85 },

    // Bottom-right area
    { name: "tomato", className: "bottom-[18%] right-[10%] w-14 h-14 md:w-18 md:h-18", delay: 3.5, duration: 17, yRange: 25, xRange: -15, rotationRange: 40 },
    { name: "basil", className: "bottom-[32%] right-[22%] w-10 h-10 md:w-12 md:h-12", delay: 0.8, duration: 10, yRange: -15, xRange: 10, rotationRange: -20 },
    { name: "cheese", className: "bottom-[10%] right-[30%] w-8 h-8 md:w-10 md:h-10", delay: 2, duration: 11, yRange: 12, xRange: -20, rotationRange: 30 }
  ];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {ingredients.map((ing, idx) => (
        <FloatingIngredient key={`ing-${idx}-${ing.name}`} {...ing} />
      ))}
    </div>
  );
}
