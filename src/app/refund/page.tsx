import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | PepPlotter',
  description:
    'PepPlotter Refund Policy - Understand our transparent refund terms, free access tier, and digital service guarantees.',
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs text-slate-400">Last updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              1. 100% Free Core Educational Service
            </h2>
            <p>
              PepPlotter provides its core reconstitution calculator, visual syringe drawer, and pharmacokinetic elimination curves completely free of charge as a public health harm-reduction service. You are never billed or charged to use the interactive calculator.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              2. Digital Products &amp; Future Premium Services
            </h2>
            <p>
              If you purchase any digital service, protocol export upgrade, or premium research report through PepPlotter:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>
                <strong>14-Day Money-Back Guarantee:</strong> We offer a hassle-free 14-day refund policy for all digital add-ons if you are unsatisfied with the service or encountered technical errors.
              </li>
              <li>
                <strong>Immediate Cancellation:</strong> Any recurring memberships or subscriptions can be canceled at any time with a single click from your account dashboard or by emailing our support desk.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              3. Requesting a Refund
            </h2>
            <p>
              To request a refund or raise a billing question, contact our customer support team at{' '}
              <a
                href="mailto:support@pepplotter.com"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                support@pepplotter.com
              </a>
              . Please include your order confirmation number. All eligible refund requests are processed within 2–5 business days to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              4. Third-Party Physical Supplies
            </h2>
            <p>
              PepPlotter may provide educational links to laboratory supplies (such as sterile bacteriostatic water, needles, or alcohol wipes) fulfilled by certified third-party vendors. Any returns, replacements, or refunds for physical supplies must be handled directly through the merchant where the order was placed in accordance with their respective return policies.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
