"use strict";
import React from "react";
import { AlertOctagon, Flame, ShieldAlert, ArrowUpRight } from "lucide-react";

interface SafetyWarningProps {
  message: string;
}

export const SafetyWarning: React.FC<SafetyWarningProps> = ({ message }) => {
  return (
    <div className="rounded-2xl border-2 border-rose-500/80 bg-rose-950/40 p-5 backdrop-blur-md shadow-2xl shadow-rose-950/50 animate-pulse">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
          <Flame className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/60">
              Hazardous Battery Alert
            </span>
            <span className="text-xs text-rose-300 font-medium">Acute Fire / Chemical Risk</span>
          </div>
          <p className="text-sm font-semibold text-rose-100 leading-snug pt-1">
            {message}
          </p>
          <div className="pt-2 text-xs text-rose-200/80 flex items-center gap-4">
            <span>• Do not connect charger</span>
            <span>• Do not open chassis</span>
            <span>• Keep in fire-safe container</span>
          </div>
        </div>
      </div>
    </div>
  );
};
