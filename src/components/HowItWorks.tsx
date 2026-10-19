import React from 'react';
import { HelpCircle, Droplet, Target, LineChart } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full mt-14 pt-10 border-t border-slate-800/80">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 mb-3 tracking-wide uppercase">
          <HelpCircle className="w-3.5 h-3.5" />
          Step-by-Step Tutorial
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          How to Calculate Reconstitution in 3 Simple Steps
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Follow this 3-step verification process to prevent dilution miscalculations and confirm exact syringe draw targets.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 list-none p-0">
        {/* Step 1 */}
        <li className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-extrabold font-mono text-emerald-400/40">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-2">
            Input Vial Mass & BAC Water
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter the exact milligrams (mg) of lyophilized peptide powder printed on your vial label, along with the volume of Bacteriostatic (BAC) water (mL) added. The system calculates the concentration in mg/mL and mcg/mL automatically.
          </p>
        </li>

        {/* Step 2 */}
        <li className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-extrabold font-mono text-cyan-400/40">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-2">
            Set Prescribed Target Dose
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Input your target dose in micrograms (mcg) or milligrams (mg). Select your syringe type (U-100 or U-40). Our engine checks for physical limits, ensuring your requested dose does not exceed the total contents or single syringe barrel capacity.
          </p>
        </li>

        {/* Step 3 */}
        <li className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-extrabold font-mono text-amber-400/40">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LineChart className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-2">
            Verify Syringe & Plot Kinetics
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Visually verify the calculated units on the dynamic SVG syringe graphic before handling supplies. Switch to the Pharmacokinetics tab to visualize weekly blood accumulation, steady-state peaks, and the dampening effect of split-dosing schedules.
          </p>
        </li>
      </ol>
    </section>
  );
};
