'use client';

import React, { useMemo, useState, useRef } from 'react';
import { SyringeType, ReconstitutionResult, ConcentrationDataPoint, InjectionEntry } from '@/lib/types';
import { generateSmoothSpline } from '@/lib/calculator';
import { renderSheetToCanvas, SheetCanvasData } from '@/lib/canvasSheet';
import { Printer, X, Download, Copy, Check, Eye } from 'lucide-react';

interface PrintableProtocolSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
  compoundName: string;
  brandNames?: string;
  vialMg: number;
  waterMl: number;
  targetDoseMcg: number;
  syringeType: SyringeType;
  reconResult: ReconstitutionResult;
  halfLifeHours: number;
  peakConcentration: number;
  troughConcentration: number;
  averageConcentration: number;
  simulationDays: number;
  dataPoints: ConcentrationDataPoint[];
  injections: InjectionEntry[];
  frequencyDays?: number;
}

export const PrintableProtocolSheet: React.FC<PrintableProtocolSheetProps> = ({
  isOpen = false,
  onClose,
  compoundName,
  brandNames,
  vialMg,
  waterMl,
  targetDoseMcg,
  syringeType,
  reconResult,
  halfLifeHours,
  peakConcentration,
  troughConcentration,
  averageConcentration,
  simulationDays,
  dataPoints,
  injections,
  frequencyDays = 7,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const isBlocked = reconResult.error !== null;
  const doseMg = targetDoseMcg / 1000;
  const doseDisplay = targetDoseMcg >= 1000 ? `${doseMg.toFixed(2)} mg` : `${targetDoseMcg} mcg`;
  const concentrationMgMl = waterMl > 0 ? vialMg / waterMl : 0;
  const concentrationMcgMl = concentrationMgMl * 1000;
  const maxSyringeUnits = syringeType === 'U100' ? 100 : 40;
  const clampedUnits = Math.min(Math.max(reconResult.syringeUnits, 0), maxSyringeUnits);

  // --- 1. SVG Syringe Dimensions & Calculations ---
  const barrelStart = 75;
  const barrelWidth = 450;
  const barrelHeight = 32;
  const barrelY = 14;
  const fillWidth = (clampedUnits / maxSyringeUnits) * barrelWidth;
  const plungerX = barrelStart + fillWidth;

  const syringeTicks = useMemo(() => {
    const majorStep = syringeType === 'U100' ? 10 : 5;
    const minorStep = syringeType === 'U100' ? 2 : 1;
    const tickCount = Math.round(maxSyringeUnits / minorStep);
    const elements: React.ReactElement[] = [];

    for (let i = 0; i <= tickCount; i++) {
      const unitVal = i * minorStep;
      const x = barrelStart + (unitVal / maxSyringeUnits) * barrelWidth;
      const isMajor = unitVal % majorStep === 0;

      elements.push(
        <g key={unitVal}>
          <line
            x1={x}
            y1={barrelY}
            x2={x}
            y2={barrelY + (isMajor ? 12 : 6)}
            stroke="#0f172a"
            strokeWidth={isMajor ? 1.4 : 0.75}
          />
          {isMajor && (
            <text
              x={x}
              y={barrelY + 22}
              fontSize="7.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {unitVal}
            </text>
          )}
        </g>
      );
    }
    return elements;
  }, [syringeType, maxSyringeUnits, barrelStart, barrelWidth, barrelY]);

  // --- 2. SVG PK Curve Calculations ---
  const svgWidth = 680;
  const svgHeight = 88;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 12;
  const padBottom = 18;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxVal = Math.max(peakConcentration * 1.15, 0.1);
  const minVal = 0;
  const totalDays = dataPoints.length ? dataPoints[dataPoints.length - 1].day : simulationDays;

  const getX = (day: number) => padLeft + (day / (totalDays || 1)) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  const curvePathD = useMemo(() => {
    if (!dataPoints.length || totalDays <= 0) return '';
    const points = dataPoints.map((pt) => ({
      x: getX(pt.day),
      y: getY(pt.concentration),
    }));
    return generateSmoothSpline(points, padTop, padTop + chartH);
  }, [dataPoints, maxVal, minVal, totalDays]);

  const areaPathD = useMemo(() => {
    if (!curvePathD || totalDays <= 0) return '';
    return `${curvePathD} L ${getX(totalDays)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`;
  }, [curvePathD, totalDays]);

  const yTicks = [0, maxVal * 0.5, maxVal];
  const xDayStep = totalDays <= 14 ? 2 : totalDays <= 30 ? 7 : 14;
  const xTicks: number[] = [];
  for (let d = 0; d <= totalDays; d += xDayStep) {
    xTicks.push(d);
  }

  // --- 3. Dosing Schedule Table Rows (Up to 8 doses) ---
  const tableRows = useMemo(() => {
    if (injections && injections.length > 0) {
      return injections.slice(0, 8);
    }
    return [0, 1, 2, 3].map((idx) => ({
      id: `fallback-${idx}`,
      compoundId: compoundName,
      day: idx * frequencyDays,
      doseMg: doseMg || 2.5,
    }));
  }, [injections, compoundName, frequencyDays, doseMg]);

  const handleCopySummary = () => {
    const summary = `📋 ${compoundName} Protocol\n• Dose: ${doseDisplay} (${reconResult.syringeUnits} Units on ${syringeType})\n• Mixing: ${vialMg}mg vial + ${waterMl}mL BAC water (${concentrationMgMl.toFixed(2)} mg/mL)\n• Half-Life: ${(halfLifeHours / 24).toFixed(1)}d | Peak: ~${peakConcentration.toFixed(2)}mg\n• Generated via PepPlotter (https://pepplotter.com)`;
    navigator.clipboard?.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- 4. Robust Canvas 2D Image Generator (100% works in WeChat, X, Safari, Chrome) ---
  const handleExportImage = () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const canvasData: SheetCanvasData = {
        compoundName,
        brandNames,
        vialMg,
        waterMl,
        targetDoseMcg,
        doseDisplay,
        concentrationMgMl,
        concentrationMcgMl,
        syringeType,
        reconResult,
        halfLifeHours,
        peakConcentration,
        troughConcentration,
        averageConcentration,
        simulationDays,
        dataPoints,
        tableRows,
        frequencyDays,
      };

      // Direct Canvas 2D drawing (no foreignObject, no security restrictions)
      renderSheetToCanvas(canvas, canvasData);

      const pngUrl = canvas.toDataURL('image/png');
      const safeName = compoundName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'peptide';
      const filename = `pepplotter-${safeName}-protocol.png`;

      // Set image preview modal for mobile users (long press to save)
      setPreviewImageUrl(pngUrl);

      // Attempt automatic download for desktop/supported browsers
      try {
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        // In-app browsers will use the long-press preview overlay
      }
    } catch (err) {
      console.error('Canvas export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // --- Pure White Sheet Content (Shared between Modal Preview and Print) ---
  const sheetContent = (
    <div
      ref={sheetRef}
      id="printable-fridge-sheet"
      className="bg-white text-slate-900 p-4 sm:p-5 rounded-xl shadow-2xl border border-slate-300 print:border print:border-slate-300 print:shadow-none print:rounded-lg print:p-4 select-none text-[10px] leading-tight w-full max-w-[700px] mx-auto print:max-w-none"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. DOCUMENT HEADER */}
      <div className="border-b-2 border-slate-900 pb-1 mb-1.5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 uppercase">
              PepPlotter Clinical Protocol &amp; PK Report
            </span>
            <span className="px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded">
              Memo
            </span>
          </div>
          <p className="text-[9px] text-slate-600 mt-0.5">
            Reconstitution Guide • Syringe Draw Target • Pharmacokinetic Curve • Administration Log
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono font-bold text-slate-800 block">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-[8px] text-slate-500 uppercase tracking-wider block">
            pepplotter.com
          </span>
        </div>
      </div>

      {/* 2. COMPOUND SPECIFICATION STRIP */}
      <div className="bg-slate-50 border border-slate-300 rounded p-1 mb-1.5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[8.5px] uppercase font-bold text-slate-500">Compound:</span>
            <span className="text-[11px] font-black text-slate-950">
              {compoundName}
              {brandNames ? <span className="text-[9px] font-normal text-slate-600 ml-1">({brandNames})</span> : null}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[8.5px] uppercase font-bold text-slate-500">Concentration:</span>
            <span className="text-[10.5px] font-bold font-mono text-slate-900">
              {concentrationMgMl.toFixed(2)} mg/mL ({concentrationMcgMl.toFixed(0)} mcg/mL)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 text-[9px]">
          <div>
            <span className="text-slate-500">Vial Powder: </span>
            <strong className="text-slate-900 font-mono">{vialMg} mg</strong>
          </div>
          <div>
            <span className="text-slate-500">BAC Water Added: </span>
            <strong className="text-slate-900 font-mono">{waterMl} mL</strong>
          </div>
          <div>
            <span className="text-slate-500">Recon Date: </span>
            <span className="font-mono text-slate-700">___/___/202_</span>
          </div>
          <div>
            <span className="text-slate-500">28-Day Discard: </span>
            <span className="font-mono text-slate-700">___/___/202_</span>
          </div>
        </div>
      </div>

      {/* 3. SECTION 1: RECONSTITUTION & SYRINGE DRAW (Tab 1) */}
      <div className="border border-slate-300 rounded-lg p-1.5 mb-1.5 bg-white">
        <div className="flex items-center justify-between pb-0.5 border-b border-slate-200 mb-1">
          <span className="text-[9px] uppercase font-black tracking-wider text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            1. Reconstitution &amp; Precision Syringe Draw
          </span>
          <span className="text-[8px] font-bold text-slate-500">
            Syringe: {syringeType} (1 Unit = {syringeType === 'U100' ? '0.01' : '0.025'} mL)
          </span>
        </div>

        {/* 4 Core Action Badges */}
        <div className="grid grid-cols-4 gap-1 mb-1">
          <div className="border border-slate-300 rounded p-1 bg-slate-50 text-center">
            <span className="text-[8px] uppercase font-bold text-slate-500 block">Single Dose</span>
            <span className="text-[11px] font-black font-mono text-slate-900 mt-0.5 block">
              {doseDisplay}
            </span>
          </div>

          <div className="border-2 border-emerald-700 rounded p-1 bg-emerald-50 text-center">
            <span className="text-[8px] uppercase font-bold text-emerald-800 block">Draw Target</span>
            {isBlocked ? (
              <span className="text-[11px] font-bold text-rose-700 font-mono mt-0.5 block">BLOCKED</span>
            ) : (
              <span className="text-[11px] font-black font-mono text-emerald-950 mt-0.5 block">
                ★ {reconResult.syringeUnits} UNITS
              </span>
            )}
            <span className="text-[7.5px] text-emerald-800 font-mono">
              ({reconResult.drawVolumeMl} mL on {syringeType})
            </span>
          </div>

          <div className="border border-slate-300 rounded p-1 bg-slate-50 text-center">
            <span className="text-[8px] uppercase font-bold text-slate-500 block">Vial Supply</span>
            <span className="text-[11px] font-black font-mono text-slate-900 mt-0.5 block">
              {reconResult.totalVialDoses} Doses
            </span>
            <span className="text-[7.5px] text-slate-500">
              ≈ {Math.round((reconResult.totalVialDoses * frequencyDays) / 7)}w supply
            </span>
          </div>

          <div className="border border-slate-300 rounded p-1 bg-slate-50 text-center">
            <span className="text-[8px] uppercase font-bold text-slate-500 block">Storage Rules</span>
            <span className="text-[11px] font-black font-mono text-cyan-900 mt-0.5 block">
              36°F – 46°F
            </span>
            <span className="text-[7.5px] text-cyan-800 font-semibold">
              Refrigerate (2–8°C)
            </span>
          </div>
        </div>

        {/* Visual Syringe Diagram (Ink-Friendly Vector SVG) */}
        <div className="bg-slate-50 border border-slate-200 rounded p-1 mb-1">
          <div className="flex items-center justify-between mb-0.5 px-0.5">
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-700">
              Syringe Visual Draw Guide ({syringeType})
            </span>
            <span className="text-[8px] font-bold font-mono text-emerald-800">
              Target Level: {reconResult.syringeUnits} Units ({reconResult.drawVolumeMl} mL)
            </span>
          </div>

          <svg
            viewBox="0 0 650 64"
            className="w-full h-auto select-none"
            style={{ maxHeight: '48px' }}
          >
            {/* Needle & Hub */}
            <polygon points="5,30 35,29 35,31" fill="#475569" />
            <rect x="25" y="29" width="30" height="2" fill="#475569" />
            <path d="M 55 20 L 75 21 L 75 39 L 55 40 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />

            {/* Syringe Outer Barrel */}
            <rect
              x={barrelStart}
              y={barrelY}
              width={barrelWidth}
              height={barrelHeight}
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.5"
              rx="2"
            />

            {/* Barrel Finger Grip Flange */}
            <rect
              x={barrelStart + barrelWidth - 1}
              y={barrelY - 5}
              width="6"
              height={barrelHeight + 10}
              fill="#475569"
              stroke="#0f172a"
              strokeWidth="1.2"
              rx="1.5"
            />

            {/* Medication Liquid (Green Highlight) */}
            {clampedUnits > 0 && (
              <rect
                x={barrelStart}
                y={barrelY + 1}
                width={fillWidth}
                height={barrelHeight - 2}
                fill="#10b981"
                fillOpacity="0.45"
              />
            )}

            {/* Plunger Stopper & Shaft */}
            <rect
              x={plungerX}
              y={barrelY + 1}
              width="10"
              height={barrelHeight - 2}
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="1"
              rx="1"
            />
            {/* Plunger Shaft */}
            <rect
              x={plungerX + 10}
              y={barrelY + barrelHeight / 2 - 3}
              width={Math.max(barrelStart + barrelWidth + 30 + fillWidth * 0.2 - (plungerX + 10), 10)}
              height="6"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="0.8"
            />
            {/* Plunger Thumb Rest Flange */}
            <rect
              x={Math.max(barrelStart + barrelWidth + 30 + fillWidth * 0.2, plungerX + 15)}
              y={barrelY - 5}
              width="7"
              height={barrelHeight + 10}
              fill="#334155"
              stroke="#0f172a"
              strokeWidth="1.2"
              rx="1.5"
            />

            {/* Graduation Ticks */}
            {syringeTicks}

            {/* Target Marker Arrow & Label */}
            {!isBlocked && clampedUnits > 0 && (
              <g>
                <polygon
                  points={`${plungerX},${barrelY + barrelHeight + 1} ${plungerX - 3.5},${barrelY + barrelHeight + 7} ${plungerX + 3.5},${barrelY + barrelHeight + 7}`}
                  fill="#059669"
                />
                <text
                  x={plungerX}
                  y={barrelY + barrelHeight + 15}
                  fontSize="8"
                  fontWeight="900"
                  fill="#059669"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  ▲ {reconResult.syringeUnits} U
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Quick Reconstitution & Sub-Q SOP Text */}
        <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-800">
          <div className="border border-slate-200 rounded p-1 bg-slate-50/50">
            <span className="font-bold uppercase text-[8px] text-slate-600 block mb-0.5">
              Reconstitution Recipe:
            </span>
            <p className="leading-snug">
              Slowly inject <strong>{waterMl} mL</strong> Bacteriostatic Water down inside vial wall into <strong>{vialMg} mg</strong> {compoundName}. Swirl gently until dissolved. <strong>Do not shake.</strong>
            </p>
          </div>

          <div className="border border-slate-200 rounded p-1 bg-slate-50/50">
            <span className="font-bold uppercase text-[8px] text-slate-600 block mb-0.5">
              Sub-Q 3-Step SOP:
            </span>
            <p className="leading-snug">
              1. Wipe stopper &amp; site (wait 15s). 2. Draw <strong>{reconResult.syringeUnits} Units</strong> ({reconResult.drawVolumeMl} mL). 3. Pinch skin, 90° angle, depress steadily, hold 5–10s.
            </p>
          </div>
        </div>
      </div>

      {/* 4. SECTION 2: PHARMACOKINETIC ACCUMULATION & SCHEDULE (Tab 2) */}
      <div className="border border-slate-300 rounded-lg p-1.5 mb-1.5 bg-white">
        <div className="flex items-center justify-between pb-0.5 border-b border-slate-200 mb-1">
          <span className="text-[9px] uppercase font-black tracking-wider text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 inline-block" />
            2. PK Accumulation &amp; Schedule
          </span>
          <div className="flex items-center gap-1 text-[8px] font-mono">
            <span className="bg-slate-100 text-slate-800 px-1 py-0.2 rounded border border-slate-200">
              HL: <strong>{(halfLifeHours / 24).toFixed(1)}d</strong>
            </span>
            <span className="bg-rose-50 text-rose-900 px-1 py-0.2 rounded border border-rose-200">
              Peak: <strong>{peakConcentration.toFixed(2)} mg</strong>
            </span>
            <span className="bg-emerald-50 text-emerald-900 px-1 py-0.2 rounded border border-emerald-200">
              Trough: <strong>{troughConcentration.toFixed(2)} mg</strong>
            </span>
            <span className="bg-cyan-50 text-cyan-900 px-1 py-0.2 rounded border border-cyan-200">
              Avg: <strong>{averageConcentration.toFixed(2)} mg</strong>
            </span>
          </div>
        </div>

        {/* Vector SVG Half-Life Plasma Accumulation Curve */}
        <div className="bg-slate-50 border border-slate-200 rounded p-0.5 mb-1">
          <div className="flex items-center justify-between px-0.5 mb-0.5">
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
              Plasma Accumulation Trajectory ({simulationDays} Days Timeline)
            </span>
            <span className="text-[7.5px] text-slate-500 font-sans">
              ● Green Dots = Injection Events (Day 0, 7, 14, 21...)
            </span>
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: '72px' }}
          >
            <defs>
              <linearGradient id="printCurveGradCompact2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines */}
            {yTicks.map((val, i) => {
              const y = getY(val);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                  <text
                    x={padLeft - 3}
                    y={y + 3}
                    fontSize="7"
                    fill="#475569"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* X-axis day markers */}
            {xTicks.map((d) => {
              const x = getX(d);
              return (
                <g key={d}>
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + chartH}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                    strokeWidth="0.8"
                  />
                  <text
                    x={x}
                    y={padTop + chartH + 10}
                    fontSize="7"
                    fill="#64748b"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    Day {d}
                  </text>
                </g>
              );
            })}

            {/* Shaded Area Under Curve */}
            {areaPathD && <path d={areaPathD} fill="url(#printCurveGradCompact2)" />}

            {/* Concentration Spline Curve */}
            {curvePathD && (
              <path
                d={curvePathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Injection Point Dots & Annotations */}
            {dataPoints.map((pt, idx) => {
              if (!pt.isInjectionPoint) return null;
              const cx = getX(pt.day);
              const cy = getY(pt.concentration);
              return (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="3" fill="#059669" stroke="#ffffff" strokeWidth="1.2" />
                  <text
                    x={cx}
                    y={Math.max(cy - 4, padTop + 6)}
                    fontSize="6.5"
                    fontWeight="bold"
                    fill="#059669"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    Inj
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Administration Schedule & Pen-Checkoff Table */}
        <div className="border border-slate-300 rounded overflow-hidden">
          <div className="bg-slate-100 px-1.5 py-0.5 border-b border-slate-300 flex items-center justify-between">
            <span className="text-[8px] uppercase font-bold text-slate-700 tracking-wider">
              Administration Schedule &amp; Physical Pen-Check Log
            </span>
            <span className="text-[7.5px] text-slate-500">
              Rotate injection sites to prevent lipohypertrophy
            </span>
          </div>

          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[8px] uppercase text-slate-600 font-bold">
                <th className="py-0.5 px-1.5 w-8 text-center border-r border-slate-200">Dose</th>
                <th className="py-0.5 px-1.5 w-14 border-r border-slate-200">Protocol</th>
                <th className="py-0.5 px-1.5 w-20 border-r border-slate-200">Planned Date</th>
                <th className="py-0.5 px-1.5 w-24 border-r border-slate-200">Dose &amp; Units</th>
                <th className="py-0.5 px-1.5 border-r border-slate-200">Injection Site</th>
                <th className="py-0.5 px-1.5 w-16 border-r border-slate-200">Time Given</th>
                <th className="py-0.5 px-1.5 w-9 text-center">Done (✓)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[8.5px]">
              {tableRows.map((inj, idx) => {
                const targetUnits =
                  concentrationMgMl > 0
                    ? Number(((inj.doseMg / concentrationMgMl) * (syringeType === 'U100' ? 100 : 40)).toFixed(1))
                    : 0;

                return (
                  <tr key={inj.id || idx} className="hover:bg-slate-50">
                    <td className="py-0.5 px-1.5 text-center font-bold text-slate-900 border-r border-slate-200">
                      #{idx + 1}
                    </td>
                    <td className="py-0.5 px-1.5 text-slate-700 border-r border-slate-200">
                      Day {inj.day}
                    </td>
                    <td className="py-0.5 px-1.5 text-slate-600 border-r border-slate-200">
                      ___/___/202_
                    </td>
                    <td className="py-0.5 px-1.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {inj.doseMg.toFixed(2)}mg • {targetUnits} U
                    </td>
                    <td className="py-0.5 px-1.5 text-slate-600 border-r border-slate-200 font-sans text-[7.5px] whitespace-nowrap">
                      [ ] L-Abd &nbsp; [ ] R-Abd &nbsp; [ ] Thigh
                    </td>
                    <td className="py-0.5 px-1.5 text-slate-400 border-r border-slate-200">
                      ___:___
                    </td>
                    <td className="py-0.5 px-1.5 text-center text-slate-400 font-sans text-[10px]">
                      [ &nbsp; ]
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FOOTER & CLINICAL COMPLIANCE */}
      <div className="border-t border-slate-300 pt-0.5 flex items-center justify-between text-[7px] text-slate-500 leading-tight">
        <div>
          <strong>PepPlotter (pepplotter.com)</strong> • Reconstitution &amp; Pharmacokinetic Superposition Engine.
        </div>
        <div className="text-right">
          For educational &amp; personal research logging only. Not medical prescription advice.
        </div>
      </div>
    </div>
  );

  // If modal is closed, still keep sheet in DOM for background print readiness (Ctrl+P)
  if (!isOpen) {
    return (
      <div className="hidden print:block">
        {sheetContent}
      </div>
    );
  }

  // When isOpen is true, render interactive on-screen modal preview
  return (
    <div
      id="printable-sheet-modal-overlay"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="w-full max-w-[720px] my-3 sm:my-auto space-y-2 print:space-y-0 print:my-0 print:m-0 print:max-w-none">
        {/* Screen Action Bar (print:hidden) */}
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl text-xs print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-slate-100">
              A4 Protocol Sheet
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              title="Copy text summary to clipboard"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* SAVE AS IMAGE BUTTON (Canvas-Powered, 100% works in WeChat, X, Safari, Android) */}
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              title="Save full protocol sheet as a high-resolution PNG image directly to your photos / downloads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-sm shadow-cyan-600/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Save Image'}</span>
            </button>

            {/* PRINT / PDF BUTTON */}
            <button
              onClick={() => window.print()}
              title="Print or save as PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-sm shadow-emerald-500/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close Preview"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* The White A4 Paper Card */}
        {sheetContent}

        {/* Mobile Helpful Hint & Close Button */}
        <div className="text-center text-[10.5px] text-slate-400 flex items-center justify-between px-2 print:hidden">
          <span>Tap <strong>&quot;Save Image&quot;</strong> to export high-res PNG, or direct screenshot.</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white font-medium underline cursor-pointer ml-2"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* --- MOBILE IMAGE PREVIEW & LONG-PRESS OVERLAY (Zero-fail for WeChat / Twitter / Mobile) --- */}
      {previewImageUrl && (
        <div
          className="print:hidden fixed inset-0 z-[60] flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="w-full max-w-[680px] bg-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-slate-100">
                  Image Ready (2x Ultra-HD)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewImageUrl}
                  download={`pepplotter-${compoundName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-protocol.png`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => setPreviewImageUrl(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hint for WeChat / Social Media in-app browsers */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-emerald-300 mb-2 flex items-center justify-center text-center">
              <span>📱 <strong>Mobile Tip:</strong> Long-press the image below and select <strong>&quot;Save to Photos&quot;</strong> or &quot;Share&quot;.</span>
            </div>

            {/* The Rendered High-Res PNG Image */}
            <div className="overflow-y-auto flex-1 rounded-lg border border-slate-800 bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt={`${compoundName} Clinical Protocol & PK Sheet`}
                className="w-full h-auto rounded select-none pointer-events-auto"
                style={{ WebkitTouchCallout: 'default' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
