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
 * Proportioned strictly to standard A4 ratio (1 : 1.36 ~ 1.41) to avoid squat/flattened distortion.
 * Complete vector syringe with authentic plunger shaft and thumb rest flange.
 * Zero text collisions across all headers and badges.
 */
export function renderSheetToCanvas(canvas: HTMLCanvasElement, data: SheetCanvasData): void {
  // A4-proportioned dimensions: 720 x 980 (aspect ratio ~0.735, matching A4 portrait 0.707)
  const width = 720;
  const height = 980;
  const scale = 2; // 2x Retina clarity (1440 x 1960)

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

  // ============================================================
  // 1. TOP DOCUMENT HEADER
  // ============================================================
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('PEPPLOTTER CLINICAL PROTOCOL & PK REPORT', padX, curY + 14);

  // Badge "MEMO"
  const badgeText = 'MEMO';
  ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 10;
  const badgeX = padX + 395;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(badgeX, curY + 3, badgeW, 15, 3);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badgeText, badgeX + 5, curY + 14);

  // Right date & domain
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, width - padX, curY + 10);
  ctx.fillStyle = '#64748b';
  ctx.font = '9.5px system-ui, sans-serif';
  ctx.fillText('pepplotter.com', width - padX, curY + 23);
  ctx.textAlign = 'left';

  // Subtitle
  curY += 28;
  ctx.fillStyle = '#64748b';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('Reconstitution Guide • Syringe Draw Target • Pharmacokinetic Curve • Administration Log', padX, curY);

  // Divider
  curY += 8;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  // ============================================================
  // 2. COMPOUND SPECIFICATION STRIP
  // ============================================================
  curY += 12;
  const stripH = 52;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, width - padX * 2, stripH, 6);
  ctx.fill();
  ctx.stroke();

  // Line 1: Compound name & Concentration
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.fillText('COMPOUND:', padX + 12, curY + 18);
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 12.5px system-ui, sans-serif';
  const cName = data.brandNames ? `${data.compoundName} (${data.brandNames})` : data.compoundName;
  ctx.fillText(cName, padX + 82, curY + 18);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.fillText('CONCENTRATION: ', width - padX - 170, curY + 18);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11.5px monospace';
  ctx.fillText(`${data.concentrationMgMl.toFixed(2)} mg/mL (${data.concentrationMcgMl.toFixed(0)} mcg/mL)`, width - padX - 12, curY + 18);
  ctx.textAlign = 'left';

  // Divider inside strip
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 10, curY + 27);
  ctx.lineTo(width - padX - 10, curY + 27);
  ctx.stroke();

  // Line 2: 4 columns
  const colW = (width - padX * 2 - 24) / 4;
  const subY = curY + 42;
  ctx.font = '9.5px system-ui, sans-serif';

  ctx.fillStyle = '#64748b';
  ctx.fillText('Vial Powder: ', padX + 12, subY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9.5px monospace';
  ctx.fillText(`${data.vialMg} mg`, padX + 74, subY);

  ctx.font = '9.5px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('BAC Water: ', padX + 12 + colW, subY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9.5px monospace';
  ctx.fillText(`${data.waterMl} mL`, padX + 12 + colW + 65, subY);

  ctx.font = '9.5px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Recon Date: ', padX + 12 + colW * 2, subY);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9.5px monospace';
  ctx.fillText('___/___/202_', padX + 12 + colW * 2 + 66, subY);

  ctx.font = '9.5px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('28-Day Discard: ', padX + 12 + colW * 3, subY);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9.5px monospace';
  ctx.fillText('___/___/202_', padX + 12 + colW * 3 + 80, subY);

  // ============================================================
  // 3. SECTION 1: RECONSTITUTION & SYRINGE DRAW
  // ============================================================
  curY += stripH + 14;
  const sec1H = 262;
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
  ctx.arc(padX + 14, curY + 16, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('1. RECONSTITUTION & PRECISION SYRINGE DRAW', padX + 26, curY + 20);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillText(`Syringe: ${data.syringeType} (1 Unit = ${data.syringeType === 'U100' ? '0.01' : '0.025'} mL)`, width - padX - 12, curY + 20);
  ctx.textAlign = 'left';

  // Inner Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 12, curY + 28);
  ctx.lineTo(width - padX - 12, curY + 28);
  ctx.stroke();

  // 4 Action Badges
  const badgeRowY = curY + 34;
  const bW = (width - padX * 2 - 36) / 4;
  const bH = 46;

  // Box 1: Single Dose
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 12, badgeRowY, bW, bH, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SINGLE DOSE', padX + 12 + bW / 2, badgeRowY + 14);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(data.doseDisplay, padX + 12 + bW / 2, badgeRowY + 33);

  // Box 2: Draw Target (Emerald Highlight)
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(padX + 12 + bW + 8, badgeRowY, bW, bH, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('DRAW TARGET', padX + 12 + bW + 8 + bW / 2, badgeRowY + 13);
  ctx.fillStyle = '#064e3b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`★ ${data.reconResult.syringeUnits} UNITS`, padX + 12 + bW + 8 + bW / 2, badgeRowY + 29);
  ctx.fillStyle = '#047857';
  ctx.font = '8px monospace';
  ctx.fillText(`(${data.reconResult.drawVolumeMl} mL on ${data.syringeType})`, padX + 12 + bW + 8 + bW / 2, badgeRowY + 40);
  ctx.lineWidth = 1;

  // Box 3: Vial Supply
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 12 + (bW + 8) * 2, badgeRowY, bW, bH, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('VIAL SUPPLY', padX + 12 + (bW + 8) * 2 + bW / 2, badgeRowY + 13);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`${data.reconResult.totalVialDoses} Doses`, padX + 12 + (bW + 8) * 2 + bW / 2, badgeRowY + 29);
  ctx.fillStyle = '#64748b';
  ctx.font = '8px system-ui, sans-serif';
  ctx.fillText(`≈ ${Math.round((data.reconResult.totalVialDoses * data.frequencyDays) / 7)}w supply`, padX + 12 + (bW + 8) * 2 + bW / 2, badgeRowY + 40);

  // Box 4: Storage Rules
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 12 + (bW + 8) * 3, badgeRowY, bW, bH, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('STORAGE RULES', padX + 12 + (bW + 8) * 3 + bW / 2, badgeRowY + 13);
  ctx.fillStyle = '#0e7490';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('36°F – 46°F', padX + 12 + (bW + 8) * 3 + bW / 2, badgeRowY + 28);
  ctx.fillStyle = '#0891b2';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('Refrigerate (2–8°C)', padX + 12 + (bW + 8) * 3 + bW / 2, badgeRowY + 40);
  ctx.textAlign = 'left';

  // -------------------------------------------------------------
  // Full Vector Syringe Diagram (Accurate Barrel, Hub & Plunger Flange)
  // -------------------------------------------------------------
  const syrBoxY = badgeRowY + bH + 10;
  const syrBoxH = 88;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 12, syrBoxY, width - padX * 2 - 24, syrBoxH, 6);
  ctx.fill();
  ctx.stroke();

  // Syringe Header inside box
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillText(`Syringe Visual Draw Guide (${data.syringeType})`, padX + 18, syrBoxY + 14);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 9.5px monospace';
  ctx.fillText(`Target Level: ${data.reconResult.syringeUnits} Units (${data.reconResult.drawVolumeMl} mL)`, width - padX - 18, syrBoxY + 14);
  ctx.textAlign = 'left';

  // Syringe Geometry
  const bStart = padX + 78;
  const bWidth = 420; // 0 to 100 units
  const bHeight = 28;
  const bY = syrBoxY + 26;
  const maxUnits = data.syringeType === 'U100' ? 100 : 40;
  const clampedUnits = Math.min(Math.max(data.reconResult.syringeUnits, 0), maxUnits);
  const fillW = (clampedUnits / maxUnits) * bWidth;
  const pX = bStart + fillW;

  // 1. Needle (Steel Shaft & Bevel)
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(bStart - 44, bY + bHeight / 2 - 1);
  ctx.lineTo(bStart - 12, bY + bHeight / 2 - 1);
  ctx.lineTo(bStart - 12, bY + bHeight / 2 + 1);
  ctx.lineTo(bStart - 44, bY + bHeight / 2 + 1);
  ctx.fill();

  // 2. Needle Hub (Orange Plastic Collar)
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bStart - 14, bY + 3, 14, bHeight - 6, 2);
  ctx.fill();
  ctx.stroke();

  // 3. Barrel Outer Glass/Plastic Body
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bStart, bY, bWidth, bHeight, 3);
  ctx.fill();
  ctx.stroke();

  // 4. Barrel Finger Grip Flange (At Right End of Barrel)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.roundRect(bStart + bWidth - 1, bY - 6, 7, bHeight + 12, 2);
  ctx.fill();
  ctx.stroke();

  // 5. Liquid Fill (Emerald Green)
  if (fillW > 0) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.fillRect(bStart, bY + 1.5, fillW, bHeight - 3);
  }

  // 6. Plunger Rubber Stopper Head
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(pX, bY + 1.5, 9, bHeight - 3, 1);
  ctx.fill();
  ctx.stroke();

  // Stopper Rib Rings
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pX + 3, bY + 3);
  ctx.lineTo(pX + 3, bY + bHeight - 3);
  ctx.moveTo(pX + 6, bY + 3);
  ctx.lineTo(pX + 6, bY + bHeight - 3);
  ctx.stroke();

  // 7. Plunger Shaft (Extending from Stopper to Thumb Rest)
  const plungerThumbX = Math.min(bStart + bWidth + 30 + fillW * 0.25, width - padX - 30);
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.rect(pX + 9, bY + bHeight / 2 - 3, plungerThumbX - (pX + 9), 6);
  ctx.fill();
  ctx.stroke();

  // 8. Plunger Thumb Rest Flange (The tail / thumb push button)
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(plungerThumbX, bY - 6, 7, bHeight + 12, 2.5);
  ctx.fill();
  ctx.stroke();

  // Grip ribs on thumb rest
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(plungerThumbX + 2.5, bY - 2);
  ctx.lineTo(plungerThumbX + 2.5, bY + bHeight + 2);
  ctx.moveTo(plungerThumbX + 4.5, bY - 2);
  ctx.lineTo(plungerThumbX + 4.5, bY + bHeight + 2);
  ctx.stroke();

  // 9. Graduation Ticks & Numbers
  const majorStep = data.syringeType === 'U100' ? 10 : 5;
  const minorStep = data.syringeType === 'U100' ? 2 : 1;
  const tickCount = Math.round(maxUnits / minorStep);

  for (let i = 0; i <= tickCount; i++) {
    const val = i * minorStep;
    const x = bStart + (val / maxUnits) * bWidth;
    const isMajor = val % majorStep === 0;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = isMajor ? 1.25 : 0.65;
    ctx.beginPath();
    ctx.moveTo(x, bY);
    ctx.lineTo(x, bY + (isMajor ? 11 : 6));
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}`, x, bY + 21);
    }
  }
  ctx.textAlign = 'left';

  // 10. Target Indicator Arrow & Target Badge
  if (clampedUnits > 0) {
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(pX, bY + bHeight + 2);
    ctx.lineTo(pX - 4, bY + bHeight + 8);
    ctx.lineTo(pX + 4, bY + bHeight + 8);
    ctx.fill();

    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`▲ ${data.reconResult.syringeUnits} U`, pX, bY + bHeight + 18);
    ctx.textAlign = 'left';
  }

  // 2 SOP Recipe Boxes
  const sopY = syrBoxY + syrBoxH + 8;
  const sopW = (width - padX * 2 - 32) / 2;
  const sopH = 50;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 12, sopY, sopW, sopH, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('RECONSTITUTION RECIPE:', padX + 18, sopY + 13);
  ctx.fillStyle = '#1e293b';
  ctx.font = '8.5px system-ui, sans-serif';
  ctx.fillText(`Slowly inject ${data.waterMl} mL Bacteriostatic Water down inside vial wall into ${data.vialMg} mg ${data.compoundName}.`, padX + 18, sopY + 26);
  ctx.fillText('Swirl gently until fully dissolved. Do not shake violently.', padX + 18, sopY + 39);

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 12 + sopW + 8, sopY, sopW, sopH, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('SUB-Q 3-STEP SOP:', padX + 18 + sopW + 8, sopY + 13);
  ctx.fillStyle = '#1e293b';
  ctx.font = '8.5px system-ui, sans-serif';
  ctx.fillText(`1. Wipe stopper & site (wait 15s). 2. Draw ${data.reconResult.syringeUnits} Units (${data.reconResult.drawVolumeMl} mL).`, padX + 18 + sopW + 8, sopY + 26);
  ctx.fillText('3. Pinch skin fold, 90° angle, depress steadily, hold 5–10s before release.', padX + 18 + sopW + 8, sopY + 39);

  // ============================================================
  // 4. SECTION 2: PHARMACOKINETIC ACCUMULATION & SCHEDULE
  // ============================================================
  curY += sec1H + 14;
  const sec2H = 300;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, width - padX * 2, sec2H, 8);
  ctx.fill();
  ctx.stroke();

  // Section 2 Header (Title on left, clean spacing to prevent overlap)
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(padX + 14, curY + 17, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10.5px system-ui, sans-serif';
  ctx.fillText('2. PK ACCUMULATION & SCHEDULE', padX + 24, curY + 20);

  // 4 Badges on the right: Rendered right-to-left with pill styling (100% collision-proof)
  ctx.font = 'bold 8px monospace';
  const badges = [
    { label: `Avg: ~${data.averageConcentration.toFixed(2)}mg`, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
    { label: `Trough: ~${data.troughConcentration.toFixed(2)}mg`, color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    { label: `Peak: ~${data.peakConcentration.toFixed(2)}mg`, color: '#be123c', bg: '#fff1f2', border: '#fecdd3' },
    { label: `HL: ${(data.halfLifeHours / 24).toFixed(1)}d`, color: '#334155', bg: '#f1f5f9', border: '#cbd5e1' },
  ];

  let currentRight = width - padX - 12;
  for (const b of badges) {
    const textWidth = ctx.measureText(b.label).width;
    const badgeW = textWidth + 10;
    const badgeH = 15;
    const badgeX = currentRight - badgeW;
    const badgeY = curY + 11;

    // Badge pill background
    ctx.fillStyle = b.bg;
    ctx.strokeStyle = b.border;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.stroke();

    // Badge text
    ctx.fillStyle = b.color;
    ctx.textAlign = 'center';
    ctx.fillText(b.label, badgeX + badgeW / 2, badgeY + 10.5);

    currentRight = badgeX - 5; // 5px gap between badges
  }
  ctx.textAlign = 'left';

  // Inner Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 12, curY + 28);
  ctx.lineTo(width - padX - 12, curY + 28);
  ctx.stroke();

  // PK Curve Chart Box
  const cBoxY = curY + 34;
  const cBoxH = 110;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + 12, cBoxY, width - padX * 2 - 24, cBoxH, 6);
  ctx.fill();
  ctx.stroke();

  // Chart Title inside
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillText(`Plasma Accumulation Trajectory (${data.simulationDays} Days Timeline)`, padX + 18, cBoxY + 14);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#059669';
  ctx.font = '8px system-ui, sans-serif';
  ctx.fillText('● Green Dots = Injection Events (Day 0, 7, 14, 21...)', width - padX - 18, cBoxY + 14);
  ctx.textAlign = 'left';

  // Draw PK Spline Curve
  const cLeft = padX + 50;
  const cRight = width - padX - 30;
  const cTop = cBoxY + 22;
  const cBottom = cBoxY + cBoxH - 22;
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
    ctx.font = '7.5px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), cLeft - 5, y + 3);
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
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Day ${d}`, x, cBottom + 13);
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
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.28)');
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
    ctx.lineWidth = 2.25;
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
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 7.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Inj', cx, Math.max(cy - 6, cTop + 6));
    });
    ctx.textAlign = 'left';
  }

  // Administration Table
  const tblY = cBoxY + cBoxH + 10;
  const tblH = 130;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + 12, tblY, width - padX * 2 - 24, tblH, 5);
  ctx.fill();
  ctx.stroke();

  // Table Banner
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(padX + 12, tblY, width - padX * 2 - 24, 18);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('ADMINISTRATION SCHEDULE & PHYSICAL PEN-CHECK LOG', padX + 18, tblY + 12);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '8px system-ui, sans-serif';
  ctx.fillText('Rotate injection sites to prevent lipohypertrophy', width - padX - 18, tblY + 12);
  ctx.textAlign = 'left';

  // Table Columns Header
  const thY = tblY + 18;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(padX + 12, thY, width - padX * 2 - 24, 18);
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 12, thY + 18);
  ctx.lineTo(width - padX - 12, thY + 18);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('DOSE', padX + 18, thY + 12);
  ctx.fillText('PROTOCOL', padX + 64, thY + 12);
  ctx.fillText('PLANNED DATE', padX + 138, thY + 12);
  ctx.fillText('DOSE & UNITS', padX + 236, thY + 12);
  ctx.fillText('INJECTION SITE', padX + 355, thY + 12);
  ctx.fillText('TIME GIVEN', padX + 530, thY + 12);
  ctx.textAlign = 'center';
  ctx.fillText('DONE (✓)', width - padX - 38, thY + 12);
  ctx.textAlign = 'left';

  // Table Rows (Up to 4 rows)
  const rows = data.tableRows.slice(0, 4);
  const rowH = 23;

  rows.forEach((inj, idx) => {
    const rY = thY + 18 + idx * rowH;

    // Row divider
    if (idx > 0) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(padX + 12, rY);
      ctx.lineTo(width - padX - 12, rY);
      ctx.stroke();
    }

    const targetUnits =
      data.concentrationMgMl > 0
        ? Number(((inj.doseMg / data.concentrationMgMl) * (data.syringeType === 'U100' ? 100 : 40)).toFixed(1))
        : 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`#${idx + 1}`, padX + 18, rY + 15);

    ctx.fillStyle = '#334155';
    ctx.fillText(`Day ${inj.day}`, padX + 64, rY + 15);

    ctx.fillStyle = '#64748b';
    ctx.fillText('___/___/202_', padX + 138, rY + 15);

    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${inj.doseMg.toFixed(2)}mg • ${targetUnits} U`, padX + 236, rY + 15);

    ctx.fillStyle = '#475569';
    ctx.font = '8.5px system-ui, sans-serif';
    ctx.fillText('[ ] L-Abd   [ ] R-Abd   [ ] Thigh', padX + 355, rY + 15);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8.5px monospace';
    ctx.fillText('___:___', padX + 530, rY + 15);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('[   ]', width - padX - 38, rY + 15);
    ctx.textAlign = 'left';
  });

  // ============================================================
  // 5. FOOTER
  // ============================================================
  curY += sec2H + 14;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  curY += 14;
  ctx.fillStyle = '#64748b';
  ctx.font = '8px system-ui, sans-serif';
  ctx.fillText('PepPlotter (pepplotter.com) • Reconstitution & Pharmacokinetic Superposition Simulation Engine.', padX, curY);

  ctx.textAlign = 'right';
  ctx.fillText('For educational & personal research logging only. Not medical prescription advice.', width - padX, curY);
  ctx.textAlign = 'left';
}
