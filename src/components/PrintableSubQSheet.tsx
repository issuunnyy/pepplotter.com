'use client';

import React, { useState, useRef, useMemo } from 'react';
import { getQRCode } from '@/lib/qrcode';
import { renderSubQToCanvas } from '@/lib/canvasSubQ';
import { Printer, X, Download, Copy, Check } from 'lucide-react';

interface PrintableSubQSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
  compoundName?: string;
  syringeUnits?: number;
  drawVolumeMl?: number;
  syringeType?: string;
}

interface SubQStageItem {
  num: string;
  title: string;
  subtitle: string;
  photoSrc: string;
  points: string[];
  doRule: string;
  dontRule: string;
}

const SUBQ_STAGES_DATA: SubQStageItem[] = [
  {
    num: '01',
    title: 'Aseptic Supplies Setup',
    subtitle: 'Gather sterile supplies on clean surface and warm refrigerated solution to room temperature.',
    photoSrc: '/guide/step1-photo.jpg',
    points: [
      'Vial Acclimation: 5–10 min room temp to prevent sting',
      'Syringe: 31G ultra-fine single-use sterile syringe',
      'Antisepsis: 2 separate 70% isopropyl alcohol prep pads',
    ],
    doRule: 'Allow vial to reach room temperature before drawing liquid.',
    dontRule: 'Never microwave, freeze, or shake peptide vials vigorously.',
  },
  {
    num: '02',
    title: 'Site Selection & Cleansing',
    subtitle: 'Select lower abdomen (≥2" from navel) or outer thigh; allow alcohol to air-dry 15 seconds.',
    photoSrc: '/guide/step2-photo.jpg',
    points: [
      'Site Selection: Lower abdomen or outer thigh fat fold',
      'Cleanse: Spiral outward from center with alcohol pad',
      'Evaporation: Full 15s air-dry until skin turns matte',
    ],
    doRule: 'Wait 15s for alcohol to air-dry completely before puncture.',
    dontRule: 'Never fan, wipe dry, or blow breath onto sterilized skin.',
  },
  {
    num: '03',
    title: 'Precision Medication Draw',
    subtitle: 'Invert vial vertically 180°, submerge needle tip in liquid pool, and align plunger to exact mark.',
    photoSrc: '/guide/step3-photo.jpg',
    points: [
      'Air Equalization: Inject room air equal to dose volume',
      'Inversion: Hold vial 180° vertical to keep needle tip submerged',
      'Plunger Alignment: Align top ring of black plunger to target mark',
    ],
    doRule: 'Flick syringe barrel gently to dislodge micro air bubbles.',
    dontRule: 'Never draw medication while vial is sitting upright on a table.',
  },
  {
    num: '04',
    title: '90° Injection & 10s Dwell',
    subtitle: 'Pinch 2-inch skin fold, insert at 90°, depress smoothly, and hold 10 seconds before withdrawal.',
    photoSrc: '/guide/step4-photo.jpg',
    points: [
      'Grip & Angle: Gentle 2-inch fold, insert at 90° like a dart',
      'Smooth Plunger: Depress plunger steadily without hesitating',
      '10s Dwell: Hold needle in place 10 seconds to stop backflow',
    ],
    doRule: 'Maintain 10-second needle dwell to ensure full depot absorption.',
    dontRule: 'Never rub, massage, or apply direct heat to the injection site.',
  },
];

