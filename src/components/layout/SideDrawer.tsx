"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useFocusTrap from "@/hooks/useFocusTrap";
import { useToast } from "@/context/ToastContext";
import AddressManager from "@/components/profile/AddressManager";

interface CustomerSessionCustomer {
  id: string;
  phone: string;
  name?: string | null;
}

type CustomerSessionState = CustomerSessionCustomer | null;

export default function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { push } = useToast();
  useFocusTrap(open, containerRef);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState<CustomerSessionState>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setCustomer(data.user ?? null);
      })
      .catch(() => {
        if (active) setCustomer(null);
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSendOtp = async () => {
    const normalizedPhone = phone.trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Please wait 60 seconds before requesting another code") {
          setError("Please wait before requesting another code.");
        } else {
          throw new Error(data.error || "Unable to send OTP.");
        }
        return;
      }
      setStep("otp");
      setCooldown(60);
      setOtp("");
      push("OTP sent. Check the server console for the code.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedPhone = phone.trim();
    const normalizedCode = otp.trim();
    if (!/^\d{4,6}$/.test(normalizedCode)) {
      setError("Please enter the 4-6 digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code: normalizedCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to verify OTP.");
      }

      const verifiedCustomer = data.customer ?? null;
      setCustomer(verifiedCustomer);
      if (!verifiedCustomer?.name) {
        setName("");
        setStep("name");
        setError("");
        push("Almost there — please add your name.", "success");
        return;
      }
      setIsLoginOpen(false);
      setStep("phone");
      setOtp("");
      setPhone("");
      push("Signed in successfully", "success");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    await handleSendOtp();
  };

  const handleSaveName = async () => {
    if (!customer?.id) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to save your name.");
      }
      setCustomer(data.customer ?? null);
      setIsLoginOpen(false);
      setStep("phone");
      setOtp("");
      setPhone("");
      setName("");
      push("Signed in successfully", "success");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your name.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCustomer(null);
      push("Logged out", "success");
    } catch {
      push("Unable to log out right now", "error");
    }
  };

  const headerLabel = useMemo(() => {
    if (customer) return customer.name || customer.phone;
    return "Guest";
  }, [customer]);

  const subLabel = useMemo(() => {
    if (customer) return customer.phone;
    return "Saved addresses";
  }, [customer]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          >
            <motion.button
              onClick={onClose}
              aria-label="Close drawer"
              className="absolute inset-0 bg-black/0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Account drawer"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full w-80 max-w-full min-h-screen bg-white shadow-2xl ring-1 ring-black/10 border-r border-brand-dark/10"
            >
              <div className="p-4 border-b border-brand-dark/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">👤</div>
                  <div>
                    <div className="text-sm font-bold">{headerLabel}</div>
                    <div className="text-xs text-brand-dark/50">{subLabel}</div>
                  </div>
                </div>
                <button onClick={onClose} className="text-brand-dark/60 text-xl" aria-label="Close">×</button>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {!customer ? (
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold"
                  >
                    Login
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 rounded-xl border border-brand-dark/10 bg-brand-light/70 p-3">
                    <div className="text-sm font-bold text-brand-dark">Signed in</div>
                    <div className="text-xs text-brand-dark/70">{customer.phone}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsProfileOpen(true)}
                        className="mt-1 flex-1 px-3 py-2 rounded-lg bg-white text-brand-dark font-semibold border border-brand-dark/10"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="mt-1 px-3 py-2 rounded-lg bg-white text-brand-dark font-semibold border border-brand-dark/10"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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

      <AddressManager open={isProfileOpen} onClose={() => setIsProfileOpen(false)} customer={customer} />

      <AnimatePresence>
        {isLoginOpen && (
          <motion.div
            key="login-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4"
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-brand-dark/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-brand-dark">Sign in with OTP</h3>
                  <p className="text-sm text-brand-dark/60 mt-1">
                    {step === "phone"
                      ? "Enter your phone number to receive a one-time passcode."
                      : "Enter the code sent to your phone."}
                  </p>
                </div>
                <button onClick={() => setIsLoginOpen(false)} className="text-brand-dark/50" aria-label="Close login">×</button>
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              ) : null}

              {step === "phone" ? (
                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-sm font-semibold text-brand-dark">Phone number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 9876543210"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-3 text-sm outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              ) : step === "otp" ? (
                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-sm font-semibold text-brand-dark">OTP code</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-3 text-sm outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                  <div className="flex items-center justify-between text-sm text-brand-dark/70">
                    <button
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setError("");
                      }}
                      className="font-semibold text-brand-primary"
                    >
                      Change number
                    </button>
                    <button
                      onClick={handleResendOtp}
                      disabled={cooldown > 0 || loading}
                      className="font-semibold text-brand-dark/70 disabled:opacity-60"
                    >
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-sm font-semibold text-brand-dark">What&apos;s your name?</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-3 text-sm outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={loading}
                    className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
