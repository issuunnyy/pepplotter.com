import { describe, it, expect, vi } from 'vitest';
import { renderShareCardToCanvas } from './canvasShare';

describe('renderShareCardToCanvas', () => {
  it('does not throw when getContext returns null', () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
    } as unknown as HTMLCanvasElement;

    expect(() => {
      renderShareCardToCanvas(mockCanvas, {
        shareUrl: 'https://pepplotter.com/?preset=semaglutide',
        compoundName: 'Semaglutide',
        vialMg: 5,
        waterMl: 2,
        doseMcg: 250,
        syringeUnits: 10,
        drawVolumeMl: 0.1,
        syringeType: 'U100',
      });
    }).not.toThrow();

    expect(mockCanvas.width).toBe(840);
    expect(mockCanvas.height).toBe(880);
  });

  it('correctly executes canvas drawing operations when context is available', () => {
    const mockCtx = {
      scale: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillRect: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
    } as unknown as HTMLCanvasElement;

    renderShareCardToCanvas(mockCanvas, {
      shareUrl: 'https://pepplotter.com/?preset=tirzepatide',
      compoundName: 'Tirzepatide',
      vialMg: 10,
      waterMl: 2,
      doseMcg: 2500,
      syringeUnits: 50,
      drawVolumeMl: 0.5,
      syringeType: 'U100',
    });

    expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Tirzepatide'),
      expect.any(Number),
      expect.any(Number)
    );
  });
});
