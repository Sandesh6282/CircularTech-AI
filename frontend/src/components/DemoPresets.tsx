"use strict";
import React from "react";
import { Laptop, Smartphone, AlertTriangle, Cpu } from "lucide-react";
import { DeviceAssessmentInput } from "../lib/types";

interface DemoPresetsProps {
  onApplyPreset: (preset: DeviceAssessmentInput, presetId: string) => void;
  activePresetId?: string | null;
}

export const PRESETS: {
  id: string;
  title: string;
  subtitle: string;
  expectedPathway: string;
  icon: React.ElementType;
  badgeColor: string;
  data: DeviceAssessmentInput;
}[] = [
  {
    id: "phone_repair",
    title: "Cracked Screen Phone",
    subtitle: "Repair cost ₹2,000 vs. post-repair value ₹7,000",
    expectedPathway: "Repair (Economical)",
    icon: Smartphone,
    badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
    data: {
      category: "phone",
      category_confirmed_by_user: true,
      brand: "OnePlus",
      model_name: "Nord CE 2",
      purchase_year: 2022,
      device_age_years: 2.5,
      functional_condition: "functional_minor_issues",
      known_faults: "Display glass cracked, touch digitizer fully responsive",
      screen_condition: "cracked",
      water_damage: false,
      charging_works: "works",
      battery: {
        health_percentage: 82,
        condition: "good",
        safety_concern: "none_known",
        replaceable: true,
      },
      warranty_status: "expired",
      economics: {
        estimated_repair_cost: 2000,
        estimated_post_repair_value: 7000,
        currency: "INR",
      },
      user_preference: "keep_repair",
      has_personal_data: true,
    },
  },
  {
    id: "tablet_hazard",
    title: "Swollen Battery Tablet",
    subtitle: "Physical battery expansion / thermal hazard",
    expectedPathway: "Immediate Hazard Override",
    icon: AlertTriangle,
    badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
    data: {
      category: "tablet",
      category_confirmed_by_user: true,
      brand: "Apple",
      model_name: "iPad Air 2",
      purchase_year: 2016,
      device_age_years: 8.0,
      functional_condition: "partially_functional",
      screen_condition: "intact",
      water_damage: false,
      battery: {
        condition: "swollen_damaged",
        safety_concern: "swollen",
      },
      warranty_status: "expired",
      economics: {
        estimated_repair_cost: 3500,
        estimated_post_repair_value: 5000,
        currency: "INR",
      },
      user_preference: "unsure",
    },
  },
  {
    id: "laptop_reuse",
    title: "Functional Business Laptop",
    subtitle: "4 yrs old, healthy battery, fully operational",
    expectedPathway: "Reuse / Continue Using",
    icon: Laptop,
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-700",
    data: {
      category: "laptop",
      category_confirmed_by_user: true,
      brand: "Dell",
      model_name: "Latitude 7490",
      purchase_year: 2020,
      device_age_years: 4.0,
      functional_condition: "fully_functional",
      screen_condition: "intact",
      water_damage: false,
      charging_works: "works",
      battery: {
        health_percentage: 87,
        condition: "good",
        safety_concern: "none_known",
      },
      warranty_status: "expired",
      economics: {
        currency: "INR",
      },
      user_preference: "keep_repair",
      has_personal_data: true,
    },
  },
  {
    id: "desktop_obsolete",
    title: "Defective 2011 PC",
    subtitle: "Does not power on, 13+ years old",
    expectedPathway: "Authorized E-Waste Recycling",
    icon: Cpu,
    badgeColor: "bg-slate-900 text-slate-300 border-slate-700",
    data: {
      category: "desktop",
      category_confirmed_by_user: true,
      brand: "Custom Tower",
      purchase_year: 2011,
      device_age_years: 13.0,
      functional_condition: "does_not_power_on",
      water_damage: false,
      battery: {
        condition: "not_applicable",
        safety_concern: "none_known",
      },
      warranty_status: "expired",
      economics: {
        currency: "INR",
      },
      user_preference: "recycle",
    },
  },
];

export const DemoPresets: React.FC<DemoPresetsProps> = ({ onApplyPreset, activePresetId }) => {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
            Quick Demo Presets
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
            1-Click Live Evaluation
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Click any scenario to instantly fill the form & generate its recovery recommendation
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isActive = activePresetId === p.id;
          return (
            <button
              id={`preset-${p.id}`}
              data-testid={`preset-${p.id}`}
              key={p.id}
              type="button"
              onClick={() => onApplyPreset({ ...p.data }, p.id)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500 shadow-lg shadow-emerald-950/60 scale-[1.02]"
                  : "bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700 hover:scale-[1.01]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-emerald-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                      Active
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor}`}
                  >
                    {p.expectedPathway}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-white">{p.title}</div>
              <div className="text-xs text-slate-400 mt-1 leading-snug">{p.subtitle}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
