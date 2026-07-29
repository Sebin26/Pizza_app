"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MenuItem } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FeaturedPizzaShowcaseProps {
  featuredPizzas: MenuItem[];
}

// Hand-drawn SVG doodle accents
const DoodleSquiggle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M3 15C12 3 24 27 35 15C46 3 57 27 68 15C79 3 90 27 97 15"
      stroke="#E8722C"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DoodleStar = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M25 3L28.5 18.5L44 25L28.5 31.5L25 47L21.5 31.5L6 25L21.5 18.5L25 3Z"
      stroke="#E8722C"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DoodlePlus = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 5V35M5 20H35" stroke="#241C15" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const DoodleCircle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M30 6C15 6 6 18 6 32C6 46 18 54 32 54C46 54 54 42 54 28C54 14 42 7 28 8"
      stroke="#E8722C"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="4 2"
    />
  </svg>
);

const DoodleSparkle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 2C20 12 12 20 2 20C12 20 20 28 20 38C20 28 28 20 38 20C28 20 20 12 20 2Z"
      fill="#E8722C"
      fillOpacity="0.85"
    />
  </svg>
);

const ACCENT_PHRASES = [
  "Wood-Fired Daily",
  "Customer Favorite",
  "House Signature Sourdough",
  "Artisanal Recipe",
  "Handcrafted Daily",
];

export default function FeaturedPizzaShowcase({ featuredPizzas }: FeaturedPizzaShowcaseProps) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col gap-24 lg:gap-32">
      {featuredPizzas.map((item, idx) => {
        const isEven = idx % 2 === 0;
        const accentPhrase = ACCENT_PHRASES[idx % ACCENT_PHRASES.length];

        return (
          <div
            key={item.id}
            className={`w-full flex flex-col ${
              isEven ? "lg:flex-row" : "lg:flex-row-reverse"
            } items-center justify-between gap-12 lg:gap-16 relative`}
          >
            {/* PHOTO SIDE (No bordered card container, soft floating photo with doodles) */}
            <motion.div
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="w-full lg:w-[44%] flex justify-center items-center relative group"
            >
              {/* Subtle Hand-Drawn Doodle Accents positioned in whitespace */}
              {isEven ? (
                <>
                  <DoodleSquiggle className="absolute -top-6 -left-4 w-16 sm:w-20 h-auto opacity-70 pointer-events-none -rotate-12" />
                  <DoodleStar className="absolute top-4 -right-2 sm:right-2 w-8 sm:w-10 h-auto opacity-80 pointer-events-none rotate-12" />
                  <DoodlePlus className="absolute -bottom-4 left-6 w-6 sm:w-8 h-auto opacity-40 pointer-events-none" />
                  <DoodleCircle className="absolute -bottom-6 right-8 w-12 sm:w-14 h-auto opacity-60 pointer-events-none" />
                </>
              ) : (
                <>
                  <DoodleSparkle className="absolute -top-6 -right-2 w-8 sm:w-10 h-auto opacity-80 pointer-events-none" />
                  <DoodleSquiggle className="absolute -bottom-6 -right-4 w-16 sm:w-20 h-auto opacity-70 pointer-events-none rotate-45" />
                  <DoodleStar className="absolute bottom-2 -left-4 w-8 sm:w-10 h-auto opacity-75 pointer-events-none -rotate-15" />
                  <DoodlePlus className="absolute top-2 left-6 w-6 sm:w-8 h-auto opacity-40 pointer-events-none" />
                </>
              )}

              {/* Pizza Floating Image */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-full lg:max-w-md aspect-square">
                {item.imageUrl ? (
                  <Image
                    src={`/${item.imageUrl}.png`}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-contain rounded-full drop-shadow-[0_25px_35px_rgba(36,28,21,0.22)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-3"
                    priority={idx === 0}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full drop-shadow-[0_25px_35px_rgba(36,28,21,0.22)] flex items-center justify-center text-7xl sm:text-8xl transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-6"
                    style={{
                      background: "radial-gradient(circle, #D99A2B 10%, #E8722C 60%, #be5212 100%)",
                    }}
                  >
                    <span>🍕</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* TEXT SIDE (Editorial Poster Style) */}
            <motion.div
              initial={{ opacity: 0, x: isEven ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="w-full lg:w-[52%] flex flex-col justify-center text-left"
            >
              {/* Short Italic Accent Phrase in Caveat font */}
              <span className="font-caveat text-2xl sm:text-3xl text-brand-gold italic font-medium tracking-wide mb-1 select-none">
                ~ {accentPhrase} ~
              </span>

              {/* Pizza Title in large bold Poppins font */}
              <h3 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-[1.08] mb-3">
                {item.name}
              </h3>

              {/* Large Burnt-Orange Price */}
              <div className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#E8722C] mb-4">
                ${item.basePrice.toFixed(2)}
              </div>

              {/* Description */}
              <p className="text-brand-dark/75 text-base sm:text-lg font-normal leading-relaxed mb-8 max-w-xl">
                {item.description}
              </p>

              {/* Solid Burnt-Orange Filled Button */}
              <div>
                <button
                  type="button"
                  onClick={() => router.push(`/builder?id=${item.id}`)}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#E8722C] hover:bg-[#be5212] text-white font-poppins font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-[#E8722C]/25 hover:shadow-xl hover:shadow-[#E8722C]/35 transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                >
                  <span>Customize &amp; Order</span>
                  <ArrowRight className="w-5.5 h-5.5 group-hover:translate-x-1 transition-transform duration-200 ease-out" />
                </button>
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* Explore full catalog CTA link */}
      <div className="pt-8 text-center">
        <Link
          href="/?order=true"
          className="group inline-flex items-center gap-3 font-poppins font-extrabold text-lg sm:text-xl text-[#E8722C] hover:text-[#be5212] transition-colors duration-200"
        >
          <span>Explore full catalog of pizzas, sides, and drinks</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-200 ease-out" />
        </Link>
      </div>
    </div>
  );
}
