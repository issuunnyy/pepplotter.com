'use client';

import React, { useState } from 'react';
import { X, Mail, Copy, Check, Stethoscope, Sparkles, Send, ExternalLink } from 'lucide-react';

interface CustomProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompoundName?: string;
  defaultVialMg?: number;
  defaultDoseMcg?: number;
}

export const CustomProtocolModal: React.FC<CustomProtocolModalProps> = ({
  isOpen,
  onClose,
  defaultCompoundName = '',
  defaultVialMg = 5,
  defaultDoseMcg = 500,
}) => {
  const [compoundName, setCompoundName] = useState(defaultCompoundName || 'Custom Peptide / Stack');
  const [vialMg, setVialMg] = useState(defaultVialMg);
  const [doseMcg, setDoseMcg] = useState(defaultDoseMcg);
  const [frequency, setFrequency] = useState('Twice Weekly (Every 3.5 Days)');
  const [researchGoal, setResearchGoal] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const supportEmail = 'support@pepplotter.com';
  const emailSubject = encodeURIComponent(`Custom Peptide Protocol Request: ${compoundName || 'Unlisted Compound'}`);
  const emailBodyText = `Hello PepPlotter Clinical PK Team,

I am researching an unlisted peptide compound and would like assistance calibrating a verified pharmacokinetic protocol:

• Target Compound / Blend: ${compoundName}
• Vial Powder Size: ${vialMg} mg
• Planned Single Injected Dose: ${doseMcg} mcg (${(doseMcg / 1000).toFixed(2)} mg)
• Target Dosing Frequency: ${frequency}
• Researcher Email: ${userEmail || '[Not specified]'}
• Specific Research Objectives / Notes: ${researchGoal || 'Standard therapeutic accumulation calibration'}

Please advise on the verified elimination half-life, reconstitution water recipe, and steady-state concentration trajectory.

Thank you!`;

  const mailtoUrl = `mailto:${supportEmail}?subject=${emailSubject}&body=${encodeURIComponent(emailBodyText)}`;

  const handleCopyDraft = () => {
    navigator.clipboard?.writeText(emailBodyText).then(() => {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(supportEmail).then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <span>Request Custom Protocol</span>
                <span className="text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">
                  Clinical PK
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Have an unlisted peptide or blend? Our support team will calibrate your verified half-life.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Compound / Blend Name
            </label>
            <input
              type="text"
              value={compoundName}
              onChange={(e) => setCompoundName(e.target.value)}
              placeholder="e.g. CJC-1295 / Ipamorelin Blend, AOD-9604, Tesofensine"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Vial Size (mg)
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={vialMg}
                onInvalid={(e) => e.preventDefault()}
                onChange={(e) => setVialMg(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Target Single Dose (mcg)
              </label>
              <input
                type="number"
                min="10"
                step="any"
                value={doseMcg}
                onInvalid={(e) => e.preventDefault()}
                onChange={(e) => setDoseMcg(parseFloat(e.target.value) || 100)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Planned Dosing Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Daily (Every 24 Hours)">Daily (Every 24 Hours)</option>
              <option value="Every Other Day (EOD / 48 Hours)">Every Other Day (EOD / 48 Hours)</option>
              <option value="Twice Weekly (Every 3.5 Days)">Twice Weekly (Every 3.5 Days)</option>
              <option value="Weekly (Every 7 Days)">Weekly (Every 7 Days)</option>
              <option value="Pulse / Cyclic Protocol">Pulse / Cyclic Protocol (10-14 days on)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Your Contact Email (Optional)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. researcher@gmail.com (so we can reply directly)"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Research Objective / Specific Questions (Optional)
            </label>
            <textarea
              rows={2}
              value={researchGoal}
              onChange={(e) => setResearchGoal(e.target.value)}
              placeholder="e.g. Need half-life confirmation, recommended BAC water dilution, or steady-state blood level projection."
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Dual Delivery Action Row */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Primary Action: Direct Mail Client (mailto:) */}
            <a
              href={mailtoUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send via Email Client</span>
            </a>

            {/* Fallback Action: One-Click Copy Full Text (Works in Web Gmail / Any Browser) */}
            <button
              type="button"
              onClick={handleCopyDraft}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              title="Copy the entire structured inquiry to paste into webmail (Gmail, Outlook.com)"
            >
              {copiedDraft ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDraft ? 'Copied to Clipboard!' : 'Copy Inquiry Draft'}</span>
            </button>
          </div>

          {/* Guaranteed Direct Email Address with 1-Click Copy */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              Direct Support Email: <strong className="text-slate-200 font-mono">{supportEmail}</strong>
            </span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
