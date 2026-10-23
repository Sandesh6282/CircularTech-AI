"use strict";
import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Sparkles, Check, AlertCircle, RefreshCw } from "lucide-react";
import { CategoryPredictionOutput, DeviceCategory } from "../lib/types";

interface ImageUploaderProps {
  onImageSelected: (file: File | null) => void;
  prediction: CategoryPredictionOutput | null;
  isPredicting: boolean;
  selectedCategory: DeviceCategory;
  onConfirmCategory: (cat: DeviceCategory) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  prediction,
  isPredicting,
  selectedCategory,
  onConfirmCategory,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, or WEBP).");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onImageSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <span>Device Image & Visual Identification</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload a clear photo. Our trained vision model helps identify the device category.
          </p>
        </div>
        {previewUrl && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg border border-rose-900/50 hover:bg-rose-950/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-emerald-500 bg-emerald-950/20"
              : "border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Upload className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            Click to upload or drag & drop a device photo
          </p>
          <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WEBP (Max 15MB)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 relative group rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Device Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs bg-slate-900/90 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className="md:col-span-7 space-y-3">
            {isPredicting ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 animate-pulse flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                <div>
                  <div className="text-sm font-medium text-white">Analyzing device visual features...</div>
                  <div className="text-xs text-slate-400">MobileNetV3 classifier evaluating visual synsets</div>
                </div>
              </div>
            ) : prediction ? (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                      Visual AI Classification
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
                    {(prediction.confidence * 100).toFixed(1)}% Confidence
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-white capitalize">
                    {prediction.predicted_category.replace("_", " ")}
                  </div>
                  {selectedCategory === prediction.predicted_category ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  ) : (
                    <button
                      onClick={() => onConfirmCategory(prediction.predicted_category)}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      Use this category
                    </button>
                  )}
                </div>

                {prediction.top_candidates && prediction.top_candidates.length > 1 && (
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">Alternative candidates:</span>
                    {prediction.top_candidates
                      .filter((cand) => cand.category !== prediction.predicted_category)
                      .slice(0, 2)
                      .map((cand, idx) => (
                        <button
                          key={`${cand.category}-${idx}`}
                          onClick={() => onConfirmCategory(cand.category as DeviceCategory)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors capitalize cursor-pointer"
                        >
                          {cand.category.replace("_", " ")} ({(cand.confidence * 100).toFixed(0)}%)
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong>Honest AI Principle:</strong> Visual classification identifies device category only. Internal faults, battery health, and electronic integrity must be established through the specifications below.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
