'use client';

import { motion } from 'framer-motion';

/**
 * Shared injection objects – every scene references these.
 * Style: clean medical pictogram / icon silhouettes.
 * Stroke: bold (3–7 px) #f4f4f5 on dark background.
 */

const INK = '#f4f4f5';
const LABEL = 'system-ui, -apple-system, Segoe UI, sans-serif';

/* ──────────────────── VIAL ──────────────────── */
export const VIAL_W = 88;
export const VIAL_H = 152;

/**
 * Upright: cap on top, liquid block on the bottom.
 * Inverted: cap on the bottom, liquid settles against stopper.
 * The whole group is mirrored when inverted so the liquid always pools "down".
 */
export function Vial({
  inverted = false,
  fill = 0.58,
}: {
  inverted?: boolean;
  fill?: number;
}) {
  const bodyX = 12;
  const bodyW = 64;
  const bodyH = 96;
  const bodyY = 40;
  const neckY = 28;
  const capY = 8;
  const liquidH = Math.max(16, (bodyH - 20) * Math.min(1, Math.max(0.12, fill)));
  const liquidY = bodyY + bodyH - 10 - liquidH;

  const inner = (
    <g>
      {/* Body */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx="8" fill="none" stroke={INK} strokeWidth="6" />
      {/* Liquid */}
      <rect x={bodyX + 10} y={liquidY} width={bodyW - 20} height={liquidH} fill={INK} />
      {/* Neck */}
      <rect x="26" y={neckY} width="36" height="12" fill={INK} />
      {/* Cap / stopper */}
      <rect x="16" y={capY} width="56" height="18" rx="4" fill={INK} />
    </g>
  );

  if (inverted) {
    return <g transform={`translate(0 ${VIAL_H}) scale(1 -1)`}>{inner}</g>;
  }
  return inner;
}

/* ──────────────────── SYRINGE ──────────────────── */
export const SYRINGE_W = 70;
export const SYRINGE_H = 200;

/**
 * Insulin syringe icon.
 * point="up": needle at local y=0.
 * point="down": flipped so needle at the bottom.
 * `units` sets the plunger position.
 */
export function Syringe({
  units = 20,
  maxUnits = 100,
  point = 'up',
  content = 'liquid',
  pump = false,
}: {
  units?: number;
  maxUnits?: number;
  point?: 'up' | 'down';
  content?: 'liquid' | 'air' | 'empty';
  pump?: boolean;
}) {
  const barrelX = 16;
  const barrelY = 76;
  const barrelW = 38;
  const barrelH = 64;
  const clamped = Math.min(maxUnits, Math.max(0, units));
  const sealY = barrelY + 8 + (clamped / maxUnits) * (barrelH - 28);
  const barrelEnd = barrelY + barrelH;
  const thumbY = sealY + (barrelEnd - (barrelY + 8)) + 8;

  const plunger = (
    <g>
      <rect x={barrelX + 8} y={sealY} width={barrelW - 16} height="6" rx="1" fill={INK} />
      <rect x="33" y={sealY + 6} width="4" height={thumbY - sealY - 6} fill={INK} />
      <rect x="12" y={thumbY} width="46" height="10" rx="3" fill={INK} />
    </g>
  );

  const body = (
    <g>
      {/* Needle */}
      <line x1="35" y1="0" x2="35" y2="62" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      {/* Hub */}
      <path d="M27 62 H43 L40 76 H30 Z" fill={INK} />
      {/* Finger flanges */}
      <rect x="2" y={barrelY - 2} width="16" height="10" rx="2" fill={INK} />
      <rect x="52" y={barrelY - 2} width="16" height="10" rx="2" fill={INK} />
      {/* Barrel */}
      <rect x={barrelX} y={barrelY} width={barrelW} height={barrelH} rx="7" fill="none" stroke={INK} strokeWidth="7" />
      {/* Liquid fill */}
      {content === 'liquid' && (
        <rect x={barrelX + 8} y={barrelY + 8} width={barrelW - 16} height={Math.max(6, sealY - barrelY - 10)} fill={INK} opacity="0.85" />
      )}
      {/* Plunger */}
      {pump ? (
        <motion.g animate={{ y: [0, -16, 0] }} transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}>
          {plunger}
        </motion.g>
      ) : (
        plunger
      )}
    </g>
  );

  if (point === 'down') {
    return <g transform={`translate(0 ${SYRINGE_H}) scale(1 -1)`}>{body}</g>;
  }
  return body;
}

