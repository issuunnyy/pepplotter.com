'use client';

import { motion } from 'framer-motion';
import { Abdomen, AlcoholPad, SharpsBin, Syringe, Thigh, Vial } from '@/components/subqParts';

const LABEL = 'system-ui, -apple-system, Segoe UI, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, monospace';
const INK = '#f4f4f5';

function Blueprint({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={`${id}-sm`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="rgba(125,211,252,0.16)" strokeWidth="0.7" />
        </pattern>
        <pattern id={`${id}-lg`} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M100 0 H0 V100" fill="none" stroke="rgba(16,185,129,0.18)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="500" height="280" fill="#071018" />
      <rect width="500" height="280" fill={`url(#${id}-sm)`} />
      <rect width="500" height="280" fill={`url(#${id}-lg)`} />
    </>
  );
}

function Caption({ children }: { children: string }) {
  return (
    <text x="250" y="258" textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="700" fontFamily={LABEL}>
      {children}
    </text>
  );
}

/* ================================================================== */
/*  1 — Four tools, same size, same white ink                         */
/* ================================================================== */
export function ScenePrep({ beat }: { beat: number }) {
  const ring = (index: number, x: number) =>
    beat === index ? (
      <rect x={x} y="28" width="108" height="156" rx="16" fill="none" stroke="#34d399" strokeWidth="2" />
    ) : null;

  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto" role="img" aria-label="Lay out the vial, syringe, alcohol pad, and sharps bin">
      <Blueprint id="prep" />
      {ring(0, 8)}
      {ring(1, 132)}
      {ring(2, 256)}
      {ring(3, 380)}
      <g transform="translate(22 52) scale(0.72)">
        <Vial fill={0.55} />
      </g>
      <g transform="translate(154 36) scale(0.58)">
        <Syringe units={12} maxUnits={40} point="up" content="empty" />
      </g>
      <g transform="translate(272 86)">
        <AlcoholPad />
      </g>
      <g transform="translate(396 58)">
        <SharpsBin />
      </g>
      {['Vial', 'Syringe', 'Alcohol pad', 'Sharps bin'].map((name, index) => (
        <text
          key={name}
          x={62 + index * 124}
          y="206"
          textAnchor="middle"
          fill={beat === index ? '#6ee7b7' : '#e2e8f0'}
          fontSize="14"
          fontWeight="800"
          fontFamily={LABEL}
        >
          {name}
        </text>
      ))}
      <Caption>
        {beat === 0
          ? 'Peptide vial'
          : beat === 1
            ? 'New insulin syringe'
            : beat === 2
              ? '75% alcohol pad'
              : 'Sharps bin, open'}
      </Caption>
    </svg>
  );
}

