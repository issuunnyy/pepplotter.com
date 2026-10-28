import { describe, it, expect } from 'vitest';
import { getQRCode } from './qrcode';

describe('QR Code Generator (pepplotter.com)', () => {
  it('generates a valid 25x25 QR Code matrix for default domain', () => {
    const qr = getQRCode('https://pepplotter.com');
    expect(qr.moduleCount).toBe(25);
    expect(typeof qr.isDark).toBe('function');
  });

  it('correctly sets finder pattern corners to dark', () => {
    const qr = getQRCode('https://pepplotter.com');
    // Top-left finder corner (0,0) must be dark
    expect(qr.isDark(0, 0)).toBe(true);
    // Top-left inner white margin
    expect(qr.isDark(1, 1)).toBe(false);
    // Top-right finder corner (0, 24) must be dark
    expect(qr.isDark(0, 24)).toBe(true);
    // Bottom-left finder corner (24, 0) must be dark
    expect(qr.isDark(24, 0)).toBe(true);
  });

  it('outputs non-empty valid SVG path string', () => {
    const qr = getQRCode('https://pepplotter.com');
    const path = qr.getSvgPath(1);
    expect(typeof path).toBe('string');
    expect(path.startsWith('M')).toBe(true);
    expect(path.length).toBeGreaterThan(100);
  });
});
