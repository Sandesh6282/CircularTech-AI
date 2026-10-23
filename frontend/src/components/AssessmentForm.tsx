"use strict";
import React, { useState, useEffect } from "react";
import {
  DeviceAssessmentInput,
  DeviceCategory,
  FunctionalCondition,
  BatteryCondition,
  BatterySafetyConcern,
  WarrantyStatus,
  UserPreference,
} from "../lib/types";
import { CategorySelector } from "./CategorySelector";
import { SafetyWarning } from "./SafetyWarning";
import {
  Wrench,
  ShieldCheck,
  Battery,
  AlertTriangle,
  DollarSign,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";

interface AssessmentFormProps {
  initialValues: DeviceAssessmentInput;
  onSubmit: (values: DeviceAssessmentInput) => void;
  isLoading: boolean;
  aiSuggestedCategory?: DeviceCategory | null;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  aiSuggestedCategory,
}) => {
  const [formData, setFormData] = useState<DeviceAssessmentInput>(initialValues);

  // Sync internal form state whenever initialValues changes (e.g. from Demo Presets)
  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const updateField = <K extends keyof DeviceAssessmentInput>(
    key: K,
    val: DeviceAssessmentInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const updateBattery = (key: string, val: unknown) => {
    setFormData((prev) => ({
      ...prev,
      battery: { ...prev.battery, [key]: val },
    }));
  };

  const updateEcon = (key: string, val: unknown) => {
    setFormData((prev) => ({
      ...prev,
      economics: { ...prev.economics, [key]: val },
    }));
  };

  const isBatteryHazard =
    formData.battery.safety_concern !== "none_known" &&
    formData.battery.safety_concern !== "unknown";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Category Selection */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
        <CategorySelector
          value={formData.category}
          onChange={(cat) => updateField("category", cat)}
          aiSuggestedCategory={aiSuggestedCategory}
        />

        {/* Brand & Model Optional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-800/80">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Brand (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Apple, Dell, Samsung"
              value={formData.brand || ""}
              onChange={(e) => updateField("brand", e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Model Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro, ThinkPad X1"
              value={formData.model_name || ""}
              onChange={(e) => updateField("model_name", e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Device Age (Years)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              placeholder="e.g. 3.5"
              value={formData.device_age_years ?? ""}
              onChange={(e) =>
                updateField(
                  "device_age_years",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Functional Condition */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <span>Functional & Operational Condition</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Report what works and what is observed. (User-reported metrics)
          </p>
        </div>

        {/* Primary Condition Radio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: "fully_functional", label: "Fully Functional", desc: "No known issues; boots and operates normally" },
            { id: "functional_minor_issues", label: "Minor Issues", desc: "Powers on; cosmetic or minor defect (cracked glass, sluggish)" },
            { id: "partially_functional", label: "Partially Functional", desc: "Some subsystems broken (ports, camera, keyboard)" },
            { id: "does_not_power_on", label: "Does Not Power On", desc: "No boot, completely unresponsive to power button" },
            { id: "physically_damaged", label: "Physically Damaged", desc: "Heavy structural breakage, water ingress, or bent chassis" },
            { id: "unknown_not_tested", label: "Unknown / Untested", desc: "Lacks charger or hasn't been plugged in" },
          ].map((item) => {
            const isSelected = formData.functional_condition === item.id;
            return (
              <label
                key={item.id}
                className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500 text-white"
                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <input
                    type="radio"
                    name="functional_condition"
                    checked={isSelected}
                    onChange={() =>
                      updateField("functional_condition", item.id as FunctionalCondition)
                    }
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-xs text-slate-400">{item.desc}</span>
              </label>
            );
          })}
        </div>

        {/* Detailed Hardware Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Screen Condition
            </label>
            <select
              value={formData.screen_condition || "unknown"}
              onChange={(e) => updateField("screen_condition", e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="intact">Intact / Undamaged</option>
              <option value="cracked">Cracked Glass (Display Works)</option>
              <option value="broken">Broken / Black Screen / Lines</option>
              <option value="not_applicable">Not Applicable (No Screen)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Water / Liquid Damage
            </label>
            <select
              value={
                formData.water_damage === true
                  ? "yes"
                  : formData.water_damage === false
                  ? "no"
                  : "unknown"
              }
              onChange={(e) =>
                updateField(
                  "water_damage",
                  e.target.value === "yes"
                    ? true
                    : e.target.value === "no"
                    ? false
                    : undefined
                )
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="no">No Liquid Ingress</option>
              <option value="yes">Yes (Liquid Contact Reported)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Charging Status
            </label>
            <select
              value={formData.charging_works || "unknown"}
              onChange={(e) => updateField("charging_works", e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="works">Charges Reliably</option>
              <option value="intermittent">Intermittent / Loose Port</option>
              <option value="does_not_work">Does Not Charge</option>
              <option value="not_applicable">N/A (Mains Powered)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Known Faults / Symptoms (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Broken hinge, fan noise, battery drains quickly"
            value={formData.known_faults || ""}
            onChange={(e) => updateField("known_faults", e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 3. Battery Health & Safety Concerns */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" />
            <span>Battery Health & Thermal Safety</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Lithium-ion integrity is vital for safe reuse and handling.
          </p>
        </div>

        {/* Real-time hazard banner if hazard is selected */}
        {isBatteryHazard && (
          <SafetyWarning
            message={`Hazardous state '${formData.battery.safety_concern}' reported. Safety logic will enforce immediate authorized hazardous collection.`}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Battery Safety Concern <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.battery.safety_concern}
              onChange={(e) =>
                updateBattery("safety_concern", e.target.value as BatterySafetyConcern)
              }
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border focus:outline-none ${
                isBatteryHazard
                  ? "border-rose-500 text-rose-300"
                  : "border-slate-800 text-white focus:border-emerald-500"
              }`}
            >
              <option value="none_known">None Known (Safe)</option>
              <option value="swollen">Swollen / Bulging Case ⚠️</option>
              <option value="leaking">Leaking Liquid / Odor ⚠️</option>
              <option value="overheating">Excessive Overheating ⚠️</option>
              <option value="punctured">Punctured / Pierced ⚠️</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Battery Condition
            </label>
            <select
              value={formData.battery.condition}
              onChange={(e) =>
                updateBattery("condition", e.target.value as BatteryCondition)
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="good">Good / Normal</option>
              <option value="degraded">Degraded (Short Runtime)</option>
              <option value="swollen_damaged">Swollen / Damaged</option>
              <option value="not_applicable">Not Applicable (No Battery)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Reported Battery Health (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 84"
              value={formData.battery.health_percentage ?? ""}
              onChange={(e) =>
                updateBattery(
                  "health_percentage",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Economics & Warranty */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Repair Economics & Warranty Context</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent financial evaluation compares quotes against secondary market value.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Currency
            </label>
            <select
              value={formData.economics.currency}
              onChange={(e) => updateEcon("currency", e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Estimated Repair Cost
            </label>
            <input
              type="number"
              min="0"
              step="50"
              placeholder="e.g. 1500"
              value={formData.economics.estimated_repair_cost ?? ""}
              onChange={(e) =>
                updateEcon(
                  "estimated_repair_cost",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Estimated Value After Repair
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 5000"
              value={formData.economics.estimated_post_repair_value ?? ""}
              onChange={(e) =>
                updateEcon(
                  "estimated_post_repair_value",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Warranty Status
            </label>
            <select
              value={formData.warranty_status}
              onChange={(e) =>
                updateField("warranty_status", e.target.value as WarrantyStatus)
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="expired">Expired</option>
              <option value="active">Active (Under Warranty)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Your Preference / Intention
            </label>
            <select
              value={formData.user_preference}
              onChange={(e) =>
                updateField("user_preference", e.target.value as UserPreference)
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="keep_repair">Keep & Repair (Extend Use)</option>
              <option value="sell_donate">Sell or Donate to Someone Else</option>
              <option value="recycle">Recycle Responsibly</option>
              <option value="unsure">Unsure / Best Recommendation</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.has_personal_data}
                onChange={(e) => updateField("has_personal_data", e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Device stores sensitive personal or enterprise data</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <span>Evaluating Recovery Pathways...</span>
          ) : (
            <>
              <span>Generate Recovery Recommendation</span>
              <ArrowRight className="w-5 h-5 text-emerald-200" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
