import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, HeartPulse } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical & Harm Reduction Disclaimer | PepPlotter',
  description: 'PepPlotter Medical & Harm Reduction Disclaimer - Educational simulation tool, not medical advice.',
  alternates: {
    canonical: 'https://pepplotter.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6">
      <main className="w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Calculator
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Medical & Harm Reduction Disclaimer
            </h1>
            <p className="text-xs text-slate-400">Essential regulatory and public health notice</p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <strong className="block text-sm font-bold text-amber-300 mb-1">
              NOT MEDICAL ADVICE
            </strong>
            The contents of PepPlotter, including all mathematical calculations, syringe drawings, pharmacokinetic concentration curves, and guides, are intended strictly for educational, informational, and harm-reduction purposes.
          </div>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              1. No Doctor-Patient Relationship
            </h2>
            <p>
              Your use of PepPlotter does not establish a doctor-patient, healthcare provider, or pharmacist relationship of any kind. This website does not prescribe medications, recommend specific treatments, or diagnose conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              2. Always Seek Professional Medical Care First
            </h2>
            <p>
              If you have access to healthcare facilities, we strongly advocate consulting a licensed physician, endocrinologist, or nurse practitioner before administering any injectable pharmaceutical or research peptide. Professional clinical laboratory monitoring, safe titration, and medical supervision are the gold standard of care.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              3. Our Harm Reduction Philosophy
            </h2>
            <p>
              We recognize that across many regions, healthcare deserts, specialist shortages, and protracted appointment backlogs leave individuals attempting home administration of prescribed therapies without adequate support. In such circumstances, arithmetic errors—especially between U-100 and U-40 syringe calibrations—can lead to life-threatening overdoses. PepPlotter exists as a harm-reduction calculator to prevent mathematical miscalculations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              4. Emergency Notice
            </h2>
            <p>
              If you suspect you have administered an overdose, or if you experience signs of severe hypoglycemia (dizziness, fainting, extreme confusion), anaphylaxis, or acute gastrointestinal distress, call your local emergency medical service (911 in the US/Canada, 112 in Europe, 999 in the UK) immediately.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
