"use client";

import React from "react";
import Link from "next/link";
import { Flame, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Centered Top Logo */}
        <div className="flex justify-center border-b border-white/10 pb-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:rotate-6 transition-[transform] duration-300 ease-out">
              <Flame className="w-6 h-6 fill-current text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-brand-primary transition-[color] duration-300 ease-out">
              D TOWN <span className="text-brand-primary">PIZZA</span>
            </span>
          </Link>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 items-start">
          
          {/* Col 1: COMPANY */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">COMPANY</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">STORY</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">LOCATIONS</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">FRANCHISE</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">PRIVACY POLICY</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">TERMS & CONDITIONS</Link></li>
            </ul>
          </div>

          {/* Col 2: OUR FOOD */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">OUR FOOD</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">MENU</Link></li>
              <li><Link href="/builder" className="hover:text-white transition-colors duration-150 uppercase">ALLERGIES</Link></li>
              <li><Link href="/builder" className="hover:text-white transition-colors duration-150 uppercase">HALAL</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">TAKEOUT MENU</Link></li>
            </ul>
          </div>

          {/* Col 3: COMMUNITY */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">COMMUNITY</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">GIFT CARDS</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">REWARDS</Link></li>
            </ul>
          </div>

          {/* Col 4: REACH OUT */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[17px] font-black uppercase tracking-wider text-brand-primary">REACH OUT</h4>
            <ul className="flex flex-col gap-3.5 text-xs font-bold tracking-wider text-white/70">
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">CONTACT US</Link></li>
              <li><Link href="/?order=true" className="hover:text-white transition-colors duration-150 uppercase">FAQ&apos;S</Link></li>
            </ul>
          </div>

          {/* Col 5: SEE WHAT WE'RE UP TO! */}
          <div className="md:col-span-4 bg-brand-primary text-white p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden min-h-[190px] justify-center">
            <h4 className="text-2xl font-black uppercase tracking-tight leading-none text-white">
              SEE WHAT<br />WE&apos;RE UP TO!
            </h4>
            
            {/* Social media icons row */}
            <div className="flex flex-wrap gap-2.5 z-10">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* TikTok Custom SVG */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="TikTok">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39v7.7c0 4.13-2.7 7.7-6.8 7.7-3.9 0-7.3-3.1-7.3-7.1 0-3.9 3.2-7.1 7.1-7.1h1.3v4.1c-.4-.1-.9-.1-1.3-.1-1.7 0-3.1 1.4-3.1 3.1 0 1.7 1.4 3.1 3.1 3.1 1.7 0 3.1-1.4 3.1-3.1V.02z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Custom X Logo SVG */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="X">
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                </svg>
              </a>
              {/* Snapchat */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="Snapchat">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 2c-3.7 0-6.1 1.7-6.1 4.5 0 .9.3 2 .8 2.8-.2.2-.4.6-.4.9 0 .8.8.9 1.2.9.2 0 .4-.1.6-.2.4.9.9 1.6 1.8 2 .3.1.6-.2.6-.5 0-.1-.1-.3-.2-.4-.4-.5-.6-1.1-.6-1.8 0-1.8 1.4-3.3 3.3-3.3 1.9 0 3.3 1.5 3.3 3.3 0 .7-.2 1.3-.6 1.8-.1.1-.2.3-.2.4 0 .3.3.6.6.5.9-.4 1.4-1.1 1.8-2 .2.1.4.2.6.2.4 0 1.2-.1 1.2-.9 0-.3-.2-.7-.4-.9.5-.8.8-1.9.8-2.8 0-2.8-2.4-4.5-6.1-4.5z"/>
                </svg>
              </a>
              {/* Threads Logo SVG */}
              <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" aria-label="Threads">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 12c-2 0-3-1.2-3-2.5s1.2-2.5 3-2.5 3 1.2 3 2.5v1.5c0 1.4-.8 2.5-2 2.5s-2-1.1-2-2.5V8.5C11 6 12.8 4 16.5 4c2.8 0 4.5 1.7 4.5 4.5v3.5c0 3.5-2.5 6-7.5 6s-7.5-2.5-7.5-6v-1c0-4.5 3-7 8.5-7" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[11px] text-white/50 tracking-wider">Copyright © {new Date().getFullYear()} D Town Pizza - All rights reserved</span>
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
