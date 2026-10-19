'use client';

import React from 'react';
import { Thermometer, Droplets, Syringe, ExternalLink, type LucideIcon } from 'lucide-react';

interface SupplyItem {
  icon: LucideIcon;
  /** 图标容器配色（icon + 悬停标题色） */
  iconClass: string;
  hoverTitleClass: string;
  title: string;
  description: string;
  /** 品类标签，渲染在卡片底部 */
  category: string;
  /**
   * 联盟链接。为空时卡片只作信息展示，不渲染链接形态的假入口——
   * 上一版"Check Specs"等是纯 span，点了没反应，直接伤信任与转化。
   */
  href?: string;
}

const SUPPLIES: SupplyItem[] = [
  {
    icon: Thermometer,
    iconClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    hoverTitleClass: 'group-hover:text-cyan-300',
    title: 'TSA-Approved Peptide Travel Cooler',
    description:
      'Maintains 36°F - 46°F (2°C - 8°C) for up to 48 hours. Built-in digital bi-metal temperature display to protect fragile GLP-1 chains from heat degradation.',
    category: 'Travel Protection',
  },
  {
    icon: Droplets,
    iconClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    hoverTitleClass: 'group-hover:text-emerald-300',
    title: 'Sterile Reconstitution & Prep Kit',
    description:
      'USP grade bacteriostatic water containing 0.9% benzyl alcohol preservative. Multipack 30mL sealed glass vials with 70% isopropyl alcohol wipe pads.',
    category: 'Sterile Diluent',
  },
  {
    icon: Syringe,
    iconClass: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
    hoverTitleClass: 'group-hover:text-slate-200',
    title: 'U-100 31G 5/16" Micro-Fine Syringes',
    description:
      'Ultra-thin 31-gauge 8mm needle for painless subcutaneous administration. High-contrast bold black barrel graduations for zero-error micro-draws.',
    category: 'Precision Syringes',
  },
];

export const AffiliateSupplies: React.FC = () => {
  return (
    <div className="w-full mt-10 pt-8 border-t border-slate-800">
      <div className="mb-5">
        <span className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
          Essential Research Supplies & Safety Gear
        </span>
        <h3 className="text-lg font-bold text-slate-100 mt-0.5">
          Recommended Sterile Mixing & Temperature Control Tools
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUPPLIES.map((item) => {
          const Icon = item.icon;
          const cardClass =
            'bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all flex flex-col justify-between group';

          const cardBody = (
            <>
              <div>
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${item.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className={`text-sm font-bold text-slate-200 transition-colors ${item.hoverTitleClass}`}>
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{item.category}</span>
                {item.href && (
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View listing <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </>
          );

          return item.href ? (
            <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
              {cardBody}
            </a>
          ) : (
            <div key={item.title} className={cardClass}>
              {cardBody}
            </div>
          );
        })}
      </div>
    </div>
  );
};