export const PrintableSubQSheet: React.FC<PrintableSubQSheetProps> = ({
  isOpen = false,
  onClose,
  compoundName = 'Semaglutide',
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
        // Fallback for mobile in-app browsers
      }
    } catch (err) {
      console.error('Sub-Q Canvas export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = () => {
    const summary = `💉 PepPlotter Sub-Q Injection Protocol (Patient Guide)
• Medication: ${compoundName}
• Target Dose: ${syringeUnits} Units (${drawVolumeMl} mL on ${syringeType})
• Step 1: Aseptic Supplies Setup - Gather sterile supplies, acclimate vial to room temp, inspect 31G syringe.
• Step 2: Site Selection & Cleansing - Lower abdomen or outer thigh, spiral outward, wait full 15s to air-dry matte.
• Step 3: Precision Medication Draw - Equal room air in, invert vial vertically 180°, flick microbubbles, align plunger.
• Step 4: 90° Injection & 10s Dwell - Pinch 2" fold, insert at 90°, depress steadily, hold 10s dwell before withdrawal.
• Live visual guide: https://pepplotter.com/#guide`;

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
      className="bg-white text-slate-900 p-2.5 sm:p-5 rounded-xl shadow-2xl border border-slate-300 print:border print:border-slate-300 print:shadow-none print:rounded-lg print:p-4 select-none text-[10px] leading-tight w-full max-w-[700px] mx-auto print:max-w-none"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. DOCUMENT HEADER (Responsive on Mobile, Single Row on Desktop/Print) */}
      <div className="border-b-2 border-slate-900 pb-1.5 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4">
          {/* Left Title Area */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-sm font-black tracking-tight text-slate-950 uppercase whitespace-nowrap">
                PEPPLOTTER • SUB-Q INJECTION PROTOCOL
              </span>
              <span className="px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded shrink-0">
                ADA / FITTER S.O.P.
              </span>
            </div>
            <p className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5 leading-snug">
              Evidence-Based Sub-Q Protocol: Aseptic Prep, 45°–90° Pinch, &amp; Safe Sharps Disposal
            </p>
          </div>

          {/* Right Header Area: QR Code + Date & Domain */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {/* QR Code */}
            <div className="flex items-center gap-1.5 sm:flex-col sm:gap-0">
              <div
                className="p-0.5 bg-white border border-slate-300 rounded shadow-2xs"
                title="Scan QR Code with phone to open interactive guide at pepplotter.com/#guide"
              >
                <svg
                  viewBox={`0 0 ${qrCodeData.moduleCount} ${qrCodeData.moduleCount}`}
                  className="w-7 h-7 sm:w-8.5 sm:h-8.5 block"
                  role="img"
                  aria-label="QR Code to pepplotter.com/#guide"
                >
                  <rect width="100%" height="100%" fill="#ffffff" />
                  <path d={qrCodeData.getSvgPath(1)} fill="#090d16" />
                </svg>
              </div>
              <span className="text-[6.5px] uppercase font-bold text-slate-500 tracking-wider sm:mt-0.5 leading-none">
                Scan Guide
              </span>
            </div>

            {/* Date & Domain */}
            <div className="text-right">
              <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-slate-800 block">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[7.5px] sm:text-[8px] text-slate-700 font-bold block leading-tight">
                pepplotter.com
              </span>
              <span className="text-[6.5px] sm:text-[7px] text-emerald-700 font-bold uppercase tracking-wider block leading-tight">
                CLINICAL GUIDE • FREE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TARGET DOSE SPECIFICATION STRIP */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 mb-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 text-[9px]">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500 font-bold uppercase tracking-wide">MEDICATION:</span>
          <span className="text-slate-950 font-black text-[10px]">{compoundName}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono whitespace-nowrap">
          <span className="text-slate-500 font-bold uppercase tracking-wide">TARGET DOSE:</span>
          <span className="text-slate-950 font-bold text-[10px]">
            {syringeUnits} Units ({drawVolumeMl} mL on {syringeType})
          </span>
        </div>
      </div>

      {/* 3. 4 STAGE CARDS WITH CLINICAL PHOTOS (Exact Reference Design, Horizontal on all screens) */}
      <div className="space-y-2 mb-2">
        {SUBQ_STAGES_DATA.map((stage) => (
          <div
            key={stage.num}
            className="border border-slate-200/90 rounded-xl p-2 sm:p-2.5 bg-slate-50/50 flex flex-row gap-2.5 sm:gap-3 items-center"
          >
            {/* Left Column: Photo Thumbnail with STEP badge */}
            <div className="relative w-20 h-16 sm:w-28 sm:h-20 md:w-32 md:h-22 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={stage.photoSrc}
                alt={stage.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <span className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-slate-950/85 text-emerald-400 font-mono font-bold text-[6.5px] sm:text-[7.5px] uppercase tracking-wider shadow-sm">
                STEP {stage.num}
              </span>
            </div>

            {/* Right Column: Title, Subtitle, 3 Bullets, DO & DON'T */}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-slate-950 text-[10px] sm:text-[11.5px] leading-tight">
                {stage.num}. {stage.title}
              </div>
              <p className="text-[7.5px] sm:text-[8.5px] text-slate-500 mt-0.5 mb-1 leading-snug">
                {stage.subtitle}
              </p>

              {/* 3 Bullet points */}
              <div className="space-y-0.5 mb-1 text-[7.5px] sm:text-[8.5px] text-slate-700 leading-tight">
                {stage.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* DO & DON'T Rules */}
              <div className="text-[7.5px] sm:text-[8.5px] leading-tight space-y-0.5">
                <div className="text-emerald-700 font-bold flex items-start gap-1">
                  <span className="shrink-0">✓ DO:</span>
                  <span>{stage.doRule}</span>
                </div>
                <div className="text-rose-600 font-bold flex items-start gap-1">
                  <span className="shrink-0">✕ DON&apos;T:</span>
                  <span>{stage.dontRule}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. FOOTER & CLINICAL COMPLIANCE */}
      <div className="border-t border-slate-200 pt-1.5 text-[7px] text-slate-500 leading-normal">
        <div>
          PepPlotter.com • Harm-reduction clinical protocol based on FITTER and ADA subcutaneous injection guidelines.
        </div>
        <div className="text-slate-400 mt-0.5">
          For educational and personal logging only. Not medical prescription advice. Always dispose needles in an FDA-cleared sharps container.
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
