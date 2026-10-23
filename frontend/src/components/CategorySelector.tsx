"use strict";
import React from "react";
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Tv,
  HardDrive,
  Printer,
  Cable,
  BatteryMedium,
  Cpu,
  HelpCircle,
} from "lucide-react";
import { DeviceCategory } from "../lib/types";

interface CategorySelectorProps {
  value: DeviceCategory;
  onChange: (category: DeviceCategory) => void;
  aiSuggestedCategory?: DeviceCategory | null;
}

const CATEGORIES: { id: DeviceCategory; label: string; icon: React.ElementType }[] = [
  { id: "phone", label: "Smartphone", icon: Smartphone },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "desktop", label: "Desktop PC", icon: HardDrive },
  { id: "monitor", label: "Monitor", icon: Monitor },
  { id: "tv", label: "Television", icon: Tv },
  { id: "printer", label: "Printer", icon: Printer },
  { id: "battery", label: "Battery Unit", icon: BatteryMedium },
  { id: "charger_cable", label: "Cables / Charger", icon: Cable },
  { id: "circuit_board", label: "Circuit Board (PCB)", icon: Cpu },
  { id: "other", label: "Other Electronics", icon: HelpCircle },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  aiSuggestedCategory,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200">
          Device Category <span className="text-emerald-400">*</span>
        </label>
        <span className="text-xs text-slate-400">Select or verify</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = value === cat.id;
          const isAiMatch = aiSuggestedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500"
                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium leading-tight">{cat.label}</span>

              {isAiMatch && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-900 text-teal-300 border border-teal-700">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
