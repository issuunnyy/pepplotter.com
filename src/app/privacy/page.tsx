import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PepPlotter',
  description: 'PepPlotter Privacy Policy - We do not collect, store, or transmit your peptide calculation data or personal medical information.',
  alternates: {
    canonical: 'https://pepplotter.com/privacy',
  },
};

export default function PrivacyPage() {
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
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400">Last updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              1. 100% Client-Side Architecture (Zero Data Collection)
            </h2>
            <p>
              PepPlotter operates entirely within your web browser. All calculations, numbers entered (including vial sizes, diluent volumes, target doses, and injection schedules), and pharmacokinetic simulations are computed strictly on your device using JavaScript.
            </p>
            <p className="mt-2 text-emerald-400 font-medium">
              We do NOT transmit, log, store, or sell any of your dosing data or medical research inputs to any external server or database.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              2. Cookies and Local Storage
            </h2>
            <p>
              We do not use tracking cookies for profiling or behavioral ad targeting. We may utilize standard browser `localStorage` solely to save your UI preferences (such as your chosen preset or syringe type) locally on your own computer for convenience upon revisiting.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              3. Analytics & Hosting Logs
            </h2>
            <p>
              Like most web infrastructure, our hosting provider (Cloudflare) records standard anonymous technical connection logs (such as IP address, browser user-agent, and request timestamp) for security and DDoS mitigation. These technical logs contain no personal health information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              4. External Links
            </h2>
            <p>
              Our website may contain links to external reference sites (such as scientific publications or verified medical supply vendors). We have no control over the privacy practices of external third-party websites.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              5. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding our privacy practices, please contact us at:{' '}
              <a href="mailto:support@pepplotter.com" className="text-emerald-400 hover:underline">
                support@pepplotter.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
