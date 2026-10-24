import { CompoundPreset, ReconstitutionResult, InjectionEntry, ConcentrationDataPoint, SyringeType, ReconstitutionError } from './types';

/** 针管容量：U-100 = 100 单位 = 1.0 mL；U-40 = 40 单位 = 1.0 mL */
export const SYRINGE_CAPACITY: Record<SyringeType, number> = {
  U100: 100,
  U40: 40,
};

/** 硬性输入上限，防止 Infinity / NaN 污染计算链 */
export const INPUT_LIMITS = {
  vialMg: { min: 0.1, max: 100 },
  waterMl: { min: 0.1, max: 10 },
  targetDoseMcg: { min: 1, max: 50000 },
} as const;

function isValidNumber(n: number, min: number, max: number): boolean {
  return Number.isFinite(n) && n >= min && n <= max;
}

function emptyResult(
  error: ReconstitutionError,
  syringeType: SyringeType
): ReconstitutionResult {
  const syringeCapacity = SYRINGE_CAPACITY[syringeType];
  return {
    concentrationMgMl: 0,
    concentrationMcgMl: 0,
    drawVolumeMl: 0,
    syringeUnits: 0,
    totalVialDoses: 0,
    syringeCapacity,
    overCapacity: false,
    syringesRequired: 0,
    error,
  };
}

export const COMPOUND_PRESETS: CompoundPreset[] = [
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    brandNames: 'Ozempic, Wegovy, Rybelsus',
    halfLifeHours: 168, // 7 days
    defaultVialMg: 5,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 250, // 0.25 mg starting dose
    standardFrequencyDays: 7,
    description: 'GLP-1 receptor agonist with ~7-day half-life. Commonly dosed once weekly or split into twice-weekly injections.',
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    brandNames: 'Mounjaro, Zepbound',
    halfLifeHours: 120, // 5 days
    defaultVialMg: 10,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 2500, // 2.5 mg starting dose
    standardFrequencyDays: 7,
    description: 'Dual GIP/GLP-1 agonist with ~5-day half-life. Rapidly accumulating plasma profile.',
  },
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    brandNames: 'Triple G (GIP/GLP-1/Glucagon)',
    halfLifeHours: 144, // 6 days
    defaultVialMg: 10,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 2000, // 2.0 mg
    standardFrequencyDays: 7,
    description: 'Triple agonist peptide with ~6-day half-life in clinical trials.',
  },
  {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    brandNames: 'Cagri, CagriSema component',
    halfLifeHours: 168, // 7 days (160-180h)
    defaultVialMg: 5,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 250, // 0.25 mg starting dose
    standardFrequencyDays: 7,
    description: 'Long-acting acylated amylin analogue co-targeting hunger satiety with GLP-1/GIP agonists. Dosed once weekly.',
  },
  {
    id: 'bpc157',
    name: 'BPC-157',
    brandNames: 'Body Protection Compound',
    halfLifeHours: 4, // 4 hours
    defaultVialMg: 5,
    defaultWaterMl: 2.5,
    defaultDoseMcg: 250, // 250 mcg
    standardFrequencyDays: 1,
    description: 'Regenerative pentadecapeptide with a short half-life (~4h). Commonly administered 1-2 times daily.',
  },
  {
    id: 'tb500',
    name: 'TB-500',
    brandNames: 'Thymosin Beta-4',
    halfLifeHours: 24, // 24 hours
    defaultVialMg: 10,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 2500, // 2.5 mg
    standardFrequencyDays: 3.5,
    description: 'Tissue recovery synthetic peptide, typically administered twice weekly.',
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    brandNames: 'NNC 26-0161, Selective GHRP',
    halfLifeHours: 2, // 2 hours
    defaultVialMg: 5,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 200, // 200 mcg standard bedtime dose
    standardFrequencyDays: 1,
    description: 'Highly selective growth hormone secretagogue with ~2h half-life, stimulating clean nighttime GH release without cortisol elevation.',
  },
  {
    id: 'custom',
    name: 'Custom Peptide / Compound',
    brandNames: 'User Defined',
    halfLifeHours: 72,
    defaultVialMg: 5,
    defaultWaterMl: 2.0,
    defaultDoseMcg: 500,
    standardFrequencyDays: 7,
    description: 'Enter your own custom parameters and half-life for any research compound.',
  },
];

/**
 * Reconstitution calculation
 * Concentration (mg/mL) = Vial (mg) / Water (mL)
 * Draw Volume (mL) = Target Dose (mg) / Concentration (mg/mL)
 * Syringe Units: U-100 = Volume * 100, U-40 = Volume * 40
 */
