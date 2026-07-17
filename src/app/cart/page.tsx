"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, tax, total } = useCart();

  // Guest checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg("Please enter your name to place the order.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Map cart items to API requirements
      const apiItems = cart.map((item) => {
        const payload: {
          menuItemId: string;
          quantity: number;
          notes: string;
          customization?: {
            sizeId: string;
            crustId: string;
            sauceId: string;
            toppingIds: string[];
            addonIds: string[];
          };
        } = {
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || "",
        };

        if (item.menuItem.isPizza && item.customization) {
          payload.customization = {
            sizeId: item.customization.size.id,
            crustId: item.customization.crust.id,
            sauceId: item.customization.sauce.id,
            toppingIds: item.customization.toppings.map((t) => t.id),
            addonIds: item.customization.addons.map((a) => a.id),
          };
        }

        return payload;
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone: customerPhone ? customerPhone : null,
          items: apiItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while submitting the order.");
      }

      // Success
      clearCart();
      router.push(`/confirmation/${data.order.id}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to submit order. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-brand-dark/5 flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-brand-dark/30">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-brand-dark">Your Cart is Empty</h2>
            <p className="text-sm sm:text-base text-brand-dark/50 leading-relaxed max-w-sm">
              Head back to our gourmet menu and select some delicious food to order.
            </p>
          </div>
          <Link 
            href="/?order=true" 
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-bold text-sm shadow-md shadow-brand-red/20 transition-all active:scale-95 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Menu</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      <div className="flex flex-col gap-1.5 border-b border-brand-dark/5 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark">
          Review Your Order
        </h1>
        <p className="text-sm sm:text-[15px] text-brand-dark/50">
          Verify your details and checkout instantly. No registration required.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-red/10 border border-brand-red/25 text-brand-red">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              <div className="flex gap-4 items-start sm:items-center flex-1">
                <span className="text-4xl shrink-0 p-2.5 rounded-xl bg-brand-light">
                  {item.menuItem.isPizza ? "🍕" : "🍽️"}
                </span>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base sm:text-lg font-bold text-brand-dark">
                    {item.menuItem.name}
                  </h3>
                  
                  {item.menuItem.isPizza && item.customization && (
                    <div className="text-xs sm:text-sm text-brand-dark/50 flex flex-col gap-0.5">
                      <p>
                        <strong className="text-brand-dark/70 font-semibold">Size:</strong> {item.customization.size.name} |{" "}
                        <strong className="text-brand-dark/70 font-semibold">Crust:</strong> {item.customization.crust.name}
                      </p>
                      <p>
                        <strong className="text-brand-dark/70 font-semibold">Sauce:</strong> {item.customization.sauce.name}
                      </p>
                      {item.customization.toppings.length > 0 && (
                        <p>
                          <strong className="text-brand-dark/70 font-semibold">Toppings:</strong>{" "}
                          {item.customization.toppings.map((t) => t.name).join(", ")}
                        </p>
                      )}
                      {item.customization.addons.length > 0 && (
                        <p>
                          <strong className="text-brand-dark/70 font-semibold">Add-ons:</strong>{" "}
                          {item.customization.addons.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs sm:text-sm italic text-brand-orange bg-brand-orange/5 px-2.5 py-1 rounded-lg border border-brand-orange/10 w-fit mt-1">
                      Note: {item.notes}
                    </p>
                  )}
                  
                  <span className="text-base font-extrabold text-brand-red mt-1.5 flex items-baseline gap-1.5">
                    ${(item.price * item.quantity).toFixed(2)}
                    {item.quantity > 1 && (
                      <span className="text-xs font-semibold text-brand-dark/40">
                        (${item.price.toFixed(2)} each)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Quantity controls and delete action */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-brand-dark/5 pt-4 sm:pt-0">
                <div className="flex items-center gap-3.5 bg-brand-light rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-colors active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold w-5 text-center text-brand-dark">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-colors active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-9 h-9 rounded-xl bg-brand-red/5 hover:bg-brand-red text-brand-red hover:text-white flex items-center justify-center transition-colors duration-200 active:scale-95 shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          ))}
          
          <Link 
            href="/?order=true" 
            className="flex items-center gap-1.5 text-sm font-bold text-brand-dark/60 hover:text-brand-red transition-colors w-fit px-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Adding Food</span>
          </Link>
        </div>

        {/* Right Column: Checkout Summary & Guest Form (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-brand-dark/5 flex flex-col gap-6">
            <h3 className="text-lg font-extrabold text-brand-dark border-b border-brand-dark/5 pb-3">
              Order Summary
            </h3>
            
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-brand-dark/60">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-brand-dark/60">
                <span className="font-semibold">Taxes (10%)</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-brand-dark/5 pt-4 text-brand-dark">
                <span className="text-base font-extrabold">Total Amount</span>
                <span className="text-2xl font-extrabold text-brand-red">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Guest Details Form */}
            <form onSubmit={handleSubmitOrder} className="flex flex-col gap-4 border-t border-brand-dark/5 pt-5">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-extrabold text-brand-dark">Guest Information</h4>
                <p className="text-[11px] text-brand-dark/40">
                  Required to identify your table and call your token.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-name" className="text-xs font-bold text-brand-dark/70">
                  Your Name <span className="text-brand-red font-bold">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="E.g., Mario Rossi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/30 border border-transparent focus:border-brand-red/30 focus:ring-2 focus:ring-brand-red/10 focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-phone" className="text-xs font-bold text-brand-dark/70">
                  Phone Number <span className="text-brand-dark/40 font-semibold">(Optional)</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="E.g., 555-0199"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/30 border border-transparent focus:border-brand-red/30 focus:ring-2 focus:ring-brand-red/10 focus:bg-white transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-extrabold text-[15px] shadow-md shadow-brand-red/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-99"
              >
                {isSubmitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <Send className="w-4.5 h-4.5" />
                    <span>Place In-Store Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
