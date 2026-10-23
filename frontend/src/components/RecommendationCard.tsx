"use strict";
import React, { useState } from "react";
import {
  CheckCircle2,
  Wrench,
  Gift,
  Recycle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Edit3,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { RecommendationOutput, RecoveryPathway } from "../lib/types";
import { SafetyWarning } from "./SafetyWarning";

interface RecommendationCardProps {
  recommendation: RecommendationOutput;
  onEditInputs: () => void;
}

const PATHWAY_CONFIGS: Record<
  RecoveryPathway,
  {
    theme: string;
    bgGradient: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    icon: React.ElementType;
  }
> = {
  "Reuse / Continue using": {
    theme: "emerald",
    bgGradient: "from-emerald-950/40 via-slate-900/60 to-slate-950",
    border: "border-emerald-500/40",
    badgeBg: "bg-emerald-950 border-emerald-600/50",
    badgeText: "text-emerald-300",
    icon: CheckCircle2,
  },
  "Resell / Donate": {
    theme: "teal",
    bgGradient: "from-teal-950/40 via-slate-900/60 to-slate-950",
    border: "border-teal-500/40",
    badgeBg: "bg-teal-950 border-teal-600/50",
    badgeText: "text-teal-300",
    icon: Gift,
  },
  Repair: {
    theme: "amber",
    bgGradient: "from-amber-950/40 via-slate-900/60 to-slate-950",
    border: "border-amber-500/40",
    badgeBg: "bg-amber-950 border-amber-600/50",
    badgeText: "text-amber-300",
    icon: Wrench,
  },
  "Refurbish / Professionally assess": {
    theme: "indigo",
    bgGradient: "from-indigo-950/40 via-slate-900/60 to-slate-950",
    border: "border-indigo-500/40",
    badgeBg: "bg-indigo-950 border-indigo-600/50",
    badgeText: "text-indigo-300",
    icon: TrendingUp,
  },
  "Authorized recycling": {
    theme: "rose",
    bgGradient: "from-rose-950/40 via-slate-900/60 to-slate-950",
    border: "border-rose-500/40",
    badgeBg: "bg-rose-950 border-rose-600/50",
    badgeText: "text-rose-300",
    icon: Recycle,
  },
  "Needs more information": {
    theme: "slate",
    bgGradient: "from-slate-900/80 via-slate-900/60 to-slate-950",
    border: "border-slate-700",
    badgeBg: "bg-slate-800 border-slate-600",
    badgeText: "text-slate-300",
    icon: HelpCircle,
  },
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onEditInputs,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const config = PATHWAY_CONFIGS[recommendation.pathway] || PATHWAY_CONFIGS["Needs more information"];
  const PathwayIcon = config.icon;

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const fin = recommendation.financial_summary;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Prominent Critical Battery Safety Alert */}
      {recommendation.safety_alert && (
        <SafetyWarning message={recommendation.safety_alert} />
      )}

      {/* Main Pathway Recommendation Card */}
      <div
        className={`relative overflow-hidden rounded-3xl border ${config.border} bg-gradient-to-b ${config.bgGradient} p-6 sm:p-8 backdrop-blur-xl shadow-2xl`}
      >
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.badgeBg} ${config.badgeText}`}
              >
                <PathwayIcon className="w-3.5 h-3.5" />
                {recommendation.pathway}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Engine v{recommendation.decision_version}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {recommendation.headline}
            </h2>
          </div>

          <button
            onClick={onEditInputs}
            className="self-start sm:self-center flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl transition-all shrink-0"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Edit & Recalculate</span>
          </button>
        </div>

        {/* Executive Summary Explanation */}
        <p className="mt-6 text-base text-slate-300 leading-relaxed font-medium">
          {recommendation.explanation}
        </p>

        {/* Financial Comparison Summary (If available) */}
        {fin && fin.repair_cost_ratio !== undefined && fin.net_value_after_repair !== undefined && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Financial Viability Assessment
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  fin.is_financially_viable
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                    : "bg-rose-950 text-rose-300 border-rose-700"
                }`}
              >
                {fin.is_financially_viable ? "Economically Viable" : "Uneconomic Repair"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Repair Cost Ratio</div>
                <div className="text-xl font-bold text-white">
                  {(fin.repair_cost_ratio * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Threshold ≤ 60%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Net Projected Equity</div>
                <div
                  className={`text-xl font-bold ${
                    fin.net_value_after_repair > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {fin.currency} {fin.net_value_after_repair.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Post-repair value - cost</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Decision Status</div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {fin.is_financially_viable ? "Proceed with Repair" : "Prefer Recycling / Salvage"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reasons Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Key Supporting Reasons
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {recommendation.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-300 leading-normal"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps Action Checklist */}
        {recommendation.next_steps && recommendation.next_steps.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-3 flex items-center justify-between">
              <span>Recommended Action Steps</span>
              <span className="text-[10px] text-slate-400 normal-case">
                Click to mark completed
              </span>
            </h4>
            <div className="space-y-2">
              {recommendation.next_steps.map((step, idx) => {
                const isDone = !!checkedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-950/30 border-emerald-800/60 text-slate-400 line-through"
                        : "bg-slate-900/70 border-slate-850 hover:border-slate-700 text-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleStep(idx)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-sm leading-snug">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warnings & Caveats */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Important Warnings & Limitations</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {recommendation.warnings.map((warn, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Information Note */}
        {recommendation.missing_information && recommendation.missing_information.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Fields to refine this assessment: </span>
            {recommendation.missing_information.join(", ")}.
          </div>
        )}
      </div>
    </div>
  );
};