export function calculateReconstitution(
  vialMg: number,
  waterMl: number,
  targetDoseMcg: number,
  syringeType: SyringeType = 'U100',
  vialCost?: number
): ReconstitutionResult {
  const syringeCapacity = SYRINGE_CAPACITY[syringeType];

  // --- 输入合法性拦截：任何越界/非有限值都不允许产出给药指令 ---
  if (!isValidNumber(vialMg, INPUT_LIMITS.vialMg.min, INPUT_LIMITS.vialMg.max)) {
    return emptyResult('INVALID_VIAL', syringeType);
  }
  if (!isValidNumber(waterMl, INPUT_LIMITS.waterMl.min, INPUT_LIMITS.waterMl.max)) {
    return emptyResult('INVALID_WATER', syringeType);
  }
  if (!isValidNumber(targetDoseMcg, INPUT_LIMITS.targetDoseMcg.min, INPUT_LIMITS.targetDoseMcg.max)) {
    return emptyResult('INVALID_DOSE', syringeType);
  }
  // 单次剂量不能超过整瓶总量，否则"可抽次数 < 1"属于物理不可能
  if (targetDoseMcg > vialMg * 1000) {
    return emptyResult('DOSE_EXCEEDS_VIAL', syringeType);
  }

  const concentrationMgMl = vialMg / waterMl;
  const concentrationMcgMl = concentrationMgMl * 1000;

  const targetDoseMg = targetDoseMcg / 1000;
  const drawVolumeMl = targetDoseMg / concentrationMgMl;

  const multiplier = syringeType === 'U100' ? 100 : 40;
  const syringeUnits = drawVolumeMl * multiplier;

  const totalVialDoses = (vialMg * 1000) / targetDoseMcg;
  const costPerDose = vialCost && vialCost > 0 && totalVialDoses > 0
    ? vialCost / totalVialDoses
    : undefined;

  const overCapacity = syringeUnits > syringeCapacity;
  const syringesRequired = overCapacity ? Math.ceil(syringeUnits / syringeCapacity) : 1;

  return {
    concentrationMgMl: Number(concentrationMgMl.toFixed(3)),
    concentrationMcgMl: Number(concentrationMcgMl.toFixed(1)),
    drawVolumeMl: Number(drawVolumeMl.toFixed(4)),
    syringeUnits: Number(syringeUnits.toFixed(1)),
    totalVialDoses: Number(totalVialDoses.toFixed(1)),
    costPerDose: costPerDose ? Number(costPerDose.toFixed(2)) : undefined,
    syringeCapacity,
    overCapacity,
    syringesRequired,
    error: null,
  };
}

/**
 * Pharmacokinetics Subcutaneous Absorption & Elimination (Bateman Model)
 * Models first-order subcutaneous depot uptake (ka) and systemic elimination (ke):
 * C(t) = sum_{i: t_i <= t} D_i * ((e^(-ke*(t-t_i)) - e^(-ka*(t-t_i))) / peakFactor)
 */
export function calculatePharmacokinetics(
  injections: InjectionEntry[],
  halfLifeHours: number,
  totalDays: number = 28,
  stepHours: number = 2
): {
  dataPoints: ConcentrationDataPoint[];
  peakConcentration: number;
  troughConcentration: number;
  averageConcentration: number;
} {
  if (!injections.length || halfLifeHours <= 0 || !Number.isFinite(halfLifeHours) || totalDays <= 0) {
    return {
      dataPoints: [],
      peakConcentration: 0,
      troughConcentration: 0,
      averageConcentration: 0,
    };
  }

  // Elimination rate constant
  const ke = Math.LN2 / halfLifeHours;
  // Subcutaneous depot absorption rate constant (ka > ke, giving realistic 18~36h post-injection Tmax)
  let ka = Math.max(ke * 4.5, 0.08);
  if (ka <= ke) {
    ka = ke * 2;
  }

  // Normalized peak factor at theoretical Tmax
  const tMax = Math.log(ka / ke) / (ka - ke);
  const rawPeak = Math.exp(-ke * tMax) - Math.exp(-ka * tMax);
  const peakFactor = rawPeak > 0 ? rawPeak : 1;

  const totalHours = totalDays * 24;
  const dataPoints: ConcentrationDataPoint[] = [];
  let peak = 0;
  let trough = Number.MAX_VALUE;
  let sum = 0;
  let count = 0;

  // Injection timestamps in hours
  const injectionHours = injections.map((inj) => ({
    hour: inj.day * 24,
    doseMg: inj.doseMg,
  }));

  for (let h = 0; h <= totalHours; h += stepHours) {
    let conc = 0;
    let isInjection = false;

    // Accumulate Bateman curve contributions from all prior injections
    for (const inj of injectionHours) {
      if (h >= inj.hour) {
        const dt = h - inj.hour;
        const contribution = inj.doseMg * ((Math.exp(-ke * dt) - Math.exp(-ka * dt)) / peakFactor);
        conc += contribution;
      }
      if (Math.abs(inj.hour - h) < stepHours / 2) {
        isInjection = true;
      }
    }

    if (!Number.isFinite(conc)) conc = 0;

    const currentDay = Number((h / 24).toFixed(2));

    dataPoints.push({
      day: currentDay,
      hour: h,
      concentration: Number(conc.toFixed(3)),
      formattedDate: `Day ${Math.floor(currentDay)}`,
      isInjectionPoint: isInjection,
    });

    if (conc > peak) peak = conc;
    // Only calculate trough after initial absorption phase (> 48h)
    if (h >= 48 && conc < trough) trough = conc;
    sum += conc;
    count++;
  }

  return {
    dataPoints,
    peakConcentration: Number(peak.toFixed(3)),
    troughConcentration: trough === Number.MAX_VALUE ? 0 : Number(trough.toFixed(3)),
    averageConcentration: count > 0 ? Number((sum / count).toFixed(3)) : 0,
  };
}

/**
 * 安全复制到剪贴板。
 * navigator.clipboard 仅在 HTTPS / localhost 下可用，且用户可能拒绝授权；
 * 直接调用会产生 unhandledRejection（非安全上下文抛 NotAllowedError）。
 * 这里统一 catch，并降级到 execCommand 兜底。
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 落到下面的兜底方案
  }

  try {
    if (typeof document === 'undefined') return false;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Catmull-Rom spline to SVG Cubic Bezier path with boundary clamping */
export function generateSmoothSpline(points: { x: number; y: number }[], minY: number, maxY: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = Math.min(Math.max(p1.y + (p2.y - p0.y) / 6, minY), maxY);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = Math.min(Math.max(p2.y - (p3.y - p1.y) / 6, minY), maxY);

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}
