"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface Address {
  id: string;
  label?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode?: string | null;
  landmark?: string | null;
  isDefault: boolean;
  createdAt: string;
}

interface AddressManagerProps {
  open: boolean;
  onClose: () => void;
  customer: { id: string; phone: string; name?: string | null } | null;
}

export default function AddressManager({ open, onClose, customer }: AddressManagerProps) {
  const { push } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    landmark: "",
    isDefault: false,
  });

  const loadAddresses = async () => {
    if (!customer) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customers/addresses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load addresses");
      setAddresses(data.addresses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    let isActive = true;
    const run = async () => {
      if (!customer) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/customers/addresses");
        const data = await res.json();
        if (!isActive) return;
        if (!res.ok) throw new Error(data.error || "Unable to load addresses");
        setAddresses(data.addresses || []);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Unable to load addresses");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    run();
    return () => {
      isActive = false;
    };
  }, [open, customer, customer?.id]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      label: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      landmark: "",
      isDefault: false,
    });
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label || "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      postcode: address.postcode || "",
      landmark: address.landmark || "",
      isDefault: address.isDefault,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    if (!form.addressLine1.trim()) {
      setError("Address line 1 is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        label: form.label.trim() || null,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || null,
        city: form.city.trim(),
        postcode: form.postcode.trim() || null,
        landmark: form.landmark.trim() || null,
        isDefault: form.isDefault,
      };

      const res = await fetch(editingId ? `/api/customers/addresses/${editingId}` : "/api/customers/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save address");

      push(editingId ? "Address updated" : "Address added", "success");
      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (address: Address) => {
    if (!customer) return;
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/customers/addresses/${address.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete address");
      push("Address deleted", "success");
      await loadAddresses();
    } catch (err) {
      push(err instanceof Error ? err.message : "Unable to delete address", "error");
    }
  };

  const primaryAddress = useMemo(() => addresses.find((item) => item.isDefault) || addresses[0], [addresses]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6"
      >
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          className="w-full max-w-2xl rounded-2xl border border-brand-dark/10 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-brand-dark/5 px-5 py-4">
            <div>
              <h3 className="text-lg font-extrabold text-brand-dark">Edit Profile</h3>
              <p className="text-sm text-brand-dark/60">Manage your saved delivery addresses</p>
            </div>
            <button onClick={onClose} className="rounded-full bg-brand-light p-2 text-brand-dark/70" aria-label="Close profile">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-5 py-5">
            <div className="mb-5 rounded-2xl border border-brand-dark/10 bg-brand-light/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-brand-dark">Saved addresses</p>
                  <p className="text-xs text-brand-dark/60">Use these for checkout and delivery</p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setError("");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-brand-dark/10 bg-white px-3 py-2 text-xs font-bold text-brand-dark"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add new
                </button>
              </div>

              {loading ? (
                <div className="mt-4 text-sm text-brand-dark/60">Loading addresses…</div>
              ) : addresses.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-brand-dark/10 bg-white p-3 text-sm text-brand-dark/60">
                  No addresses saved yet. Add your first delivery location to get started.
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="rounded-xl border border-brand-dark/10 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-brand-dark">
                              {address.label || "Address"}
                            </p>
                            {address.isDefault && (
                              <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-brand-dark/70">{address.addressLine1}</p>
                          {address.addressLine2 ? <p className="text-sm text-brand-dark/70">{address.addressLine2}</p> : null}
                          <p className="text-sm text-brand-dark/70">
                            {address.city}
                            {address.postcode ? `, ${address.postcode}` : ""}
                          </p>
                          {address.landmark ? <p className="text-sm text-brand-dark/60">{address.landmark}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(address)}
                            className="rounded-lg border border-brand-dark/10 px-3 py-2 text-xs font-bold text-brand-dark"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(address)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-brand-dark/10 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-primary" />
                <h4 className="text-sm font-extrabold text-brand-dark">
                  {editingId ? "Update address" : "Add a new address"}
                </h4>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {(["Home", "Work", "Other"] as const).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, label: chip }))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      form.label === chip
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-brand-dark/10 bg-brand-light text-brand-dark"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-brand-dark/70">Label</label>
                  <input
                    value={form.label}
                    onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="Home, Work, or Other"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-brand-dark/70">
                    Address line 1 <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    value={form.addressLine1}
                    onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="Street address, P.O. box"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-brand-dark/70">Address line 2</label>
                  <input
                    value={form.addressLine2}
                    onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                    placeholder="Apartment, suite, unit, building"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-brand-dark/70">
                    City <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-brand-dark/70">Postcode</label>
                  <input
                    value={form.postcode}
                    onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value }))}
                    placeholder="ZIP / Postcode"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-brand-dark/70">Landmark</label>
                  <input
                    value={form.landmark}
                    onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
                    placeholder="Near school, park, or building"
                    className="w-full rounded-xl border border-brand-dark/10 bg-brand-light px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      className="h-4 w-4 rounded border-brand-dark/20 text-brand-primary"
                    />
                    Set as default address
                  </label>
                </div>
              </div>

              {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-dark/5 pt-4">
                <div className="text-xs text-brand-dark/60">
                  {primaryAddress ? `Primary address: ${primaryAddress.label || "Address"}` : "No primary address yet"}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-brand-dark/10 px-4 py-2 text-sm font-bold text-brand-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {submitting ? "Saving..." : editingId ? "Save changes" : "Save address"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
