"use client";

import React from "react";
import Link from "next/link";
import { Flame, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:rotate-6 transition-[transform] duration-300 ease-out">
                <Flame className="w-5.5 h-5.5 fill-current text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-brand-primary transition-[color] duration-300 ease-out">
                D Town <span className="text-brand-primary">Pizza</span>
              </span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-sm font-semibold">
              Authentic wood-fired culinary craft combined with in-store table ordering convenience. Making gourmet pizza accessible, fast, and unforgettable.
            </p>
            
            {/* Social icons - circular styled */}
            <div className="flex items-center gap-3 mt-1">
              <a href="#" className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center hover:scale-115 transition-transform duration-200 ease-out cursor-pointer" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center hover:scale-115 transition-transform duration-200 ease-out cursor-pointer" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">Explore</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">Menu Catalog</Link></li>
              <li><Link href="/builder" className="hover:text-white transition-colors duration-150 uppercase">Pizza Customizer</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors duration-150 uppercase">My Cart</Link></li>
            </ul>
          </div>

          {/* Col 3: Kitchen Opening Hours */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">Kitchen Hours</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="font-extrabold text-white">11:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sat - Sun</span>
                <span className="font-extrabold text-white">12:00 PM - 11:30 PM</span>
              </li>
              <li className="flex justify-between border-t border-white/10 pt-3">
                <span className="text-[11px] leading-relaxed text-white/50 lowercase italic font-semibold">Table orders stop 30m before close.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Address / Contact */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">Contact</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">108 Artisan Avenue, Suite B,<br />Detroit, MI 48201</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-brand-primary" />
                <span>+1 (313) 555-0145</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-brand-primary" />
                <span>support@dtownpizza.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[11px] text-white/50 tracking-wider">© {new Date().getFullYear()} D Town Pizza. All rights reserved.</span>
          <div className="flex items-center gap-6 text-[11px] text-white/50 font-semibold tracking-wider">
            <a href="#" className="hover:text-white transition-colors duration-150 uppercase">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-150 uppercase">Terms of Service</a>
          </div>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-0.5 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </footer>
  );
}
