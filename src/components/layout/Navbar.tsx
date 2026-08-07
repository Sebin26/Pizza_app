"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Flame, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SideDrawer from "./SideDrawer";

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-brand-dark/5 shadow-xs transition-shadow">
      <div className="w-full px-6 md:px-12 lg:px-16 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group transition-transform duration-200 active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/25 group-hover:rotate-12 transition-transform duration-300">
            <Flame className="w-6.5 h-6.5 fill-current animate-pulse" />
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-dark">
            D Town <span className="text-brand-primary">Pizza</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/?order=true" 
            className="text-base font-bold tracking-tight text-brand-dark/80 hover:text-brand-primary transition-colors duration-200"
          >
            Menu
          </Link>
          <Link 
            href="/builder" 
            className="text-base font-bold tracking-tight text-brand-dark/80 hover:text-brand-primary transition-colors duration-200"
          >
            Pizza Customizer
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Cart: only visible when there are items */}
          {cartCount > 0 && (
            <Link 
              href="/cart" 
              className="relative flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-base font-bold shadow-md shadow-brand-primary/20 transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-white text-[12px] font-extrabold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white animate-bounce" aria-live="polite">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Avatar */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-light hover:bg-brand-light/95 border border-brand-dark/5 text-brand-dark focus:outline-none active:scale-[0.9] transition-transform duration-100 cursor-pointer"
            aria-label="Open account drawer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-brand-dark/5">
              <User className="w-5 h-5 text-brand-dark/75" />
            </div>
          </button>

          {/* Hamburger button (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden items-center justify-center w-11 h-11 rounded-xl bg-brand-light hover:bg-brand-light/95 border border-brand-dark/5 text-brand-dark focus:outline-none active:scale-[0.9] transition-transform duration-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Mobile dropdown navigation menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white border-t border-brand-dark/5"
          >
            <nav className="flex flex-col px-6 py-4 gap-4">
              <Link 
                href="/?order=true" 
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-brand-dark/70 hover:text-brand-primary py-1.5 transition-colors duration-200"
              >
                Menu
              </Link>
              <Link 
                href="/builder" 
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-brand-dark/70 hover:text-brand-primary py-1.5 transition-colors duration-200"
              >
                Pizza Customizer
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
