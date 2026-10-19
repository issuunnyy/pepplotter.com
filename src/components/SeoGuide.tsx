'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown } from 'lucide-react';

export const SeoGuide: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleSection = (id: number) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <article className="w-full mt-14 pt-10 border-t border-slate-800/80 text-slate-300">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 mb-3 tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          Comprehensive Educational Guide
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          The Definitive Clinical Guide to Peptide Reconstitution &amp; Pharmacokinetics
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          An authoritative reference on dilution mathematical formulas, insulin syringe calibrations, elimination half-lives, and harm-reduction protocols.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Section 1 */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-colors hover:border-slate-700">
          <button
            onClick={() => toggleSection(1)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSections[1]}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono">01.</span>
              The Fundamental Reconstitution Formula
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-transform duration-200 shrink-0 ${
                openSections[1] ? 'rotate-180 text-emerald-400' : ''
              }`}
            />
          </button>
          
          <div className={openSections[1] ? 'mt-4 pt-4 border-t border-slate-800/60 block text-xs sm:text-sm' : 'hidden'}>
            <p className="mb-4 text-slate-300">
              Peptide compounds are synthesized and lyophilized (freeze-dried) into a fragile powder cake to ensure chemical stability during transport. Before subcutaneous or intramuscular administration, this powder must be reconstituted with an appropriate sterile solvent—most commonly Bacteriostatic Water containing 0.9% benzyl alcohol. Calculating the resulting solution concentration is governed by straightforward volumetric physics:
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-emerald-300 text-xs sm:text-sm my-4">
              <div className="font-semibold text-slate-400 mb-1">Concentration Formula:</div>
              Concentration (mg/mL) = Vial Mass (mg) ÷ BAC Water Volume (mL)
              <div className="font-semibold text-slate-400 mt-3 mb-1">Required Draw Volume:</div>
              Draw Volume (mL) = Target Dose (mg) ÷ Concentration (mg/mL)
              <div className="font-semibold text-slate-400 mt-3 mb-1">Syringe Units (U-100 Syringe):</div>
              Syringe Units = Draw Volume (mL) × 100
            </div>
            <p className="text-slate-400">
              For example, if a researcher reconstitutes a <strong>5 mg vial</strong> of Semaglutide with <strong>2.0 mL</strong> of bacteriostatic water, the concentration becomes exactly <strong>2.5 mg/mL</strong> (equivalent to 2,500 mcg/mL). To deliver a standard clinical starting dose of <strong>250 mcg (0.25 mg)</strong>, the required volume is 0.25 mg ÷ 2.5 mg/mL = <strong>0.10 mL</strong>. On a standard U-100 insulin syringe, 0.10 mL corresponds to exactly <strong>10 units</strong>.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-colors hover:border-slate-700">
          <button
            onClick={() => toggleSection(2)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSections[2]}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <span className="text-cyan-400 font-mono">02.</span>
              Insulin Syringe Calibrations: U-100 vs. U-40 Pitfalls
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 shrink-0 ${
                openSections[2] ? 'rotate-180 text-cyan-400' : ''
              }`}
            />
          </button>

          <div className={openSections[2] ? 'mt-4 pt-4 border-t border-slate-800/60 block text-xs sm:text-sm' : 'hidden'}>
            <p className="mb-4 text-slate-300">
              One of the most dangerous and frequent sources of dosing errors in home peptide administration is confusion over syringe calibrations. Insulin syringes are manufactured to match specific insulin concentrations, predominantly U-100 and U-40:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400 mb-1">U-100 Syringes (Human Standard)</h4>
                <p className="text-xs text-slate-400">
                  Calibrated for solutions with 100 units per 1.0 mL. Therefore, <strong>1 unit = 0.01 mL</strong>. A 100-unit syringe holds 1.0 mL; a 50-unit syringe holds 0.5 mL; a 30-unit syringe holds 0.3 mL. This is the universal standard for peptide reconstitution protocols worldwide.
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-amber-400 mb-1">U-40 Syringes (Veterinary Standard)</h4>
                <p className="text-xs text-slate-400">
                  Calibrated for veterinary insulins with 40 units per 1.0 mL. Therefore, <strong>1 unit = 0.025 mL</strong>. Drawing a peptide solution to the 10-unit line on a U-40 syringe delivers 0.25 mL—which represents a catastrophic <strong>250% (2.5×) overdose</strong> compared to a U-100 syringe.
                </p>
              </div>
            </div>
            <p className="text-slate-400">
              PepPlotter enforces strict syringe calibration toggling. If using a U-40 veterinary syringe, the system automatically recalculates unit lines to prevent dangerous accidental volume multiplication.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-colors hover:border-slate-700">
          <button
            onClick={() => toggleSection(3)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSections[3]}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <span className="text-amber-400 font-mono">03.</span>
              Pharmacokinetics: Elimination Half-Life &amp; Steady-State Accumulation
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-transform duration-200 shrink-0 ${
                openSections[3] ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </button>

          <div className={openSections[3] ? 'mt-4 pt-4 border-t border-slate-800/60 block text-xs sm:text-sm' : 'hidden'}>
            <p className="mb-4 text-slate-300">
              Administering a medication is not an isolated event; it triggers a dynamic biological curve governed by absorption, distribution, metabolism, and excretion (ADME). The elimination half-life (t<sub>1/2</sub>) represents the time required for plasma serum concentration to decrease by 50% through metabolic clearance.
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm my-4 space-y-2">
              <p className="text-slate-300">
                <strong>The 5 Half-Life Rule:</strong> In clinical pharmacokinetics, when a drug is administered repeatedly at intervals equal to or shorter than its half-life, drug molecules accumulate until the rate of administration equals the rate of elimination. This steady-state equilibrium is mathematically achieved after approximately <strong>4 to 5 elimination half-lives</strong>.
              </p>
              <ul className="list-disc pl-5 text-slate-400 space-y-1 mt-2">
                <li><strong>Semaglutide (Ozempic / Wegovy):</strong> Half-life ~7 days (168 hours). Steady-state plasma concentration is reached after 4 to 5 weeks of continuous once-weekly injections. This explains why clinical titration schedules mandate 4-week dose escalation intervals.</li>
                <li><strong>Tirzepatide (Mounjaro / Zepbound):</strong> Half-life ~5 days (120 hours). Accumulates over ~25 days, with steeper clearance troughs preceding subsequent doses.</li>
                <li><strong>Retatrutide (Triple-G Agonist):</strong> Half-life ~6 days (144 hours), requiring similar 4-week titration intervals in clinical trial protocols.</li>
              </ul>
            </div>
            <p className="text-slate-400">
              PepPlotter&apos;s Pharmacokinetic Plotter utilizes a superposition exponential decay algorithm to plot real-time blood accumulation curves, helping users visualize peak concentrations and prevent premature dosage escalations.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-colors hover:border-slate-700">
          <button
            onClick={() => toggleSection(4)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSections[4]}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <span className="text-indigo-400 font-mono">04.</span>
              The Clinical Rationale for Split-Dosing (3.5-Day Schedule)
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-transform duration-200 shrink-0 ${
                openSections[4] ? 'rotate-180 text-indigo-400' : ''
              }`}
            />
          </button>

          <div className={openSections[4] ? 'mt-4 pt-4 border-t border-slate-800/60 block text-xs sm:text-sm' : 'hidden'}>
            <p className="mb-4 text-slate-300">
              In standard clinical protocols, long-acting GLP-1 receptor agonists are prescribed as once-weekly injections for convenience. However, a once-weekly bolus generates a sharp concentration peak (C<sub>max</sub>) approximately 24 to 48 hours post-injection, often precipitating severe gastrointestinal adverse reactions such as acute nausea, acid reflux, vomiting, and fatigue.
            </p>
            <p className="mb-4 text-slate-300">
              <strong>Split-dosing</strong> divides the total weekly milligram dose into two equal administrations separated by 3.5 days (for example, Monday morning and Thursday evening). By halving each bolus:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block text-sm">~35–40% Lower Peak</span>
                <span className="text-[11px] text-slate-400">Dampens acute gastrointestinal side effects</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold block text-sm">Elevated Trough</span>
                <span className="text-[11px] text-slate-400">Prevents mid-week &amp; weekend rebound hunger</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm">Identical AUC</span>
                <span className="text-[11px] text-slate-400">Maintains exact weekly metabolic exposure</span>
              </div>
            </div>
            <p className="text-slate-400">
              Our Split-Dose toggle enables users to simulate this dampening effect dynamically, comparing once-weekly serum volatility against smooth twice-weekly steady-state profiles.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-colors hover:border-slate-700">
          <button
            onClick={() => toggleSection(5)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSections[5]}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <span className="text-rose-400 font-mono">05.</span>
              Sterile Technique, Bacteriostatic Water, and Cold Chain Storage
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-transform duration-200 shrink-0 ${
                openSections[5] ? 'rotate-180 text-rose-400' : ''
              }`}
            />
          </button>

          <div className={openSections[5] ? 'mt-4 pt-4 border-t border-slate-800/60 block text-xs sm:text-sm' : 'hidden'}>
            <p className="mb-4 text-slate-300">
              Maintaining microbiological sterility and chemical integrity during the reconstitution process is essential to prevent severe abscesses, bacterial infections, and peptide degradation:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Bacteriostatic Water vs Sterile Water:</strong> Plain sterile water contains no antimicrobial preservative and must be discarded within 24 hours of opening. Bacteriostatic water contains 0.9% benzyl alcohol, which inhibits bacterial growth, allowing multi-dose use for up to 28 days when refrigerated.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Gentle Solvent Introduction:</strong> When reconstituting, aim the needle against the inner glass wall of the vial. Allow the diluent to trickle down slowly. Never spray liquid directly onto the powder cake, and <em>never vigorously shake the vial</em>. Peptides possess fragile tertiary protein structures; aggressive agitation causes shear stress and denatures the compound. Swirl gently until dissolved.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cold Chain Refrigeration:</strong> Lyophilized powder in sealed vials may remain stable at controlled room temperature for limited periods, but once reconstituted with BAC water, vials must immediately be stored in a refrigerator at <strong>2°C to 8°C (36°F to 46°F)</strong>. Do not freeze reconstituted peptide liquid, as ice crystallization shears peptide chains.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
};
