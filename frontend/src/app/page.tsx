"use client";

import React, { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ImageUploader } from "@/components/ImageUploader";
import { AssessmentForm } from "@/components/AssessmentForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DemoPresets, PRESETS } from "@/components/DemoPresets";
import {
  CategoryPredictionOutput,
  DeviceAssessmentInput,
  DeviceCategory,
  RecommendationOutput,
} from "@/lib/types";
import { predictDeviceCategory, submitAssessment } from "@/lib/api";
import { Recycle, BookOpen, X, Sparkles, CheckCircle2, Shield, HeartHandshake } from "lucide-react";
import confetti from "canvas-confetti";

const DEFAULT_ASSESSMENT: DeviceAssessmentInput = {
  category: "phone",
  category_confirmed_by_user: true,
  functional_condition: "functional_minor_issues",
  screen_condition: "intact",
  water_damage: false,
  charging_works: "works",
  battery: {
    condition: "good",
    safety_concern: "none_known",
    health_percentage: 85,
  },
  warranty_status: "expired",
  economics: {
    currency: "INR",
  },
  user_preference: "keep_repair",
  has_personal_data: true,
};

export default function Home() {
  const [assessment, setAssessment] = useState<DeviceAssessmentInput>(DEFAULT_ASSESSMENT);
  const [prediction, setPrediction] = useState<CategoryPredictionOutput | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const assessmentSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToAssessment = () => {
    assessmentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageSelected = async (file: File | null) => {
    if (!file) {
      setPrediction(null);
      return;
    }

    setIsPredicting(true);
    try {
      const pred = await predictDeviceCategory(file);
      setPrediction(pred);
      if (pred.predicted_category) {
        setAssessment((prev) => ({
          ...prev,
          category: pred.predicted_category,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleApplyPreset = (presetData: DeviceAssessmentInput, presetId?: string) => {
    setActivePresetId(presetId || null);
    setAssessment(presetData);
    setPrediction(null);
    // Automatically submit and compute recommendation immediately so the user sees the output!
    handleSubmitAssessment(presetData);
  };

  const handleSubmitAssessment = async (values: DeviceAssessmentInput) => {
    setIsSubmitting(true);
    try {
      const rec = await submitAssessment(values);
      setRecommendation(rec);

      // Trigger celebratory confetti for positive recovery pathways!
      if (
        rec.pathway === "Reuse / Continue using" ||
        rec.pathway === "Repair" ||
        rec.pathway === "Resell / Donate"
      ) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#10b981", "#14b8a6", "#3b82f6"],
          });
        } catch {
          // Ignore if canvas-confetti is not loaded
        }
      }

      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      console.error(e);
      alert("Failed to compute recommendation. Please check backend status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputs = () => {
    scrollToAssessment();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        onStartAssessment={scrollToAssessment}
        onViewDocs={() => setShowDocsModal(true)}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          onStartAssessment={scrollToAssessment}
          onSelectPreset={(presetId) => {
            const p = PRESETS.find((x) => x.id === presetId);
            if (p) handleApplyPreset(p.data, p.id);
          }}
        />

        {/* Assessment Section */}
        <section
          ref={assessmentSectionRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20 space-y-8"
        >
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Assess Your Electronic Device
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Provide an optional photo for visual recognition, then specify functional and economic metrics for transparent recovery guidance.
            </p>
          </div>

          {/* Quick Demo Presets */}
          <DemoPresets
            onApplyPreset={handleApplyPreset}
            activePresetId={activePresetId}
          />

          {/* Step 1: Visual Identification */}
          <ImageUploader
            onImageSelected={handleImageSelected}
            prediction={prediction}
            isPredicting={isPredicting}
            selectedCategory={assessment.category}
            onConfirmCategory={(cat) =>
              setAssessment((prev) => ({ ...prev, category: cat }))
            }
          />

          {/* Step 2: Form Metrics */}
          <AssessmentForm
            initialValues={assessment}
            onSubmit={handleSubmitAssessment}
            isLoading={isSubmitting}
            aiSuggestedCategory={prediction?.predicted_category}
          />

          {/* Results Display */}
          <div ref={resultsSectionRef} className="scroll-mt-20 pt-4">
            {recommendation && (
              <RecommendationCard
                recommendation={recommendation}
                onEditInputs={handleEditInputs}
              />
            )}
          </div>
        </section>

        {/* Methodology Overview Section */}
        <section className="bg-slate-900/40 border-t border-slate-800/80 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl font-bold text-white">
                How CircularTech AI Recommends Pathways
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                Grounding decision intelligence in transparency, device safety, and true circular economics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">1. Priority Safety Override</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Swollen, punctured, or leaking batteries pose thermal runaway and chemical risks. The system overrides all reuse/repair logic immediately with hazardous handling protocols.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Recycle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">2. Repair Economic Viability</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Rather than making assumptions, we compare estimated repair costs against post-repair value. If the repair cost ratio is ≤ 60%, repair is recommended to extend hardware life.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">3. Data Privacy & Resale</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Working electronics are guided to resale or donation with a strict data sanitization checklist (cloud account removal and cryptographic factory resets).
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">CircularTech AI</span>
            <span>— Give Every Device a Second Life</span>
          </div>
          <div>
            College AI/ML Hackathon Edition • Trained on ETID Benchmark (98% Accuracy)
          </div>
        </div>
      </footer>

      {/* Methodology Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Decision Engine Methodology</span>
              </h3>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>CircularTech AI</strong> adheres to strict ethical engineering principles:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>No Fake Internal Diagnostics:</strong> A photo alone cannot determine whether a motherboard has blown capacitors or if a lithium battery is healthy. Computer vision is strictly bounded to device category identification.
                </li>
                <li>
                  <strong>Safety First:</strong> Battery thermal hazards (swelling, leaking, overheating) automatically trigger safety warnings and authorized collection pathways.
                </li>
                <li>
                  <strong>Transparent Economics:</strong> Financial viability uses the formula:{" "}
                  <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">
                    repair_cost_ratio = repair_cost / post_repair_value
                  </code>
                  . Viable threshold is configurable at ≤ 60%.
                </li>
                <li>
                  <strong>Zero Greenwashing:</strong> We do not fabricate CO2 or carbon credit figures without certified lifecycle assessment data.
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
