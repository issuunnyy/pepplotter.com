import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, ShieldCheck, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peptide Reconstitution Calculator | PepPlotter',
  description:
    'Free peptide reconstitution calculator. Turn vial mg and water mL into an exact U-100 unit mark — no scrap-paper math, no 10x errors.',
  alternates: {
    canonical: 'https://pepplotter.com/reconstitution-calculator',
  },
};

export default function ReconstitutionCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6">
      <main className="w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Interactive Calculator
        </Link>

        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Peptide Reconstitution Calculator
            </h1>
            <p className="text-xs text-slate-400">Clinical Math &amp; Syringe Tick Precision • Harm-Reduction Standard</p>
          </div>
        </div>

        {/* Lead In Context */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <p>
              Reconstitution is the critical step where a freeze-dried (lyophilized) peptide vial becomes an injectable liquid solution: you add bacteriostatic water, and then every subsequent dose depends on one single division.
            </p>
            <p>
              Get the decimal wrong and an intended <strong>250 mcg</strong> starter dose instantly turns into an accidental <strong>2,500 mcg</strong> overdose. This calculator exists so that specific, dangerous calculation error is virtually impossible to make.
            </p>
          </section>

          {/* The Formula Callout */}
          <section className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Universal Reconstitution Mathematical Formula</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-center text-emerald-300 font-bold text-xs sm:text-sm">
              Syringe Units = [ Target Dose (mcg) ÷ Concentration (mcg/mL) ] × 100
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-center text-cyan-300 font-bold text-xs sm:text-sm">
              Concentration (mcg/mL) = [ Vial Amount (mg) × 1,000 ] ÷ Water Added (mL)
            </div>
          </section>

          {/* Worked Example */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Worked Calculation Example
            </h2>
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-slate-300">
              <p>
                Suppose you have a <strong>5 mg vial</strong> of peptide powder and gently add <strong>2.0 mL</strong> of bacteriostatic water:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 font-mono text-xs">
                <li>Concentration = (5 mg × 1,000) ÷ 2.0 mL = <strong>2,500 mcg/mL</strong> (2.5 mg/mL).</li>
                <li>Target Dose = <strong>250 mcg</strong> (0.25 mg).</li>
                <li>Calculation = (250 ÷ 2,500) × 100 = <strong className="text-emerald-300 font-bold">10 units on a U-100 syringe</strong> (0.10 mL).</li>
              </ul>
            </div>
          </section>

          {/* Dose Matrix Excerpt */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Dose Matrix Excerpt (250 mcg Target)
            </h2>
            <p className="text-xs text-slate-400">
              Reference dilutions for a standard 250 mcg starter dose across common vial configurations:
            </p>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="p-3">Vial</th>
                    <th className="p-3">Water</th>
                    <th className="p-3">Concentration</th>
                    <th className="p-3 text-emerald-400">Draw (U-100)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-100">5 mg</td>
                    <td className="p-3 text-slate-300">2.0 mL</td>
                    <td className="p-3 text-slate-300">2.5 mg/mL</td>
                    <td className="p-3 font-bold text-emerald-400">10 units</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 bg-emerald-950/10">
                    <td className="p-3 font-bold text-slate-100">10 mg</td>
                    <td className="p-3 text-slate-300">1.0 mL</td>
                    <td className="p-3 text-slate-300">10 mg/mL</td>
                    <td className="p-3 font-bold text-emerald-400">2.5 units</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-100">10 mg</td>
                    <td className="p-3 text-slate-300">2.0 mL</td>
                    <td className="p-3 text-slate-300">5.0 mg/mL</td>
                    <td className="p-3 font-bold text-emerald-400">5 units</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Full multi-ratio matrix (5 / 10 / 15 mg × 1 / 2 / 3 mL) lives interactively on the main calculator.
            </p>
          </section>

          {/* How to Read a U-100 Syringe */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              How to Read a U-100 Syringe
            </h2>
            <p>
              A standard U-100 insulin syringe holds <strong>100 units = 1.0 mL</strong>. Each small graduation mark represents exactly 1 unit (0.01 mL). The PepPlotter live SVG visualizer highlights your exact target tick mark in real time with high-visibility color fills so you never have to count ticks by eye under dim bathroom lights.
            </p>
          </section>

          {/* Built-in Safety Checks */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Built-in Safety Checks
            </h2>
            <p>
              The calculator enforces hard mathematical barriers against two primary failure modes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Syringe Barrel Over-Capacity:</strong> Prevents requests where required liquid volume exceeds syringe capacity (e.g., &gt;100 units).</li>
              <li><strong>Extreme Input Range Blocking:</strong> Intercepts impossible concentration inputs. A blocked calculation is not a suggestion to round up—it is an unconditional clinical stop sign.</li>
            </ul>
          </section>

          {/* Cross Links to Tool and Visual Guide */}
          <section className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/#guide"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>4-Stage Clinical Photographic Guide &rarr;</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Launch Interactive Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Harm Reduction Stance */}
          <section className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <strong className="text-slate-300 block">Our Harm-Reduction Position:</strong>
            <p>
              Health by effort first. Guidance by licensed professionals second. Precision math when you must—this tool is the last resort, not the first step. It provides no dosing recommendations and no individual medical advice; it only performs pure arithmetic, entirely within your browser, with zero accounts and zero tracking.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
