'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Timer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  LayoutGrid,
  ListOrdered,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera
} from 'lucide-react';

interface SubQVisualGuideProps {
  syringeUnits?: number;
  drawVolumeMl?: number;
  syringeType?: string;
  compoundName?: string;
  activeStep?: number;
  onStepChange?: (step: number) => void;
}

interface StepDetail {
  id: number;
  stepNumber: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  badge: string;
  citation: string;
  toolbarType: 'status' | 'dry-timer' | 'dose-sync' | 'dwell-timer';
  statusText?: string;
  timerDuration?: number;
  timerLabel?: string;
  keyPoints: {
    num: string;
    title: string;
    description: string;
  }[];
  doRule: string;
  dontRule: string;
  anxietyQ: string;
  anxietyA: string;
}

export function SubQVisualGuide({
  syringeUnits = 10,
  drawVolumeMl = 0.1,
  syringeType = 'U100',
  compoundName = 'Subcutaneous Peptide',
  activeStep: controlledActiveStep,
  onStepChange,
}: SubQVisualGuideProps) {
  const [internalActiveStep, setInternalActiveStep] = useState<number>(1);
  const activeStep = controlledActiveStep !== undefined ? controlledActiveStep : internalActiveStep;

  // Mobile accordion expanded step: null = all collapsed; 1..4 = that step expanded
  const [mobileExpandedStep, setMobileExpandedStep] = useState<number | null>(null);

  // Sync mobile expanded step when controlledActiveStep (e.g. Guided Tour) changes
  useEffect(() => {
    if (controlledActiveStep !== undefined) {
      setMobileExpandedStep(controlledActiveStep);
    }
  }, [controlledActiveStep]);

  const setActiveStep = (stepOrFn: number | ((prev: number) => number)) => {
    const nextStep = typeof stepOrFn === 'function' ? stepOrFn(activeStep) : stepOrFn;
    setInternalActiveStep(nextStep);
    onStepChange?.(nextStep);
  };

  const [isCheatSheetMode, setIsCheatSheetMode] = useState<boolean>(false);

  // Live Timer Controller (Step 2: 15s Air-Dry; Step 4: 10s Needle Dwell)
  const [timerCount, setTimerCount] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Precision-calibrated symmetrical content (Apple-grade consistency)
  const STEPS: StepDetail[] = useMemo(() => [
    {
      id: 1,
      stepNumber: '01',
      title: 'Aseptic Supplies Preparation',
      shortTitle: 'Aseptic Supplies Setup',
      subtitle: 'Gather sterile supplies on a clean surface and warm refrigerated solution to room temperature.',
      imageSrc: '/guide/step1-photo.jpg',
      imageAlt: 'Sterile peptide vial, ultra-fine 31G insulin syringe with orange cap, and sealed 70% alcohol pads arranged neatly on a clean clinical desk.',
      badge: 'STAGE 01 • PREPARATION',
      citation: 'CDC Safe Injection Practices & WHO Aseptic Protocols',
      toolbarType: 'status',
      statusText: 'Room Temp Acclimation: 5–10 min • Sterile Check Passed',
      keyPoints: [
        {
          num: '1',
          title: 'Vial Temperature Acclimation',
          description: 'Let cold refrigerated vial sit at room temperature for 5–10 minutes to eliminate cold-fluid injection sting.'
        },
        {
          num: '2',
          title: 'Single-Use Syringe Verification',
          description: `Use a single-use 31G ultra-fine syringe calibrated to your target ${syringeUnits} Units (${drawVolumeMl} mL). Never reuse needles.`
        },
        {
          num: '3',
          title: 'Dual Alcohol Swab Setup',
          description: 'Have two separate 70% isopropyl alcohol pads ready: one dedicated to the stopper and one for the skin.'
        }
      ],
      doRule: 'Inspect solution clarity; confirm fluid is 100% transparent and particle-free.',
      dontRule: 'Never place uncapped sterile needles or swabbed stoppers on unsterilized desks.',
      anxietyQ: 'Why warm the vial?',
      anxietyA: 'Cold liquid triggers skin nerve receptors. Room temperature fluid eliminates over 80% of injection sting.'
    },
    {
      id: 2,
      stepNumber: '02',
      title: 'Site Selection & 15-Second Air Evaporation',
      shortTitle: 'Site Selection & Cleansing',
      subtitle: 'Target lower abdominal fat and allow 15 seconds for complete evaporation to prevent burning.',
      imageSrc: '/guide/step2-photo.jpg',
      imageAlt: 'Healthcare hand wearing sterile blue glove swabbing lower abdomen with 70% isopropyl alcohol pad',
      badge: 'STAGE 02 • DISINFECTION',
      citation: 'American Diabetes Association (ADA) & FITTER Guidelines §4.2',
      toolbarType: 'dry-timer',
      timerDuration: 15,
      timerLabel: 'Start 15s Air-Dry Timer',
      keyPoints: [
        {
          num: '1',
          title: 'Two-Inch Navel Clearance',
          description: 'Select a site at least 2 inches (5 cm) away from your navel across the lower left or right abdomen.'
        },
        {
          num: '2',
          title: 'Systematic Weekly Rotation',
          description: 'Rotate injection quadrants weekly (Left side Week 1, Right side Week 2) to prevent fat lumps.'
        },
        {
          num: '3',
          title: 'Complete Matte Evaporation',
          description: 'Swab outward and wait until the skin turns completely matte. Liquid alcohol causes 90% of burning.'
        }
      ],
      doRule: 'Allow alcohol to air-dry completely until skin appears 100% matte and non-reflective.',
      dontRule: 'Never blow on wet skin or wave your hand to dry it; oral bacteria will contaminate the site.',
      anxietyQ: 'Why does injection sting?',
      anxietyA: 'The ultra-fine needle causes zero pain. Stinging occurs when wet alcohol is dragged into fat by the needle.'
    },
    {
      id: 3,
      stepNumber: '03',
      title: 'Air Equalization & Bubble-Free Precision Draw',
      shortTitle: 'Precision Medication Draw',
      subtitle: 'Equalize vial pressure, invert completely, and align the plunger accurately to your dose.',
      imageSrc: '/guide/step3-photo.jpg',
      imageAlt: 'Illustration showing injection of room air into peptide vial, inverting vial with needle submerged in fluid, and tapping syringe barrel to remove bubbles.',
      badge: 'STAGE 03 • FLUID DYNAMICS',
      citation: 'CDC Injection Techniques & Clinical Pharmacokinetics',
      toolbarType: 'dose-sync',
      statusText: `Protocol Locked: ${syringeUnits} Units (${drawVolumeMl} mL) • ${syringeType} Calibration`,
      keyPoints: [
        {
          num: '1',
          title: 'Equal Room Air Injection',
          description: `Push ${syringeUnits} Units of air into upright vial before drawing to prevent vacuum struggle and resistance.`
        },
        {
          num: '2',
          title: 'Inverted Needle Submersion',
          description: 'Invert the vial completely so liquid pools against the stopper, ensuring the needle tip is fully submerged.'
        },
        {
          num: '3',
          title: 'Bubble Tap & Target Alignment',
          description: `Draw past mark, flick barrel to send micro-bubbles to top, and push plunger exactly to ${syringeUnits} Units.`
        }
      ],
      doRule: 'Invert the vial 180° completely so liquid pools against the stopper, covering the needle tip.',
      dontRule: 'Never worry about micro-bubbles causing embolism; subcutaneous fat has no vascular channels.',
      anxietyQ: 'Is bubble dangerous?',
      anxietyA: 'No embolism risk. Sub-Q fat absorbs micro-bubbles harmlessly; tapping is strictly for dosage accuracy.'
    },
    {
      id: 4,
      stepNumber: '04',
      title: '90° Dart Entry, 10s Dwell & Safe Aftercare',
      shortTitle: '90° Injection & 10s Dwell',
      subtitle: 'Smooth perpendicular entry, 10-second dwell to prevent leakage, followed by safe disposal.',
      imageSrc: '/guide/step4-photo.jpg',
      imageAlt: 'Close-up macro of subcutaneous injection into a pinched abdominal fat fold at 90 degrees with thumb pushing plunger smoothly.',
      badge: 'STAGE 04 • ADMINISTRATION',
      citation: 'FITTER 10-Second Needle Dwell Standard & Mayo Clinic Protocol',
      toolbarType: 'dwell-timer',
      timerDuration: 10,
      timerLabel: 'Start 10s Needle Dwell Count',
      keyPoints: [
        {
          num: '1',
          title: 'Pinch & 90° Dart Insertion',
          description: 'Gently pinch a 2-inch skin fold and insert the 31G needle fully at a perpendicular 90° angle like a dart.'
        },
        {
          num: '2',
          title: 'Strictly No Plunger Aspiration',
          description: 'Never pull back plunger to check for blood. Sub-Q lacks large vessels; pulling back tears tissue.'
        },
        {
          num: '3',
          title: 'The 10-Second Anti-Leak Dwell',
          description: 'Keep needle completely still for 10 seconds after pushing to let peptide diffuse without backflow.'
        }
      ],
      doRule: 'Hold 10 seconds before withdrawal, press lightly with clean pad, and dispose syringe into a sharps container.',
      dontRule: 'Never recap or reuse single-use needles, never rub the injection spot, and never aspirate.',
      anxietyQ: 'Why hold 10s & dispose immediately?',
      anxietyA: 'Holding 10s seals the dose against track leakage. Immediate puncture-proof disposal prevents accidental needle sticks.'
    }
  ], [syringeUnits, drawVolumeMl, syringeType]);

  const currentStep = STEPS[activeStep - 1] || STEPS[0];

  const handleMobileNextStage = (nextId: number) => {
    setMobileExpandedStep(nextId);
    setActiveStep(nextId);
    setTimeout(() => {
      const el = document.getElementById(`mobile-stage-${nextId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleMobileStageToggle = (stepId: number) => {
    setMobileExpandedStep((prev) => {
      const isCurrentlyExpanded = prev === stepId;
      if (isCurrentlyExpanded) {
        // True collapse to null
        return null;
      } else {
        // Expand target stage and sync desktop step
        setActiveStep(stepId);
        setTimeout(() => {
          const el = document.getElementById(`mobile-stage-${stepId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return stepId;
      }
    });
  };

  // Reset timer ONLY when user switches activeStep or unmounts
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setTimerCompleted(false);
    setTimerCount(currentStep.timerDuration || 10);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [activeStep]);

  // Live Timer Controller
  const handleToggleTimer = () => {
    if (isTimerRunning) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setIsTimerRunning(false);
      return;
    }

    const duration = currentStep.timerDuration || 10;
    setTimerCount(duration);
    setTimerCompleted(false);
    setIsTimerRunning(true);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setIsTimerRunning(false);
          setTimerCompleted(true);
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([150, 80, 150]);
            } catch {
              // Ignore unsupported
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setTimerCompleted(false);
    setTimerCount(currentStep.timerDuration || 10);
  };

  return (
    <section
      id="subq-guide"
      className="w-full relative scroll-mt-6"
      aria-label="Clinical Subcutaneous Self-Injection Protocol"
    >
      {/* Background Subtle Medical Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sub-Q Injection Visual Protocol</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider">
              FITTER / ADA Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-normal max-w-3xl">
            Evidence-based Sub-Q technique: aseptic prep, 45°–90° pinch, and safe sharps disposal.
          </p>
        </div>

        {/* View Switcher & Quick Save Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            title="Save as PDF or print injection guide"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save / Print</span>
          </button>

          <button
            onClick={() => setIsCheatSheetMode(!isCheatSheetMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap cursor-pointer ${
              isCheatSheetMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Toggle between Interactive Dual-Column View and 4-Card Bento Grid"
          >
            {isCheatSheetMode ? <ListOrdered className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            <span>{isCheatSheetMode ? 'Interactive View' : 'Cheat Sheet'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE A: CHEAT SHEET VIEW (Bento Grid Screenshot Card)         */}
      {/* ============================================================ */}
      {isCheatSheetMode ? (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-100 tracking-tight">PepPlotter • Clinical Sub-Q Protocol</span>
                <span className="block text-[10px] text-slate-400 font-mono">ADA &amp; FITTER Harm-Reduction Standard</span>
              </div>
            </div>
            <div className="text-[11px] font-mono font-semibold text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-md">
              Target Dose: {syringeUnits} Units ({drawVolumeMl} mL)
            </div>
          </div>

          {/* 4 Steps Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="p-4 sm:p-5 rounded-xl border bg-slate-900/80 border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 mb-3 bg-slate-950">
                    <img
                      src={step.imageSrc}
                      alt={step.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-emerald-400 border border-emerald-500/30">
                      STEP {step.stepNumber}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mb-1 leading-snug">{step.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{step.subtitle}</p>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                    {step.keyPoints.map((kp) => (
                      <div key={kp.num} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span><strong className="text-slate-200">{kp.title}:</strong> {kp.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                  <div className="text-emerald-300 flex items-start gap-1">
                    <span className="font-bold">✓ DO:</span>
                    <span>{step.doRule}</span>
                  </div>
                  <div className="text-rose-400 flex items-start gap-1">
                    <span className="font-bold">✗ DON'T:</span>
                    <span>{step.dontRule}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Protocol Verification Card */}
          <div className="mt-5 p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-cyan-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
              <span className="text-slate-400">Compound: <strong className="text-slate-200">{compoundName}</strong></span>
              <span className="text-slate-400">Target Draw: <strong className="text-emerald-400">{syringeUnits} Units ({drawVolumeMl} mL)</strong></span>
              <span className="text-slate-400">Syringe: <strong className="text-slate-200">{syringeType} (31G Ultra-Fine)</strong></span>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.print();
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-emerald-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-400/50 hover:border-emerald-400 text-xs font-semibold text-emerald-300 hover:text-white transition-all shadow-md shadow-emerald-500/10 cursor-pointer group shrink-0"
              title="Click to print/save cheat sheet as PDF or take a screenshot for camera roll"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Save Screenshot / Print Cheat Sheet</span>
              <span className="text-[10px] text-cyan-300 font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                pepplotter.com
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* MODE B: CLINICAL SUB-Q VISUAL GUIDE                          */
        /* (Desktop: Dual-Column Master-Detail; Mobile: Accordion)      */
        /* ============================================================ */
        (() => {
          const renderDetailContent = (step: StepDetail, isMobile: boolean) => (
            <div className="space-y-4 flex flex-col justify-between h-full">
              {/* Top: Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
                    {step.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Stage {step.id} of 4
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className={`text-xs sm:text-sm text-emerald-300/90 font-medium mt-1 leading-snug ${isMobile ? '' : 'truncate'}`}>
                  {step.subtitle}
                </p>
              </div>

              {/* Standardized Action Bar / Timer */}
              <div className="min-h-12 py-2 sm:py-0 w-full flex items-center rounded-xl bg-slate-900/90 border border-slate-800 px-3">
                {step.toolbarType === 'dry-timer' || step.toolbarType === 'dwell-timer' ? (
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleTimer}
                      className={`flex-1 h-9 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isTimerRunning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                          : timerCompleted
                          ? 'bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {isTimerRunning
                          ? `Timing in Progress... ${timerCount}s remaining`
                          : timerCompleted
                          ? step.id === 2
                            ? '✓ 100% Matte & Evaporated. Ready.'
                            : '✓ 10s Dwell Complete. Zero Backflow.'
                          : step.timerLabel}
                      </span>
                    </button>
                    {isTimerRunning && (
                      <button
                        type="button"
                        onClick={handleResetTimer}
                        className="h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 shrink-0 cursor-pointer"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <strong className="text-slate-200">{step.statusText}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold text-[11px] shrink-0">VERIFIED</span>
                  </div>
                )}
              </div>

              {/* Exactly 3 Core SOP Points */}
              <div className="space-y-2.5">
                {step.keyPoints.map((point) => (
                  <div
                    key={point.num}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-mono font-bold text-[10px] mt-0.5">
                      {point.num}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-slate-200 font-semibold block mb-0.5">
                        {point.title}
                      </strong>
                      <span className="text-slate-400 leading-relaxed block text-[11px]">
                        {point.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Symmetrical DO / DON'T Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>DO (Clinical Best Practice)</span>
                  </div>
                  <p className={`text-slate-300 text-[11px] leading-relaxed ${isMobile ? '' : 'line-clamp-2'}`}>
                    {step.doRule}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>DON'T (Strict Prohibition)</span>
                  </div>
                  <p className={`text-slate-300 text-[11px] leading-relaxed ${isMobile ? '' : 'line-clamp-2'}`}>
                    {step.dontRule}
                  </p>
                </div>
              </div>

              {/* Symmetrical Anxiety Breaker */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs min-w-0">
                  <span className="font-semibold text-amber-300 block mb-0.5">
                    Clinical Insight: "{step.anxietyQ}"
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {step.anxietyA}
                  </p>
                </div>
              </div>

              {/* Bottom Navigation & Authority Citation */}
              {isMobile ? (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    <span>Authority: </span>
                    <strong className="text-slate-300 font-medium">{step.citation}</strong>
                  </div>

                  {step.id < 4 ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMobileStageToggle(step.id)}
                        className="py-3.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Collapse this stage"
                      >
                        <ChevronUp className="w-4 h-4 text-emerald-400" />
                        <span>Collapse</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMobileNextStage(step.id + 1)}
                        className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>Next Stage: Stage 0{step.id + 1}</span>
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMobileStageToggle(step.id)}
                        className="py-3 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Collapse this stage"
                      >
                        <ChevronUp className="w-4 h-4 text-emerald-400" />
                        <span>Collapse</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMobileNextStage(1)}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>✓ Done · Review Stage 01</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs mt-auto">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    <span>Authority: </span>
                    <strong className="text-slate-300 font-medium truncate">{step.citation}</strong>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : 4))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={() => setActiveStep((prev) => (prev < 4 ? prev + 1 : 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );

          return (
            <div>
              {/* ============================================================ */}
              {/* DESKTOP VIEW (≥1024px): 4 CARDS LEFT + DETAIL PANEL RIGHT    */}
              {/* Strictly unchanged visually & functionally                   */}
              {/* ============================================================ */}
              <div className="hidden lg:block bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-12 gap-7 items-stretch">
                  
                  {/* LEFT COLUMN: 4 Full-Width High-Definition 16:9 Photos Stacked (5 cols, Equal Height to Right) */}
                  <div className="col-span-5 flex flex-col h-full min-h-[580px]">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1 mb-2 shrink-0">
                      <span>Select Macro View</span>
                      <span className="text-emerald-400 font-bold">Stage 0{activeStep} of 04</span>
                    </div>

                    {/* 4 Cards evenly stretch to fill 100% height, bottom perfectly flush with right card */}
                    <div className="flex-1 grid grid-rows-4 gap-3 min-h-0">
                      {STEPS.map((step) => {
                        const isActive = activeStep === step.id;

                        return (
                          <button
                            key={step.id}
                            onClick={() => setActiveStep(step.id)}
                            className={`w-full h-full text-left rounded-2xl overflow-hidden transition-all duration-200 relative group border flex flex-col ${
                              isActive
                                ? 'bg-slate-950 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/40 opacity-100'
                                : 'bg-slate-950/60 hover:bg-slate-950/90 border-slate-800 hover:border-slate-700 opacity-65 hover:opacity-100'
                            }`}
                          >
                            {/* Active Gradient Side Indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-cyan-400 z-10" />
                            )}

                            {/* Photo Container stretching to fill 100% of cell */}
                            <div className="relative w-full h-full overflow-hidden bg-slate-950">
                              <img
                                src={step.imageSrc}
                                alt={step.imageAlt}
                                className={`w-full h-full object-cover transition-transform duration-300 ${
                                  isActive ? 'scale-105' : 'group-hover:scale-105'
                                }`}
                                loading="lazy"
                              />
                              
                              {/* Step Glass Badge (Top Left) */}
                              <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-slate-950/90 text-emerald-400 border-emerald-500/50'
                                  : 'bg-slate-950/80 text-slate-300 border-slate-700/60'
                              }`}>
                                <span>STAGE {step.stepNumber}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                              </div>

                              {/* Title Overlay Banner (Bottom) */}
                              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between">
                                <span className={`text-xs sm:text-sm font-bold truncate ${
                                  isActive ? 'text-slate-100' : 'text-slate-300'
                                }`}>
                                  {step.shortTitle}
                                </span>
                                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                                  isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'
                                }`} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Symmetrical, High-Precision Clinical Guidance (7 cols) */}
                  <div className="col-span-7 flex flex-col justify-between h-full min-h-[680px] bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-inner">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 flex flex-col justify-between h-full"
                      >
                        {renderDetailContent(currentStep, false)}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* ============================================================ */}
              {/* MOBILE VIEW (<1024px): STREAMLINED CLINICAL ACCORDION        */}
              {/* Direct thumbnail + expandable content in unified stage cards */}
              {/* ============================================================ */}
              <div className="block lg:hidden space-y-4">
                {STEPS.map((step) => {
                  const isExpanded = mobileExpandedStep === step.id;

                  return (
                    <div
                      key={step.id}
                      id={`mobile-stage-${step.id}`}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden scroll-mt-24 ${
                        isExpanded
                          ? 'bg-slate-900/95 border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-400/30'
                          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80'
                      }`}
                    >
                      {/* Stage Header / Accordion Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleMobileStageToggle(step.id)}
                        className="w-full text-left cursor-pointer focus:outline-none group block relative"
                        aria-expanded={isExpanded}
                      >
                        {/* High-Definition 16:9 Image */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                          <img
                            src={step.imageSrc}
                            alt={step.imageAlt}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              isExpanded ? 'scale-105' : 'group-hover:scale-105'
                            }`}
                            loading="lazy"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                          {/* Stage Badge (Top Left) */}
                          <div
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
                              isExpanded
                                ? 'bg-slate-950/90 text-emerald-400 border-emerald-500/50'
                                : 'bg-slate-950/80 text-slate-300 border-slate-700/60'
                            }`}
                          >
                            <span>STAGE {step.stepNumber}</span>
                            {isExpanded && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          </div>

                          {/* Tap Status Indicator (Top Right) */}
                          <div
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border flex items-center gap-1.5 transition-colors ${
                              isExpanded
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : 'bg-slate-950/70 text-slate-300 border-slate-700/60'
                            }`}
                          >
                            <span>{isExpanded ? 'Collapse' : 'Tap to View'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>

                          {/* Bottom Title Bar */}
                          <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">
                                {step.badge}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate mt-0.5">
                                {step.shortTitle}
                              </h4>
                            </div>
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform ${
                                isExpanded
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 rotate-180'
                                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
                              }`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Accordion Body: Full Detail View */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key={`mobile-content-${step.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 space-y-4">
                              {renderDetailContent(step, true)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}

      {/* Safety Disclaimer Permanent Footer */}
      <div className="mt-8 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-semibold">Medical &amp; Harm-Reduction Education Disclaimer:</strong>
          <p className="mt-0.5">
            This visual guide is designed strictly for educational and clinical harm reduction reference. PepPlotter does not provide medical prescriptions. Self-administration of subcutaneous peptides without professional clinical supervision carries risks of tissue injury and systemic adverse events. Always consult a licensed endocrinologist or certified healthcare practitioner before commencing any regimen.
          </p>
        </div>
      </div>
    </section>
  );
}
