'use client';

import React, { useState } from 'react';
import { Table, Sparkles, HelpCircle, Check, ArrowRight } from 'lucide-react';

interface MatrixRow {
  vialMg: number;
  waterMl: number;
  concentrationMgMl: number;
  concentrationMcgMl: number;
  doseMcg: number;
  doseMg: number;
  u100Units: number;
  drawMl: number;
  isCommon?: boolean;
  notes?: string;
}

const MATRIX_DATA: MatrixRow[] = [
  // 5mg Vial + 1mL BAC Water
  { vialMg: 5, waterMl: 1.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 100, doseMg: 0.1, u100Units: 2, drawMl: 0.02 },
  { vialMg: 5, waterMl: 1.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 250, doseMg: 0.25, u100Units: 5, drawMl: 0.05 },
  { vialMg: 5, waterMl: 1.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 500, doseMg: 0.5, u100Units: 10, drawMl: 0.10 },
  { vialMg: 5, waterMl: 1.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 1000, doseMg: 1.0, u100Units: 20, drawMl: 0.20 },
  { vialMg: 5, waterMl: 1.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 2500, doseMg: 2.5, u100Units: 50, drawMl: 0.50 },

  // 5mg Vial + 2mL BAC Water (Industry Standard Starter)
  { vialMg: 5, waterMl: 2.0, concentrationMgMl: 2.5, concentrationMcgMl: 2500, doseMcg: 100, doseMg: 0.1, u100Units: 4, drawMl: 0.04 },
  { vialMg: 5, waterMl: 2.0, concentrationMgMl: 2.5, concentrationMcgMl: 2500, doseMcg: 250, doseMg: 0.25, u100Units: 10, drawMl: 0.10, isCommon: true, notes: 'Starter Dose' },
  { vialMg: 5, waterMl: 2.0, concentrationMgMl: 2.5, concentrationMcgMl: 2500, doseMcg: 500, doseMg: 0.5, u100Units: 20, drawMl: 0.20, isCommon: true, notes: 'Step-up Dose' },
  { vialMg: 5, waterMl: 2.0, concentrationMgMl: 2.5, concentrationMcgMl: 2500, doseMcg: 1000, doseMg: 1.0, u100Units: 40, drawMl: 0.40 },
  { vialMg: 5, waterMl: 2.0, concentrationMgMl: 2.5, concentrationMcgMl: 2500, doseMcg: 2500, doseMg: 2.5, u100Units: 100, drawMl: 1.00 },

  // 10mg Vial + 1mL BAC Water
  { vialMg: 10, waterMl: 1.0, concentrationMgMl: 10.0, concentrationMcgMl: 10000, doseMcg: 250, doseMg: 0.25, u100Units: 2.5, drawMl: 0.025 },
  { vialMg: 10, waterMl: 1.0, concentrationMgMl: 10.0, concentrationMcgMl: 10000, doseMcg: 500, doseMg: 0.5, u100Units: 5, drawMl: 0.05 },
  { vialMg: 10, waterMl: 1.0, concentrationMgMl: 10.0, concentrationMcgMl: 10000, doseMcg: 1000, doseMg: 1.0, u100Units: 10, drawMl: 0.10 },
  { vialMg: 10, waterMl: 1.0, concentrationMgMl: 10.0, concentrationMcgMl: 10000, doseMcg: 2500, doseMg: 2.5, u100Units: 25, drawMl: 0.25, isCommon: true, notes: 'Standard Maintenance' },
  { vialMg: 10, waterMl: 1.0, concentrationMgMl: 10.0, concentrationMcgMl: 10000, doseMcg: 5000, doseMg: 5.0, u100Units: 50, drawMl: 0.50 },

  // 10mg Vial + 2mL BAC Water (Popular Precision Mix)
  { vialMg: 10, waterMl: 2.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 250, doseMg: 0.25, u100Units: 5, drawMl: 0.05 },
  { vialMg: 10, waterMl: 2.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 500, doseMg: 0.5, u100Units: 10, drawMl: 0.10 },
  { vialMg: 10, waterMl: 2.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 1000, doseMg: 1.0, u100Units: 20, drawMl: 0.20 },
  { vialMg: 10, waterMl: 2.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 2500, doseMg: 2.5, u100Units: 50, drawMl: 0.50, isCommon: true, notes: 'Tirzepatide Starter' },
  { vialMg: 10, waterMl: 2.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 5000, doseMg: 5.0, u100Units: 100, drawMl: 1.00 },

  // 15mg Vial + 3mL BAC Water
  { vialMg: 15, waterMl: 3.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 500, doseMg: 0.5, u100Units: 10, drawMl: 0.10 },
  { vialMg: 15, waterMl: 3.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 1000, doseMg: 1.0, u100Units: 20, drawMl: 0.20 },
  { vialMg: 15, waterMl: 3.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 2500, doseMg: 2.5, u100Units: 50, drawMl: 0.50, isCommon: true, notes: 'Standard Ratio' },
  { vialMg: 15, waterMl: 3.0, concentrationMgMl: 5.0, concentrationMcgMl: 5000, doseMcg: 5000, doseMg: 5.0, u100Units: 100, drawMl: 1.00 },
];

