"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Flame, ShieldAlert } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Flame className={styles.logoIcon} />
          <span className={styles.logoText}>D Town <span className={styles.highlight}>Pizza</span></span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Menu</Link>
          <Link href="/builder" className={`${styles.navLink} ${styles.customLink}`}>Pizza Customizer</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/staff" className={styles.staffLink} title="Staff Dashboard">
            <ShieldAlert size={20} />
            <span className={styles.staffText}>Staff</span>
          </Link>
          <Link href="/cart" className={`${styles.cartButton} btn btn-primary`}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
