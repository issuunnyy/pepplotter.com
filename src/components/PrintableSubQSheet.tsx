'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { getQRCode } from '@/lib/qrcode';
import { renderSubQToCanvas } from '@/lib/canvasSubQ';
import { Printer, X, Download, Copy, Check, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PrintableSubQSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
  compoundName?: string;
  syringeUnits?: number;
  drawVolumeMl?: number;
  syringeType?: string;
}

const SUBQ_STAGES_A4 = [
  {
    num: '01',
    stageName: 'STAGE 01 • PREPARATION',
    title: 'Aseptic Supplies Setup & Acclimation',
    objective: 'Prepare sterile workstation and warm refrigerated peptide solution to room temperature.',
    points: [
      { label: 'Vial Temperature Acclimation', text: 'Let refrigerated vial sit 5–10 min at room temperature to eliminate cold-liquid injection sting.' },
      { label: 'Single-Use Syringe Verification', text: 'Inspect unopened 31G ultra-fine syringe (8mm / 5/16"). Verify intact tamper seal. Never reuse needles.' },
      { label: 'Dual Alcohol Swab Setup', text: 'Prepare 2 separate 70% isopropyl alcohol pads: 1 dedicated to the vial stopper, 1 for the skin site.' },
    ],
    doRule: 'Allow solution to reach ambient room temperature before drawing to eliminate stinging.',
    dontRule: 'Never microwave, boil, freeze, or vigorously shake peptide solutions (protein denatures).',
  },
  {
    num: '02',
    stageName: 'STAGE 02 • SITE PREPARATION',
    title: 'Site Selection & Mandatory 15s Air-Dry',
    objective: 'Select appropriate subcutaneous tissue zone and achieve sterile, non-irritating skin surface.',
    points: [
      { label: 'Optimal Injection Zones', text: 'Lower abdomen (≥2 inches / 5 cm from navel) or outer mid-thigh. Rotate injection sites weekly.' },
      { label: 'Centrifugal Cleansing', text: 'Cleanse the skin using firm outward spiral motion from center to perimeter. Do not retrace back.' },
      { label: 'Mandatory 15s Air-Dry', text: 'Allow full 15 seconds for alcohol to completely evaporate until skin surface appears matte.' },
    ],
    doRule: 'Allow full 15s evaporation before puncture (wet alcohol causes intense sting and degrades peptides).',
    dontRule: 'Never fan with hands, blow breath, or wipe sterilized skin dry with tissue.',
  },
  {
    num: '03',
    stageName: 'STAGE 03 • MEDICATION DRAW',
    title: 'Precision Pressure Balance & Unit Alignment',
    objective: 'Draw exact target units bubble-free with zero vacuum resistance inside the vial.',
    points: [
      { label: 'Pressure Equalization', text: 'Pull plunger to target dose in room air, inject air smoothly into upright vial to balance internal pressure.' },
      { label: '180° Vertical Inversion', text: 'Invert vial 180° vertically. Ensure needle bevel tip is fully submerged beneath the liquid surface.' },
      { label: 'Microbubble Expulsion', text: 'Draw plunger slightly past target units. Flick barrel gently to float bubbles to top; push plunger to exact mark.' },
    ],
    doRule: 'Keep vial fully inverted vertically while pulling plunger to ensure bubble-free liquid intake.',
    dontRule: 'Never draw medication while vial is sitting upright flat on a table (draws air vacuum).',
  },
  {
    num: '04',
    stageName: 'STAGE 04 • ADMINISTRATION',
    title: '90° Dart Insertion & Mandatory 10s Dwell',
    objective: 'Deliver medication into subcutaneous fat layer with zero skin leakage and safe disposal.',
    points: [
      { label: '2-Inch Sub-Q Pinch', text: 'Gently fold 2 inches (5 cm) of skin and subcutaneous fat between thumb and index finger.' },
      { label: '90° Dart Insertion', text: 'Insert 31G needle fully at a 90-degree angle with a quick, smooth dart-like motion. Do not aspirate.' },
      { label: 'Mandatory 10s Dwell', text: 'Depress plunger steadily. Maintain needle fully inserted for a full 10-second dwell before withdrawal.' },
      { label: 'Immediate Sharps Disposal', text: 'Withdraw smoothly along the insertion angle. Dispose immediately into an FDA-cleared sharps bin.' },
    ],
    doRule: 'Maintain 10-second needle dwell to ensure full depot absorption and prevent retrograde backflow.',
    dontRule: 'Never rub, massage, or apply direct heat to the injection site post-injection.',
  },
];

