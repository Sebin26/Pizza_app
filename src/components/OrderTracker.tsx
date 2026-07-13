"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";
import { ArrowLeft, Clock, Bell, ChefHat, CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import styles from "./OrderTracker.module.css";

interface OrderTrackerProps {
  initialOrder: Order;
}

export default function OrderTracker({ initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState<Order>(initialOrder);

  // Poll order status every 4 seconds
  useEffect(() => {
    // If order is already completed, no need to poll anymore
    if (order.status === "COMPLETED") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${order.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.order) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order.id, order.status]);

  const getStatusStepClass = (step: string) => {
    const statuses = ["RECEIVED", "PREPARING", "READY", "COMPLETED"];
    const currentIndex = statuses.indexOf(order.status);
    const stepIndex = statuses.indexOf(step);

    if (stepIndex === currentIndex) return styles.stepActive;
    if (stepIndex < currentIndex) return styles.stepCompleted;
    return styles.stepPending;
  };

  return (
    <div className={styles.wrapper}>
      {/* Thank you note */}
      <div className={`${styles.successHeader} glass-elevated`}>
        <CheckCircle2 size={48} className={styles.successIcon} />
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for dining with us, <strong>{order.customerName}</strong>.</p>
      </div>

      <div className={styles.trackerLayout}>
        {/* Token and Live Status card */}
        <div className={`${styles.statusCard} glass-elevated`}>
          <div className={styles.tokenSection}>
            <span className={styles.tokenLabel}>YOUR TOKEN NUMBER</span>
            <h2 className={styles.tokenNumber}>{order.orderNumber}</h2>
            <p className={styles.tokenHint}>Please watch the screens or wait for this token to be called.</p>
          </div>

          {/* Progress Tracker */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width:
                    order.status === "RECEIVED"
                      ? "16%"
                      : order.status === "PREPARING"
                      ? "50%"
                      : order.status === "READY"
                      ? "83%"
                      : "100%",
                }}
              />
            </div>

            <div className={styles.steps}>
              <div className={`${styles.step} ${getStatusStepClass("RECEIVED")}`}>
                <div className={styles.stepCircle}>
                  <ShoppingBag size={16} />
                </div>
                <span className={styles.stepLabelText}>Received</span>
              </div>

              <div className={`${styles.step} ${getStatusStepClass("PREPARING")}`}>
                <div className={styles.stepCircle}>
                  <ChefHat size={16} />
                </div>
                <span className={styles.stepLabelText}>Preparing</span>
              </div>

              <div className={`${styles.step} ${getStatusStepClass("READY")}`}>
                <div className={styles.stepCircle}>
                  <Bell size={16} />
                </div>
                <span className={styles.stepLabelText}>Ready</span>
              </div>

              <div className={`${styles.step} ${getStatusStepClass("COMPLETED")}`}>
                <div className={styles.stepCircle}>
                  <CheckCircle2 size={16} />
                </div>
                <span className={styles.stepLabelText}>Completed</span>
              </div>
            </div>
          </div>

          {/* Wait Time Display */}
          <div className={styles.waitSection}>
            {order.status === "READY" ? (
              <div className={styles.readyBanner}>
                <Bell className={styles.bellIcon} />
                <div>
                  <h4>Your Order is Ready!</h4>
                  <p>Please head over to the counter to collect your fresh pizza.</p>
                </div>
              </div>
            ) : order.status === "COMPLETED" ? (
              <div className={styles.completedBanner}>
                <h4>Order Collected</h4>
                <p>Enjoy your meal! Thank you for choosing D Town Pizza.</p>
              </div>
            ) : (
              <div className={styles.waitTimer}>
                <Clock size={20} className={styles.clockIcon} />
                <div>
                  <span>Estimated Preparation Time</span>
                  <h4>~{order.estimatedPrepMin} Minutes</h4>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details card */}
        <div className={`${styles.detailsCard} glass`}>
          <h3>Order Details</h3>
          <span className={styles.orderId}>ID: {order.id}</span>
          
          <div className={styles.itemList}>
            {order.items?.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemQty}>{item.quantity}x</span>
                  <div>
                    <h4 className={styles.itemName}>{item.menuItem.name}</h4>
                    {item.customization && (
                      <div className={styles.customText}>
                        <p>{item.customization.size?.name} | {item.customization.crust?.name}</p>
                        <p>Sauce: {item.customization.sauce?.name}</p>
                        {item.customization.toppings.length > 0 && (
                          <p>
                            Toppings:{" "}
                            {item.customization.toppings.map((t) => t.topping.name).join(", ")}
                          </p>
                        )}
                        {item.customization.addons.length > 0 && (
                          <p>
                            Add-ons:{" "}
                            {item.customization.addons.map((a) => a.addon.name).join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                    {item.notes && <p className={styles.itemNotes}>Note: {item.notes}</p>}
                  </div>
                </div>
                <span className={styles.itemPrice}>${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Taxes (10%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/" className={`${styles.homeLink} btn btn-secondary`}>
            <ArrowLeft size={16} />
            <span>Order Something Else</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
