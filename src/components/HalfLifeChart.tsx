'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { ConcentrationDataPoint } from '@/lib/types';
import { generateSmoothSpline } from '@/lib/calculator';
import { TrendingUp, Activity } from 'lucide-react';

// Chart dimensions (module scope so handlers can reference them without stale closure)
const svgWidth = 800;
const svgHeight = 260;
const paddingLeft = 50;
const paddingRight = 30;
const paddingTop = 25;
const paddingBottom = 40;
const chartW = svgWidth - paddingLeft - paddingRight;
const chartH = svgHeight - paddingTop - paddingBottom;

interface HalfLifeChartProps {
  dataPoints: ConcentrationDataPoint[];
  peakConcentration: number;
  troughConcentration: number;
  averageConcentration: number;
  compoundName: string;
  halfLifeHours: number;
}

export const HalfLifeChart: React.FC<HalfLifeChartProps> = React.memo(function HalfLifeChart({
  dataPoints,
  peakConcentration,
  troughConcentration,
  averageConcentration,
  compoundName,
  halfLifeHours,
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const maxVal = Math.max(peakConcentration * 1.15, 0.1);
  const minVal = 0;
  const totalDays = dataPoints.length ? dataPoints[dataPoints.length - 1].day : 1;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = svgRef.current;
      if (!svg || !dataPoints.length) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;
      // 把客户端坐标映射回 viewBox 逻辑坐标
      const vbX = ((e.clientX - rect.left) / rect.width) * svgWidth;
      const clampedX = Math.min(Math.max(vbX, paddingLeft), svgWidth - paddingRight);
      const ratio = (clampedX - paddingLeft) / chartW;
      const idx = Math.round(ratio * (dataPoints.length - 1));
      setHoveredIndex(Math.min(Math.max(idx, 0), dataPoints.length - 1));
    },
    [dataPoints.length]
  );

  // Smooth spline curve across high-density Bateman data points
  const pathD = useMemo(() => {
    if (!dataPoints.length || totalDays <= 0) return '';
    const points = dataPoints.map((pt) => ({
      x: paddingLeft + (pt.day / totalDays) * chartW,
      y: paddingTop + chartH - ((pt.concentration - minVal) / (maxVal - minVal)) * chartH,
    }));
    return generateSmoothSpline(points, paddingTop, paddingTop + chartH);
  }, [dataPoints, maxVal, minVal, totalDays]);

  if (!dataPoints.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500">
No active injection schedule to plot.
      </div>
    );
  }

  // Scale functions
  const getX = (day: number) => paddingLeft + (day / totalDays) * chartW;
  const getY = (val: number) => paddingTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Build area fill path
  const areaD = `${pathD} L ${getX(totalDays)} ${paddingTop + chartH} L ${getX(0)} ${paddingTop + chartH} Z`;

  // Y-axis tick marks
  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  // X-axis day labels (every 1, 2, 7, or 14 days depending on totalDays)
  const xDayStep = totalDays <= 7 ? 1 : totalDays <= 14 ? 2 : totalDays <= 30 ? 7 : 14;
  const xTicks = [];
  for (let d = 0; d <= totalDays; d += xDayStep) {
    xTicks.push(d);
  }

  const hoveredPoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : null;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header and key metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              {compoundName} Blood Plasma Accumulation Curve
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Half-life:{' '}
            <span className="text-slate-200 font-medium">
              {halfLifeHours >= 24
                ? `${(halfLifeHours / 24).toFixed(1)} days (${Number(halfLifeHours.toFixed(1))}h)`
                : `${Number(halfLifeHours.toFixed(1))}h (${(halfLifeHours / 24).toFixed(2)}d)`}
            </span>{' '}
            | Pharmacokinetic superposition model
          </p>
        </div>

        {/* Metrics Pill Grid */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Peak Level</span>
            <span className="text-rose-400 font-mono font-bold text-sm tabular-nums">{peakConcentration.toFixed(2)} mg</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trough (Floor)</span>
            <span className="text-emerald-400 font-mono font-bold text-sm tabular-nums">{troughConcentration.toFixed(2)} mg</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Average Est.</span>
            <span className="text-cyan-400 font-mono font-bold text-sm tabular-nums">{averageConcentration.toFixed(2)} mg</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Plot */}
      <div className="relative w-full overflow-hidden">
        <svg
ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label={`${compoundName} concentration curve over ${totalDays} days: peak ${peakConcentration.toFixed(2)} mg, trough ${troughConcentration.toFixed(2)} mg, average ${averageConcentration.toFixed(2)} mg.`}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines (Horizontal) */}
          {yTicks.map((val, i) => {
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fontSize="10"
                  fill="#64748b"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Grid lines (Vertical Day markers) */}
          {xTicks.map((day) => {
            const x = getX(day);
            return (
              <g key={day}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + chartH}
                  stroke="#1e293b"
                  strokeDasharray="2 4"
                />
                <text
                  x={x}
                  y={paddingTop + chartH + 18}
                  fontSize="11"
                  fill="#94a3b8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  Day {day}
                </text>
              </g>
            );
          })}

          {/* Shaded Area Under Curve */}
          <path d={areaD} fill="url(#curveGradient)" />

          {/* The Concentration Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Injection Event Dots */}
          {dataPoints.map((pt, idx) => {
            if (!pt.isInjectionPoint) return null;
            const cx = getX(pt.day);
            const cy = getY(pt.concentration);
            return (
              <g key={idx} className="cursor-pointer">
                <circle cx={cx} cy={cy} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <circle cx={cx} cy={cy} r="10" fill="#10b981" opacity="0.25" />
              </g>
            );
          })}

{/* Single full-plot hover surface: 1 DOM node replaces O(n) transparent rects */}
     <rect
    x={paddingLeft}
   y={paddingTop}
            width={chartW}
         height={chartH}
            fill="transparent"
            className="cursor-crosshair"
            onMouseMove={handleMouseMove}
          />

          {/* Hover Crosshair Marker */}
          {hoveredPoint && (
            <g>
              <line
                x1={getX(hoveredPoint.day)}
                y1={paddingTop}
                x2={getX(hoveredPoint.day)}
                y2={paddingTop + chartH}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoveredPoint.day)}
                cy={getY(hoveredPoint.concentration)}
                r="6"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-2xl text-xs pointer-events-none flex items-center gap-4 backdrop-blur-md"
          >
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Timeline</span>
              <div className="text-slate-100 font-bold font-mono">Day {hoveredPoint.day}</div>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Active Blood Concentration</span>
              <div className="text-cyan-400 font-bold font-mono text-sm">
                {hoveredPoint.concentration.toFixed(3)} mg
              </div>
            </div>
            {hoveredPoint.isInjectionPoint && (
              <div className="border-l border-slate-800 pl-3 flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Dose Administered
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clinical & Split-Dosing Insight Box */}
      <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300">Why Plot Half-Life?</strong> Steady-state accumulation happens over 4-5 half-lives (about 4 weeks for Semaglutide, 3-4 weeks for Tirzepatide). Splitting a large weekly dose into twice-weekly (e.g. every 3.5 days) significantly lowers the post-injection Cmax peak spike and raises the green trough floor, drastically reducing gastrointestinal nausea while maintaining sustained appetite suppression.
          <div className="mt-1.5 text-slate-500">
            Model note: First-order subcutaneous absorption &amp; elimination (Bateman pharmacokinetic model), accurately simulating realistic 24–36h post-injection plasma Tmax peaks.
          </div>
        </div>
      </div>
    </div>
  );
});
