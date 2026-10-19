export type SyringeType = 'U100' | 'U40';

export interface CompoundPreset {
  id: string;
  name: string;
  brandNames: string;
  halfLifeHours: number;
  defaultVialMg: number;
  defaultWaterMl: number;
  defaultDoseMcg: number;
  standardFrequencyDays: number;
  description: string;
}

export interface ReconstitutionResult {
  concentrationMgMl: number;
  concentrationMcgMl: number;
  drawVolumeMl: number;
  syringeUnits: number;
  totalVialDoses: number;
  costPerDose?: number;
  /** 单支针管可容纳的最大单位数（U-100=100 / U-40=40） */
  syringeCapacity: number;
  /** 抽取量是否超出单支针管容量 —— 为 true 时禁止生成任何给药指令 */
  overCapacity: boolean;
  /** 超出容量时所需针管支数 */
  syringesRequired: number;
  /** 输入非法（空/NaN/超范围）时的阻断原因；null 表示计算有效 */
  error: ReconstitutionError | null;
}

export type ReconstitutionError =
  | 'INVALID_VIAL'
  | 'INVALID_WATER'
  | 'INVALID_DOSE'
  | 'DOSE_EXCEEDS_VIAL'
  | 'UNSAFE_INPUT';

export interface InjectionEntry {
  id: string;
  compoundId: string;
  day: number; // Day of injection (e.g., 0, 7, 14...)
  doseMg: number;
}

export interface ConcentrationDataPoint {
  day: number;
  hour: number;
  concentration: number;
  formattedDate: string;
  isInjectionPoint: boolean;
}
