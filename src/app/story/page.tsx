"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Flame, 
  Clock, 
  Leaf, 
  Award, 
  Sparkles, 
  Heart, 
  ArrowRight, 
  UtensilsCrossed 
} from "lucide-react";

export default function StoryPage() {
  const milestones = [
    {
      year: "2004",
      title: "Origins in Napoli",
      desc: "Chef Giovanni Rossi nurtures his first sourdough starter using pure spring water and Italian organic flour."
    },
    {
      year: "2015",
      title: "The Stone Oven Arrives",
      desc: "Commissioned a custom 900°F volcanic stone deck oven built by master artisans in Naples."
    },
    {
      year: "2021",
      title: "D Town Pizza Launch",
      desc: "Opened our flag-ship store in Detroit, pairing old-world baking traditions with modern tech."
    },
    {
      year: "Today",
      title: "Instant Table Ordering",
      desc: "Pioneered in-store digital ordering, letting patrons customize pies live at their table."
    }
  ];

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-20">
      
      {/* 1. HERO BANNER */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative overflow-hidden rounded-4xl bg-brand-dark text-white p-8 sm:p-14 lg:p-20 shadow-2xl flex flex-col gap-6"
      >
        <div className="absolute top-0 right-0 w-120 h-120 bg-linear-to-br from-brand-primary/30 to-brand-gold/25 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col gap-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest w-fit">
            <Flame className="w-4 h-4 fill-current animate-pulse" /> Our Heritage & Vision
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08]">
            Crafted by Hand.<br />
            <span className="bg-linear-to-r from-brand-primary via-orange-400 to-brand-gold bg-clip-text text-transparent">
              Fired by Tradition.
            </span>
          </h1>
          <p className="text-white/85 text-base sm:text-xl font-semibold leading-relaxed max-w-2xl">
            At D Town Pizza, we believe gourmet food shouldn&apos;t keep you waiting. We ferment our sourdough for 48 hours, source Italian San Marzano tomatoes, and fire every pie at 900°F.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/?order=true"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-base rounded-2xl shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>Explore The Menu</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 2. THE THREE PILLARS OF OUR CRAFT */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            Uncompromising Standards
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-dark tracking-tight">
            The Craft Behind Every Slice
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-brand-dark/5 shadow-xs flex flex-col gap-5 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-brand-dark">100% Organic Sourcing</h3>
            <p className="text-base font-semibold text-brand-dark/75 leading-relaxed">
              We source San Marzano D.O.P. tomatoes from the volcanic slopes of Mount Vesuvius and fresh mozzarella made fresh daily by local artisan cheesemakers.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-brand-dark/5 shadow-xs flex flex-col gap-5 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-brand-dark">48-Hour Fermentation</h3>
            <p className="text-base font-semibold text-brand-dark/75 leading-relaxed">
              Slow wild yeast fermentation creates a light, airy, digestible crust with complex flavors that fast-rising commercial dough simply cannot replicate.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-brand-dark/5 shadow-xs flex flex-col gap-5 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/15 text-brand-gold flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Flame className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-brand-dark">900°F Stone Deck Oven</h3>
            <p className="text-base font-semibold text-brand-dark/75 leading-relaxed">
              Every pizza is blazed at intense heat for under 5 minutes, producing leopard-spotted char, bubbly crusts, and perfectly melted cheese.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. CHEF NARRATIVE */}
      <section className="bg-white/90 backdrop-blur-lg rounded-4xl p-8 sm:p-12 border border-brand-dark/5 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 relative aspect-square w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border border-brand-dark/10 group">
          <Image 
            src="/chef_portrait.png" 
            alt="Chef Giovanni preparing artisan pizza" 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider w-fit">
            Meet The Master Pizzaiolo
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-dark tracking-tight leading-tight">
            &ldquo;Pizza is a living art form.&rdquo;
          </h2>
          <p className="text-base sm:text-lg font-semibold text-brand-dark/80 leading-relaxed">
            Born in Naples, Chef Giovanni Rossi spent two decades refining his family&apos;s sourdough starter. When bringing his recipes to Detroit, he integrated instant digital table ordering so guests receive piping-hot pies seconds after leaving the oven.
          </p>
          <div className="border-l-4 border-brand-primary pl-4 py-1">
            <span className="block font-black text-xl text-brand-dark">Chef Giovanni Rossi</span>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Founder & Head Chef</span>
          </div>
        </div>
      </section>

      {/* 4. TIMELINE MILESTONES */}
      <section className="flex flex-col gap-10">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            Our Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-dark tracking-tight">
            Milestones of Excellence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, idx) => (
            <motion.div 
              key={m.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white/80 p-6 rounded-3xl border border-brand-dark/5 shadow-xs flex flex-col gap-3"
            >
              <span className="text-4xl font-black text-brand-primary tracking-tight">{m.year}</span>
              <h4 className="text-xl font-bold text-brand-dark">{m.title}</h4>
              <p className="text-sm font-semibold text-brand-dark/70 leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
