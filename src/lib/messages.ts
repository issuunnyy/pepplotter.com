import { ReconstitutionError } from './types';

/**
 * 阻断原因 → 用户可读说明。
 * page.tsx 与 ProtocolReportModal.tsx 共用同一套语义，
 * 此前两处各持一份副本且文案已漂移（DOSE_EXCEEDS_VIAL 缺后半句）。
 */
export const BLOCK_MESSAGES: Record<ReconstitutionError, string> = {
  INVALID_VIAL: 'Vial powder quantity is out of the valid range (0.1 – 100 mg).',
  INVALID_WATER: 'Bacteriostatic water volume is out of the valid range (0.1 – 10 mL).',
  INVALID_DOSE: 'Target dose is out of the valid range (1 – 50,000 mcg).',
  DOSE_EXCEEDS_VIAL:
    'Target dose exceeds the total powder in this vial. Lower the dose or use a larger vial.',
  UNSAFE_INPUT: 'Input contains values that cannot be safely calculated.',
};
