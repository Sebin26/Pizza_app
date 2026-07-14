"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MenuItem } from "@/types";
import { 
  ArrowRight, 
  Flame, 
  Clock, 
  Leaf, 
  Award, 
  Star, 
  ArrowUpRight 
} from "lucide-react";

// Dynamically import client-only 3D/animation elements to prevent hydration issues
const Pizza3D = dynamic(() => import("./Pizza3D"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full aspect-square max-w-md md:max-w-xl flex items-center justify-center">
      <div className="w-24 h-24 rounded-full border-4 border-t-brand-red border-r-transparent border-b-brand-orange border-l-transparent animate-spin"></div>
    </div>
  )
});

const IngredientsCanvas = dynamic(() => import("./IngredientsCanvas"), { ssr: false });

interface LandingPageProps {
  featuredPizzas: MenuItem[];
}

export default function LandingPage({ featuredPizzas }: LandingPageProps) {
  const router = useRouter();

  // Scroll handler for landing page anchors
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // height of fixed header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-cream text-brand-dark overflow-x-hidden selection:bg-brand-red/10 selection:text-brand-red">
      
      {/* Background Gradients & Ambient Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft radial grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,124,0,0.025)_0%,transparent_75%)]" />
        
        {/* Warm ambient light blobs */}
        <div className="absolute top-[10%] left-[65%] w-[50vw] h-[50vw] max-w-[600px] bg-linear-to-tr from-brand-orange/12 to-brand-red/8 rounded-full blur-[120px] opacity-75" />
        <div className="absolute top-[40%] left-[-15%] w-[45vw] h-[45vw] max-w-[500px] bg-brand-orange/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] max-w-[450px] bg-linear-to-br from-brand-yellow/10 to-brand-orange/5 rounded-full blur-[110px]" />
      </div>

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Cinematic Content */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/5 border border-brand-red/15 text-brand-red text-xs font-bold uppercase tracking-widest w-fit">
                <Flame className="w-4 h-4 fill-current animate-pulse text-brand-red" />
                <span>Wood-Fired Pizza Experience</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-brand-dark">
                Freshly Made Pizza.<br />
                <span className="bg-linear-to-r from-brand-red to-brand-orange bg-clip-text text-transparent">
                  Ready When You Are.
                </span>
              </h1>
              
              <p className="text-[16px] sm:text-[18px] text-brand-dark/70 leading-relaxed font-medium max-w-xl">
                Skip the queue. Place your order directly from your table, customize toppings live, and watch as our chefs fire your pizza at 900°F.
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/?order=true"
                className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-brand-red hover:bg-brand-red/95 text-white font-bold rounded-2xl shadow-lg shadow-brand-red/25 hover:shadow-xl hover:shadow-brand-red/35 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-98 overflow-hidden"
              >
                {/* Micro-glow effect */}
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <span>Start Ordering</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#featured-pizzas"
                onClick={(e) => handleScroll(e, "featured-pizzas")}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/70 hover:bg-white border border-brand-dark/10 hover:border-brand-dark/20 text-brand-dark font-bold rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-98"
              >
                <span>View Menu</span>
              </a>
            </motion.div>

            {/* In-Store Ordering Features badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-4 border-t border-brand-dark/10 max-w-lg"
            >
              <div>
                <span className="block text-2xl font-extrabold text-brand-red">Table #</span>
                <span className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">Tap to Order</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-brand-red">900°F</span>
                <span className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">Wood Oven</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-brand-red">5 Min</span>
                <span className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">Fast Service</span>
              </div>
            </motion.div>
          </div>

          {/* Right: R3F 3D Pizza Canvas */}
          <div className="lg:col-span-6 flex items-center justify-center relative w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[500px]">
            {/* Blurry blobs behind canvas */}
            <div className="absolute w-72 h-72 rounded-full bg-brand-orange/15 filter blur-3xl opacity-80 pointer-events-none" />
            
            {/* 3D Canvas element */}
            <Pizza3D />
            
            {/* Floating Ingredients surrounding the canvas */}
            <IngredientsCanvas />
          </div>

        </div>
      </section>

      {/* 2. FEATURED PIZZAS SECTION */}
      <section id="featured-pizzas" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-brand-dark/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
              Signature Pies
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight">
              Chef’s Handcrafted Selections
            </h2>
            <p className="text-[15px] sm:text-base text-brand-dark/60 max-w-2xl leading-relaxed">
              Try our freshly baked signature pizzas, made with house-fermented sourdough and organic ingredients. Fully customizable at your table.
            </p>
          </div>

          {/* Grid of Featured Pizzas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPizzas.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-brand-cream rounded-3xl overflow-hidden shadow-xs hover:shadow-xl border border-brand-dark/5 flex flex-col justify-between transition-all duration-300"
              >
                {/* Pizza Graphic/Image Header */}
                <div className="h-52 bg-brand-light relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-brand-red/10 transition-transform duration-500 group-hover:scale-105"></div>
                  
                  {/* Rotating/Scaling Pizza Image on Hover */}
                  {item.imageUrl ? (
                    <div className="relative w-40 h-40 transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-12">
                      <Image
                        src={`/${item.imageUrl}.png`}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain rounded-full drop-shadow-xl"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-32 h-32 rounded-full shadow-xl flex items-center justify-center text-5xl transition-transform duration-700 ease-out group-hover:rotate-45"
                      style={{
                        background: "radial-gradient(circle, #FBC02D 10%, #F57C00 50%, #C62828 100%)"
                      }}
                    >
                      <span>🍕</span>
                    </div>
                  )}

                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-brand-red text-[11px] font-extrabold uppercase tracking-wide shadow-xs">
                    Popular
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-red transition-colors duration-200">
                        {item.name}
                      </h3>
                      <span className="text-xl font-extrabold text-brand-red shrink-0">
                        ${item.basePrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-brand-dark/65 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => router.push(`/builder?id=${item.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-brand-red group-hover:bg-brand-red text-brand-dark group-hover:text-white font-bold rounded-xl border border-brand-dark/10 group-hover:border-transparent text-sm transition-all duration-300 active:scale-97 shadow-xs hover:shadow-md"
                  >
                    <span>Customize & Order</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Menu CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/?order=true"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:text-brand-orange transition-colors"
            >
              <span>Explore full catalog of pizzas, sides, and drinks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-cream border-t border-brand-dark/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-xs font-bold uppercase tracking-wider">
              The Artisan Standard
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight">
              The Craft Behind The Crust
            </h2>
            <p className="text-[15px] sm:text-base text-brand-dark/60 max-w-xl leading-relaxed">
              We make each pizza with meticulous detail, blending old-world baking traditions with modern tech convenience.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Fresh Ingredients */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-3xl shadow-xs border border-brand-dark/5 flex flex-col gap-6 group hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Fresh Ingredients</h3>
              <p className="text-sm text-brand-dark/65 leading-relaxed">
                Handpicked San Marzano tomatoes, fresh buffalo mozzarella, and organic basil, imported from Italy or sourced from local, sustainable micro-farms.
              </p>
            </motion.div>

            {/* Fast Preparation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xs border border-brand-dark/5 flex flex-col gap-6 group hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Fast Preparation</h3>
              <p className="text-sm text-brand-dark/65 leading-relaxed">
                No long wait times. Fired in our artisanal 900°F stone-deck oven, your handcrafted pizza is baked to bubbly perfection in under 5 minutes.
              </p>
            </motion.div>

            {/* Authentic Italian Recipe */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-xs border border-brand-dark/5 flex flex-col gap-6 group hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Authentic Recipe</h3>
              <p className="text-sm text-brand-dark/65 leading-relaxed">
                Our signature sourdough is fermented for 48 hours, creating a crust that is light, airy, deeply flavorful, and incredibly easy to digest.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 4. CHEF STORY SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-brand-dark/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Chef Portrait */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative w-full aspect-square max-w-[480px] mx-auto rounded-[32px] overflow-hidden shadow-2xl border border-brand-dark/10 group"
          >
            {/* Overlay border design */}
            <div className="absolute inset-4 rounded-[24px] border border-white/20 z-10 pointer-events-none" />
            
            {/* Chef image loaded from public */}
            <Image 
              src="/chef_portrait.png" 
              alt="Chef Giovanni preparing authentic wood-fired pizza" 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              priority
            />
          </motion.div>

          {/* Right: Narrative story */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider w-fit">
              Master Pizzaiolo
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
              A Sourdough Secret,<br />Passed Down for Generations
            </h2>
            <div className="h-0.5 w-16 bg-brand-red rounded-full my-1"></div>
            
            <div className="flex flex-col gap-4 text-[15px] sm:text-base text-brand-dark/75 leading-relaxed font-medium">
              <p>
                Born and raised in Napoli, Chef Giovanni brought the scent of wood-fired smoke and traditional yeast recipes to D Town Pizza. For over 20 years, his sourdough starter has been nurtured daily, bringing complex fermentation notes to every bite.
              </p>
              <p>
                &ldquo;Making a pizza is not just cooking. It is a precise dance between temperature, humidity, and time. When that crust hits the stone in our oven, it&apos;s the culmination of hours of fermentation and decades of tradition coming alive.&rdquo;
              </p>
            </div>

            {/* Blockquote signature */}
            <div className="pt-2">
              <span className="block font-bold text-lg text-brand-dark">Chef Giovanni Rossi</span>
              <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Founder & Head Chef</span>
            </div>

            <div className="pt-4">
              <Link
                href="/?order=true"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-brand-dark hover:bg-brand-red text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <span>Discover Chef Specials</span>
                <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION (GLASSMORPHISM) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-cream border-t border-brand-dark/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/15 text-yellow-700 text-xs font-bold uppercase tracking-wider">
              Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight">
              Loved By Pizza Connoisseurs
            </h2>
            <p className="text-[15px] sm:text-base text-brand-dark/60 max-w-xl leading-relaxed">
              Read real reviews left by our local patrons ordering from their tables today.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1 text-brand-yellow">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-medium text-brand-dark/80 italic leading-relaxed">
                  &ldquo;The Margherita was flawless. Crust was incredibly puffy and charred in all the right places. Ordering from the table layout was simple and it arrived within 6 minutes.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center font-bold text-brand-orange text-sm">
                  MA
                </div>
                <div>
                  <span className="block text-sm font-bold text-brand-dark">Marco Andreoni</span>
                  <span className="block text-[10px] text-brand-dark/40 uppercase tracking-wider font-semibold">Table 4 Guest</span>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1 text-brand-yellow">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-medium text-brand-dark/80 italic leading-relaxed">
                  &ldquo;I customized a pie with pepperoni, jalapeños, and honey. Best crust in the city. The digital tracker keeps you updated, so you know exactly when to get your plates!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center font-bold text-brand-red text-sm">
                  SC
                </div>
                <div>
                  <span className="block text-sm font-bold text-brand-dark">Sarah Cole</span>
                  <span className="block text-[10px] text-brand-dark/40 uppercase tracking-wider font-semibold">Table 12 Guest</span>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xs flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1 text-brand-yellow">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-medium text-brand-dark/80 italic leading-relaxed">
                  &ldquo;Outstanding sourdough texture. You can feel the lightness immediately. The white garlic sauce base is a revelation. Clean, fast UI, zero friction.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center font-bold text-brand-green text-sm">
                  DP
                </div>
                <div>
                  <span className="block text-sm font-bold text-brand-dark">David Patel</span>
                  <span className="block text-[10px] text-brand-dark/40 uppercase tracking-wider font-semibold">Takeout Guest</span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>
    </div>
  );
}
