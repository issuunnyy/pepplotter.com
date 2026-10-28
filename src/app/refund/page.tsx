import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, HeartHandshake, CheckCircle2, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zero-Charge Guarantee & Refund Policy | PepPlotter',
  description:
    'PepPlotter Zero-Charge Guarantee & Refund Terms - 100% free public harm-reduction calculator with zero hidden fees and transparent consumer protection policies.',
  alternates: {
    canonical: 'https://pepplotter.com/refund',
  },
};

export default function RefundPage() {
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Zero-Charge Guarantee &amp; Refund Policy
            </h1>
            <p className="text-xs text-slate-400">Harm-Reduction Transparency • Last updated: October 2026</p>
          </div>
        </div>

        {/* Public Health Guarantee Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-200 block mb-1">100% Free Public Harm-Reduction Commitment</strong>
            PepPlotter operates as a free educational initiative dedicated to preventing accidental peptide dosing errors. We never bill users, never collect credit card details, and charge zero fees for our core calculators, visualizers, and protocol sync features.
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              1. 100% Free Core Educational Service (Zero Charges)
            </h2>
            <p>
              PepPlotter provides its core reconstitution calculator, interactive syringe drawer, pharmacokinetic accumulation charts, fridge sheet exports, and calendar reminder syncing completely free of charge. You will never encounter unexpected fees, subscriptions, or credit card requirements to access our clinical safety tools.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              2. Why This Policy Exists (Legal Transparency &amp; Anti-Fraud)
            </h2>
            <p>
              To comply with international consumer protection regulations, search engine quality standards (Google E-E-A-T), and payment processor compliance rules, all public digital web platforms are legally advised to publish explicit billing and refund disclosures. This policy serves as our legally binding assurance to the public that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>No recurring payments, hidden trials, or involuntary memberships are ever initiated.</li>
              <li>No personal financial or payment information is ever gathered by our core application.</li>
              <li>Any future optional donation or specialized add-on will adhere to standard 14-day refund rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              3. Future Voluntary Add-ons &amp; 14-Day Refund Terms
            </h2>
            <p>
              Should PepPlotter in the future introduce optional voluntary supporter passes or specialized laboratory data exports:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>
                <strong>14-Day Money-Back Guarantee:</strong> Any voluntary digital purchase will be covered by a 14-day no-questions-asked full refund window.
              </li>
              <li>
                <strong>Single-Click Cancellation:</strong> Supporter memberships may be terminated instantly at any time with zero retention friction.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              4. Billing Inquiries &amp; Support Contact
            </h2>
            <p>
              If you ever notice an unrecognized transaction referencing our name or have questions regarding billing integrity, please contact our administrative desk immediately at{' '}
              <a
                href="mailto:support@pepplotter.com"
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
              >
                support@pepplotter.com
              </a>
              . All inquiries are investigated and resolved within 24–48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              5. Third-Party Physical Medical &amp; Lab Supplies
            </h2>
            <p>
              PepPlotter may present educational links or vendor references to sterile bacteriostatic water, alcohol pads, or safety syringes. PepPlotter does not handle warehousing or shipping. Any returns, replacements, or refunds for physical supplies must be conducted directly through the independent licensed supplier in accordance with their respective return policies.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
