"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Flame } from "lucide-react";

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-brand-dark/5 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group transition-transform duration-200 active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-md shadow-brand-red/25 group-hover:rotate-12 transition-transform duration-300">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-dark">
            D Town <span className="text-brand-red">Pizza</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/?order=true" 
            className="text-[15px] font-semibold text-brand-dark/70 hover:text-brand-red transition-colors duration-200"
          >
            Menu
          </Link>
          <Link 
            href="/builder" 
            className="text-[15px] font-semibold text-brand-dark/70 hover:text-brand-red transition-colors duration-200"
          >
            Pizza Customizer
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/cart" 
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-sm font-bold shadow-md shadow-brand-red/20 transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
