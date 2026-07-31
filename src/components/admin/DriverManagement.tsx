"use client";

import { useState, useEffect, useCallback } from "react";
import { Driver } from "@/types";
import {
  Truck,
  Plus,
  Phone,
  Car,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Power,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // New driver form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Scooter");
  const [customVehicle, setCustomVehicle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-driver updating state
  const [updatingDriverId, setUpdatingDriverId] = useState<string | null>(null);

  // Status alerts
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await fetch("/api/drivers?includeInactive=true");
      if (!res.ok) {
        throw new Error("Failed to load drivers");
      }
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error fetching drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim() || !phone.trim()) {
      setFormError("Name and phone number are required.");
      return;
    }

    const finalVehicleType =
      vehicleType === "Other" ? customVehicle.trim() : vehicleType;

    try {
      setSubmitting(true);
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          vehicleType: finalVehicleType || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create driver");
      }

      setFormSuccess(`Driver "${data.driver?.name || name}" added successfully!`);
      setName("");
      setPhone("");
      setVehicleType("Scooter");
      setCustomVehicle("");

      // Refresh drivers list
      fetchDrivers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add driver");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (driver: Driver) => {
    const newIsActive = !(driver.isActive ?? true);
    setUpdatingDriverId(driver.id);
    setFormError("");

    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newIsActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      // Optimistically / reactively update local state
      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, isActive: newIsActive } : d))
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to toggle active state");
    } finally {
      setUpdatingDriverId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
        <h1 className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-primary" />
          Driver Management
        </h1>
        <p className="text-xs text-brand-dark/50 font-medium">
          Add delivery drivers, manage active staff status, and monitor availability.
        </p>
      </div>

      {/* Form & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form to Add New Driver */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
              Register New Driver
            </h3>
            <Truck className="w-4 h-4 text-brand-primary" />
          </div>

          <form onSubmit={handleAddDriver} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark/60 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark/60 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark/60 uppercase tracking-wider mb-1">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out mb-2"
              >
                <option value="Scooter">Scooter</option>
                <option value="E-Bike">E-Bike</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Car">Car</option>
                <option value="Other">Other...</option>
              </select>

              {vehicleType === "Other" && (
                <input
                  type="text"
                  placeholder="Specify vehicle details"
                  value={customVehicle}
                  onChange={(e) => setCustomVehicle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                />
              )}
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white font-extrabold text-xs shadow-sm hover:shadow transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.97] mt-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Driver...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Driver</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Driver Roster */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-brand-dark/5 pb-3">
            <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">
              Driver Roster ({drivers.length})
            </h3>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-dark/40 bg-brand-light px-2 py-1 rounded-lg">
              {drivers.filter((d) => d.isActive ?? true).length} Active
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-brand-dark/40 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <span className="text-xs font-semibold">Loading drivers list...</span>
            </div>
          ) : fetchError ? (
            <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl text-xs text-brand-primary font-semibold flex items-center justify-between">
              <span>{fetchError}</span>
              <button
                onClick={fetchDrivers}
                className="px-3 py-1 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary-dark transition-colors"
              >
                Retry
              </button>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-10 px-4 bg-brand-light rounded-xl border border-dashed border-brand-dark/10">
              <Truck className="w-8 h-8 text-brand-dark/20 mx-auto mb-2" />
              <p className="text-xs font-bold text-brand-dark/60">No drivers registered yet.</p>
              <p className="text-[11px] text-brand-dark/40 mt-0.5">
                Use the form on the left to add your first delivery driver.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1">
              <AnimatePresence>
                {drivers.map((driver) => {
                  const isActive = driver.isActive ?? true;
                  const isAvailable = driver.isAvailable ?? true;
                  const isUpdating = updatingDriverId === driver.id;

                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-xl border transition-all duration-200 gap-3 ${
                        isActive
                          ? "bg-brand-light border-brand-dark/5"
                          : "bg-gray-50/80 border-gray-200/60 opacity-75"
                      }`}
                    >
                      {/* Driver Details */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-brand-dark">
                            {driver.name}
                          </span>

                          {/* Availability Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              isAvailable
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                            }`}
                          >
                            {isAvailable ? "Available" : "On Delivery"}
                          </span>

                          {/* Active / Inactive Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              isActive
                                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                                : "bg-gray-200 text-gray-600 border-gray-300"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-brand-dark/60 font-medium">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-brand-dark/40 shrink-0" />
                            {driver.phone}
                          </span>

                          {driver.vehicleType && (
                            <span className="flex items-center gap-1 bg-white/70 px-1.5 py-0.5 rounded border border-brand-dark/5 text-[10px] text-brand-dark/70 font-semibold">
                              <Car className="w-3 h-3 text-brand-primary/80 shrink-0" />
                              {driver.vehicleType}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active Status Toggle Button */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(driver)}
                          disabled={isUpdating}
                          title={isActive ? "Deactivate driver" : "Activate driver"}
                          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-95 border ${
                            isActive
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isActive ? (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <UserX className="w-3.5 h-3.5 text-gray-500" />
                          )}
                          <span>{isActive ? "Active" : "Inactive"}</span>

                          {/* Pill Toggle Visual */}
                          <div
                            className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ml-1 flex items-center ${
                              isActive ? "bg-emerald-600 justify-end" : "bg-gray-400 justify-start"
                            }`}
                          >
                            <motion.div
                              layout
                              className="w-3 h-3 bg-white rounded-full shadow-xs"
                            />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