/* ================================================================== */
/*  2 — Belly, thigh, wipe, dry                                        */
/* ================================================================== */
export function SceneClean({ beat, dryProgress }: { beat: number; dryProgress?: number }) {
  const timed = typeof dryProgress === 'number';
  const progress = timed ? Math.min(1, Math.max(0, dryProgress)) : 0;
  const dry = progress > 0.92;

  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto" role="img" aria-label="Pick a spot, wipe from the center out, and let the alcohol dry">
      <Blueprint id="clean" />

      {beat === 0 && (
        <g>
          <g transform="translate(150 118)">
            <Abdomen />
          </g>
          <circle cx="150" cy="126" r="36" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeDasharray="5 4" />
          <circle cx="104" cy="168" r="11" fill="none" stroke="#34d399" strokeWidth="3" />
          <circle cx="196" cy="168" r="11" fill="none" stroke="#34d399" strokeWidth="3" />
          <text x="300" y="112" fill="#fecdd3" fontSize="15" fontWeight="800" fontFamily={LABEL}>
            Not the navel
          </text>
          <text x="300" y="140" fill="#6ee7b7" fontSize="15" fontWeight="800" fontFamily={LABEL}>
            5 cm / 2 in out
          </text>
          <Caption>Belly. Switch sides each time.</Caption>
        </g>
      )}

      {beat === 1 && (
        <g>
          <g transform="translate(150 124)">
            <Thigh />
          </g>
          <circle cx="150" cy="124" r="12" fill="none" stroke="#34d399" strokeWidth="3" />
          <text x="250" y="118" fill="#e2e8f0" fontSize="16" fontWeight="800" fontFamily={LABEL}>
            Front or outer thigh
          </text>
          <text x="250" y="146" fill="#fda4af" fontSize="14" fontWeight="700" fontFamily={LABEL}>
            Not the knee. Not the groin.
          </text>
          <Caption>Knee is the curve at the bottom.</Caption>
        </g>
      )}

      {beat === 2 && (
        <g>
          <circle cx="210" cy="118" r="46" fill="none" stroke={INK} strokeWidth="6" />
          <circle cx="210" cy="118" r="5" fill={INK} />
          <motion.g animate={{ x: [0, 54], y: [0, 28] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <g transform="translate(172 96) scale(0.7)">
              <AlcoholPad />
            </g>
          </motion.g>
          <Caption>Wipe from the center outward.</Caption>
        </g>
      )}

      {beat === 3 && (
        <g>
          <circle
            cx="168"
            cy="118"
            r="52"
            fill={dry ? 'rgba(16,185,129,0.2)' : 'rgba(34,211,238,0.16)'}
            stroke={dry ? '#34d399' : '#22d3ee'}
            strokeWidth="6"
          />
          <text x="168" y="124" textAnchor="middle" fill={dry ? '#d1fae5' : '#e0f2fe'} fontSize="18" fontWeight="800" fontFamily={LABEL}>
            {dry ? 'Dry' : 'Wet'}
          </text>
          <text x="280" y="112" fill="#e2e8f0" fontSize="16" fontWeight="800" fontFamily={LABEL}>
            {dry ? 'Do not touch it.' : 'Do not blow.'}
          </text>
          <text x="280" y="138" fill="#94a3b8" fontSize="14" fontFamily={LABEL}>
            {dry ? 'Draw the dose next.' : 'Let the shine disappear.'}
          </text>
          <Caption>{dry ? 'Skin is dry.' : 'Air-dry. Hands off.'}</Caption>
        </g>
      )}
    </svg>
  );
}

/* ================================================================== */
/*  3 — Stopper, air, flip, bubble                                     */
/* ================================================================== */
function doseWindow(units: number) {
  const safe = Number.isFinite(units) ? Math.max(0, units) : 0;
  if (safe <= 40) return { ticks: [10, 20, 30, 40], max: 40, units: safe };
  if (safe <= 80) return { ticks: [20, 40, 60, 80], max: 80, units: safe };
  return { ticks: [25, 50, 75, 100], max: 100, units: Math.min(100, safe) };
}

export function SceneDraw({
  beat,
  units,
  volumeMl,
}: {
  beat: number;
  units: number;
  volumeMl: number;
}) {
  const scale = doseWindow(units);
  const yAt = (value: number) => {
    const min = scale.ticks[0];
    const max = scale.ticks[scale.ticks.length - 1];
    return 62 + ((value - min) / (max - min)) * 108;
  };
  const targetY = yAt(scale.units);

  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto" role="img" aria-label="Wipe the stopper, push air in, draw the dose, and push bubbles out">
      <Blueprint id="draw" />

      {beat === 0 && (
        <g>
          <g transform="translate(156 36) scale(0.82)">
            <Vial fill={0.55} />
          </g>
          <motion.g animate={{ x: [130, 196, 130] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <g transform="translate(0 28) scale(0.72)">
              <AlcoholPad />
            </g>
          </motion.g>
          <Caption>Wipe the rubber stopper once.</Caption>
        </g>
      )}

      {beat === 1 && (
        <g>
          <g transform="translate(186 18) scale(0.48)">
            <Syringe units={28} content="air" point="down" pump />
          </g>
          <g transform="translate(170 96) scale(0.72)">
            <Vial fill={0.5} />
          </g>
          <text x="292" y="58" fill="#7dd3fc" fontSize="14" fontWeight="800" fontFamily={MONO}>
            AIR ↓
          </text>
          <Caption>Same volume of air as the dose.</Caption>
        </g>
      )}

      {beat === 2 && (
        <g>
          <g transform="translate(150 8) scale(0.66)">
            <Vial inverted fill={0.62} />
          </g>
          <g transform="translate(158 96) scale(0.55)">
            <Syringe units={16} point="up" content="liquid" />
          </g>
          <text x="300" y="120" fill={INK} fontSize="16" fontWeight="800" fontFamily={LABEL}>
            Tip stays in the liquid
          </text>
          <Caption>Pull slowly to your mark.</Caption>
        </g>
      )}

      {beat >= 3 && (
        <g>
          <g transform="translate(18 36) scale(0.5)">
            <Vial inverted fill={0.55} />
          </g>
          <g transform="translate(28 86) scale(0.42)">
            <Syringe units={scale.units} maxUnits={scale.max} point="up" content="liquid" />
          </g>
          <text x="52" y="28" fill="#94a3b8" fontSize="11" fontWeight="700" fontFamily={MONO}>
            FULL VIEW
          </text>
          <line x1="108" y1="150" x2="196" y2="120" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="4 3" />

          <circle cx="320" cy="118" r="92" fill="#06101c" stroke="#34d399" strokeWidth="3" />
          <rect x="338" y="48" width="30" height="140" rx="4" fill="#020617" stroke="#94a3b8" strokeWidth="2" />
          {scale.ticks.map((tick) => {
            const y = yAt(tick);
            const onTarget = Math.abs(tick - scale.units) < 0.6;
            return (
              <g key={tick}>
                <line x1="328" y1={y} x2="338" y2={y} stroke={onTarget ? '#34d399' : '#e2e8f0'} strokeWidth={onTarget ? 3 : 1.5} />
                <text x="322" y={y + 4} textAnchor="end" fill={onTarget ? '#6ee7b7' : '#e2e8f0'} fontSize="13" fontWeight="800" fontFamily={MONO}>
                  {tick}
                </text>
              </g>
            );
          })}
          <line x1="334" y1={targetY} x2="392" y2={targetY} stroke="#34d399" strokeWidth="3" />
          <rect x="341" y="52" width="24" height={Math.max(6, targetY - 54)} fill="#34d399" opacity="0.9" />
          <rect x="334" y={targetY - 4} width="38" height="8" rx="2" fill="#059669" />
          <circle cx="353" cy={targetY - 18} r="5" fill="#ffffff" />
          <text x="396" y={targetY + 4} fill="#d1fae5" fontSize="13" fontWeight="800" fontFamily={LABEL}>
            {scale.units}
          </text>
          <Caption>{`Push the bubble out. Stop at ${scale.units} units · ${volumeMl} mL`}</Caption>
        </g>
      )}
    </svg>
  );
}

/* ================================================================== */
/*  4 — A skin fold, then the needle into that fold                    */
/* ================================================================== */
function SkinFold({ needle, pump }: { needle: boolean; pump?: boolean }) {
  return (
    <g>
      <path
        d="M36 146 L150 146 L214 78 L278 146 L464 146"
        fill="none"
        stroke={INK}
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M36 170 L158 170 L226 108 L286 170 L464 170"
        fill="none"
        stroke={INK}
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect x="96" y="108" width="22" height="52" rx="11" fill={INK} />
      <rect x="318" y="108" width="22" height="52" rx="11" fill={INK} />
      {needle && (
        <g transform="translate(214 86) rotate(-62) scale(0.38) translate(-35 0)">
          <Syringe units={10} maxUnits={40} point="up" content="liquid" pump={pump} />
        </g>
      )}
    </g>
  );
}

export function SceneInject({ beat, seconds }: { beat: number; seconds: number }) {
  const ring = 2 * Math.PI * 16;
  const left = Math.min(10, Math.max(0, seconds));

  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto" role="img" aria-label="Pinch a fold, insert the needle, push slowly, and hold before pulling out">
      <Blueprint id="inject" />
      <SkinFold needle={beat >= 1} pump={beat === 2} />
      {beat === 3 && (
        <g>
          <circle cx="430" cy="64" r="26" fill="#020617" stroke="#334155" strokeWidth="4" />
          <circle
            cx="430"
            cy="64"
            r="16"
            fill="none"
            stroke="#34d399"
            strokeWidth="4"
            strokeDasharray={ring}
            strokeDashoffset={ring * (1 - left / 10)}
            strokeLinecap="round"
            transform="rotate(-90 430 64)"
          />
          <text x="430" y="70" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="800" fontFamily={MONO}>
            {left}
          </text>
        </g>
      )}
      <Caption>
        {beat === 0
          ? 'Pinch a fold.'
          : beat === 1
            ? 'Needle all the way into the fold.'
            : beat === 2
              ? 'Push slowly. Do not pull back.'
              : 'Hold, then straight out. Press, do not rub.'}
      </Caption>
    </svg>
  );
}

/* ================================================================== */
/*  5 — Bin, once, fridge, still                                       */
/* ================================================================== */
export function SceneAfter({ beat }: { beat: number }) {
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto" role="img" aria-label="Drop the syringe in the sharps bin and store the vial without shaking it">
      <Blueprint id="after" />

      {beat <= 1 && (
        <g>
          <g transform="translate(212 118)">
            <SharpsBin />
          </g>
          <g transform="translate(216 16) scale(0.46)">
            <Syringe point="down" units={4} maxUnits={40} content="empty" />
          </g>
          {beat === 1 && (
            <g>
              <circle cx="250" cy="70" r="34" fill="none" stroke="#fb7185" strokeWidth="4" />
              <line x1="226" y1="46" x2="274" y2="94" stroke="#fb7185" strokeWidth="4" />
            </g>
          )}
          <Caption>{beat === 0 ? 'Drop it in. Needle first.' : 'One use. Do not take it back out.'}</Caption>
        </g>
      )}

      {beat === 2 && (
        <g>
          <rect x="168" y="28" width="164" height="186" rx="16" fill="none" stroke={INK} strokeWidth="6" />
          <line x1="168" y1="72" x2="332" y2="72" stroke={INK} strokeWidth="4" />
          <g transform="translate(206 88) scale(0.58)">
            <Vial fill={0.4} />
          </g>
          <Caption>Fridge, if the label says so.</Caption>
        </g>
      )}

      {beat === 3 && (
        <g>
          <g transform="translate(120 40) scale(0.78)">
            <Vial fill={0.4} />
          </g>
          <g transform="translate(280 90)">
            <line x1="8" y1="18" x2="78" y2="18" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <path d="M66 8 L80 18 L66 28" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="80" y1="46" x2="10" y2="46" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <path d="M22 36 L8 46 L22 56" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="44" cy="32" r="40" fill="none" stroke="#fb7185" strokeWidth="4" />
            <line x1="18" y1="8" x2="70" y2="56" stroke="#fb7185" strokeWidth="4" />
          </g>
          <Caption>Do not shake.</Caption>
        </g>
      )}
    </svg>
  );
}
