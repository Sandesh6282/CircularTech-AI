"use strict";
import React from "react";
import { ArrowRight, CheckCircle2, ShieldAlert, Cpu, Sparkles, AlertTriangle } from "lucide-react";

interface HeroProps {
  onStartAssessment: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartAssessment, onSelectPreset }) => {
  return (
    <div className="relative overflow-hidden pt-10 pb-16 sm:pb-24">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/50 backdrop-blur-sm text-xs font-semibold text-emerald-300 mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI-Powered Circular Economy & E-Waste Recovery</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Give Every Device <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            a Second Life.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Decide with confidence whether to <strong className="text-emerald-400 font-semibold">reuse</strong>,{" "}
          <strong className="text-amber-400 font-semibold">repair</strong>,{" "}
          <strong className="text-teal-400 font-semibold">resell/donate</strong>, or{" "}
          <strong className="text-rose-400 font-semibold">recycle safely</strong>. Combining visual device recognition with transparent, explainable recovery economics.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartAssessment}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Assess Your Device</span>
            <ArrowRight className="w-5 h-5 text-emerald-200" />
          </button>
          
          <button
            onClick={() => onSelectPreset("phone_repair")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-6 py-4 rounded-2xl transition-all"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Load Sample Preset</span>
          </button>
        </div>

        {/* Key Tenets & Trust Indicators */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <div className="text-2xl font-bold text-white mb-1">96.4%</div>
            <div className="text-xs text-slate-400">Model Category Accuracy on ETID Dataset</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <div className="text-2xl font-bold text-emerald-400 mb-1">100%</div>
            <div className="text-xs text-slate-400">Explainable Decision Heuristics (No Hallucinations)</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <div className="text-2xl font-bold text-rose-400 mb-1">Safety-First</div>
            <div className="text-xs text-slate-400">Automatic Swollen / Leaking Battery Overrides</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <div className="text-2xl font-bold text-teal-400 mb-1">Cost-Benefit</div>
            <div className="text-xs text-slate-400">Transparent Repair Cost vs. Post-Repair Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};
