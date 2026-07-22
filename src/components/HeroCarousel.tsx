"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    url: "/pizza1.png",
    alt: "Signature Wood-Fired Pizza",
    title: "Gourmet Wood-Fired Pies",
    subtitle: "Baked at 900°F with house sourdough"
  },
  {
    url: "/bbq_chicken_supreme.png",
    alt: "BBQ Chicken Supreme Pizza",
    title: "Artisanal Ingredients",
    subtitle: "Local organic toppings & hand-crafted cheeses"
  },
  {
    url: "/chef_portrait.png",
    alt: "Head Chef portrait",
    title: "Chef Crafted Recipes",
    subtitle: "Signature pairings curated by our master pizzaiolo"
  },
  {
    url: "/margherita_pizza.png",
    alt: "Classic Margherita Pizza",
    title: "Timeless Italian Classics",
    subtitle: "Saporous San Marzano tomato sauce, fresh basil & mozzarella"
  }
];

export default function HeroCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      handleNext();
    }, 7000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isHovered, currentIdx]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx: number) => {
    setCurrentIdx(idx);
  };

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden select-none group z-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={slides[currentIdx].url}
            alt={slides[currentIdx].alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center w-full h-full"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between items-center pointer-events-none">
        <button
          onClick={handlePrev}
          type="button"
          className="pointer-events-auto w-12 h-12 rounded-full bg-brand-dark/30 hover:bg-brand-primary text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6 stroke-3" />
        </button>
        <button
          onClick={handleNext}
          type="button"
          className="pointer-events-auto w-12 h-12 rounded-full bg-brand-dark/30 hover:bg-brand-primary text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6 stroke-3" />
        </button>
      </div>

      {/* Slide Indicators Dots */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleDotClick(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
              idx === currentIdx 
                ? "bg-brand-primary scale-110" 
                : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
