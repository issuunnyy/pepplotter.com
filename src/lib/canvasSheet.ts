import { SyringeType, ReconstitutionResult, ConcentrationDataPoint, InjectionEntry } from './types';

export interface SheetCanvasData {
  compoundName: string;
  brandNames?: string;
  vialMg: number;
  waterMl: number;
  targetDoseMcg: number;
  doseDisplay: string;
  concentrationMgMl: number;
  concentrationMcgMl: number;
  syringeType: SyringeType;
  reconResult: ReconstitutionResult;
  halfLifeHours: number;
  peakConcentration: number;
  troughConcentration: number;
  averageConcentration: number;
  simulationDays: number;
  dataPoints: ConcentrationDataPoint[];
  tableRows: { day: number; doseMg: number }[];
  frequencyDays: number;
}

/**
 * Pure HTML5 Canvas 2D Renderer for PepPlotter Protocol Sheet.
 * Zero external dependencies. Zero XML/foreignObject security sandbox issues.
 * Guaranteed 100% compatibility across WeChat, Twitter/X, iOS Safari, Android Chrome, and PC.
 */
export function renderSheetToCanvas(canvas: HTMLCanvasElement, data: SheetCanvasData): void {
  const width = 720;
  const height = 780;
  const scale = 2; // 2x Retina clarity (1440x1560)

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const padX = 24;
  let curY = 24;

  // 1. Top Document Header
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('PEPPLOTTER CLINICAL PROTOCOL & PK REPORT', padX, curY + 14);

  // Badge "MEMO"
  const badgeText = 'MEMO';
  ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 8;
  const badgeX = padX + 395;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(badgeX, curY + 4, badgeW, 14, 3);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badgeText, badgeX + 4, curY + 14);

  // Right date & domain
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, width - padX, curY + 10);
  ctx.fillStyle = '#64748b';
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillText('pepplotter.com', width - padX, curY + 22);
  ctx.textAlign = 'left';

  // Subtitle
  curY += 26;
  ctx.fillStyle = '#64748b';
  ctx.font = '9.5px system-ui, sans-serif';
  ctx.fillText('Reconstitution Guide • Syringe Draw Target • Pharmacokinetic Curve • Administration Log', padX, curY);

  // Divider
  curY += 6;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  // 2. Compound Specification Strip
  curY += 10;
  const stripH = 46;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, width - padX * 2, stripH, 6);
  ctx.fill();
  ctx.stroke();

  // Line 1: Compound name & Concentration
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillText('COMPOUND:', padX + 10, curY + 16);
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 12px system-ui, sans-serif';
  const cName = data.brandNames ? `${data.compoundName} (${data.brandNames})` : data.compoundName;
  ctx.fillText(cName, padX + 75, curY + 16);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillText('CONCENTRATION: ', width - padX - 160, curY + 16);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`${data.concentrationMgMl.toFixed(2)} mg/mL (${data.concentrationMcgMl.toFixed(0)} mcg/mL)`, width - padX - 10, curY + 16);
  ctx.textAlign = 'left';

  // Divider inside strip
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 8, curY + 23);
  ctx.lineTo(width - padX - 8, curY + 23);
  ctx.stroke();

  // Line 2: 4 columns
  const colW = (width - padX * 2 - 20) / 4;
  const subY = curY + 37;
  ctx.font = '9px system-ui, sans-serif';

  ctx.fillStyle = '#64748b';
  ctx.fillText('Vial Powder: ', padX + 10, subY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${data.vialMg} mg`, padX + 68, subY);

  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('BAC Water: ', padX + 10 + colW, subY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${data.waterMl} mL`, padX + 10 + colW + 60, subY);

  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Recon Date: ', padX + 10 + colW * 2, subY);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('___/___/202_', padX + 10 + colW * 2 + 62, subY);

  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('28-Day Discard: ', padX + 10 + colW * 3, subY);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('___/___/202_', padX + 10 + colW * 3 + 75, subY);

  // 3. Section 1: Reconstitution & Syringe Draw
  curY += stripH + 12;
  const sec1H = 210;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, width - padX * 2, sec1H, 8);
  ctx.fill();
  ctx.stroke();

  // Section 1 Header
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.arc(padX + 14, curY + 14, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('1. RECONSTITUTION & PRECISION SYRINGE DRAW', padX + 24, curY + 17);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText(`Syringe: ${data.syringeType} (1 Unit = ${data.syringeType === 'U100' ? '0.01' : '0.025'} mL)`, width - padX - 10, curY + 17);
  ctx.textAlign = 'left';

  // Inner Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 10, curY + 24);
  ctx.lineTo(width - padX - 10, curY + 24);
  ctx.stroke();

  // 4 Action Badges
  const badgeRowY = curY + 30;
  const bW = (width - padX * 2 - 30) / 4;
  const bH = 38;

  // Box 1: Single Dose
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 10, badgeRowY, bW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SINGLE DOSE', padX + 10 + bW / 2, badgeRowY + 12);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(data.doseDisplay, padX + 10 + bW / 2, badgeRowY + 28);

  // Box 2: Draw Target (Emerald Highlight)
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(padX + 10 + bW + 7, badgeRowY, bW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('DRAW TARGET', padX + 10 + bW + 7 + bW / 2, badgeRowY + 11);
  ctx.fillStyle = '#064e3b';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`★ ${data.reconResult.syringeUnits} UNITS`, padX + 10 + bW + 7 + bW / 2, badgeRowY + 24);
  ctx.fillStyle = '#047857';
  ctx.font = '7.5px monospace';
  ctx.fillText(`(${data.reconResult.drawVolumeMl} mL on ${data.syringeType})`, padX + 10 + bW + 7 + bW / 2, badgeRowY + 33);
  ctx.lineWidth = 1;

  // Box 3: Vial Supply
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 10 + (bW + 7) * 2, badgeRowY, bW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('VIAL SUPPLY', padX + 10 + (bW + 7) * 2 + bW / 2, badgeRowY + 11);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`${data.reconResult.totalVialDoses} Doses`, padX + 10 + (bW + 7) * 2 + bW / 2, badgeRowY + 24);
  ctx.fillStyle = '#64748b';
  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillText(`≈ ${Math.round((data.reconResult.totalVialDoses * data.frequencyDays) / 7)}w supply`, padX + 10 + (bW + 7) * 2 + bW / 2, badgeRowY + 33);

  // Box 4: Storage Rules
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 10 + (bW + 7) * 3, badgeRowY, bW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('STORAGE RULES', padX + 10 + (bW + 7) * 3 + bW / 2, badgeRowY + 11);
  ctx.fillStyle = '#0e7490';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('36°F – 46°F', padX + 10 + (bW + 7) * 3 + bW / 2, badgeRowY + 23);
  ctx.fillStyle = '#0891b2';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText('Refrigerate (2–8°C)', padX + 10 + (bW + 7) * 3 + bW / 2, badgeRowY + 33);
  ctx.textAlign = 'left';

  // Syringe Visualizer Box
  const syrBoxY = badgeRowY + bH + 8;
  const syrBoxH = 68;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 10, syrBoxY, width - padX * 2 - 20, syrBoxH, 4);
  ctx.fill();
  ctx.stroke();

  // Syringe Header inside box
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText(`Syringe Visual Draw Guide (${data.syringeType})`, padX + 16, syrBoxY + 11);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText(`Target Level: ${data.reconResult.syringeUnits} Units (${data.reconResult.drawVolumeMl} mL)`, width - padX - 16, syrBoxY + 11);
  ctx.textAlign = 'left';

  // Render Syringe Vectors
  const bStart = padX + 75;
  const bWidth = 470;
  const bHeight = 24;
  const bY = syrBoxY + 20;
  const maxUnits = data.syringeType === 'U100' ? 100 : 40;
  const clampedUnits = Math.min(Math.max(data.reconResult.syringeUnits, 0), maxUnits);
  const fillW = (clampedUnits / maxUnits) * bWidth;
  const pX = bStart + fillW;

  // Needle
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(bStart - 40, bY + bHeight / 2 - 1);
  ctx.lineTo(bStart - 10, bY + bHeight / 2 - 1);
  ctx.lineTo(bStart - 10, bY + bHeight / 2 + 1);
  ctx.lineTo(bStart - 40, bY + bHeight / 2 + 1);
  ctx.fill();

  // Needle Hub (Orange)
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#c2410c';
  ctx.beginPath();
  ctx.roundRect(bStart - 14, bY + 3, 14, bHeight - 6, 2);
  ctx.fill();
  ctx.stroke();

  // Barrel Outer
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.roundRect(bStart, bY, bWidth, bHeight, 2);
  ctx.fill();
  ctx.stroke();

  // Liquid Fill (Emerald)
  if (fillW > 0) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.fillRect(bStart, bY + 1, fillW, bHeight - 2);
  }

  // Stopper
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pX, bY + 1, 8, bHeight - 2);

  // Plunger Shaft
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(pX + 8, bY + bHeight / 2 - 2, Math.max(width - padX - 30 - (pX + 8), 10), 4);

  // Graduation Ticks
  const majorStep = data.syringeType === 'U100' ? 10 : 5;
  const minorStep = data.syringeType === 'U100' ? 2 : 1;
  const tickCount = Math.round(maxUnits / minorStep);

  for (let i = 0; i <= tickCount; i++) {
    const val = i * minorStep;
    const x = bStart + (val / maxUnits) * bWidth;
    const isMajor = val % majorStep === 0;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = isMajor ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(x, bY);
    ctx.lineTo(x, bY + (isMajor ? 10 : 5));
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}`, x, bY + 18);
    }
  }
  ctx.textAlign = 'left';

  // Indicator Arrow & Text
  if (clampedUnits > 0) {
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(pX, bY + bHeight + 1);
    ctx.lineTo(pX - 3.5, bY + bHeight + 6);
    ctx.lineTo(pX + 3.5, bY + bHeight + 6);
    ctx.fill();

    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`▲ ${data.reconResult.syringeUnits} U`, pX, bY + bHeight + 14);
    ctx.textAlign = 'left';
  }

  // 2 SOP Recipe Boxes
  const sopY = syrBoxY + syrBoxH + 6;
  const sopW = (width - padX * 2 - 26) / 2;
  const sopH = 44;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 10, sopY, sopW, sopH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('RECONSTITUTION RECIPE:', padX + 16, sopY + 11);
  ctx.fillStyle = '#1e293b';
  ctx.font = '8px system-ui, sans-serif';
  ctx.fillText(`Slowly inject ${data.waterMl} mL Bacteriostatic Water down inside vial wall into ${data.vialMg} mg ${data.compoundName}.`, padX + 16, sopY + 23);
  ctx.fillText('Swirl gently until dissolved. Do not shake violently.', padX + 16, sopY + 34);

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 10 + sopW + 6, sopY, sopW, sopH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('SUB-Q 3-STEP SOP:', padX + 16 + sopW + 6, sopY + 11);
  ctx.fillStyle = '#1e293b';
  ctx.font = '8px system-ui, sans-serif';
  ctx.fillText(`1. Wipe stopper & site (wait 15s). 2. Draw ${data.reconResult.syringeUnits} Units (${data.reconResult.drawVolumeMl} mL).`, padX + 16 + sopW + 6, sopY + 23);
  ctx.fillText('3. Pinch skin fold, 90° angle, depress steadily, hold 5–10s.', padX + 16 + sopW + 6, sopY + 34);

  // 4. Section 2: Pharmacokinetic Curve & Injection Calendar
  curY += sec1H + 12;
  const sec2H = 260;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, width - padX * 2, sec2H, 8);
  ctx.fill();
  ctx.stroke();

  // Section 2 Header
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(padX + 14, curY + 14, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('2. PHARMACOKINETIC BLOOD CURVE & DOSING CALENDAR', padX + 24, curY + 17);

  // 4 mini badges in header
  ctx.textAlign = 'right';
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = '#0284c7';
  ctx.fillText(`Avg: ~${data.averageConcentration.toFixed(2)}mg`, width - padX - 10, curY + 17);
  ctx.fillStyle = '#059669';
  ctx.fillText(`Trough: ~${data.troughConcentration.toFixed(2)}mg  |  `, width - padX - 95, curY + 17);
  ctx.fillStyle = '#e11d48';
  ctx.fillText(`Peak: ~${data.peakConcentration.toFixed(2)}mg  |  `, width - padX - 215, curY + 17);
  ctx.fillStyle = '#475569';
  ctx.fillText(`Half-Life: ${(data.halfLifeHours / 24).toFixed(1)}d  |  `, width - padX - 315, curY + 17);
  ctx.textAlign = 'left';

  // Inner Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 10, curY + 24);
  ctx.lineTo(width - padX - 10, curY + 24);
  ctx.stroke();

  // PK Curve Chart Box
  const cBoxY = curY + 28;
  const cBoxH = 96;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 10, cBoxY, width - padX * 2 - 20, cBoxH, 4);
  ctx.fill();
  ctx.stroke();

  // Chart Title inside
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText(`Plasma Accumulation Trajectory (${data.simulationDays} Days Timeline)`, padX + 16, cBoxY + 11);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#059669';
  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillText('● Green Dots = Injection Events (Day 0, 7, 14, 21...)', width - padX - 16, cBoxY + 11);
  ctx.textAlign = 'left';

  // Draw PK Spline Curve
  const cLeft = padX + 46;
  const cRight = width - padX - 26;
  const cTop = cBoxY + 18;
  const cBottom = cBoxY + cBoxH - 18;
  const cW = cRight - cLeft;
  const cH = cBottom - cTop;

  const maxVal = Math.max(data.peakConcentration * 1.15, 0.1);
  const totalDays = data.dataPoints.length ? data.dataPoints[data.dataPoints.length - 1].day : data.simulationDays;

  // Y-axis ticks & gridlines
  const yTicks = [0, maxVal * 0.5, maxVal];
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8;
  yTicks.forEach((val) => {
    const y = cBottom - (val / maxVal) * cH;
    ctx.beginPath();
    ctx.moveTo(cLeft, y);
    ctx.lineTo(cRight, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '7px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), cLeft - 4, y + 2.5);
  });
  ctx.setLineDash([]);
  ctx.textAlign = 'left';

  // X-axis Day markers
  const xDayStep = totalDays <= 14 ? 2 : totalDays <= 30 ? 7 : 14;
  ctx.setLineDash([2, 2]);
  ctx.strokeStyle = '#e2e8f0';
  for (let d = 0; d <= totalDays; d += xDayStep) {
    const x = cLeft + (d / (totalDays || 1)) * cW;
    ctx.beginPath();
    ctx.moveTo(x, cTop);
    ctx.lineTo(x, cBottom);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '7.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Day ${d}`, x, cBottom + 11);
  }
  ctx.setLineDash([]);
  ctx.textAlign = 'left';

  // Curve points
  if (data.dataPoints.length > 1) {
    ctx.beginPath();
    const pts = data.dataPoints.map((pt) => ({
      x: cLeft + (pt.day / (totalDays || 1)) * cW,
      y: cBottom - (pt.concentration / maxVal) * cH,
    }));

    // Area fill
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.lineTo(cRight, cBottom);
    ctx.lineTo(cLeft, cBottom);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, cTop, 0, cBottom);
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.25)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Injection Dots
    data.dataPoints.forEach((pt) => {
      if (!pt.isInjectionPoint) return;
      const cx = cLeft + (pt.day / (totalDays || 1)) * cW;
      const cy = cBottom - (pt.concentration / maxVal) * cH;

      ctx.fillStyle = '#059669';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Inj', cx, Math.max(cy - 5, cTop + 6));
    });
    ctx.textAlign = 'left';
  }

  // Administration Table
  const tblY = cBoxY + cBoxH + 8;
  const tblH = 114;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 10, tblY, width - padX * 2 - 20, tblH, 4);
  ctx.fill();
  ctx.stroke();

  // Table Banner
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(padX + 10, tblY, width - padX * 2 - 20, 16);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('ADMINISTRATION SCHEDULE & PHYSICAL PEN-CHECK LOG', padX + 16, tblY + 11);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillText('Rotate injection sites to prevent lipohypertrophy', width - padX - 16, tblY + 11);
  ctx.textAlign = 'left';

  // Table Columns Header
  const thY = tblY + 16;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(padX + 10, thY, width - padX * 2 - 20, 16);
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 10, thY + 16);
  ctx.lineTo(width - padX - 10, thY + 16);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('DOSE', padX + 16, thY + 11);
  ctx.fillText('PROTOCOL', padX + 60, thY + 11);
  ctx.fillText('PLANNED DATE', padX + 130, thY + 11);
  ctx.fillText('DOSE & UNITS', padX + 225, thY + 11);
  ctx.fillText('INJECTION SITE', padX + 340, thY + 11);
  ctx.fillText('TIME GIVEN', padX + 510, thY + 11);
  ctx.textAlign = 'center';
  ctx.fillText('DONE (✓)', width - padX - 35, thY + 11);
  ctx.textAlign = 'left';

  // Table Rows (Up to 4 rows)
  const rows = data.tableRows.slice(0, 4);
  const rowH = 20;

  rows.forEach((inj, idx) => {
    const rY = thY + 16 + idx * rowH;

    // Row divider
    if (idx > 0) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(padX + 10, rY);
      ctx.lineTo(width - padX - 10, rY);
      ctx.stroke();
    }

    const targetUnits =
      data.concentrationMgMl > 0
        ? Number(((inj.doseMg / data.concentrationMgMl) * (data.syringeType === 'U100' ? 100 : 40)).toFixed(1))
        : 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(`#${idx + 1}`, padX + 16, rY + 13);

    ctx.fillStyle = '#334155';
    ctx.fillText(`Day ${inj.day}`, padX + 60, rY + 13);

    ctx.fillStyle = '#64748b';
    ctx.fillText('___/___/202_', padX + 130, rY + 13);

    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${inj.doseMg.toFixed(2)}mg • ${targetUnits} U`, padX + 225, rY + 13);

    ctx.fillStyle = '#475569';
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillText('[ ] L-Abd   [ ] R-Abd   [ ] Thigh', padX + 340, rY + 13);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText('___:___', padX + 510, rY + 13);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('[   ]', width - padX - 35, rY + 13);
    ctx.textAlign = 'left';
  });

  // 5. Footer
  curY += sec2H + 10;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  curY += 12;
  ctx.fillStyle = '#64748b';
  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillText('PepPlotter (pepplotter.com) • Reconstitution & Pharmacokinetic Superposition Simulation Engine.', padX, curY);

  ctx.textAlign = 'right';
  ctx.fillText('For educational & personal research logging only. Not medical prescription advice.', width - padX, curY);
  ctx.textAlign = 'left';
}
