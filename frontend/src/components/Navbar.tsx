"use strict";
import React from "react";
import { Recycle, ShieldCheck, Sparkles } from "lucide-react";

interface NavbarProps {
  onStartAssessment?: () => void;
  onViewDocs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartAssessment, onViewDocs }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              CircularTech AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-emerald-400/80 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-950/40">
              E-Waste Intelligence
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onViewDocs}
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900"
          >
            Methodology & Rules
          </button>
          <button
            onClick={onStartAssessment}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Assess a Device</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
