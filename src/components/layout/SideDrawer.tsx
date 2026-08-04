"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useFocusTrap from "@/hooks/useFocusTrap";

export default function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLElement | null>(null);
  useFocusTrap(open, containerRef as any);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50`}
        >
          <motion.button
            onClick={onClose}
            aria-label="Close drawer"
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            ref={containerRef as any}
            role="dialog"
            aria-modal="true"
            aria-label="Account drawer"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 h-full w-80 bg-white border-r border-brand-dark/10 shadow-2xl"
          >
            <div className="p-4 border-b border-brand-dark/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">👤</div>
                <div>
                  <div className="text-sm font-bold">Guest</div>
                  <div className="text-xs text-brand-dark/50">Saved addresses</div>
                </div>
              </div>
              <button onClick={onClose} className="text-brand-dark/60 text-xl" aria-label="Close">×</button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <button className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold">Login</button>
              <nav className="flex flex-col gap-2 mt-2">
                <Link href="#" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Deals & Offers</Link>
                <Link href="#" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Track Current Order</Link>
                <Link href="/cart" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Order History</Link>
                <Link href="#" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Terms & Conditions</Link>
                <Link href="#" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Need Help? Chat with Us!</Link>
                <Link href="#" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Bulk Order</Link>
                <Link href="#" className="py-2 text-sm text-brand-dark hover:text-brand-primary transition-colors duration-150">Nutritional Information</Link>
              </nav>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
