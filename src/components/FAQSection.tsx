'use client';

import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { FAQS } from '@/lib/faqs';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full mt-14 pt-10 border-t border-slate-800/80">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 mb-3 tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          Verified Answers
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Frequently Asked Questions (FAQ)
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Clear, definitive answers to the most common questions regarding peptide reconstitution, syringe math, and pharmacokinetics.
        </p>
      </div>

      <div className="space-y-3 max-w-4xl mx-auto">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden transition-colors hover:border-slate-700"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-200 hover:text-emerald-300 transition-colors"
                aria-expanded={isOpen}
              >
                <h3 className="text-sm font-semibold text-slate-200 hover:text-emerald-300 m-0 p-0 text-left">
                  {item.question}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
