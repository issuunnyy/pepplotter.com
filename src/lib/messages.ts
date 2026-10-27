import { ReconstitutionError } from './types';

/**
 * Reconstitution block error messages mapped to human-readable explanations.
 */
export const BLOCK_MESSAGES: Record<ReconstitutionError, string> = {
  INVALID_VIAL: 'Vial powder quantity is out of the valid range (0.1 - 100 mg).',
  INVALID_WATER: 'Bacteriostatic water volume is out of the valid range (0.1 - 10 mL).',
  INVALID_DOSE: 'Target dose is out of the valid range (1 - 50,000 mcg).',
  DOSE_EXCEEDS_VIAL:
    'Target single dose exceeds the entire vial\'s total powder (you cannot draw more than the whole vial contains). Please select a larger vial (e.g. 5mg or 10mg) or lower your target dose.',
  UNSAFE_INPUT: 'Input contains values that cannot be safely calculated.',
};
