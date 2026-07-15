"use client";

import React from "react";
import Link from "next/link";
import { Flame, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white shadow-md">
                <Flame className="w-5 h-5 fill-current text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                D Town <span className="text-brand-red">Pizza</span>
              </span>
            </Link>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              Authentic wood-fired culinary craft combined with in-store table ordering convenience. Making gourmet pizza accessible, fast, and unforgettable.
            </p>
            
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-red text-white/70 hover:text-white flex items-center justify-center transition-all" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-red text-white/70 hover:text-white flex items-center justify-center transition-all" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">Explore</h4>
            <ul className="flex flex-col gap-3 text-xs text-white/60">
              <li><Link href="/?order=true" className="hover:text-white transition-colors">Menu Catalog</Link></li>
              <li><Link href="/builder" className="hover:text-white transition-colors">Pizza Customizer</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
            </ul>
          </div>

          {/* Col 3: Kitchen Opening Hours */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">Kitchen Hours</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-white/60">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="font-semibold text-white">11:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sat - Sun</span>
                <span className="font-semibold text-white">12:00 PM - 11:30 PM</span>
              </li>
              <li className="flex justify-between border-t border-white/5 pt-2">
                <span>In-store Table Orders stop 30m before close.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Address / Newsletter */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">Contact</h4>
            <ul className="flex flex-col gap-3 text-xs text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4.5 h-4.5 text-brand-red shrink-0" />
                <span>108 Artisan Avenue, Suite B,<br />Detroit, MI 48201</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-red" />
                <span>+1 (313) 555-0145</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-red" />
                <span>support@dtownpizza.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/5 text-center text-[11px] text-white/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} D Town Pizza. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