export const PrintableSubQSheet: React.FC<PrintableSubQSheetProps> = ({
  isOpen = false,
  onClose,
  compoundName = 'Subcutaneous Peptide',
  syringeUnits = 10,
  drawVolumeMl = 0.1,
  syringeType = 'U100',
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const qrCodeData = useMemo(() => getQRCode('https://pepplotter.com/#guide'), []);

  // Safe print trigger with data attribute isolation
  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    document.body.setAttribute('data-print-target', 'subq');
    window.print();
    const handleAfterPrint = () => {
      document.body.removeAttribute('data-print-target');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      await renderSubQToCanvas(canvas, {
        compoundName,
        syringeUnits,
        drawVolumeMl,
        syringeType,
      });

      const pngUrl = canvas.toDataURL('image/png');
      const filename = `pepplotter-subq-injection-protocol.png`;

      setPreviewImageUrl(pngUrl);

      try {
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        // Fallback for restricted mobile in-app browsers
      }
    } catch (err) {
      console.error('Sub-Q Canvas export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = () => {
    const summary = `💉 PepPlotter Sub-Q Injection Protocol (1-Page Patient Guide)
• Medication: ${compoundName}
• Target Dose: ${syringeUnits} Units (${drawVolumeMl} mL on ${syringeType})
• Needle Standard: 31G Ultra-Fine (8mm) Single-Use
• Step 1: Acclimate vial 5–10 min; verify 31G sterile syringe & dual 70% alcohol pads.
• Step 2: Cleanse lower abdomen / thigh in outward spiral; wait full 15s to air-dry matte.
• Step 3: Invert vial 180° vertical, inject air equal to dose, tap microbubbles, align plunger.
• Step 4: Pinch 2" fold, insert at 90°, depress steadily, hold 10s dwell before withdrawal.
• Free live visual guide: https://pepplotter.com/#guide`;

    navigator.clipboard?.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- Pure White Sheet Content (Shared between Modal Preview and Print) ---
  const sheetContent = (
    <div
      ref={sheetRef}
      id="printable-subq-sheet"
      className="bg-white text-slate-900 p-4 sm:p-5 rounded-xl shadow-2xl border border-slate-300 print:border print:border-slate-300 print:shadow-none print:rounded-lg print:p-4 select-none text-[10px] leading-tight w-full max-w-[700px] mx-auto print:max-w-none"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. DOCUMENT HEADER */}
      <div className="border-b-2 border-slate-900 pb-1 mb-1.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 uppercase">
              PepPlotter Sub-Q Injection Protocol &amp; Patient Guide
            </span>
            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded shrink-0">
              Clinical S.O.P. · ADA/FITTER
            </span>
          </div>
          <p className="text-[9px] text-slate-600 mt-0.5">
            Standardized 4-Stage Subcutaneous Administration Protocol for First-Time Users
          </p>
        </div>

        {/* Right Header Area: QR Code with Generous Breathing Room */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-2">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div
              className="p-0.5 bg-white border border-slate-300 rounded shadow-2xs"
              title="Scan QR Code with phone to open interactive guide at pepplotter.com/#guide"
            >
              <svg
                viewBox={`0 0 ${qrCodeData.moduleCount} ${qrCodeData.moduleCount}`}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 block"
                role="img"
                aria-label="QR Code to pepplotter.com/#guide"
              >
                <rect width="100%" height="100%" fill="#ffffff" />
                <path d={qrCodeData.getSvgPath(1)} fill="#090d16" />
              </svg>
            </div>
            <span className="text-[6.5px] uppercase font-bold text-slate-500 tracking-wider mt-0.5 leading-none">
              Scan Guide
            </span>
          </div>

          {/* Date & Domain */}
          <div className="text-right">
            <span className="text-[9px] font-mono font-bold text-slate-800 block">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[8px] text-slate-700 font-bold block leading-tight">
              pepplotter.com
            </span>
            <span className="text-[7px] text-emerald-700 font-bold uppercase tracking-wider block leading-tight">
              Live Guide &bull; Free
            </span>
          </div>
        </div>
      </div>

      {/* 2. COMPOUND & TARGET DOSE SPECIFICATION STRIP */}
      <div className="bg-slate-50 border border-slate-300 rounded p-1 mb-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px]">
          <div>
            <span className="text-slate-500">Medication: </span>
            <strong className="text-slate-900 font-bold">{compoundName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Target Dose: </span>
            <strong className="text-emerald-700 font-mono font-bold">
              {syringeUnits} Units ({drawVolumeMl} mL on {syringeType})
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Needle Spec: </span>
            <strong className="text-slate-900 font-mono">31G Ultra-Fine (8mm)</strong>
          </div>
          <div>
            <span className="text-slate-500">Storage Rules: </span>
            <strong className="text-cyan-800 font-bold">36°F–46°F (Refrigerate 2–8°C)</strong>
          </div>
        </div>
      </div>

      {/* 3. 4-STAGE CLINICAL INJECTION PROTOCOL */}
      <div className="space-y-1.5 mb-1.5">
        {SUBQ_STAGES_A4.map((stage) => (
          <div
            key={stage.num}
            className="border border-slate-300 rounded-lg p-1.5 bg-white flex flex-col justify-between"
          >
            <div>
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-0.5 border-b border-slate-200 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[7.5px] font-mono font-bold bg-emerald-600 text-white uppercase">
                    STEP {stage.num}
                  </span>
                  <span className="text-[9.5px] font-black text-slate-950 uppercase tracking-tight">
                    {stage.title}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-slate-500 uppercase">
                  {stage.stageName}
                </span>
              </div>

              {/* Subtitle / Objective */}
              <p className="text-[8.5px] text-slate-600 italic mb-1 leading-snug">
                {stage.objective}
              </p>

              {/* 3 Key Clinical Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-1 text-[8.5px]">
                {stage.points.map((pt, pIdx) => (
                  <div key={pIdx} className="bg-slate-50 border border-slate-200 rounded p-1">
                    <strong className="text-slate-900 block font-semibold text-[8px] mb-0.5">
                      • {pt.label}:
                    </strong>
                    <span className="text-slate-700 leading-tight block">
                      {pt.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DO & DON'T Rules */}
            <div className="pt-1 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[8px] leading-tight">
              <div className="text-emerald-800 font-medium flex items-start gap-1 bg-emerald-50/60 p-0.5 rounded border border-emerald-200/60">
                <span className="font-bold shrink-0">✓ DO:</span>
                <span>{stage.doRule}</span>
              </div>
              <div className="text-rose-800 font-medium flex items-start gap-1 bg-rose-50/60 p-0.5 rounded border border-rose-200/60">
                <span className="font-bold shrink-0">✗ DON&apos;T:</span>
                <span>{stage.dontRule}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. FOOTER & CLINICAL COMPLIANCE */}
      <div className="border-t border-slate-300 pt-1 flex items-center justify-between text-[7px] text-slate-500 leading-tight">
        <div>
          <strong>PepPlotter (pepplotter.com)</strong> • Evidence-Based Sub-Q Protocol (ADA &amp; FITTER Harm-Reduction Standard).
        </div>
        <div className="text-right">
          For educational &amp; personal logging only. Not medical prescription advice. Always dispose needles in an FDA-cleared sharps bin.
        </div>
      </div>
    </div>
  );

  // If modal is closed, keep sheet in DOM for background print readiness (Ctrl+P)
  if (!isOpen) {
    return (
      <div className="hidden print:block print-subq-sheet">
        {sheetContent}
      </div>
    );
  }

  // When isOpen is true, render interactive on-screen modal preview
  return (
    <div
      id="printable-subq-sheet-modal-overlay"
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md print:p-0 print:bg-white print:static print:overflow-visible animate-in fade-in duration-150 ${
        previewImageUrl ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className={`w-full max-w-[720px] my-3 sm:my-auto space-y-2 print:space-y-0 print:my-0 print:m-0 print:max-w-none ${
          previewImageUrl ? 'hidden print:block' : ''
        }`}
      >
        {/* Screen Action Bar (print:hidden) */}
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-slate-100">
              Sub-Q Injection Protocol (1-Page A4)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase">
              First-Time Guide
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
              <span>{copied ? 'Copied' : 'Copy SOP'}</span>
            </button>

            {/* SAVE AS IMAGE BUTTON */}
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              title="Save full Sub-Q injection protocol sheet as a high-resolution PNG image directly to your photos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-sm shadow-cyan-600/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Save Image'}</span>
            </button>

            {/* PRINT / PDF BUTTON */}
            <button
              onClick={handlePrint}
              title="Print Sub-Q injection guide or save as PDF"
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

      {/* --- MOBILE IMAGE PREVIEW & LONG-PRESS OVERLAY --- */}
      {previewImageUrl && (
        <div
          className="print:hidden fixed inset-0 z-[60] flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="w-full max-w-[680px] bg-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-slate-100">
                  Sub-Q Protocol Image Ready (2x Ultra-HD)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewImageUrl}
                  download="pepplotter-subq-injection-protocol.png"
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

            <p className="text-[11px] text-emerald-400 font-semibold mb-2 flex items-center gap-1">
              <span>📱 Mobile Tip: Long-press the image below and select &quot;Save to Photos&quot; or &quot;Share&quot;.</span>
            </p>

            <div className="overflow-y-auto flex-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2 flex items-center justify-center">
              <img
                src={previewImageUrl}
                alt="PepPlotter Sub-Q Protocol Sheet"
                className="max-w-full h-auto rounded shadow-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
