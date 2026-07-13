"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";
import styles from "./CartPage.module.css";

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
        const payload: any = {
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={`${styles.emptyCard} glass`}>
          <ShoppingBag size={64} className={styles.emptyIcon} />
          <h2>Your Cart is Empty</h2>
          <p>Go back to our menu and select some delicious food to order.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Review Your Order</h1>
      <p className={styles.subtitle}>Verify your details and checkout instantly. No signup required.</p>

      {errorMsg && (
        <div className={`${styles.errorAlert} glass`}>
          <AlertTriangle className={styles.errorIcon} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={styles.content}>
        {/* Left Column: Cart Items list */}
        <div className={styles.itemsCol}>
          {cart.map((item) => (
            <div key={item.id} className={`${styles.itemRow} glass`}>
              <span className={styles.itemEmoji}>
                {item.menuItem.isPizza ? "🍕" : "🍽️"}
              </span>

              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.menuItem.name}</h3>
                
                {item.menuItem.isPizza && item.customization && (
                  <div className={styles.customizationSummary}>
                    <p>
                      <strong>Size:</strong> {item.customization.size.name} |{" "}
                      <strong>Crust:</strong> {item.customization.crust.name}
                    </p>
                    <p>
                      <strong>Sauce:</strong> {item.customization.sauce.name}
                    </p>
                    {item.customization.toppings.length > 0 && (
                      <p>
                        <strong>Toppings:</strong>{" "}
                        {item.customization.toppings.map((t) => t.name).join(", ")}
                      </p>
                    )}
                    {item.customization.addons.length > 0 && (
                      <p>
                        <strong>Add-ons:</strong>{" "}
                        {item.customization.addons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {item.notes && (
                  <p className={styles.itemNotes}>
                    <em>Note: {item.notes}</em>
                  </p>
                )}
                
                <span className={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                  {item.quantity > 1 && <small> (${item.price.toFixed(2)} each)</small>}
                </span>
              </div>

              {/* Quantity Selector and Delete */}
              <div className={styles.itemActions}>
                <div className={styles.quantityControls}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className={styles.qtyBtn}
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qtyVal}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className={styles.qtyBtn}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.deleteBtn}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <Link href="/" className={styles.continueLink}>
            <ArrowLeft size={16} />
            <span>Continue Adding Food</span>
          </Link>
        </div>

        {/* Right Column: Checkout Summary & Form */}
        <div className={styles.checkoutCol}>
          <div className={`${styles.checkoutCard} glass-elevated`}>
            <h3>Order Summary</h3>
            
            <div className={styles.summaryTotals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Taxes (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Guest Details Form */}
            <form onSubmit={handleSubmitOrder} className={styles.checkoutForm}>
              <h4 className={styles.formTitle}>Guest Information</h4>
              <p className={styles.formSubtitle}>Required to call your number when the pizza is ready.</p>

              <div className={styles.formGroup}>
                <label htmlFor="customer-name" className={styles.formLabel}>
                  Your Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="E.g., John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="customer-phone" className={styles.formLabel}>
                  Phone Number <span className={styles.optional}>(Optional)</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="E.g., 555-0199"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.submitBtn} btn btn-primary`}
              >
                {isSubmitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <Send size={18} />
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
