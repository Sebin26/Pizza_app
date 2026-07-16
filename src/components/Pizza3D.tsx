"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Pizza3D() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-4 select-none">
      {/* Outer wrapper: entrance fly-in, then hands off to the existing CSS float animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 60, rotate: -25 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] rounded-full bg-radial from-brand-orange/15 via-brand-orange/5 to-transparent flex items-center justify-center animate-float"
      >
        
        {/* Glowing backdrop border */}
        <div className="absolute inset-0 rounded-full border border-brand-orange/10 scale-105 pointer-events-none" />
        <div className="absolute inset-4 rounded-full bg-linear-to-tr from-brand-orange/20 to-transparent blur-xl opacity-60 pointer-events-none" />
        
        {/* Rotating container with slow spin animation */}
        <div className="w-[90%] h-[90%] relative animate-spin-slow flex items-center justify-center">
          {/* Subtle crust backdrop to simulate the 3D depth */}
          <div className="absolute w-[98%] h-[98%] rounded-full bg-linear-to-b from-[#b07b3e] to-[#7c4d1c] shadow-2xl border-4 border-[#9c662d]/50 pointer-events-none" />
          
          {/* The Pizza Image */}
          <div className="relative w-[94%] h-[94%]">
            <Image 
              src="/pizza1.png" 
              alt="Delicious Rotating Pizza"
              fill
              sizes="(max-w-7xl) 100vw, 400px"
              priority
              className="object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </motion.div>
      
      {/* Soft shadow cast below the pizza */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1.1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="absolute bottom-2 w-48 h-5 bg-brand-dark/10 blur-md rounded-full animate-pulse"
      ></motion.div>
    </div>
  );
}
