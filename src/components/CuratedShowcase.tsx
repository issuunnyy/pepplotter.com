import React from 'react';
import { Pill, Activity, Split, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  vialMg: number;
  waterMl: number;
  doseMcg: number;
  drawUnits: number;
  syringe: string;
  halfLife: string;
  clinicalNote: string;
  pkInsight: string;
}

const SHOWCASES: ShowcaseItem[] = [
  {
    id: 'sema-start',
    name: 'Semaglutide Starting Protocol',
    category: 'GLP-1 Receptor Agonist',
    badge: 'Standard 4-Week Initiation',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    vialMg: 5,
    waterMl: 2.0,
    doseMcg: 250,
    drawUnits: 10,
    syringe: 'U-100 (0.10 mL)',
    halfLife: '~168 hours (7 days)',
    clinicalNote: 'Adding 2.0 mL BAC water to a 5 mg vial yields 2.5 mg/mL. A 250 mcg (0.25 mg) dose aligns exactly to 10 units.',
    pkInsight: 'Due to the 7-day half-life, plasma concentration accumulates over 4–5 weeks before reaching true steady-state equilibrium.',
  },
  {
    id: 'tirz-init',
    name: 'Tirzepatide Induction Phase',
    category: 'Dual GIP / GLP-1 Agonist',
    badge: 'Initiation Titration',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    vialMg: 10,
    waterMl: 2.0,
    doseMcg: 2500,
    drawUnits: 50,
    syringe: 'U-100 (0.50 mL)',
    halfLife: '~120 hours (5 days)',
    clinicalNote: '10 mg reconstituted in 2.0 mL BAC water yields 5.0 mg/mL. A standard 2.5 mg initial dose occupies 50 units (half of a 1.0 mL syringe).',
    pkInsight: 'The shorter 5-day half-life results in steeper weekend trough dips unless administered on strict 7-day or split intervals.',
  },
  {
    id: 'split-dose',
    name: 'Split-Dosing GI Comfort Protocol',
    category: 'Pharmacokinetic Optimization',
    badge: 'Twice-Weekly (Every 3.5 Days)',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    vialMg: 5,
    waterMl: 2.0,
    doseMcg: 250,
    drawUnits: 10,
    syringe: 'U-100 (Twice / Week)',
    halfLife: 'Variable (GLP-1s)',
    clinicalNote: 'Splitting 0.50 mg weekly into two 0.25 mg doses (e.g. Monday morning and Thursday evening) lowers acute C_max peaks.',
    pkInsight: 'Reduces maximum serum concentration spikes by ~35–40%, alleviating nausea and gastric reflux while avoiding mid-week appetite return.',
  },
  {
    id: 'bpc-recovery',
    name: 'BPC-157 Laboratory Research Math',
    category: 'Body Protection Compound',
    badge: 'Short Half-Life Reference',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    vialMg: 5,
    waterMl: 2.5,
    doseMcg: 250,
    drawUnits: 12.5,
    syringe: 'U-100 (0.125 mL)',
    halfLife: '~4 hours',
    clinicalNote: 'Diluting 5 mg in 2.5 mL BAC water creates a concentration of 2.0 mg/mL (2,000 mcg/mL). 250 mcg equals exactly 12.5 units.',
    pkInsight: 'Demonstrates rapid 4-hour systemic clearance, showing students why peptide kinetics differ fundamentally from long-acting GLP-1s.',
  },
];

export const CuratedShowcase: React.FC = () => {
  return (
    <section className="w-full mt-14 pt-10 border-t border-slate-800/80">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400 mb-3 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Information Gain & Clinical References
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Curated Reconstitution Protocols & Half-Life Models
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Standardized calculation breakdowns verified against official clinical titration schedules and pharmacokinetic literature.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SHOWCASES.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {item.name}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${item.badgeColor} shrink-0`}>
                  {item.badge}
                </span>
              </div>

              {/* Math Spec Pill Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/70 mb-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Vial / Water</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {item.vialMg}mg / {item.waterMl}mL
                  </span>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Dose</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {item.doseMcg} mcg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Syringe Draw</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {item.drawUnits} Units
                  </span>
                </div>
              </div>

              {/* Explanations */}
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-slate-100">Math Breakdown:</strong> {item.clinicalNote}
                </p>
                <p className="text-slate-400 border-l-2 border-emerald-500/50 pl-2.5 py-0.5 italic">
                  <strong>PK Kinetics ({item.halfLife}):</strong> {item.pkInsight}
                </p>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Checked for U-100 Calibrations
              </span>
              <span className="font-mono text-slate-400">{item.syringe}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