/* ──────────────────── ALCOHOL PAD ──────────────────── */
export const PAD_W = 76;
export const PAD_H = 48;

/** White wipe icon. No fill color, so it matches the vial and syringe. */
export function AlcoholPad() {
  return (
    <g>
      <rect width={PAD_W} height={PAD_H} rx="8" fill="none" stroke={INK} strokeWidth="6" />
      <rect x="16" y="14" width="44" height="20" rx="4" fill={INK} />
    </g>
  );
}

/* ──────────────────── ABDOMEN ──────────────────── */
/** Front of the belly. Navel is the filled dot at local (0, 8). */
export function Abdomen() {
  return (
    <g fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-70 -108 L-96 8 Q-84 112 0 116 Q84 112 96 8 L70 -108" />
      <path d="M-70 -108 Q0 -84 70 -108" />
      <circle cy="8" r="7" fill={INK} stroke="none" />
    </g>
  );
}

/* ──────────────────── THIGH ──────────────────── */
/** One thigh, hip at the top, knee curve at the bottom. Front of the thigh is local (0, 0). */
export function Thigh() {
  return (
    <g fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round">
      <path d="M-48 -112 C-64 -10 -42 78 -26 118" />
      <path d="M48 -112 C64 -10 42 78 26 118" />
      <path d="M-20 112 Q0 132 20 112" />
    </g>
  );
}

/* ──────────────────── SHOULDER ──────────────────── */
/** Upper arm silhouette. Injection point near local (8, 8). */
export function Shoulder() {
  return (
    <g fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round">
      <path d="M-6 -86 C22 -36 10 28 -30 92" />
      <path d="M40 -70 C68 -16 52 46 16 100" />
    </g>
  );
}

/* ──────────────────── TISSUE STACK ──────────────────── */
/** Cross-section skin layers. Local origin = top-left of epidermis. */
export function TissueStack({
  width,
  epi = 28,
  fat = 96,
  muscle = 44,
  pinch = false,
  compact = false,
}: {
  width: number;
  epi?: number;
  fat?: number;
  muscle?: number;
  pinch?: boolean;
  compact?: boolean;
}) {
  const epiPath = pinch
    ? `M0 8 Q${width / 2} -18 ${width} 8 L${width} ${epi} Q${width / 2} ${epi - 16} 0 ${epi} Z`
    : `M0 0 H${width} V${epi} H0 Z`;
  const fatPath = pinch
    ? `M0 ${epi} Q${width / 2} ${epi - 16} ${width} ${epi} L${width} ${epi + fat} Q${width / 2} ${epi + fat + 12} 0 ${epi + fat} Z`
    : `M0 ${epi} H${width} V${epi + fat} H0 Z`;
  return (
    <g>
      <path d={epiPath} fill="#f3d0b0" />
      <path d={fatPath} fill="#f6c445" />
      <rect y={epi + fat} width={width} height={muscle} fill="#9f1239" />
      <text x="8" y={epi - 8} fill="#7c4a2d" fontSize={compact ? 11 : 13} fontWeight="800" fontFamily={LABEL}>
        {compact ? 'Skin' : 'Epidermis'}
      </text>
      <text x="8" y={epi + fat / 2} fill="#713f12" fontSize={compact ? 12 : 14} fontWeight="800" fontFamily={LABEL}>
        {compact ? 'Fat' : 'Sub-Q Fat — Target'}
      </text>
      <text x="8" y={epi + fat + (compact ? 18 : 26)} fill="#ffe4e6" fontSize={compact ? 11 : 13} fontWeight="800" fontFamily={LABEL}>
        {compact ? 'Muscle' : 'Muscle — Avoid'}
      </text>
    </g>
  );
}

/* ──────────────────── SHARPS BIN ──────────────────── */
export const BIN_W = 76;
export const BIN_H = 96;

/** White sharps bin. The drop slot is the dark gap in the lid, at local y ≈ 8. */
export function SharpsBin() {
  return (
    <g>
      <rect x="8" width="60" height="16" rx="3" fill={INK} />
      <rect x="24" y="5" width="28" height="6" rx="2" fill="#071018" />
      <rect y="18" width={BIN_W} height="78" rx="8" fill="none" stroke={INK} strokeWidth="6" />
    </g>
  );
}

/* ──────────────────── TWO FINGERS ──────────────────── */
export function TwoFingers() {
  return (
    <g>
      <rect width="16" height="42" rx="8" fill="#f8fafc" />
      <rect x="20" width="16" height="42" rx="8" fill="#e2e8f0" />
    </g>
  );
}
