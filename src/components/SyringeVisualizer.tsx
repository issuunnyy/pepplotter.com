'use client';

import React, { useMemo } from 'react';
import { SyringeType } from '@/lib/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SyringeVisualizerProps {
  units: number;
  drawVolumeMl: number;
  syringeType: SyringeType;
  maxUnits?: number;
}

export const SyringeVisualizer: React.FC<SyringeVisualizerProps> = React.memo(function SyringeVisualizer({
  units,
  drawVolumeMl,
  syringeType,
  maxUnits = syringeType === 'U100' ? 100 : 40,
}) {
  const isOverflow = units > maxUnits;
  const clampedUnits = Math.min(Math.max(units, 0), maxUnits);

  // Barrel dimensions
  const barrelStart = 100; // x-coord of barrel start
  const barrelWidth = 420; // x-coord width of 0 to maxUnits
  const barrelHeight = 70;
  const barrelY = 40;

  // Calculate liquid fill length (proportional to units)
  const fillWidth = (clampedUnits / maxUnits) * barrelWidth;
  const plungerX = barrelStart + fillWidth;

  // 刻度仅依赖 syringeType / maxUnits —— memo 掉，避免每次输入重建 51 个 <g>
  const ticks = useMemo(() => {
    const majorStep = syringeType === 'U100' ? 10 : 5;
    const minorStep = syringeType === 'U100' ? 2 : 1;
    const tickCount = Math.round(maxUnits / minorStep);
    const out: React.ReactElement[] = [];

    for (let i = 0; i <= tickCount; i++) {
      const unitVal = i * minorStep;
      const x = barrelStart + (unitVal / maxUnits) * barrelWidth;
      const isMajor = unitVal % majorStep === 0;

      out.push(
        <g key={unitVal}>
          <line
            x1={x}
            y1={barrelY}
            x2={x}
            y2={barrelY + (isMajor ? 24 : 12)}
            stroke={isMajor ? '#ffffff' : '#cbd5e1'}
            strokeWidth={isMajor ? 1.75 : 1}
            style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.85))' }}
          />
          {isMajor && (
            <text
              x={x}
              dx={unitVal === maxUnits ? -2 : 0}
              y={barrelY + 37}
              fontSize="11"
              fontWeight="800"
              fill="#ffffff"
              textAnchor={unitVal === maxUnits ? 'end' : 'middle'}
              fontFamily="monospace"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.95))' }}
            >
              {unitVal}
            </text>
          )}
        </g>
      );
    }
    return out;
  }, [syringeType, maxUnits, barrelStart, barrelWidth, barrelY]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Visual Syringe Draw Target ({syringeType})
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight tabular-nums">
              {units > 0 ? units : '0.0'}
            </span>
            <span className="text-sm font-semibold text-emerald-500 uppercase">
              Units
            </span>
            <span className="text-xs text-slate-400 tabular-nums font-mono">
              ({drawVolumeMl > 0 ? drawVolumeMl.toFixed(3) : '0.000'} mL)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOverflow ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-xs font-medium">
<AlertCircle className="w-3.5 h-3.5" />
    Exceeds one syringe — reduce dose or add water
</div>
          ) : units > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Target mark highlighted
            </div>
          ) : (
            <span className="text-xs text-slate-400">Enter parameters to visualize</span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full max-w-full overflow-hidden py-2">
        <svg
          viewBox="0 0 640 160"
          className="w-full h-auto select-none block"
        >
          <defs>
            {/* Stainless steel needle gradient */}
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Liquid fill gradient */}
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
            </linearGradient>

            {/* Glass Barrel Glare */}
            <linearGradient id="barrelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="85%" stopColor="#000000" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>

            {/* Plunger shadow */}
            <filter id="plungerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="2" dy="0" stdDeviation="3" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* === NEEDLE & HUB === */}
          {/* Needle tip bevel */}
          <polygon
            points="10,75 50,73.5 50,76.5"
            fill="url(#needleGrad)"
          />
          {/* Needle Shaft */}
          <rect
            x="35"
            y="73.8"
            width="40"
            height="2.4"
            fill="url(#needleGrad)"
          />
          {/* Orange/Clear Hub (Plastic needle attachment) */}
          <path
            d="M 75 60 L 100 62 L 100 88 L 75 90 Z"
            fill="#f97316"
            stroke="#ea580c"
            strokeWidth="1.5"
            rx="2"
          />

          {/* === BARREL BASE === */}
          {/* Background barrel interior */}
          <rect
            x={barrelStart}
            y={barrelY}
            width={barrelWidth}
            height={barrelHeight}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2"
            rx="4"
          />

          {/* === MEDICATION LIQUID (Fill Level) === */}
          {clampedUnits > 0 && (
            <rect
              x={barrelStart}
              y={barrelY + 2}
              width={fillWidth}
              height={barrelHeight - 4}
              fill="url(#liquidGrad)"
              rx="2"
            />
          )}

          {/* === RUBBER PLUNGER HEAD & SHAFT (Inside Barrel) === */}
          <g filter="url(#plungerShadow)">
            {/* Rubber Stopper */}
            <rect
              x={plungerX}
              y={barrelY + 1}
              width="14"
              height={barrelHeight - 2}
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="1.5"
              rx="3"
            />
            {/* Stopper rib rings */}
            <line
              x1={plungerX + 4}
              y1={barrelY + 4}
              x2={plungerX + 4}
              y2={barrelY + barrelHeight - 4}
              stroke="#334155"
              strokeWidth="2"
            />
            <line
              x1={plungerX + 10}
              y1={barrelY + 4}
              x2={plungerX + 10}
              y2={barrelY + barrelHeight - 4}
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Plunger Shaft */}
            <rect
              x={plungerX + 14}
              y={barrelY + barrelHeight / 2 - 5}
              width={Math.max(590 - (plungerX + 14), 20)}
              height="10"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Plunger End Grip (Flange) */}
            <rect
              x="585"
              y={barrelY - 5}
              width="10"
              height={barrelHeight + 10}
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="1.5"
              rx="2"
            />
          </g>

          {/* === GRADUATION TICKS & NUMBERS (Printed on Outer Barrel) === */}
          {ticks}

          {/* Glass Barrel Overlay Reflection */}
          <rect
            x={barrelStart}
            y={barrelY}
            width={barrelWidth}
            height={barrelHeight}
            fill="url(#barrelGrad)"
            pointerEvents="none"
          />

          {/* Barrel Finger Flange on the right end */}
          <path
            d={`M ${barrelStart + barrelWidth} ${barrelY - 10} L ${barrelStart + barrelWidth + 10} ${barrelY - 10} L ${barrelStart + barrelWidth + 10} ${barrelY + barrelHeight + 10} L ${barrelStart + barrelWidth} ${barrelY + barrelHeight + 10} Z`}
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1.5"
            rx="2"
          />

          {/* Marker Indicator Arrow pointing at current units */}
          {clampedUnits > 0 && (
            <g transform={`translate(${plungerX}, ${barrelY + barrelHeight + 8})`}>
              <polygon points="0,0 -5,8 5,8" fill="#10b981" />
              <text
                x="0"
                y="22"
                fontSize="11"
                fontWeight="700"
                fill="#10b981"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {units} U
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Syringe Tips */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Green highlight represents exact volume to draw.</span>
        </div>
        <div className="text-slate-400">
          Standard <strong className="text-slate-300">U-100</strong> (100 Units = 1 mL) | 1 Unit = 0.01 mL
        </div>
      </div>
    </div>
  );
});
