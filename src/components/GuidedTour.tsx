'use client';

import React from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X, CheckCircle } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  tip?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'step-preset',
    title: 'Step 1: Choose a Compound or Vial Size',
    description:
      'Click a fast preset (like Semaglutide or Tirzepatide) or enter the exact total milligrams (mg) printed on your peptide vial label.',
    tip: 'Most common vials are 5mg or 10mg.',
  },
  {
    targetId: 'step-water',
    title: 'Step 2: Enter BAC Water Added',
    description:
      'Enter how many milliliters (mL) of sterile Bacteriostatic Water you inject into the vial to dissolve the lyophilized powder.',
    tip: '2.0 mL is the industry standard for easy calculation.',
  },
  {
    targetId: 'step-dose',
    title: 'Step 3: Set Your Target Dose',
    description:
      'Enter the single dose you want to administer in micrograms (mcg). E.g., a standard 0.25 mg starter dose is 250 mcg.',
    tip: '1 milligram (mg) = 1,000 micrograms (mcg).',
  },
  {
    targetId: 'step-syringe',
    title: 'Step 4: Read Your Live Syringe Mark',
    description:
      'Look at the high-precision syringe below! The green fill and indicator arrow tell you the exact unit mark to pull the plunger to.',
    tip: 'No more confusing math or conversion panic.',
  },
  {
    targetId: 'subq-guide',
    title: 'Step 5: Follow the Clinical Sub-Q Visual Guide',
    description:
      "Explore 4 high-definition clinical sub-Q stages with DO/DON'T harm-reduction checklists and a printable Cheat Sheet view.",
    tip: 'Save the 4-step photographic cheat sheet to your camera roll for offline reference.',
  },
];

interface GuidedTourProps {
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  currentStepIndex,
  onNext,
  onPrev,
  onClose,
}) => {
  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block break-words">
              Interactive Beginner Walkthrough ({currentStepIndex + 1}/{TOUR_STEPS.length})
            </span>
            <h4 className="text-sm font-bold text-slate-100 break-words mt-0.5">{currentStep.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            title="Skip Tour"
            aria-label="Skip tour"
          >
            <span>Skip tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed break-words">
        {currentStep.description}
      </p>

      {currentStep.tip && (
        <div className="mt-2 text-[11px] text-emerald-300/90 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 rounded-md break-words">
          💡 <strong>Pro Tip:</strong> {currentStep.tip}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentStepIndex
                  ? 'bg-emerald-400 w-5'
                  : i < currentStepIndex
                  ? 'bg-emerald-600 w-2'
                  : 'bg-slate-700 w-2'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentStepIndex > 0 && (
            <button
              onClick={onPrev}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}

          <button
            onClick={isLast ? onClose : onNext}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {isLast ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" /> Got it!
              </>
            ) : (
              <>
                Next Step <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
