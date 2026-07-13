"use client";

import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./AccessDenied.module.css";

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
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass-elevated`}>
        <div className={styles.iconCircle}>
          <ShieldAlert size={36} className={styles.icon} />
        </div>
        <h2>Administrator Access Required</h2>
        <p className={styles.description}>
          You are currently signed in as crew member <strong className={styles.username}>@{username}</strong>. 
          This account does not have permission to access the Admin Control Center.
        </p>

        <div className={styles.actions}>
          <button onClick={() => router.push("/staff")} className="btn btn-secondary" style={{ flex: 1 }}>
            <ArrowLeft size={16} />
            <span>Staff Queue</span>
          </button>
          
          <button onClick={handleLogout} className="btn btn-primary" style={{ flex: 1 }}>
            <LogOut size={16} />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
