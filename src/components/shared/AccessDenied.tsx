"use client";

import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AccessDeniedProps {
  username: string;
}

export default function AccessDenied({ username }: AccessDeniedProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login?redirect=/admin");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-brand-dark/5 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Administrator Required</h2>
          <p className="text-xs sm:text-sm text-brand-dark/50 leading-relaxed">
            You are signed in as crew member <strong className="text-brand-dark/70">@{username}</strong>. 
            This account does not have permission to access the Administration Center.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={() => router.push("/staff")} 
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-light text-brand-dark font-bold text-xs transition-colors cursor-pointer active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Staff Queue</span>
          </button>
          
          <button 
            onClick={handleLogout} 
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-md shadow-brand-primary/20 transition-all cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
