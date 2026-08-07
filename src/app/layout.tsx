import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyCartBar from "@/components/cart/StickyCartBar";

export const metadata: Metadata = {
  title: "D Town Pizza | In-Store Digital Ordering",
  description: "Customize and place your order instantly from your table. Freshly baked gourmet pizzas, sides, drinks, and desserts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ToastProvider>
            <div className="relative min-h-screen" style={{ display: "flex", flexDirection: "column" }}>
              {/* Crisp white base background */}
              <div className="fixed inset-0 -z-20 bg-white pointer-events-none" />
              {/* Black & White pizza pattern overlay with radial mask fade */}
              <div
                className="fixed inset-0 -z-10 mix-blend-multiply bg-repeat pointer-events-none grayscale"
                style={{
                  backgroundImage: "url('/patterns/pizza-pattern.jpeg')",
                  backgroundSize: "380px",
                  opacity: 0.08,
                  filter: "grayscale(100%)",
                  WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 90%)",
                  maskImage: "radial-gradient(circle at center, black 40%, transparent 90%)",
                }}
              />
              <Navbar />
              <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {children}
              </main>
              <StickyCartBar />
              <Footer />
            </div>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
