"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Lock, User, AlertCircle } from "lucide-react";
import styles from "./LoginPage.module.css";

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
    <div className={`${styles.loginCard} glass-elevated`}>
      <div className={styles.header}>
        <div className={styles.logoCircle}>
          <Flame className={styles.logoIcon} />
        </div>
        <h2>Staff Portal</h2>
        <p>Secure login for kitchen crew and managers</p>
      </div>

      {errorMsg && (
        <div className={styles.errorAlert}>
          <AlertCircle size={18} className={styles.errorIcon} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Username</label>
          <div className={styles.inputContainer}>
            <User size={18} className={styles.inputIcon} />
            <input
              type="text"
              required
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputContainer}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.submitBtn} btn btn-primary`}
        >
          {isLoading ? "Signing in..." : "Access Dashboard"}
        </button>
      </form>
      
      <div className={styles.footer}>
        <p>For credentials, check standard configurations.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      <Suspense fallback={
        <div className={`${styles.loginCard} glass`}>
          <div className={styles.header}>
            <div className={styles.spinner} style={{ margin: "20px auto" }}></div>
            <h2>Loading Portal...</h2>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
