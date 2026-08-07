"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface FAQItem {
  question: string;
  answer: string;
  category: "ordering" | "dietary" | "delivery" | "payment";
}

const FAQS: FAQItem[] = [
  {
    category: "ordering",
    question: "How does table digital ordering work?",
    answer: "Scan the QR code on your table or select 'Menu' on this site. Choose your pizza, customize size, crust, and toppings, then hit 'Place Order'. Our kitchen receives your order instantly and fires it in our wood oven."
  },
  {
    category: "ordering",
    question: "Can I modify my pizza toppings after placing an order?",
    answer: "Because our wood-fired oven bakes pizzas in under 5 minutes, orders enter preparation immediately. Please notify standard floor staff right away if you need an urgent change."
  },
  {
    category: "dietary",
    question: "Do you offer Gluten-Free or Vegan options?",
    answer: "Yes! We offer a dedicated 10-inch Cauliflower Gluten-Free Crust and Plant-Based Vegan Mozzarella. All dietary options can be filtered directly in our customizer."
  },
  {
    category: "dietary",
    question: "What flour is used in your sourdough?",
    answer: "We use 100% unbleached organic Italian Tipo 00 flour fermented for 48 hours, creating a lower gluten load that is gentle on digestion."
  },
  {
    category: "delivery",
    question: "What are your delivery and pickup hours?",
    answer: "We deliver Monday to Friday from 11:00 AM - 10:00 PM, and Saturday & Sunday from 12:00 PM - 11:30 PM. Pickup orders are ready in 15 minutes."
  },
  {
    category: "payment",
    question: "What payment methods do you accept?",
    answer: "We accept all major Credit/Debit Cards, Apple Pay, Google Pay, and Cash at counter/table."
  }
];

export default function SupportPage() {
  const { push } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      push("Please fill out all contact fields", "error");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      push("Message sent! Our support team will get back to you shortly.", "success");
      setName("");
      setEmail("");
      setMessage("");
    }, 800);
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      
      {/* 1. HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs sm:text-sm font-extrabold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4" /> Customer Service & FAQ
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-brand-dark tracking-tight leading-tight">
          How Can We Help You Today?
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-brand-dark/75 leading-relaxed">
          Find instant answers to common questions about table ordering, dietary ingredients, and delivery, or contact our guest support team.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-xl relative mt-4">
          <Search className="w-5 h-5 text-brand-dark/40 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search help topics (e.g., gluten free, table QR, delivery)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-brand-dark/10 text-brand-dark text-base font-semibold placeholder:text-brand-dark/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
          />
        </div>
      </motion.div>

      {/* 2. FAQ SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-brand-dark/10 pb-4">
            {[
              { id: "all", label: "All Topics" },
              { id: "ordering", label: "Table Ordering" },
              { id: "dietary", label: "Ingredients & Dietary" },
              { id: "delivery", label: "Delivery & Pickup" },
              { id: "payment", label: "Payments" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-white/70 hover:bg-white text-brand-dark/70 hover:text-brand-dark border border-brand-dark/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="flex flex-col gap-3.5">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white/80 p-8 rounded-3xl text-center text-brand-dark/60 font-semibold">
                No matching topics found. Try searching another term or contact us below!
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white/80 backdrop-blur-md rounded-2xl border border-brand-dark/5 shadow-xs overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-black/2 transition-colors cursor-pointer"
                    >
                      <span className="text-lg font-bold text-brand-dark">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-brand-primary shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-6 pb-5 border-t border-brand-dark/5 pt-4 text-base font-semibold text-brand-dark/75 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. CONTACT INFO SIDEBAR */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-brand-dark text-white p-8 rounded-3xl shadow-xl flex flex-col gap-6">
            <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-brand-primary" /> Contact Details
            </h3>

            <ul className="flex flex-col gap-5 text-sm font-semibold text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">Store Address</span>
                  <span>108 Artisan Avenue, Suite B, Detroit, MI 48201</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">Direct Line</span>
                  <span>+1 (313) 555-0145</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">Email Support</span>
                  <span>support@dtownpizza.com</span>
                </div>
              </li>

              <li className="flex items-start gap-3 border-t border-white/10 pt-4">
                <Clock className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">Store Hours</span>
                  <span>Mon-Fri: 11AM - 10PM</span><br />
                  <span>Sat-Sun: 12PM - 11:30PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* 4. SEND US A MESSAGE FORM */}
      <section className="bg-white/90 backdrop-blur-lg p-8 sm:p-12 rounded-4xl border border-brand-dark/5 shadow-md flex flex-col gap-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Still Have Questions? Send Us a Message
          </h2>
          <p className="text-base font-semibold text-brand-dark/70">
            Our guest support manager responds to all inquiries within 1 hour during store operating hours.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h3 className="text-2xl font-bold text-emerald-900">Message Received!</h3>
            <p className="text-base font-semibold text-emerald-800 max-w-md">
              Thank you for contacting D Town Pizza. A member of our team will get back to you shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-brand-dark">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-brand-light border border-brand-dark/10 text-brand-dark text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-brand-dark">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-brand-light border border-brand-dark/10 text-brand-dark text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-extrabold text-brand-dark">How can we help?</label>
              <textarea
                rows={4}
                placeholder="Describe your question, order issue, or feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-4 py-3 rounded-xl bg-brand-light border border-brand-dark/10 text-brand-dark text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-base shadow-md shadow-brand-primary/25 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? "Sending..." : "Submit Message"}</span>
            </button>
          </form>
        )}
      </section>

    </div>
  );
}
