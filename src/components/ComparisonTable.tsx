import React from 'react';
import { Table, Check, X, ShieldAlert } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  return (
    <section className="w-full mt-14 pt-10 border-t border-slate-800/80">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-400 mb-3 tracking-wide uppercase">
          <Table className="w-3.5 h-3.5" />
          Feature Comparison
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          PepPlotter vs Traditional Reconstitution Methods
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Why healthcare trainees, researchers, and home administrators choose visual simulation over error-prone mental math.
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-4 sm:px-6">Capability / Safety Guardrail</th>
              <th className="py-4 px-3 sm:px-4 text-emerald-400 bg-emerald-500/5 font-bold">
                PepPlotter
              </th>
              <th className="py-4 px-3 sm:px-4 text-slate-400">Mental Math / Scrap Paper</th>
              <th className="py-4 px-3 sm:px-4 text-slate-400">Generic Online Calculators</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-slate-300">
            {/* Feature 1 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Visual SVG Syringe Draw Calibration (U-100 & U-40)
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Live Visual Line
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> None
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-slate-400">
                Text Number Only
              </td>
            </tr>

            {/* Feature 2 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Pharmacokinetic Blood Concentration Accumulation Curve
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Interactive Plotter
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Impossible
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Not Available
              </td>
            </tr>

            {/* Feature 3 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Overdose & Single-Syringe Capacity Blocking
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Inline Overdose & Capacity Blocking
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> High Human Error Risk
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Shows Deadly Values
              </td>
            </tr>

            {/* Feature 4 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Twice-Weekly Split-Dosing Serum Simulator
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1-Click Peak/Trough Map
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Guesswork
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Unsupported
              </td>
            </tr>

            {/* Feature 5 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Mobile Injection Reminders (.ICS / Google Calendar)
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Instant Sync
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-slate-400">Manual Entry</td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Rare
              </td>
            </tr>

            {/* Feature 6 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Harm-Reduction Stance & Medical Safety Guidance
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Core Philosophy
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-slate-400">N/A</td>
              <td className="py-3.5 px-3 sm:px-4 text-rose-400">
                <X className="w-4 h-4 text-rose-400 shrink-0 inline mr-1" /> Grey-market Affiliate Ads
              </td>
            </tr>

            {/* Feature 7 */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-200">
                Client-Side Privacy (Zero Dosing-Data Logs / No Login Required)
              </td>
              <td className="py-3.5 px-3 sm:px-4 bg-emerald-500/5 text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 100% In-Browser (Zero Dosing-Data Logs)
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-slate-300">Private (Paper)</td>
              <td className="py-3.5 px-3 sm:px-4 text-amber-400">Often Logs IP / Trackers</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
