"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Lock, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/staff";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check if already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.push(redirectUrl);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkAuth();
  }, [redirectUrl, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-brand-dark/5 flex flex-col gap-6"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/25">
          <Flame className="w-6 h-6 fill-current animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Staff Portal</h2>
          <p className="text-xs sm:text-sm text-brand-dark/50 leading-normal">
            Secure access dashboard for kitchen crew & managers.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm font-semibold leading-normal">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-brand-dark/70">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-dark/40" />
            <input
              type="text"
              required
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-brand-dark/70">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-dark/40" />
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-sm shadow-md shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-99"
        >
          {isLoading ? "Signing in..." : "Access Dashboard"}
        </button>
      </form>
      
      <div className="text-center border-t border-brand-dark/5 pt-4 text-[11px] text-brand-dark/40 font-semibold uppercase tracking-wider">
        D Town Pizza Co.
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-brand-dark/5 flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin"></div>
          <h2 className="text-lg font-bold text-brand-dark">Loading Portal...</h2>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
