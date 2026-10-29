'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Check,
  Copy,
  Download,
  Share2,
  QrCode,
  ExternalLink,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { getQRCode } from '@/lib/qrcode';
import { safeCopyToClipboard } from '@/lib/calculator';
import { renderShareCardToCanvas } from '@/lib/canvasShare';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  compoundName: string;
  vialMg: number;
  waterMl: number;
  doseMcg: number;
  syringeUnits: number;
  drawVolumeMl: number;
  syringeType: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  compoundName,
  vialMg,
  waterMl,
  doseMcg,
  syringeUnits,
  drawVolumeMl,
  syringeType,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if Web Share API is available (primarily mobile devices)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [isOpen, onClose]);

  // Generate QR Code data for current live deep link
  const qrData = useMemo(() => {
    return getQRCode(shareUrl || 'https://pepplotter.com');
  }, [shareUrl]);

  if (!isOpen) return null;

  const doseDisplay =
    doseMcg >= 1000
      ? `${(doseMcg / 1000).toFixed(2).replace(/\.00$/, '')} mg`
      : `${doseMcg} mcg`;

  const handleCopyLink = () => {
    safeCopyToClipboard(shareUrl).then((ok) => {
      if (!ok) return;
      setCopiedLink(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `PepPlotter • ${compoundName} Dosing Protocol`,
          text: `Precision Reconstitution: ${compoundName} ${doseDisplay} (${syringeUnits} Units · ${drawVolumeMl} mL on ${syringeType})`,
          url: shareUrl,
        });
      } catch {
        // User dismissed or share failed
      }
    }
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      renderShareCardToCanvas(canvas, {
        shareUrl,
        compoundName,
        vialMg,
        waterMl,
        doseMcg,
        syringeUnits,
        drawVolumeMl,
        syringeType,
      });

      const pngUrl = canvas.toDataURL('image/png');
      const safeName = compoundName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `pepplotter-${safeName}-protocol.png`;

      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export share card PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-sm sm:text-base font-bold text-slate-100 leading-tight">
                Share Protocol &amp; QR Code
              </h2>
              <p className="text-[11px] text-slate-400">
                Scan or screenshot to forward live calculations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Visual Share Card (Screenshot / Forwarding Container) */}
          <div
            id="share-visual-card"
            className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl select-none"
          >
            {/* Card Top Brand */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-white tracking-tight">PepPlotter</span>
                  <span className="text-[9px] text-slate-400 block -mt-0.5">Clinical Peptide Math</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-full">
                Live Deep Link
              </span>
            </div>

            {/* Compound & Dosage Summary Strip */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 mb-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-100 truncate">{compoundName}</div>
                <div className="text-[10px] text-slate-400">
                  {vialMg} mg vial &bull; {waterMl} mL BAC water
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-[10px] text-emerald-400">
                  {doseDisplay}
                </span>
                <div className="text-[9px] font-mono text-slate-300 mt-0.5">
                  {syringeUnits} Units ({drawVolumeMl} mL)
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="p-3 bg-white rounded-xl shadow-lg border border-slate-200"
                title="Scan QR Code with camera to load live interactive tool"
              >
                <svg
                  viewBox={`0 0 ${qrData.moduleCount} ${qrData.moduleCount}`}
                  className="w-40 h-40 sm:w-44 sm:h-44 block"
                  role="img"
                  aria-label="QR Code to current live protocol"
                >
                  <rect width="100%" height="100%" fill="#ffffff" />
                  <path d={qrData.getSvgPath(1)} fill="#090d16" />
                </svg>
              </div>

              {/* Scan Guide Note */}
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Scan with phone camera to load exact formula</span>
              </div>
            </div>

            {/* Card Footer Domain */}
            <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[9px] text-slate-500">
              <span className="font-mono text-slate-400">pepplotter.com</span>
              <span>Harm-Reduction Protocol &bull; Free</span>
            </div>
          </div>

          {/* Direct URL Copy Bar */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
              Protocol URL (Live Parameters Included)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 truncate focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Save Image & Native Share */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-60 cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{isExporting ? 'Generating PNG...' : 'Save QR Card (PNG)'}</span>
            </button>

            {canShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Share via...</span>
              </button>
            )}
          </div>

          {/* Mobile Sharing Helper Note */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            💡 <strong>Quick Share Tip:</strong> You can take a screenshot or long-press the card above to share directly on WeChat, Telegram, WhatsApp, or Reddit.
          </p>
        </div>
      </div>
    </div>
  );
};
