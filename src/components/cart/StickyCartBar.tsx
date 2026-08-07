"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyCartBar() {
  const { cart, total } = useCart();
  const router = useRouter();

  if (!cart || cart.length === 0) return null;

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-40"
      >
        <div className="bg-brand-primary text-white rounded-lg flex items-center justify-between p-3 shadow-lg">
          <div className="font-bold">{itemCount} item{itemCount>1?"s":""} • ${total.toFixed(2)}</div>
          <button
            onClick={() => router.push('/cart')}
            className="bg-white text-brand-primary px-4 py-2 rounded-lg font-bold"
            aria-label="Open cart"
          >
            View Cart
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
