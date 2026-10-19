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
import { HarmReductionManifesto } from '@/components/HarmReductionManifesto';
import { ComparisonTable } from '@/components/ComparisonTable';
import { SeoGuide } from '@/components/SeoGuide';
import { SubQVisualGuide } from '@/components/SubQVisualGuide';
import { ReconstitutionMatrix } from '@/components/ReconstitutionMatrix';
import { FAQS } from '@/lib/faqs';
import { COMPOUND_PRESETS, calculateReconstitution, calculatePharmacokinetics, safeCopyToClipboard } from '@/lib/calculator';
import { BLOCK_MESSAGES } from '@/lib/messages';
import { CompoundPreset, SyringeType, InjectionEntry } from '@/lib/types';
import { 
  Calculator, 
  Activity, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck,
  Split, 
  CalendarDays,
  Pill,
  Share2,
  Check,
  Compass,
  ArrowRight,
  Calendar,
  FileText,
  HeartPulse
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

  // Default 4-week injection schedule (e.g. Day 0, Day 7, Day 14, Day 21)
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

    // Automatically synchronize Tab 2 injection schedule with compound defaults
    const defaultDoseMg = Number((preset.defaultDoseMcg / 1000).toFixed(3));
    const freq = preset.standardFrequencyDays || 7;
    setInjections([
      { id: crypto.randomUUID(), compoundId: preset.id, day: 0, doseMg: defaultDoseMg },
      { id: crypto.randomUUID(), compoundId: preset.id, day: freq, doseMg: defaultDoseMg },
      { id: crypto.randomUUID(), compoundId: preset.id, day: freq * 2, doseMg: defaultDoseMg },
      { id: crypto.randomUUID(), compoundId: preset.id, day: freq * 3, doseMg: defaultDoseMg },
    ]);
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

  // Manual one-click synchronization from current calculator dose to Tab 2 schedule
  const syncCurrentDoseToSchedule = () => {
    const currentDoseMg = Number(
      ((safeTargetDoseMcg || activePreset.defaultDoseMcg) / (isSplitDoseMode ? 2000 : 1000)).toFixed(3)
    );
    setInjections((prev) =>
      prev.map((inj) => ({
        ...inj,
        doseMg: currentDoseMg,
      }))
    );
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

  const pkResult = useMemo(() => {
    return calculatePharmacokinetics(injections, halfLifeHours, simulationDays, 2);
  }, [injections, halfLifeHours, simulationDays]);

  // Tour controls
  const startTour = () => {
    handleTabChange('calc');
    setTourStepIndex(0);
    setIsTourActive(true);
  };

  // 引导步骤切换时，把当前高亮目标滚动进视口（替代原硬编码 scrollTo 380）
  useEffect(() => {
    if (!isTourActive) return;
    const target = TOUR_STEPS[tourStepIndex];
    if (tourStepIndex === 4) {
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
      }, 60);
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
    const nextDay = injections.length > 0 ? injections[injections.length - 1].day + 7 : 0;
    const defaultDose = injections.length > 0 ? injections[injections.length - 1].doseMg : 0.25;
    const newEntry: InjectionEntry = {
      id: crypto.randomUUID(),
      compoundId: plotCompoundId,
      day: nextDay,
      doseMg: defaultDose,
    };
    if (nextDay > simulationDays) {
      if (nextDay <= 28) setSimulationDays(28);
      else if (nextDay <= 42) setSimulationDays(42);
      else setSimulationDays(60);
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

  // Copy shareable dosage summary with permanent interactive deep link
  const copySummary = () => {
    const shareUrl = `https://pepplotter.com/?preset=${selectedPresetId}&vial=${safeVialMg}&water=${safeWaterMl}&dose=${safeTargetDoseMcg}&syringe=${syringeType}${activeTab === 'plotter' ? '&tab=plotter' : activeTab === 'guide' ? '&tab=guide' : ''}`;

    let text: string;
    if (reconResult.error) {
      text = `PepPlotter — protocol blocked:\n${BLOCK_MESSAGES[reconResult.error!]}\nNo dosing instruction was generated.\n🔗 Verify: ${shareUrl}`;
    } else if (reconResult.overCapacity) {
      text = `PepPlotter — warning for ${activePreset.name}:\nDose requires ${reconResult.syringesRequired} syringe(s) of ${syringeType} (capacity ${reconResult.syringeCapacity} units).\nSplit the dose or increase reconstitution water. Do NOT draw ${reconResult.drawVolumeMl} mL into a single syringe.\n🔗 Interactive Syringe & Curve: ${shareUrl}`;
    } else {
      text = `Peptide Reconstitution Protocol (${activePreset.name}):\n• Vial: ${safeVialMg} mg\n• BAC Water: ${safeWaterMl} mL\n• Target Dose: ${safeTargetDoseMcg} mcg (${(safeTargetDoseMcg / 1000).toFixed(2)} mg)\n• Syringe Draw: ${reconResult.syringeUnits} Units (${reconResult.drawVolumeMl} mL on ${syringeType})\n\n🔗 Interactive Syringe & Curve:\n${shareUrl}`;
    }
    // 复制失败时不弹成功态，并降级到 execCommand 兜底
    safeCopyToClipboard(text).then((ok) => {
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 max-w-[100vw]">
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

      {/* Main Container */}
      <main className="w-full max-w-5xl px-4 sm:px-6 py-8 md:py-12">
        {/* Top Brand Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                  PepPlotter
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Harm Reduction &amp; Simulation v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Precision Peptide Reconstitution &amp; Pharmacokinetic Accumulation Simulator
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleTabChange('guide');
                document.getElementById('main-tab-switcher')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>🛡️ Sub-Q Visual Guide</span>
            </button>

            <button
              onClick={startTour}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>How to Use (Tour)</span>
            </button>

            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied Protocol!' : 'Share Protocol'}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50 max-w-3xl mx-auto leading-tight">
            Precision Peptide Reconstitution Calculator &amp; <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Syringe Visualizer</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base font-semibold text-emerald-300/95 italic tracking-wide">
            &ldquo;Health by Effort. Guidance by Professionals. Precision Math When You Must.&rdquo;
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate dangerous dilution and drawing errors for Semaglutide, Tirzepatide, Retatrutide &amp; research peptides. Real-time SVG syringe draw markers, pharmacokinetic half-life simulation, and clinical harm reduction guidance.
          </p>

          {/* Beginner Friendly Callout Pill */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={startTour}
              className="group inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-full text-xs text-slate-300 transition-all shadow-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>First time mixing? <strong>Follow our 5-Step Guided Walkthrough</strong></span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Fast Compound Preset Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Fast Presets:
            </span>
            {COMPOUND_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Tab Switcher */}
        <div id="main-tab-switcher" className="flex justify-center mb-8 scroll-mt-6">
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
            className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg"
          >
            <button
              id="tab-btn-calc"
              role="tab"
              aria-selected={activeTab === 'calc'}
              aria-controls="tab-panel-calc"
              tabIndex={activeTab === 'calc' ? 0 : -1}
              onClick={() => handleTabChange('calc')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'calc'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span>
                <span className="inline sm:hidden">1. Calculator</span>
                <span className="hidden sm:inline">1. Reconstitution Calculator</span>
              </span>
            </button>

            <button
              id="tab-btn-plotter"
              role="tab"
              aria-selected={activeTab === 'plotter'}
              aria-controls="tab-panel-plotter"
              tabIndex={activeTab === 'plotter' ? 0 : -1}
              onClick={() => handleTabChange('plotter')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plotter'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>
                <span className="inline sm:hidden">2. PK Simulator</span>
                <span className="hidden sm:inline">2. Half-Life &amp; PK Simulator</span>
              </span>
            </button>

            <button
              id="tab-btn-guide"
              role="tab"
              aria-selected={activeTab === 'guide'}
              aria-controls="tab-panel-guide"
              tabIndex={activeTab === 'guide' ? 0 : -1}
              onClick={() => handleTabChange('guide')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-300" />
              <span>
                <span className="inline sm:hidden">3. Sub-Q Guide</span>
                <span className="hidden sm:inline">3. Clinical Sub-Q Guide</span>
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
                        onClick={() => setVialMg(val)}
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
                  <div className="flex gap-1.5 mt-2">
                    {[1.0, 2.0, 3.0].map((val) => (
                      <button
                        key={val}
                        onClick={() => setWaterMl(val)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold transition-all ${
                          waterMl === val
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {val}mL
                      </button>
                    ))}
                  </div>
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
                  <div className="flex gap-1.5 mt-2 flex-wrap">
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
                        className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold transition-all ${
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
{/* SAFETY BANNER: 阻断 / 超量程 */}
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

{/* Plain-English Dosage Recipe Card */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-3">
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
          <span className="block mt-2">
            <button
              type="button"
              onClick={() => handleTabChange('guide')}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 decoration-emerald-500/40 hover:decoration-emerald-300 transition-colors cursor-pointer"
            >
              <span>First time injecting? View Step-by-Step Sub-Q Visual Guide &rarr;</span>
            </button>
          </span>
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
                <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/40 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
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

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Protocol & Reminders</span>
                  </button>
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
            {/* Top Toolbar: Compound & Split Dose Toggle */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Select Target Compound
                  </label>
                  <select
                    value={plotCompoundId}
                    onChange={(e) => {
                      setPlotCompoundId(e.target.value);
                      const found = COMPOUND_PRESETS.find((p) => p.id === e.target.value);
                      if (found && found.id !== 'custom') {
                        setCustomHalfLifeDays(found.halfLifeHours / 24);
                      }
                    }}
                    className="bg-slate-950 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
                  >
                    {COMPOUND_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brandNames})
                      </option>
                    ))}
                  </select>
                </div>

                {plotCompoundId === 'custom' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Custom Half-Life (Days)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={customHalfLifeDays}
                      onChange={(e) => setCustomHalfLifeDays(parseFloat(e.target.value) || 1)}
                      className="w-28 bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Timeline Span
                  </label>
                  <select
                    value={simulationDays}
                    onChange={(e) => setSimulationDays(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 outline-none"
                  >
                    <option value={14}>2 Weeks (14 Days)</option>
                    <option value={28}>4 Weeks (28 Days)</option>
                    <option value={42}>6 Weeks (42 Days)</option>
                    <option value={60}>8 Weeks (60 Days)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: Sync Current Dose & Split Dose */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={syncCurrentDoseToSchedule}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm cursor-pointer"
                  title="Synchronize current target dose from calculator to all schedule entries"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Sync Current Dose ({((safeTargetDoseMcg || activePreset.defaultDoseMcg) / (isSplitDoseMode ? 2000 : 1000)).toFixed(2)}mg) to Schedule
                  </span>
                </button>

                <button
                  onClick={toggleSplitDosing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSplitDoseMode
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  <Split className="w-4 h-4" />
                  <span>{isSplitDoseMode ? 'Split-Dosing Active (2x / Week)' : 'Simulate 2x / Week Split Dosing'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Half-Life Chart */}
            <HalfLifeChart
              dataPoints={pkResult.dataPoints}
              peakConcentration={pkResult.peakConcentration}
              troughConcentration={pkResult.troughConcentration}
              averageConcentration={pkResult.averageConcentration}
              compoundName={plotPreset.name}
              halfLifeHours={halfLifeHours}
            />

            {/* Injection Schedule Table & Manager */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Scheduled Administration Log ({injections.filter((inj) => inj.day <= simulationDays).length} Injections)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Sync Schedule to Calendar
                  </button>
                  <button
                    onClick={addInjection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Injection
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {injections
                  .filter((inj) => inj.day <= simulationDays)
                  .map((inj, idx) => (
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
              <span>Support Independent Harm-Reduction ($3)</span>
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

        {/* Protocol Report & Calendar Sync Modal */}
        <ProtocolReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
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
      </main>
    </div>
  );
}
