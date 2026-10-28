'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SyringeVisualizer } from '@/components/SyringeVisualizer';
import { HalfLifeChart } from '@/components/HalfLifeChart';
import { FAQSection } from '@/components/FAQSection';
import { AffiliateSupplies } from '@/components/AffiliateSupplies';
import { Tooltip } from '@/components/Tooltip';
import { GuidedTour, TOUR_STEPS } from '@/components/GuidedTour';
import { ProtocolReportModal } from '@/components/ProtocolReportModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { CustomProtocolModal } from '@/components/CustomProtocolModal';
import { PrintableProtocolSheet } from '@/components/PrintableProtocolSheet';
import { HarmReductionManifesto } from '@/components/HarmReductionManifesto';
import { ComparisonTable } from '@/components/ComparisonTable';
import { SeoGuide } from '@/components/SeoGuide';
import { SubQVisualGuide } from '@/components/SubQVisualGuide';
import { ReconstitutionMatrix } from '@/components/ReconstitutionMatrix';
import { FAQS } from '@/lib/faqs';
import { COMPOUND_PRESETS, calculateReconstitution, calculatePharmacokinetics, safeCopyToClipboard, getRecommendedWaterMl } from '@/lib/calculator';
import { BLOCK_MESSAGES } from '@/lib/messages';
import { CompoundPreset, SyringeType, InjectionEntry } from '@/lib/types';
import { 
  Calculator, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck,
  AlertTriangle,
  Split, 
  CalendarDays,
  Pill,
  Share2,
  Check,
  Compass,
  ArrowRight,
  Calendar,
  FileText,
  HeartPulse,
  MessageSquare,
  Printer,
  Info,
  Mail
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calc' | 'plotter' | 'guide'>('calc');

  // URL Hash & Query Tab Synchronizer
  const handleTabChange = (tab: 'calc' | 'plotter' | 'guide') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const hash = tab === 'calc' ? '#calculator' : tab === 'plotter' ? '#simulator' : '#guide';
      window.history.replaceState(null, '', hash);
    }
  };

  // --- REPORT & FEEDBACK MODAL STATE ---
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isSheetPreviewOpen, setIsSheetPreviewOpen] = useState<boolean>(false);
  const [isCustomProtocolModalOpen, setIsCustomProtocolModalOpen] = useState<boolean>(false);

  // --- GUIDED TOUR STATE ---
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number>(0);

  // --- RECONSTITUTION STATE ---
  const [selectedPresetId, setSelectedPresetId] = useState<string>('semaglutide');
  const [vialMg, setVialMg] = useState<number | ''>(5);
  const [waterMl, setWaterMl] = useState<number | ''>(2.0);
  const [targetDoseMcg, setTargetDoseMcg] = useState<number | ''>(250); // in mcg
  const [syringeType, setSyringeType] = useState<SyringeType>('U100');
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safe numeric derivatives for calculations & UI
  const safeVialMg = typeof vialMg === 'number' ? vialMg : 0;
  const safeWaterMl = typeof waterMl === 'number' ? waterMl : 0;
  const safeTargetDoseMcg = typeof targetDoseMcg === 'number' ? targetDoseMcg : 0;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Deep-Link & URL Query Parameter Auto-Restoration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      // Hash restoration (#calculator, #simulator, #plotter, #guide)
      const hash = window.location.hash.toLowerCase();
      if (hash === '#calculator' || hash === '#calc') {
        setActiveTab('calc');
      } else if (hash === '#simulator' || hash === '#plotter') {
        setActiveTab('plotter');
      } else if (hash === '#guide' || hash === '#subq-guide' || hash === '#subq') {
        setActiveTab('guide');
      }

      const params = new URLSearchParams(window.location.search);
      const presetParam = params.get('preset');
      const vialParam = params.get('vial');
      const waterParam = params.get('water');
      const doseParam = params.get('dose');
      const syringeParam = params.get('syringe');
      const tabParam = params.get('tab');

      let initialDose = 250;
      let initialPresetId = 'semaglutide';

      if (presetParam) {
        const found = COMPOUND_PRESETS.find(
          (p) => p.id.toLowerCase() === presetParam.toLowerCase()
        );
        if (found) {
          initialPresetId = found.id;
          setSelectedPresetId(found.id);
          setPlotCompoundId(found.id);
          if (found.id !== 'custom') {
            setCustomHalfLifeDays(found.halfLifeHours / 24);
          }
          initialDose = found.defaultDoseMcg;
        }
      }

      if (vialParam) {
        const v = parseFloat(vialParam);
        if (!isNaN(v) && v > 0 && v <= 100) setVialMg(v);
      }

      if (waterParam) {
        const w = parseFloat(waterParam);
        if (!isNaN(w) && w > 0 && w <= 20) setWaterMl(w);
      }

      if (doseParam) {
        const d = parseFloat(doseParam);
        if (!isNaN(d) && d > 0 && d <= 50000) {
          setTargetDoseMcg(d);
          initialDose = d;
        }
      }

      if (doseParam || presetParam) {
        const doseMg = Number((initialDose / 1000).toFixed(3));
        const presetObj = COMPOUND_PRESETS.find((p) => p.id === initialPresetId) || COMPOUND_PRESETS[0];
        const freq = presetObj.standardFrequencyDays || 7;
        setInjections([
          { id: crypto.randomUUID(), compoundId: initialPresetId, day: 0, doseMg },
          { id: crypto.randomUUID(), compoundId: initialPresetId, day: freq, doseMg },
          { id: crypto.randomUUID(), compoundId: initialPresetId, day: freq * 2, doseMg },
          { id: crypto.randomUUID(), compoundId: initialPresetId, day: freq * 3, doseMg },
        ]);
      }

      if (syringeParam) {
        const upper = syringeParam.toUpperCase();
        if (upper === 'U100' || upper === 'U40') {
          setSyringeType(upper as SyringeType);
        }
      }

      if (tabParam) {
        const lower = tabParam.toLowerCase();
        if (lower === 'calc' || lower === 'calculator') {
          setActiveTab('calc');
        } else if (lower === 'plotter' || lower === 'simulator') {
          setActiveTab('plotter');
        } else if (lower === 'guide' || lower === 'subq') {
          setActiveTab('guide');
        }
      }
    } catch {
      // Graceful fallback for non-browser environments
    }
  }, []);

  // --- PHARMACOKINETICS (PLOTTER) STATE ---
  const [plotCompoundId, setPlotCompoundId] = useState<string>('semaglutide');
  const [customHalfLifeDays, setCustomHalfLifeDays] = useState<number>(7);
  const [simulationDays, setSimulationDays] = useState<number>(28);
  const [isSplitDoseMode, setIsSplitDoseMode] = useState<boolean>(false);

  // Default 4-week injection schedule (4 weekly doses across 28-day cycle: Day 0, Day 7, Day 14, Day 21)
  const [injections, setInjections] = useState<InjectionEntry[]>([
    { id: '1', compoundId: 'semaglutide', day: 0, doseMg: 0.25 },
    { id: '2', compoundId: 'semaglutide', day: 7, doseMg: 0.25 },
    { id: '3', compoundId: 'semaglutide', day: 14, doseMg: 0.25 },
    { id: '4', compoundId: 'semaglutide', day: 21, doseMg: 0.25 },
  ]);

  // Current active preset object
  const activePreset = useMemo(() => {
    return COMPOUND_PRESETS.find((p) => p.id === selectedPresetId) || COMPOUND_PRESETS[0];
  }, [selectedPresetId]);

  // Current plot compound object
  const plotPreset = useMemo(() => {
    return COMPOUND_PRESETS.find((p) => p.id === plotCompoundId) || COMPOUND_PRESETS[0];
  }, [plotCompoundId]);

  // Handle preset selection with automatic schedule synchronization
  const applyPreset = (preset: CompoundPreset) => {
    setSelectedPresetId(preset.id);
    setVialMg(preset.defaultVialMg);
    setWaterMl(preset.defaultWaterMl);
    setTargetDoseMcg(preset.defaultDoseMcg);

    // Sync plotter compound
    setPlotCompoundId(preset.id);
    if (preset.id === 'custom') {
      setCustomHalfLifeDays(3);
    } else {
      setCustomHalfLifeDays(preset.halfLifeHours / 24);
    }

    // Set clinically optimized timeline span based on compound pharmacokinetics
    const targetSpan = preset.id === 'bpc157' || preset.id === 'ipamorelin' ? 7 : 28;
    setSimulationDays(targetSpan);

    // Automatically synchronize Tab 2 injection schedule across the full timeline span
    const defaultDoseMg = Number((preset.defaultDoseMcg / 1000).toFixed(3));
    const freq = preset.standardFrequencyDays || 7;
    const generatedInjections: InjectionEntry[] = [];
    for (let day = 0; day < targetSpan; day = Number((day + freq).toFixed(1))) {
      generatedInjections.push({
        id: crypto.randomUUID(),
        compoundId: preset.id,
        day,
        doseMg: defaultDoseMg,
      });
    }
    setInjections(generatedInjections);
    setIsSplitDoseMode(false);
  };

  // Automatically synchronize Tab 1 target dose into Tab 2 injection schedule in real-time
  // Only trigger when targetDoseMcg is explicitly modified in Tab 1, preserving custom ladder doses on split-toggle
  useEffect(() => {
    if (safeTargetDoseMcg > 0) {
      const calculatedDoseMg = isSplitDoseMode
        ? Number((safeTargetDoseMcg / 2000).toFixed(3))
        : Number((safeTargetDoseMcg / 1000).toFixed(3));

      setInjections((prev) =>
        prev.map((inj) => ({
          ...inj,
          doseMg: calculatedDoseMg,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTargetDoseMcg]);

  // Manual one-click synchronization from current calculator dose across full simulation schedule
  const syncCurrentDoseToSchedule = () => {
    const currentDoseMg = Number(
      ((safeTargetDoseMcg || activePreset.defaultDoseMcg) / (isSplitDoseMode ? 2000 : 1000)).toFixed(3)
    );
    const baseFreq = activePreset.standardFrequencyDays || 7;
    const freq = isSplitDoseMode ? baseFreq / 2 : baseFreq;
    const synced: InjectionEntry[] = [];
    for (let day = 0; day < simulationDays; day = Number((day + freq).toFixed(1))) {
      synced.push({
        id: crypto.randomUUID(),
        compoundId: plotCompoundId,
        day,
        doseMg: currentDoseMg,
      });
    }
    setInjections(synced);
  };

  // Reconstitution calculation result using safe numeric values
  const reconResult = useMemo(() => {
    return calculateReconstitution(safeVialMg, safeWaterMl, safeTargetDoseMcg, syringeType);
  }, [safeVialMg, safeWaterMl, safeTargetDoseMcg, syringeType]);

  // Pharmacokinetics calculation result
  const halfLifeHours = plotCompoundId === 'custom' ? customHalfLifeDays * 24 : plotPreset.halfLifeHours;

  // --- 安全状态派生：所有对外输出（KPI/文案/报告/分享）都必须先过这道闸 ---
  const isBlocked = reconResult.error !== null;
  const isOverflow = !isBlocked && reconResult.overCapacity;
  const canShowDoseInstruction = !isBlocked;

  // --- 临床舒适度评估：皮下注射推荐单次容量 0.1 - 0.5 mL，抽取 >= 0.8 mL 或满筒属于临床非推荐高容量 ---
  const isHighVolumeSubQ =
    !isBlocked &&
    !isOverflow &&
    (reconResult.drawVolumeMl >= 0.8 || reconResult.syringeUnits >= reconResult.syringeCapacity);

  // 针对当前药粉与目标剂量动态计算的黄金稀释水量（以 0.5 mL 舒适体积为基准）
  const optimalWater = useMemo(() => {
    return getRecommendedWaterMl(safeVialMg, safeTargetDoseMcg);
  }, [safeVialMg, safeTargetDoseMcg]);

  // 针对药瓶规格的基础推荐水量
  const recommendedWaterByVial = useMemo(() => {
    return getRecommendedWaterMl(safeVialMg);
  }, [safeVialMg]);

  const pkResult = useMemo(() => {
    // Dynamic adaptive sampling:
    // Ultra-short half-life compounds (Ipamorelin ~2h, BPC-157 ~4h) use 0.25h (15-min) step size
    // to render smooth, continuous physiological pulses rather than coarse polygonal triangles.
    const adaptiveStepHours =
      halfLifeHours <= 4 ? 0.25 : halfLifeHours <= 12 ? 0.5 : halfLifeHours <= 24 ? 1 : 2;

    return calculatePharmacokinetics(injections, halfLifeHours, simulationDays, adaptiveStepHours);
  }, [injections, halfLifeHours, simulationDays]);

  // Tour controls
  const startTour = () => {
    handleTabChange('calc');
    setTourStepIndex(0);
    setIsTourActive(true);
  };

  // 引导步骤切换时，把当前高亮目标滚动进视口并同步 Tab 状态
  useEffect(() => {
    if (!isTourActive) return;
    const target = TOUR_STEPS[tourStepIndex];
    if (tourStepIndex >= 4 && tourStepIndex <= 5) {
      handleTabChange('plotter');
    } else if (tourStepIndex >= 6 && tourStepIndex <= 9) {
      handleTabChange('guide');
    } else {
      handleTabChange('calc');
    }
    if (target) {
      setTimeout(() => {
        document.getElementById(target.targetId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 70);
    }
  }, [isTourActive, tourStepIndex]);

  const handleTourNext = () => {
    if (tourStepIndex < TOUR_STEPS.length - 1) {
      setTourStepIndex(tourStepIndex + 1);
    } else {
      setIsTourActive(false);
    }
  };

  const handleTourPrev = () => {
    if (tourStepIndex > 0) {
      setTourStepIndex(tourStepIndex - 1);
    }
  };

  // Add an injection to schedule
  const addInjection = () => {
    const freq = activePreset.standardFrequencyDays || 7;
    const lastDay = injections.length > 0 ? injections[injections.length - 1].day : 0;
    const nextDay = injections.length > 0 ? Number((lastDay + freq).toFixed(1)) : 0;
    const defaultDose = injections.length > 0 ? injections[injections.length - 1].doseMg : 0.25;
    const newEntry: InjectionEntry = {
      id: crypto.randomUUID(),
      compoundId: plotCompoundId,
      day: nextDay,
      doseMg: defaultDose,
    };
    if (nextDay > simulationDays) {
      if (nextDay <= 14) setSimulationDays(14);
      else if (nextDay <= 28) setSimulationDays(28);
      else if (nextDay <= 42) setSimulationDays(42);
      else if (nextDay <= 60) setSimulationDays(60);
      else if (nextDay <= 90) setSimulationDays(90);
      else if (nextDay <= 120) setSimulationDays(120);
      else setSimulationDays(Math.ceil((nextDay + freq) / 7) * 7);
    }
    setInjections([...injections, newEntry]);
  };

  // Remove an injection from schedule
  const removeInjection = (id: string) => {
    setInjections(injections.filter((inj) => inj.id !== id));
  };

  // Update an injection
  // doseMg 下限 0.01mg：避免 0 / 负剂量静默进入 PK 曲线，用户会误以为"打了没效果"
  const updateInjection = (id: string, field: 'day' | 'doseMg', val: number) => {
    const safeVal =
      field === 'day'
        ? Math.min(3650, Math.max(0, val))
        : Math.min(100, Math.max(0.01, val));
    setInjections(
      injections.map((inj) => (inj.id === id ? { ...inj, [field]: safeVal } : inj))
    );
  };

  // Split-Dose Auto Generator (divides weekly doses into every 3.5 days)
  const toggleSplitDosing = () => {
    if (!isSplitDoseMode) {
const splitList: InjectionEntry[] = [];
      injections.forEach((inj) => {
        splitList.push({
      id: crypto.randomUUID(),
          compoundId: inj.compoundId,
          day: inj.day,
      doseMg: Number((inj.doseMg / 2).toFixed(3)),
        });
        splitList.push({
       id: crypto.randomUUID(),
          compoundId: inj.compoundId,
 day: Number((inj.day + 3.5).toFixed(1)),
          doseMg: Number((inj.doseMg / 2).toFixed(3)),
   });
      });
    setInjections(splitList);
      setIsSplitDoseMode(true);
    } else {
      // 关闭分割时合并相邻的半剂量对，保留用户已修改的日/剂量，不再硬重置为 4×0.25mg
      const merged: InjectionEntry[] = [];
      injections.forEach((inj, i) => {
        const prev = i > 0 ? injections[i - 1] : null;
     const isSecondHalf = prev !== null && Math.abs(inj.day - prev.day - 3.5) < 0.01;
        if (isSecondHalf && prev) {
        const last = merged[merged.length - 1];
      if (last) {
         last.day = prev.day;
            last.doseMg = Number((prev.doseMg + inj.doseMg).toFixed(3));
          }
      } else {
        merged.push({ ...inj, id: crypto.randomUUID() });
        }
    });
      setInjections(merged);
    setIsSplitDoseMode(false);
    }
  };

  // Copy clean, permanent interactive deep link
  const copyShareUrl = () => {
    const shareUrl = `https://pepplotter.com/?preset=${selectedPresetId}&vial=${safeVialMg}&water=${safeWaterMl}&dose=${safeTargetDoseMcg}&syringe=${syringeType}${activeTab === 'plotter' ? '&tab=plotter' : activeTab === 'guide' ? '&tab=guide' : ''}`;

    safeCopyToClipboard(shareUrl).then((ok) => {
      if (!ok) return;
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center overflow-x-hidden w-full max-w-[100vw]">
      {/* Clinical JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'PepPlotter - Peptide Reconstitution Calculator & Visualizer',
            url: 'https://pepplotter.com',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'All',
            description:
              'Precision peptide reconstitution calculator, interactive syringe volume visualizer, and pharmacokinetic half-life simulation tool for GLP-1 compounds including Semaglutide, Tirzepatide, and Retatrutide.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Interactive U-100 and U-40 syringe visualizer',
              'Precise unit and volume calculation with overflow safeguards',
              'Pharmacokinetic multi-dose accumulation curve simulation',
              'Split-dosing auto calculation',
              'Standard reconstitution matrix reference table',
              'Standard 4-step clinical subcutaneous injection guide',
            ],
          })
            .replace(/</g, '\u003c')
            .replace(/>/g, '\u003e')
            .replace(/&/g, '\u0026'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          })
            .replace(/</g, '\u003c')
            .replace(/>/g, '\u003e')
            .replace(/&/g, '\u0026'),
        }}
      />

      {/* Glow Ambient Lights — Wrapped in overflow-hidden container to prevent mobile viewport scroll */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 max-w-[100vw] print:hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),transparent_70%)]" />
        <div className="absolute top-40 right-0 w-full max-w-[600px] h-[340px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12),transparent_70%)]" />
      </div>

      {/* Floating Guided Tour Bar (Active when tour is on) */}
      {isTourActive && (
        <GuidedTour
          currentStepIndex={tourStepIndex}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onClose={() => setIsTourActive(false)}
        />
      )}

      {/* Main Container (Strictly hidden during printing to isolate Fridge Sheet) */}
      <main className="w-full max-w-5xl px-4 sm:px-6 py-8 md:py-12 print:hidden">
        {/* Top Brand Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-8 mb-4 sm:mb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              {/* Row 1: Brand name + Badge (Scaled down to prevent truncation on mobile) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-emerald-200 to-cyan-300 bg-clip-text text-transparent shrink-0">
                  PepPlotter
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full whitespace-nowrap shrink-0">
                  <span className="inline sm:hidden">Harm Reduction v1.0</span>
                  <span className="hidden sm:inline">Harm Reduction &amp; Simulation v1.0</span>
                </span>
              </div>
              {/* Row 2: Subtitle (Fully legible without ellipsis) */}
              <p className="text-[10.5px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
                <span className="inline sm:hidden">Peptide Reconstitution &amp; PK Half-Life Simulator</span>
                <span className="hidden sm:inline">Precision Peptide Reconstitution &amp; Pharmacokinetic Accumulation Simulator</span>
              </p>
            </div>
          </div>

          {/* Quick Actions (100% Single-Row Elastic Toolbar: 4 equal 25% columns, zero truncation) */}
          <div className="w-full sm:w-auto grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2">
            <button
              onClick={startTour}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] sm:text-xs font-semibold transition-all shadow-sm shadow-emerald-500/10 cursor-pointer min-w-0"
              title="Interactive Guided Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">How to Use (Tour)</span>
                <span className="sm:hidden">Tour</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] sm:text-xs font-semibold transition-all shadow-sm shadow-emerald-500/10 cursor-pointer min-w-0"
              title="Sync Administration Protocol to Google/Apple Calendar or Print Fridge Sheet"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">Reminders &amp; Protocol</span>
                <span className="sm:hidden">Remind</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-lg text-[10px] sm:text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer min-w-0"
              title="Request Custom Peptide or Feedback"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">Request Peptide</span>
                <span className="sm:hidden">Feedback</span>
              </span>
            </button>

            <button
              type="button"
              onClick={copyShareUrl}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] sm:text-xs text-slate-300 font-semibold transition-colors cursor-pointer min-w-0"
              title="Copy shareable link with current dosage parameters"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Copy Link'}</span>
                <span className="sm:hidden">{copied ? 'Copied' : 'Share'}</span>
              </span>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50 max-w-3xl mx-auto leading-tight">
            Precision Peptide Reconstitution Calculator &amp; <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Syringe Visualizer</span>
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base font-semibold text-emerald-300/95 italic tracking-wide">
            &ldquo;Health by Effort. Guidance by Professionals. Precision Math When You Must.&rdquo;
          </p>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate dangerous dilution and drawing errors for Semaglutide, Tirzepatide, Retatrutide &amp; research peptides. Real-time SVG syringe draw markers, pharmacokinetic half-life simulation, and clinical harm reduction guidance.
          </p>

          {/* Beginner Friendly Callout Pill */}
          <div className="mt-3 sm:mt-4 flex justify-center">
            <button
              onClick={startTour}
              className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-full text-xs text-slate-300 transition-all shadow-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>First time mixing? <strong>Follow our Interactive Guided Walkthrough</strong></span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Fast Compound Preset Pills (All 8 Clinical Compounds 100% Symmetrical: 4 rows x 2 cols on Mobile, 2 rows x 4 cols on Desktop) */}
          <div className="mt-4 sm:mt-6 w-full max-w-3xl mx-auto px-1">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Fast Compound Presets (8 Clinical Protocols &amp; Custom)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {COMPOUND_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`w-full py-1.5 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all border text-center truncate cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20 font-bold'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.id === 'custom' ? 'Custom Peptide' : preset.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Tab Switcher (Dynamic Elastic Accordion: Active tab expands smoothly, Inactive tabs contract gracefully) */}
        <div id="main-tab-switcher" className="w-full max-w-2xl sm:max-w-3xl mx-auto mb-8 scroll-mt-6 px-1">
          <div
            role="tablist"
            aria-label="PepPlotter Main Tools"
            onKeyDown={(e) => {
              const tabs: Array<'calc' | 'plotter' | 'guide'> = ['calc', 'plotter', 'guide'];
              const currentIndex = tabs.indexOf(activeTab);
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextTab = tabs[(currentIndex + 1) % tabs.length];
                handleTabChange(nextTab);
                document.getElementById(`tab-btn-${nextTab}`)?.focus();
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
                handleTabChange(prevTab);
                document.getElementById(`tab-btn-${prevTab}`)?.focus();
              }
            }}
            className="w-full flex items-center p-1 sm:p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl gap-1"
          >
            {/* Tab 1: Reconstitution Calculator */}
            <button
              id="tab-btn-calc"
              role="tab"
              aria-selected={activeTab === 'calc'}
              aria-controls="tab-panel-calc"
              tabIndex={activeTab === 'calc' ? 0 : -1}
              onClick={() => handleTabChange('calc')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ease-out cursor-pointer whitespace-nowrap min-w-0 ${
                activeTab === 'calc'
                  ? 'flex-[1.5] sm:flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md px-2.5 sm:px-4'
                  : 'flex-1 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 px-1 sm:px-4'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate font-semibold">
                {activeTab === 'calc' ? (
                  <>
                    <span className="inline sm:hidden">1. Calculator</span>
                    <span className="hidden sm:inline">1. Reconstitution Calculator</span>
                  </>
                ) : (
                  <>
                    <span className="inline sm:hidden">1. Calc</span>
                    <span className="hidden sm:inline">1. Reconstitution</span>
                  </>
                )}
              </span>
            </button>

            {/* Tab 2: PK Simulator */}
            <button
              id="tab-btn-plotter"
              role="tab"
              aria-selected={activeTab === 'plotter'}
              aria-controls="tab-panel-plotter"
              tabIndex={activeTab === 'plotter' ? 0 : -1}
              onClick={() => handleTabChange('plotter')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ease-out cursor-pointer whitespace-nowrap min-w-0 ${
                activeTab === 'plotter'
                  ? 'flex-[1.5] sm:flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md px-2.5 sm:px-4'
                  : 'flex-1 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 px-1 sm:px-4'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate font-semibold">
                {activeTab === 'plotter' ? (
                  <>
                    <span className="inline sm:hidden">2. PK Simulator</span>
                    <span className="hidden sm:inline">2. Half-Life &amp; PK Simulator</span>
                  </>
                ) : (
                  <>
                    <span className="inline sm:hidden">2. PK</span>
                    <span className="hidden sm:inline">2. PK Simulator</span>
                  </>
                )}
              </span>
            </button>

            {/* Tab 3: Clinical Sub-Q Guide */}
            <button
              id="tab-btn-guide"
              role="tab"
              aria-selected={activeTab === 'guide'}
              aria-controls="tab-panel-guide"
              tabIndex={activeTab === 'guide' ? 0 : -1}
              onClick={() => handleTabChange('guide')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ease-out cursor-pointer whitespace-nowrap min-w-0 ${
                activeTab === 'guide'
                  ? 'flex-[1.5] sm:flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md px-2.5 sm:px-4'
                  : 'flex-1 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 px-1 sm:px-4'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-cyan-300" />
              <span className="truncate font-semibold">
                {activeTab === 'guide' ? (
                  <>
                    <span className="inline sm:hidden">3. Sub-Q Guide</span>
                    <span className="hidden sm:inline">3. Clinical Sub-Q Guide</span>
                  </>
                ) : (
                  <>
                    <span className="inline sm:hidden">3. Sub-Q</span>
                    <span className="hidden sm:inline">3. Sub-Q Guide</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: RECONSTITUTION & SYRINGE CALCULATOR */}
        {/* ============================================================ */}
        <div
          id="tab-panel-calc"
          role="tabpanel"
          aria-labelledby="tab-btn-calc"
          className={activeTab === 'calc' ? 'space-y-6' : 'hidden'}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Input Form Controls with Step-by-Step Numbers */}
              <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-400" />
                    Mixing Protocol Steps
                  </h2>
                  <button
                    onClick={() => applyPreset(activePreset)}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    title="Reset to default preset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                {/* Compound Info Callout */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {activePreset.name} ({activePreset.brandNames})
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1 leading-relaxed">{activePreset.description}</div>
                </div>

                {/* STEP 1: Vial Quantity (mg) */}
                <div
                  id="step-preset"
                  className={`p-3.5 rounded-xl border transition-all ${
                    isTourActive && tourStepIndex === 0
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <label className="text-slate-200 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center mr-1.5 shrink-0">
                        1
                      </span>
                      <span>Vial Powder Quantity</span>
                      <Tooltip content="The total amount of dry peptide powder inside your glass vial as printed on the label (e.g., 5mg or 10mg)." />
                    </label>
                    <span className="text-emerald-400 font-mono font-bold tabular-nums">
                      {vialMg !== '' ? `${vialMg} mg` : '—'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="100"
                      value={vialMg}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setVialMg('');
                        } else {
                          const parsed = parseFloat(val);
                          setVialMg(isNaN(parsed) ? '' : Math.min(100, Math.max(0, parsed)));
                        }
                      }}
                      onBlur={() => {
                        if (vialMg === '' || vialMg <= 0) setVialMg(activePreset.defaultVialMg);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm font-mono tabular-nums text-slate-100 outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">mg</span>
                  </div>
                  {/* Quick Pill Buttons */}
                  <div className="flex gap-1.5 mt-2">
                    {[2, 5, 10, 15].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setVialMg(val);
                          // 智能临床预设联动：当选择 2mg 药瓶时，如果当前水量为 2mL 或 3mL，自动适配推荐的 1.0mL，避免抽满筒
                          if (val <= 2 && (waterMl === 2 || waterMl === 3 || waterMl === '')) {
                            setWaterMl(1.0);
                          }
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold transition-all ${
                          vialMg === val
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {val}mg
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: Water Added (mL) */}
                <div
                  id="step-water"
                  className={`p-3.5 rounded-xl border transition-all ${
                    isTourActive && tourStepIndex === 1
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <label className="text-slate-200 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center mr-1.5 shrink-0">
                        2
                      </span>
                      <span>Bacteriostatic Water Added</span>
                      <Tooltip content="Sterile water containing 0.9% benzyl alcohol injected into the vial to reconstitute the powder into a solution." />
                    </label>
                    <span className="text-emerald-400 font-mono font-bold tabular-nums">
                      {waterMl !== '' ? `${waterMl} mL` : '—'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={waterMl}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setWaterMl('');
                        } else {
                          const parsed = parseFloat(val);
                          setWaterMl(isNaN(parsed) ? '' : Math.min(10, Math.max(0, parsed)));
                        }
                      }}
                      onBlur={() => {
                        if (waterMl === '' || waterMl <= 0) setWaterMl(activePreset.defaultWaterMl);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm font-mono tabular-nums text-slate-100 outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">mL</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {[1.0, 2.0, 3.0].map((val) => {
                      const isRec = val === recommendedWaterByVial;
                      return (
                        <button
                          key={val}
                          onClick={() => setWaterMl(val)}
                          className={`relative w-full py-1.5 text-center text-xs rounded-lg font-mono font-semibold transition-all ${
                            waterMl === val
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span>{val}mL</span>
                          {isRec && (
                            <span className="absolute -top-1.5 -right-1 text-[8px] bg-emerald-500 text-slate-950 font-sans font-extrabold px-1 py-0.2 rounded-full uppercase tracking-tight shadow-sm">
                              Rec
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <span className="text-cyan-400 font-semibold">💡 SubQ Comfort:</span>
                    <span>Target 0.1 – 0.5 mL per injection for virtually painless administration.</span>
                  </p>
                </div>

                {/* STEP 3: Desired Target Dose (mcg) */}
                <div
                  id="step-dose"
                  className={`p-3.5 rounded-xl border transition-all ${
                    isTourActive && tourStepIndex === 2
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <label className="text-slate-200 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center mr-1.5 shrink-0">
                        3
                      </span>
                      <span>Target Single Dose</span>
                      <Tooltip content="Your prescribed single injection dose in micrograms (mcg). Remember: 1 mg = 1,000 mcg. E.g. 0.25 mg = 250 mcg." />
                    </label>
                    <span className="text-emerald-400 font-mono font-bold tabular-nums">
                      {targetDoseMcg !== '' ? `${targetDoseMcg} mcg (${(Number(targetDoseMcg) / 1000).toFixed(2)} mg)` : '—'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="25"
                      min="1"
                      max="50000"
                      value={targetDoseMcg}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setTargetDoseMcg('');
                        } else {
                          const parsed = parseFloat(val);
                          setTargetDoseMcg(isNaN(parsed) ? '' : Math.min(50000, Math.max(0, parsed)));
                        }
                      }}
                      onBlur={() => {
                        if (targetDoseMcg === '' || targetDoseMcg <= 0) setTargetDoseMcg(activePreset.defaultDoseMcg);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm font-mono tabular-nums text-slate-100 outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">mcg</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {[
                      { val: 100, label: '100mcg' },
                      { val: 250, label: '250mcg' },
                      { val: 500, label: '500mcg' },
                      { val: 1000, label: '1mg' },
                      { val: 2500, label: '2.5mg' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setTargetDoseMcg(item.val)}
                        className={`w-full py-1 text-center text-xs rounded-lg font-mono font-semibold transition-all truncate ${
                          targetDoseMcg === item.val
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 4: Syringe Type Selector */}
                <div>
                  <div className="flex items-center text-xs font-medium text-slate-300 mb-1.5">
                    <span>Syringe Calibration</span>
                    <Tooltip content="Standard insulin syringes are U-100 (100 units = 1.0 mL). U-40 is typically used in specialized or veterinary applications." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSyringeType('U100')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all ${
                        syringeType === 'U100'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>U-100 (Standard)</span>
                      <span className="text-[10px] text-slate-400 font-normal">100 Units = 1.0 mL</span>
                    </button>

                    <button
                      onClick={() => setSyringeType('U40')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all ${
                        syringeType === 'U40'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>U-40 (Vet / Special)</span>
                      <span className="text-[10px] text-slate-400 font-normal">40 Units = 1.0 mL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Display & Syringe */}
              <div
                id="step-syringe"
                className={`lg:col-span-7 space-y-6 transition-all ${
                  isTourActive && tourStepIndex === 3
                    ? 'ring-2 ring-emerald-500/60 rounded-2xl p-2 bg-emerald-950/10'
                    : ''
                }`}
              >
{/* SAFETY BANNER: Blocked / Over Capacity */}
                {(isBlocked || isOverflow) && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                      isBlocked
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/30'
                        : 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30'
                    }`}
                  >
                    <ShieldAlert
                      className={`w-5 h-5 shrink-0 mt-0.5 ${isBlocked ? 'text-rose-400' : 'text-amber-400'}`}
                    />
                    <div className="text-xs leading-relaxed">
                      <div
                        className={`font-bold mb-1 ${isBlocked ? 'text-rose-300' : 'text-amber-300 text-sm flex items-center gap-1.5'}`}
                      >
                        {isBlocked ? (
                          'Calculation blocked — no dosing instruction available'
                        ) : (
                          <>
                            <span>⚠️ Syringe Capacity Overflow Warning</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                              Exceeds {reconResult.syringeCapacity} Units
                            </span>
                          </>
                        )}
                      </div>
                      {isBlocked && <p className="text-rose-200/90">{BLOCK_MESSAGES[reconResult.error!]}</p>}
                      {isOverflow && (
                        <p className="text-amber-200/90 leading-relaxed">
                          Your calculated dose requires <strong className="text-amber-200 font-mono">{reconResult.syringeUnits} Units ({reconResult.drawVolumeMl} mL)</strong>, which exceeds the single-syringe maximum capacity of a {syringeType} syringe ({reconResult.syringeCapacity} Units / 1.0 mL). <strong>Action required:</strong> Please divide the dose across <strong className="text-amber-300 underline font-semibold">{reconResult.syringesRequired} separate syringes</strong>, or reduce the amount of added BAC water to achieve a higher concentration.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* CLINICAL COMFORT ALERT: High Subcutaneous Volume (Not Recommended) */}
                {isHighVolumeSubQ && (
                  <div className="p-4 rounded-xl border bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/30 flex items-start gap-3 transition-all">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed w-full">
                      <div className="font-bold text-amber-300 text-sm flex items-center justify-between gap-2 mb-1">
                        <span className="flex items-center gap-1.5">
                          ⚠️ Clinical Practice Alert: High Injection Volume
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                          {reconResult.drawVolumeMl >= 1 ? '100% Full Syringe' : `${reconResult.syringeUnits} ${syringeType} Units`}
                        </span>
                      </div>
                      <p className="text-amber-200/90 leading-relaxed">
                        Drawing <strong className="text-amber-100 font-mono">{reconResult.syringeUnits} Units ({reconResult.drawVolumeMl} mL)</strong> fills the syringe to {reconResult.drawVolumeMl >= 1 ? 'maximum capacity' : 'near maximum'}. In clinical subcutaneous administration, drawing a completely full barrel leaves <strong>zero headspace for purging micro air bubbles</strong> and frequently causes <strong>painful skin distension, localized burning, or subcutaneous nodules</strong>.
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-amber-200/90 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>
                            Clinical Sweet Spot: Reconstitute with <strong className="text-amber-100 font-mono font-bold">{optimalWater} mL</strong> BAC water instead.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWaterMl(optimalWater)}
                          className="px-3 py-1 bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 hover:text-white border border-amber-500/50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Apply Recommended {optimalWater} mL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result KPI Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl text-center">
     <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Draw Target</span>
         <div
    className={`text-2xl font-extrabold font-mono mt-1 ${
     isBlocked ? 'text-rose-400' : isOverflow ? 'text-amber-400' : 'text-emerald-400'
       }`}
        >
        {canShowDoseInstruction ? reconResult.syringeUnits : '—'}
         </div>
         <span className="text-xs text-slate-400 font-medium">{syringeType} Units</span>
   </div>

      <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl text-center">
         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Draw Volume</span>
        <div className="text-2xl font-extrabold text-slate-100 font-mono mt-1">
       {canShowDoseInstruction ? reconResult.drawVolumeMl : '—'}
        </div>
           <span className="text-xs text-slate-400 font-medium">mL</span>
      </div>

 <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl text-center">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Concentration</span>
         <div className="text-2xl font-extrabold text-slate-100 font-mono mt-1">
          {canShowDoseInstruction ? reconResult.concentrationMgMl : '—'}
    </div>
           <span className="text-xs text-slate-400 font-medium">mg / mL</span>
    </div>

      <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl text-center">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Doses</span>
        <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
   {canShowDoseInstruction ? reconResult.totalVialDoses : '—'}
         </div>
     <span className="text-xs text-slate-400 font-medium">in this vial</span>
         </div>
       </div>

                {/* Live SVG Syringe Visualizer */}
                <SyringeVisualizer
                  units={reconResult.syringeUnits}
                  drawVolumeMl={reconResult.drawVolumeMl}
                  syringeType={syringeType}
                />

                {/* Reconstitution Math Intuition Tip */}
                {canShowDoseInstruction && (
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-[11px] text-slate-300 flex items-start gap-2.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-cyan-200">Reconstitution Math Rule:</span>{' '}
                      Lower powder in the same water volume produces a <em>more dilute</em> solution ({reconResult.concentrationMgMl} mg/mL), requiring a <em>larger liquid draw</em> ({reconResult.syringeUnits} units) to deliver your exact active dose of <strong>{safeTargetDoseMcg} mcg</strong>. Conversely, higher powder quantity concentrates the solution, requiring fewer syringe units.
                    </div>
                  </div>
                )}

{/* Plain-English Dosage Recipe Card */}
      <div 
        id="step-recipe"
        className={`p-4 bg-slate-900/40 border rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-3 transition-all scroll-mt-24 ${
          isTourActive && tourStepIndex === 10
            ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/20'
            : 'border-slate-800'
        }`}
      >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold ${
   isBlocked || isOverflow
     ? 'bg-rose-500/20 text-rose-400'
        : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
          {isBlocked || isOverflow ? '!' : '✓'}
        </div>
   <div>
            <strong className="text-slate-100 font-semibold">
    {isBlocked
      ? 'Calculation Blocked:'
       : isOverflow
    ? 'Adjusted Reconstitution Guidance:'
      : 'Your Exact Reconstitution Recipe:'}
         </strong>
    <p className="mt-1 text-slate-400">
        {isBlocked ? (
    BLOCK_MESSAGES[reconResult.error!]
    ) : isOverflow ? (
       <>
     Do NOT draw the full {reconResult.drawVolumeMl} mL into a single {syringeType} syringe
    (max {reconResult.syringeCapacity} units). Split this dose across{' '}
        <strong className="text-amber-300">{reconResult.syringesRequired} syringes</strong>, or
       reduce the dose / increase the water volume to bring it under capacity. Consult a licensed
  professional before proceeding.
       </>
   ) : (
        <>
          Gently inject <strong className="text-slate-200">{waterMl} mL</strong> of bacteriostatic
             water into your <strong className="text-slate-200">{vialMg} mg</strong> vial of{' '}
        {activePreset.name}. Allow it to dissolve completely without vigorous shaking. To inject
       your target dose of <strong className="text-slate-200">{targetDoseMcg} mcg</strong>, draw to
        the{' '}
          <strong className="text-emerald-400 font-mono font-bold">
       {reconResult.syringeUnits} unit mark
          </strong>{' '}
          ({reconResult.drawVolumeMl} mL) on your {syringeType} syringe.

          {isHighVolumeSubQ ? (
            <div className="mt-2.5 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Clinical Volume Notice:</strong> A {reconResult.drawVolumeMl} mL draw fills the syringe to the brim and may cause uncomfortable abdominal tightness. Diluting with <strong className="font-mono text-amber-100">{optimalWater} mL</strong> water instead delivers a smoother 50-unit (0.5 mL) injection.
              </span>
            </div>
          ) : (
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Comfortable SubQ Volume: Your {reconResult.drawVolumeMl} mL draw is within the optimal clinical comfort range (≤0.5 mL).</span>
            </div>
          )}

          <span className="block mt-2">
            <button
              type="button"
              onClick={() => handleTabChange('guide')}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 decoration-emerald-500/40 hover:decoration-emerald-300 transition-colors cursor-pointer"
            >
              <span>First time injecting? View Step-by-Step Sub-Q Visual Guide &rarr;</span>
            </button>
          </span>

          {/* Connected Blood Level (PK Simulator) Quick Bridge */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-300">
                Body Blood Level for <strong>{((safeTargetDoseMcg || activePreset.defaultDoseMcg) / 1000).toFixed(2)} mg</strong>:
                <span className="text-cyan-300 font-mono font-bold ml-1.5">
                  Est. Peak ~{pkResult.peakConcentration.toFixed(2)} mg / Trough ~{pkResult.troughConcentration.toFixed(2)} mg
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleTabChange('plotter')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer group"
            >
              <span>Simulate Blood Accumulation in Tab 2</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
   </>
            )}
         </p>
      </div>
  </div>

                {/* Permanent Educational Math Verification Disclaimer */}
                <div className="py-2.5 px-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                  <span>Educational &amp; laboratory math verification only. Always double-check syringe markings before administration.</span>
                </div>

                {/* 1-Click Protocol & Calendar Reminder Banner */}
                <div 
                  id="step-calendar"
                  className={`bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg transition-all scroll-mt-24 ${
                    isTourActive && tourStepIndex === 10
                      ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-500/30 bg-emerald-950/30'
                      : 'border-emerald-500/40 shadow-emerald-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>Sync Administration Protocol to Calendar</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded font-mono uppercase">Free</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Get recurring dose alerts in Google Calendar (Gmail) or Apple Calendar, plus printable fridge protocol.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsSheetPreviewOpen(true)}
                      title="Preview 1-page A4 Protocol Sheet (Screenshot & Print)"
                      className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer group"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Preview A4 Sheet</span>
                    </button>

                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Protocol &amp; Reminders</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* ============================================================ */}
        {/* TAB 2: GLP-1 & PEPTIDE HALF-LIFE PLOTTER */}
        {/* ============================================================ */}
        <div
          id="tab-panel-plotter"
          role="tabpanel"
          aria-labelledby="tab-btn-plotter"
          className={activeTab === 'plotter' ? 'space-y-6' : 'hidden'}
        >
          {/* Top Toolbar: Compound & Controls (Unified 6-cell Apple-grade Instrument Grid with Live Sync) */}
          <div 
            id="step-pk-sync"
            className={`bg-slate-900/70 border rounded-2xl p-3.5 sm:p-5 scroll-mt-24 transition-all shadow-xl backdrop-blur-md ${
              isTourActive && (tourStepIndex === 4 || tourStepIndex === 5)
                ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/20'
                : 'border-slate-800'
            }`}
          >
            {/* Sleek Live-Sync Status Bar (Zero vertical bloat, immediate visual feedback) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[11px] font-mono uppercase font-bold text-cyan-400 tracking-wider truncate">
                  Live Linked with Reconstitution
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20 font-mono shrink-0">
                  Auto-Synchronized
                </span>
              </div>
              
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] hidden xs:inline">Active Dose:</span>
                  <span className="text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    {((safeTargetDoseMcg || activePreset.defaultDoseMcg) / 1000).toFixed(2)} mg ({safeTargetDoseMcg || activePreset.defaultDoseMcg} mcg)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({reconResult.syringeUnits} units)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSheetPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-sm group"
                  title="Preview 1-page A4 sheet combining Tab 1 Reconstitution and Tab 2 PK curve"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Preview A4 Sheet</span>
                </button>
              </div>
            </div>

            {/* Symmetrical 3-cell Grid: 1 row on tablet/desktop, 3 rows on mobile */}
            <div id="step-pk-chart" className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
              
              {/* Cell 1: Select Target Compound */}
              <div className="flex flex-col justify-between">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 truncate block">
                  Select Compound
                </label>
                <div className="relative">
                  <select
                    value={plotCompoundId}
                    onChange={(e) => {
                      const found = COMPOUND_PRESETS.find((p) => p.id === e.target.value);
                      if (found) {
                        applyPreset(found);
                      }
                    }}
                    className="w-full h-10 bg-slate-950 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-2.5 outline-none focus:border-cyan-500 cursor-pointer truncate"
                  >
                    {COMPOUND_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.brandNames ? `(${p.brandNames})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cell 2: Elimination Half-Life (Editable if Custom, Verified Clinical Readout if Preset) */}
              <div className="flex flex-col justify-between">
                {plotCompoundId === 'custom' ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                        Half-Life (Days)
                      </label>
                      <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                        ~{Number((customHalfLifeDays * 24).toFixed(1))}h
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0.05"
                      max="365"
                      value={customHalfLifeDays}
                      onChange={(e) => setCustomHalfLifeDays(Math.max(0.05, parseFloat(e.target.value) || 1))}
                      className="w-full h-10 bg-slate-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold rounded-xl px-2.5 outline-none focus:border-cyan-400"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                        Verified Half-Life
                      </label>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        ✓ Clinical
                      </span>
                    </div>
                    <div className="w-full h-10 bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono font-bold rounded-xl px-2.5 flex items-center justify-between truncate">
                      <span className="text-cyan-300 font-mono truncate">
                        {halfLifeHours >= 24
                          ? `${(halfLifeHours / 24).toFixed(1)}d (${Number(halfLifeHours.toFixed(1))}h)`
                          : `${Number(halfLifeHours.toFixed(1))}h (${(halfLifeHours / 24).toFixed(2)}d)`}
                      </span>
                      <span className="text-[10px] font-sans text-slate-400 font-medium shrink-0 ml-1">
                        {plotCompoundId === 'bpc157' || plotCompoundId === 'tb500'
                          ? 'Tissue repair'
                          : plotCompoundId === 'ipamorelin'
                          ? 'GHRP / Night'
                          : plotCompoundId === 'cagrilintide'
                          ? 'Amylin Satiety'
                          : 'GLP-1/GIP'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Cell 3: Timeline Span */}
              <div className="flex flex-col justify-between">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 truncate block">
                  Timeline Span
                </label>
                <select
                  value={simulationDays}
                  onChange={(e) => setSimulationDays(parseInt(e.target.value))}
                  className="w-full h-10 bg-slate-950 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-2.5 outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  <option value={2}>48 Hours (2 Days - High-Res Pulse)</option>
                  <option value={3}>72 Hours (3 Days)</option>
                  <option value={7}>1 Week (7 Days)</option>
                  <option value={14}>2 Weeks (14 Days)</option>
                  <option value={28}>4 Weeks (28 Days)</option>
                  <option value={42}>6 Weeks (42 Days)</option>
                  <option value={60}>8 Weeks (60 Days)</option>
                  <option value={90}>12 Weeks (90 Days)</option>
                  <option value={120}>16 Weeks (120 Days)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Interactive Half-Life Accumulation Curve (Elevated for Immediate Real-Time Feedback) */}
          <HalfLifeChart
            dataPoints={pkResult.dataPoints}
            peakConcentration={pkResult.peakConcentration}
            troughConcentration={pkResult.troughConcentration}
            averageConcentration={pkResult.averageConcentration}
            compoundName={plotPreset.name}
            halfLifeHours={halfLifeHours}
          />

          {/* Injection Schedule Table & Manager (Immediately below curve for real-time visual correlation) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
              {/* Title: Concise, strictly non-truncated with 100% full text */}
              <div className="flex items-center gap-2 shrink-0">
                <CalendarDays className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider whitespace-nowrap">
                  Injection Schedule ({injections.length} Doses
                  {reconResult.totalVialDoses > 0
                    ? ` • ${(injections.length / reconResult.totalVialDoses).toFixed(1) === '1.0' ? '1 Vial' : `${(injections.length / reconResult.totalVialDoses).toFixed(1)} Vials`}`
                    : ''})
                </h3>
              </div>

              {/* Action Buttons: 4-column balanced grid on mobile, unified non-wrapping flex row on desktop */}
              <div className="grid grid-cols-4 md:flex md:items-center gap-1.5 sm:gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={syncCurrentDoseToSchedule}
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  title="Synchronize current target dose from calculator to all schedule entries"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate md:overflow-visible">
                    Sync ({((safeTargetDoseMcg || activePreset.defaultDoseMcg) / (isSplitDoseMode ? 2000 : 1000)).toFixed(2)}mg)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleSplitDosing}
                  className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                    isSplitDoseMode
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                  title="Toggle twice-weekly split-dose simulation"
                >
                  <Split className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate md:overflow-visible">
                    {isSplitDoseMode ? 'Split Active' : '2x / Week'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={addInjection}
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  title="Add custom injection entry"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate md:overflow-visible">Add Dose</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  title="Sync to Calendar & export protocol"
                >
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate md:overflow-visible">Calendar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {injections.map((inj, idx) => (
                <div
                  key={inj.id}
                  className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      #{idx + 1} • Day {inj.day}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={inj.day}
                        onChange={(e) => updateInjection(inj.id, 'day', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono rounded px-1.5 py-0.5 text-center"
                      />
                      <span className="text-xs text-slate-400">Day:</span>
                      <input
                        type="number"
                        step="0.25"
                        min="0.05"
                        value={inj.doseMg}
                        onChange={(e) => updateInjection(inj.id, 'doseMg', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded px-1.5 py-0.5 text-center"
                      />
                      <span className="text-xs text-slate-400 font-semibold">mg</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeInjection(inj.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Remove injection"
                    aria-label={`Remove injection on day ${inj.day}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Consolidated Clinical Pharmacokinetics & Protocol Guidance (Placed below interactive workspace) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Clinical Pharmacokinetics &amp; Protocol Guidance
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                {halfLifeHours <= 12 ? 'Pulsatile Kinetics' : 'Steady-State Kinetics'}
              </span>
            </div>

            {/* Dynamic Core Mechanism: Pulsatile Secretagogue vs Steady-State Accumulation */}
            {halfLifeHours <= 12 ? (
              <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-xl p-3 sm:p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-cyan-200 block">
                    Why Pulsatile Spikes Matter (Preventing Pituitary Receptor Desensitization):
                  </span>
                  <p className="text-[11.5px] text-slate-300/90 leading-snug">
                    Unlike GLP-1 agonists that require steady 24/7 blood saturation, short-acting secretagogues (such as <strong>{plotPreset.name}</strong> with a <strong>{halfLifeHours >= 24 ? `${(halfLifeHours/24).toFixed(1)}d` : `${Number(halfLifeHours.toFixed(1))}h`}</strong> half-life) are engineered for <strong>isolated, pulsatile release</strong>. Each daily dose clears rapidly within 8–12 hours, mimicking the body&apos;s natural nocturnal somatotropin pulse. This rapid clearance is essential to prevent somatotroph receptor tachyphylaxis (desensitization) and avoid prolonged insulin resistance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-xl p-3 sm:p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-cyan-200 block">
                    Steady-State Accumulation &amp; Split-Dosing Harm Reduction:
                  </span>
                  <p className="text-[11.5px] text-slate-300/90 leading-snug">
                    Steady-state plasma equilibrium is reached over <strong>4 to 5 elimination half-lives</strong> (~4 weeks for Semaglutide/Cagrilintide, ~3–4 weeks for Tirzepatide). Splitting a large weekly dose into twice-weekly (e.g. every 3.5 days) significantly lowers the post-injection Cmax peak spike and raises the green trough floor, drastically reducing gastrointestinal nausea while maintaining sustained appetite suppression.
                  </p>
                </div>
              </div>
            )}

            {/* Compound-Specific Deep Clinical Insights (for BPC-157, TB-500, Cagrilintide, Ipamorelin) */}
            {(plotCompoundId === 'bpc157' || plotCompoundId === 'tb500' || plotCompoundId === 'cagrilintide' || plotCompoundId === 'ipamorelin') && (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 sm:p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300 block mb-0.5">
                    Target Profile: {plotPreset.name} ({plotPreset.brandNames || 'Clinical Reference'})
                  </span>
                  {plotCompoundId === 'bpc157' ? (
                    <p className="text-[11.5px] text-slate-300/90 leading-snug">
                      <strong>BPC-157</strong> has an ultra-rapid circulating plasma elimination half-life (<strong>~4 hours</strong>) as systemic peptidases metabolize the pentadecapeptide. In clinical research and athletic recovery protocols, <strong>daily administration (QD)</strong> is standard to maintain steady cellular stimulation. Downstream tissue recovery (VEGFR2 angiogenesis, focal adhesion kinase activation, and granulation tissue acceleration) continues at the cellular level for 24–48 hours post-clearance.
                    </p>
                  ) : plotCompoundId === 'tb500' ? (
                    <p className="text-[11.5px] text-slate-300/90 leading-snug">
                      <strong>TB-500 (Thymosin Beta-4)</strong> exhibits a systemic plasma half-life of <strong>~24 hours (1.0 day)</strong>. While circulating blood levels peak and decline over 1–2 days, its binding to G-actin and stimulation of cell migration and anti-fibrotic remodeling in injured tissues is sustained across multi-day intervals, supporting a standard <strong>twice-weekly (every 3.5 days) loading schedule</strong>.
                    </p>
                  ) : plotCompoundId === 'cagrilintide' ? (
                    <p className="text-[11.5px] text-slate-300/90 leading-snug">
                      <strong>Cagrilintide</strong> is a long-acting acylated amylin analogue with an elimination half-life of <strong>~168 hours (7.0 days)</strong> matching Semaglutide. In next-generation dual-agonist protocols (CagriSema), it activates amylin and calcitonin receptors in the area postrema to delay gastric emptying and induce profound early satiety, complementing GLP-1/GIP mechanisms without redundant receptor competition.
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-slate-300/90 leading-snug">
                      <strong>Ipamorelin</strong> is a highly selective growth hormone secretagogue (GHRP) with a rapid circulating half-life of <strong>~2.0 hours (120 minutes)</strong>. It binds to the ghrelin receptor to trigger a clean, pulsatile spike of endogenous somatotropin from the pituitary, replicating natural deep-sleep growth hormone secretion without stimulating cortisol, ACTH, or prolactin elevation.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
              <span>Model Note:</span>
              <span>First-order Bateman pharmacokinetic model with adaptive subcutaneous absorption and elimination rate constants.</span>
            </div>
          </div>

          {/* Custom Peptide Clinical Reference Chips & Protocol Consultation Banner (Advanced / Custom Research Only) */}
          {plotCompoundId === 'custom' && (
            <div className="space-y-3 pt-1">
              {/* Clinical Half-Life Benchmarks */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Clinical Half-Life Quick Benchmarks:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click to auto-fill verified literature values
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                  {[
                    { label: '2h (0.08d)', desc: 'Ipamorelin / GHRP', days: 0.08 },
                    { label: '4h (0.17d)', desc: 'BPC-157 / MOTS-c', days: 0.17 },
                    { label: '24h (1.0d)', desc: 'TB-500 / Daily Peptides', days: 1.0 },
                    { label: '2.5d (60h)', desc: 'Mod GRF 1-29', days: 2.5 },
                    { label: '5.0d (120h)', desc: 'Tirzepatide / GIP', days: 5.0 },
                    { label: '7.0d (168h)', desc: 'Sema / Cagri / CJC', days: 7.0 },
                    { label: '14.0d (336h)', desc: 'Extended Esters', days: 14.0 },
                  ].map((chip) => {
                    const isSelected = Math.abs(customHalfLifeDays - chip.days) < 0.05;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setCustomHalfLifeDays(chip.days)}
                        className={`p-2.5 rounded-xl text-left font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                            : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                        }`}
                        title={chip.desc}
                      >
                        <div className="font-bold text-xs">{chip.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{chip.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultation & Custom Protocol Request Banner */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="font-bold text-slate-100 text-sm">
                      Researching an Unlisted Peptide or Custom Stack?
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                    Need assistance verifying the elimination half-life, titration trajectory, or reconstitution formula for a specialized compound? Submit your research parameters to our clinical pharmacokinetics support team for custom protocol calibration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomProtocolModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer text-xs group"
                >
                  <Mail className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span>Request Custom Protocol</span>
                </button>
              </div>
            </div>
          )}
          </div>

        {/* ============================================================ */}
        {/* TAB 3: CLINICAL SUB-Q VISUAL GUIDE & HARM REDUCTION */}
        {/* ============================================================ */}
        <div
          id="tab-panel-guide"
          role="tabpanel"
          aria-labelledby="tab-btn-guide"
          className={activeTab === 'guide' ? 'space-y-6' : 'hidden'}
        >
          {/* Interactive Clinical Sub-Q Visual Animation Guide & Harm Reduction Protocol */}
          <SubQVisualGuide
            syringeUnits={reconResult.syringeUnits}
            drawVolumeMl={reconResult.drawVolumeMl}
            syringeType={syringeType}
            compoundName={activePreset.name}
            activeStep={isTourActive && tourStepIndex >= 6 && tourStepIndex <= 9 ? tourStepIndex - 5 : undefined}
          />
        </div>

        {/* Reconstitution Reference Matrix Table */}
        <ReconstitutionMatrix />

        {/* Affiliate Supplies Recommendation (Directly below Matrix) */}
        <AffiliateSupplies />

        {/* Comparison & Capability Table */}
        <ComparisonTable />

        {/* In-Depth Scientific & Safety Guide (Compact Accordion) */}
        <SeoGuide />

        {/* FAQ Section */}
        <FAQSection />

        {/* Harm Reduction Trust Bar (Compact Brand Stance above Footer) */}
        <HarmReductionManifesto />

        {/* Medical Research & Regulatory Disclaimer & Compliance Links */}
        <footer className="w-full mt-16 pt-8 pb-12 border-t border-slate-800/80 text-center">
          {/* E-E-A-T Clinical Authority & Recency Trust Banner */}
          <div className="mb-4 text-xs text-slate-400 font-medium">
            Built &amp; Maintained by PepPlotter Harm-Reduction Engineering • Clinical Reference: ADA / FITTER / CDC Sub-Q Standards • Last Updated: October 2026
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            Educational, Research &amp; Harm-Reduction Simulation Tool
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PepPlotter is an independent mathematical simulation and harm-reduction calculator created solely for laboratory research and educational study. It does not provide medical advice, diagnosis, or prescription instructions. Always prioritize natural health, nutrition, and exercise, and consult a licensed healthcare professional before administering any compound.
          </p>

          {/* Feedback & Support Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
            >
              <span>💬</span>
              <span>Suggest a Feature / Request Peptide</span>
            </button>
            <a
              href="https://buymeacoffee.com/ssuunnyy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-amber-500/10"
            >
              <span>☕</span>
              <span>Support Independent Harm-Reduction</span>
            </a>
          </div>

          {/* Compliance and Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/refund" className="hover:text-emerald-400 transition-colors">
              Refund Policy
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">
              Medical Disclaimer
            </Link>
            <span className="text-slate-700">•</span>
            <a href="mailto:support@pepplotter.com" className="hover:text-emerald-400 transition-colors">
              support@pepplotter.com
            </a>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            © 2026 PepPlotter • Public Health &amp; Precision Pharmacokinetic Systems. All rights reserved.
          </div>
        </footer>
      </main>

      {/* Protocol Report & Calendar Sync Modal (Mounted outside main for clean print isolation) */}
      <ProtocolReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onOpenSheetPreview={() => {
          setIsReportModalOpen(false);
          setIsSheetPreviewOpen(true);
        }}
        compoundName={activePreset.name}
        brandNames={activePreset.brandNames}
        vialMg={safeVialMg}
        waterMl={safeWaterMl}
        targetDoseMcg={safeTargetDoseMcg}
        syringeType={syringeType}
        result={reconResult}
        frequencyDays={activePreset.standardFrequencyDays}
      />

      {/* In-Page Community Feedback & Feature Request Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Dedicated Printable Protocol & PK Sheet (A4 Single-Page Fridge Sheet & Interactive Modal) */}
      <PrintableProtocolSheet
        isOpen={isSheetPreviewOpen}
        onClose={() => setIsSheetPreviewOpen(false)}
        compoundName={activePreset.name}
        brandNames={activePreset.brandNames}
        vialMg={safeVialMg}
        waterMl={safeWaterMl}
        targetDoseMcg={safeTargetDoseMcg}
        syringeType={syringeType}
        reconResult={reconResult}
        halfLifeHours={halfLifeHours}
        peakConcentration={pkResult.peakConcentration}
        troughConcentration={pkResult.troughConcentration}
        averageConcentration={pkResult.averageConcentration}
        simulationDays={simulationDays}
        dataPoints={pkResult.dataPoints}
        injections={injections}
        frequencyDays={activePreset.standardFrequencyDays}
      />

      {/* Custom Peptide Clinical Protocol Request Modal */}
      <CustomProtocolModal
        isOpen={isCustomProtocolModalOpen}
        onClose={() => setIsCustomProtocolModalOpen(false)}
        defaultCompoundName={plotCompoundId === 'custom' ? 'Custom Peptide / Research Compound' : activePreset.name}
        defaultVialMg={safeVialMg}
        defaultDoseMcg={safeTargetDoseMcg || activePreset.defaultDoseMcg}
      />
    </div>
  );
}
