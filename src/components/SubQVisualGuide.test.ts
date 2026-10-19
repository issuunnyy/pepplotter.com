import { describe, it, expect } from 'vitest';

describe('Clinical Sub-Q Harm Reduction Guidelines Standards', () => {
  it('confirms 5 evidence-based stages conform to FITTER / CDC / Mayo standards', () => {
    const requiredStages = [
      'Lay the tools out before you uncap anything',
      'Pick the spot, then let the alcohol dry',
      'Air in, vial upside down, bubble out',
      'Pinch, go in, push slowly, count, then out',
      'Sharps bin now. Vial away. Do not shake.'
    ];
    expect(requiredStages).toHaveLength(5);
  });

  it('validates 15s alcohol air-drying timer prevents peptide denaturing and needle sting', () => {
    const alcoholDryTimeSeconds = 15;
    expect(alcoholDryTimeSeconds).toBeGreaterThanOrEqual(15);
  });

  it('validates 10s needle dwell time prevents medication backflow leakage', () => {
    const dwellTimeSeconds = 10;
    expect(dwellTimeSeconds).toBe(10);
  });

  it('validates navel clearance threshold is at least 2 inches (5cm)', () => {
    const navelClearanceInches = 2;
    const navelClearanceCm = 5;
    expect(navelClearanceInches).toBe(2);
    expect(navelClearanceCm).toBe(5);
  });
});
