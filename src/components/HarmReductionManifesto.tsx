import React from 'react';
import { HeartPulse, Stethoscope, ShieldCheck, GraduationCap } from 'lucide-react';

export const HarmReductionManifesto: React.FC = () => {
  return (
    <section 
      aria-label="Harm Reduction & Public Health Trust Bar"
      className="w-full mt-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Harm Reduction &amp; Public Health Principles
          </h2>
        </div>
        <span className="text-[11px] text-emerald-400/90 font-medium italic">
          &ldquo;Natural Health First, Medical Guidance Priority, Harm Reduction Always.&rdquo;
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <strong className="text-slate-200 font-semibold text-[11px]">1. Natural Health First</strong>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Nutrition, exercise, and sleep are the irreplaceable bedrock. Peptides are never shortcuts.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <strong className="text-slate-200 font-semibold text-[11px]">2. Clinical Priority</strong>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Prescription therapies require licensed physician and laboratory monitoring whenever accessible.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <strong className="text-slate-200 font-semibold text-[11px]">3. Harm Reduction Net</strong>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Rigorous mathematical verification to eliminate catastrophic 10× home dosing errors.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <strong className="text-slate-200 font-semibold text-[11px]">4. Open Simulation</strong>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Freely available for nursing students, medical researchers, and global healthcare learners.
          </p>
        </div>
      </div>
    </section>
  );
};