export const ReconstitutionMatrix: React.FC = () => {
  const [filterVial, setFilterVial] = useState<number | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const filteredRows = filterVial === 'all' 
    ? MATRIX_DATA 
    : MATRIX_DATA.filter((r) => r.vialMg === filterVial);

  return (
    <section 
      id="reference-matrix" 
      className="w-full mt-14 pt-10 border-t border-slate-800/80"
      aria-label="Reconstitution Reference Matrix Table"
    >
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400 mb-3 tracking-wide uppercase">
          <Table className="w-3.5 h-3.5" />
          <span>Clinical Dosing Reference Matrix</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Peptide Reconstitution <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Reference Matrix</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Standardized clinical dilution ratios for 5mg, 10mg, and 15mg peptide vials mixed with 1mL, 2mL, or 3mL of Bacteriostatic Water. Optimized for U-100 (100 units = 1.0 mL) insulin syringes.
        </p>

        {/* Mathematical Formula Callout Box for Featured Snippets */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 w-full max-w-2xl text-left shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
            <span>UNIVERSAL RECONSTITUTION FORMULA:</span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">U-100 SYRINGE</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-center text-emerald-300 font-bold text-xs sm:text-sm tracking-wide">
            Syringe Units = [ Target Dose (mcg) ÷ Concentration (mcg/mL) ] × 100
          </div>
          <p className="text-[11px] text-slate-400 mt-2 mb-0">
            Where: <strong>Concentration (mcg/mL)</strong> = [ Vial Milligrams (mg) ÷ BAC Water (mL) ] × 1,000.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-xs text-slate-400 font-medium mr-1">Filter by Vial:</span>
        <button
          onClick={() => setFilterVial('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            filterVial === 'all'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Sizes
        </button>
        {[5, 10, 15].map((val) => (
          <button
            key={val}
            onClick={() => setFilterVial(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterVial === val
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {val}mg Vials
          </button>
        ))}
      </div>

      {/* Semantic HTML Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl max-w-5xl mx-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm" aria-label="Peptide Reconstitution Ratio Matrix">
          <caption className="sr-only">
            Peptide Reconstitution Reference Matrix covering 5mg, 10mg, 15mg vials diluted with BAC water
          </caption>
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              <th scope="col" className="p-3 sm:p-4 font-bold text-slate-200">Vial Powder</th>
              <th scope="col" className="p-3 sm:p-4 font-bold text-slate-200">BAC Water</th>
              <th scope="col" className="p-3 sm:p-4 font-bold text-slate-200">Concentration</th>
              <th scope="col" className="p-3 sm:p-4 font-bold text-slate-200">Target Dose</th>
              <th scope="col" className="p-3 sm:p-4 font-bold text-emerald-400">U-100 Units</th>
              <th scope="col" className="p-3 sm:p-4 font-bold text-slate-200">Draw Volume</th>
              <th scope="col" className="p-3 sm:p-4 font-bold text-slate-400">Clinical Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {filteredRows.map((row, idx) => {
              const isHidden = filterVial === 'all' && !isExpanded && idx >= 8;
              return (
                <tr 
                  key={idx}
                  className={`${isHidden ? 'hidden' : 'table-row'} hover:bg-slate-800/40 transition-colors ${
                    row.isCommon ? 'bg-emerald-950/15' : ''
                  }`}
                >
                <td className="p-3 sm:p-4 text-slate-100 font-bold">{row.vialMg} mg</td>
                <td className="p-3 sm:p-4 text-slate-300">{row.waterMl.toFixed(1)} mL</td>
                <td className="p-3 sm:p-4 text-slate-300">
                  <span>{row.concentrationMgMl.toFixed(1)} mg/mL</span>
                  <span className="block text-[10px] text-slate-400">({row.concentrationMcgMl.toLocaleString()} mcg/mL)</span>
                </td>
                <td className="p-3 sm:p-4 font-bold text-slate-100">
                  {row.doseMcg >= 1000 ? `${row.doseMg} mg` : `${row.doseMcg} mcg`}
                  <span className="block text-[10px] text-slate-400 font-normal">
                    ({row.doseMcg.toLocaleString()} mcg)
                  </span>
                </td>
                <td className="p-3 sm:p-4 font-extrabold text-sm text-emerald-400 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5">
                    <span>{row.u100Units} Units</span>
                    {row.isCommon && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-sans font-bold rounded">
                        ★
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 sm:p-4 text-slate-300">
                  {row.drawMl < 0.1 && (row.drawMl * 100) % 1 !== 0 
                    ? row.drawMl.toFixed(3) 
                    : row.drawMl.toFixed(2)} mL
                </td>
                <td className="p-3 sm:p-4 text-[11px] font-sans text-slate-400">
                  {row.notes ? (
                    <span className="text-emerald-300/90 font-medium">{row.notes}</span>
                  ) : (
                    <span>Standard dilution</span>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show All / Show Less Toggle (Preserves full DOM for SEO) */}
      {filterVial === 'all' && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 transition-all shadow-md shadow-cyan-950/20 cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded
                ? 'Show Less ↑'
                : `Show All ${MATRIX_DATA.length} Dilution Ratios ↓`}
            </span>
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-slate-400">
        💡 <em>Rule of Thumb: For standard 0.25 mg (250 mcg) starter doses from a 5 mg vial reconstituted with 2.0 mL BAC water, pull the plunger to exactly <strong>10 Units (0.10 mL)</strong>.</em>
      </div>
    </section>
  );
};
