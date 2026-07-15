"use client";

import Image from "next/image";

export default function Pizza3D() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-4 select-none">
      {/* Outer wrapper with float animation */}
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] rounded-full bg-radial from-brand-orange/15 via-brand-orange/5 to-transparent flex items-center justify-center animate-float">
        
        {/* Glowing backdrop border */}
        <div className="absolute inset-0 rounded-full border border-brand-orange/10 scale-105 pointer-events-none" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-brand-orange/20 to-transparent blur-xl opacity-60 pointer-events-none" />
        
        {/* Rotating container with slow spin animation */}
        <div className="w-[90%] h-[90%] relative animate-spin-slow flex items-center justify-center">
          {/* Subtle crust backdrop to simulate the 3D depth */}
          <div className="absolute w-[98%] h-[98%] rounded-full bg-gradient-to-b from-[#b07b3e] to-[#7c4d1c] shadow-2xl border-4 border-[#9c662d]/50 pointer-events-none" />
          
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
      </div>
      
      {/* Soft shadow cast below the pizza */}
      <div className="absolute bottom-2 w-48 h-5 bg-brand-dark/10 blur-md rounded-full scale-x-110 animate-pulse"></div>
    </div>
  );
}
