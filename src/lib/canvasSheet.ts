import { SyringeType, ReconstitutionResult, ConcentrationDataPoint } from './types';

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
 * Perfectly calibrated to native mobile card proportions (aspect ratio ~0.60)
 * with ZERO trailing blank space, authentic syringe vectors, and 100% English text.
 */
export function renderSheetToCanvas(canvas: HTMLCanvasElement, data: SheetCanvasData): void {
  // Mobile-first proportional canvas width (440px base, rendered at 2x Retina: 880px)
  const width = 440;
  const scale = 2; // High-definition 2x Retina clarity

  // We perform an exact layout measurement so canvas height wraps content with 0 blank void
  const padX = 14;
  const contentW = width - padX * 2; // 412px
  const innerPad = 8;
  const innerW = contentW - innerPad * 2; // 396px

  // Pre-calculate Section Heights
  const bH = 46; // 4 action badges
  const syrBoxH = 74; // Syringe diagram
  const sopH = 48; // SOP recipe & sub-q
  const sec1H = 26 + bH + 6 + syrBoxH + 6 + sopH + 8; // ~214px

  const cBoxH = 88; // PK curve chart
  const tblHeaderH = 16;
  const rows = data.tableRows.slice(0, 4);
  const rowCount = Math.max(rows.length, 1);
  const rowH = 19;
  const tblH = tblHeaderH + rowCount * rowH; // ~92px
  const sec2H = 26 + cBoxH + 6 + tblH + 8; // ~220px

  const stripH = 54; // Compound strip

  // Measure exact total height needed
  let curY = 14;
  curY += 38; // Header & subtitle
  curY += stripH + 8; // Compound strip
  curY += sec1H + 8; // Section 1
  curY += sec2H + 8; // Section 2
  curY += 28; // Footer
  curY += 14; // Bottom padding

  const totalHeight = curY;

  // Set physical canvas dimensions (zero blank space at bottom)
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(totalHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // Reset cursor for drawing pass
  curY = 14;

  // ============================================================
  // 1. TOP DOCUMENT HEADER
  // ============================================================
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('PEPPLOTTER PROTOCOL & PK REPORT', padX, curY + 12);

  // Badge "MEMO"
  const memoText = 'MEMO';
  ctx.font = 'bold 7.5px system-ui, -apple-system, sans-serif';
  const memoW = ctx.measureText(memoText).width + 8;
  const memoX = padX + 225;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(memoX, curY + 2, memoW, 12, 2.5);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(memoText, memoX + 4, curY + 10.5);

  // Right date & domain
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, width - padX, curY + 9);
  ctx.fillStyle = '#64748b';
  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillText('pepplotter.com', width - padX, curY + 19);
  ctx.textAlign = 'left';

  // Subtitle
  curY += 23;
  ctx.fillStyle = '#64748b';
  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillText('Reconstitution Guide • Syringe Draw Target • Pharmacokinetic Curve • Administration Log', padX, curY);

  // Divider
  curY += 6;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  // ============================================================
  // 2. COMPOUND SPECIFICATION STRIP
  // ============================================================
  curY += 8;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, contentW, stripH, 5);
  ctx.fill();
  ctx.stroke();

  // Line 1: Compound name & Concentration
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText('COMPOUND:', padX + 8, curY + 15);
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 10px system-ui, sans-serif';
  const cName = data.brandNames ? `${data.compoundName} (${data.brandNames})` : data.compoundName;
  ctx.fillText(cName, padX + 64, curY + 15);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText('CONCENTRATION: ', width - padX - 135, curY + 15);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${data.concentrationMgMl.toFixed(2)} mg/mL (${data.concentrationMcgMl.toFixed(0)} mcg/mL)`, width - padX - 8, curY + 15);
  ctx.textAlign = 'left';

  // Divider inside strip
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 8, curY + 24);
  ctx.lineTo(width - padX - 8, curY + 24);
  ctx.stroke();

  // Line 2: 4 columns
  const colW = (contentW - 16) / 4;
  const subY = curY + 38;
  ctx.font = '7.5px system-ui, sans-serif';

  ctx.fillStyle = '#64748b';
  ctx.fillText('Vial Powder: ', padX + 8, subY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`${data.vialMg} mg`, padX + 56, subY);

  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('BAC Water: ', padX + 8 + colW, subY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`${data.waterMl} mL`, padX + 8 + colW + 50, subY);

  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Recon Date: ', padX + 8 + colW * 2, subY);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('___/___/202_', padX + 8 + colW * 2 + 52, subY);

  ctx.font = '7.5px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Discard: ', padX + 8 + colW * 3, subY);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('___/___/202_', padX + 8 + colW * 3 + 36, subY);

  // ============================================================
  // 3. SECTION 1: RECONSTITUTION & SYRINGE DRAW
  // ============================================================
  curY += stripH + 8;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, contentW, sec1H, 6);
  ctx.fill();
  ctx.stroke();

  // Section 1 Header
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.arc(padX + 11, curY + 14, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('1. RECONSTITUTION & PRECISION SYRINGE DRAW', padX + 20, curY + 17);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText(`Syringe: ${data.syringeType} (1 Unit = ${data.syringeType === 'U100' ? '0.01' : '0.025'} mL)`, width - padX - 8, curY + 17);
  ctx.textAlign = 'left';

  // Inner Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 8, curY + 24);
  ctx.lineTo(width - padX - 8, curY + 24);
  ctx.stroke();

  // 4 Action Badges
  const badgeRowY = curY + 28;
  const badgeW = (innerW - 9) / 4; // ~96px

  // Box 1: Single Dose
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad, badgeRowY, badgeW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SINGLE DOSE', padX + innerPad + badgeW / 2, badgeRowY + 13);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(data.doseDisplay, padX + innerPad + badgeW / 2, badgeRowY + 31);

  // Box 2: Draw Target (Emerald Highlight)
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(padX + innerPad + badgeW + 3, badgeRowY, badgeW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillText('DRAW TARGET', padX + innerPad + badgeW + 3 + badgeW / 2, badgeRowY + 12);
  ctx.fillStyle = '#064e3b';
  ctx.font = 'bold 11.5px monospace';
  ctx.fillText(`★ ${data.reconResult.syringeUnits} UNITS`, padX + innerPad + badgeW + 3 + badgeW / 2, badgeRowY + 28);
  ctx.fillStyle = '#047857';
  ctx.font = '6.8px monospace';
  ctx.fillText(`(${data.reconResult.drawVolumeMl} mL on ${data.syringeType})`, padX + innerPad + badgeW + 3 + badgeW / 2, badgeRowY + 39);
  ctx.lineWidth = 1;

  // Box 3: Vial Supply
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad + (badgeW + 3) * 2, badgeRowY, badgeW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillText('VIAL SUPPLY', padX + innerPad + (badgeW + 3) * 2 + badgeW / 2, badgeRowY + 12);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`${data.reconResult.totalVialDoses} Doses`, padX + innerPad + (badgeW + 3) * 2 + badgeW / 2, badgeRowY + 28);
  ctx.fillStyle = '#64748b';
  ctx.font = '6.8px system-ui, sans-serif';
  ctx.fillText(`≈ ${Math.round((data.reconResult.totalVialDoses * data.frequencyDays) / 7)}w supply`, padX + innerPad + (badgeW + 3) * 2 + badgeW / 2, badgeRowY + 39);

  // Box 4: Storage Rules
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad + (badgeW + 3) * 3, badgeRowY, badgeW, bH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillText('STORAGE RULES', padX + innerPad + (badgeW + 3) * 3 + badgeW / 2, badgeRowY + 12);
  ctx.fillStyle = '#0e7490';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('36°F – 46°F', padX + innerPad + (badgeW + 3) * 3 + badgeW / 2, badgeRowY + 27);
  ctx.fillStyle = '#0891b2';
  ctx.font = 'bold 6.8px system-ui, sans-serif';
  ctx.fillText('Refrigerate (2–8°C)', padX + innerPad + (badgeW + 3) * 3 + badgeW / 2, badgeRowY + 39);
  ctx.textAlign = 'left';

  // -------------------------------------------------------------
  // Full Vector Syringe Diagram (Accurate Barrel, Hub & Plunger Flange)
  // -------------------------------------------------------------
  const syrBoxY = badgeRowY + bH + 6;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad, syrBoxY, innerW, syrBoxH, 5);
  ctx.fill();
  ctx.stroke();

  // Syringe Header inside box
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText(`Syringe Visual Draw Guide (${data.syringeType})`, padX + innerPad + 6, syrBoxY + 12);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`Target Level: ${data.reconResult.syringeUnits} Units (${data.reconResult.drawVolumeMl} mL)`, width - padX - innerPad - 6, syrBoxY + 12);
  ctx.textAlign = 'left';

  // Syringe Geometry
  const bStart = padX + innerPad + 44;
  const bWidth = 270; // 0 to 100 units
  const bHeight = 22;
  const bY = syrBoxY + 23;
  const maxUnits = data.syringeType === 'U100' ? 100 : 40;
  const clampedUnits = Math.min(Math.max(data.reconResult.syringeUnits, 0), maxUnits);
  const fillW = (clampedUnits / maxUnits) * bWidth;
  const pX = bStart + fillW;

  // 1. Needle (Steel Shaft)
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(bStart - 28, bY + bHeight / 2 - 1);
  ctx.lineTo(bStart - 8, bY + bHeight / 2 - 1);
  ctx.lineTo(bStart - 8, bY + bHeight / 2 + 1);
  ctx.lineTo(bStart - 28, bY + bHeight / 2 + 1);
  ctx.fill();

  // 2. Needle Hub (Orange Collar)
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(bStart - 8, bY + 2, 8, bHeight - 4, 1.5);
  ctx.fill();
  ctx.stroke();

  // 3. Barrel Body
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(bStart, bY, bWidth, bHeight, 2);
  ctx.fill();
  ctx.stroke();

  // 4. Barrel Finger Grip Flange
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bStart + bWidth - 1, bY - 4, 4.5, bHeight + 8, 1.5);
  ctx.fill();
  ctx.stroke();

  // 5. Liquid Fill
  if (fillW > 0) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.fillRect(bStart, bY + 1.2, fillW, bHeight - 2.4);
  }

  // 6. Plunger Rubber Stopper Head
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(pX, bY + 1.2, 7, bHeight - 2.4, 1);
  ctx.fill();
  ctx.stroke();

  // Stopper Rib Rings
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(pX + 2.5, bY + 2.5);
  ctx.lineTo(pX + 2.5, bY + bHeight - 2.5);
  ctx.moveTo(pX + 4.5, bY + 2.5);
  ctx.lineTo(pX + 4.5, bY + bHeight - 2.5);
  ctx.stroke();

  // 7. Plunger Shaft
  const plungerThumbX = Math.min(bStart + bWidth + 24 + fillW * 0.15, width - padX - innerPad - 16);
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.rect(pX + 7, bY + bHeight / 2 - 2, Math.max(plungerThumbX - (pX + 7), 6), 4);
  ctx.fill();
  ctx.stroke();

  // 8. Plunger Thumb Rest Flange
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(plungerThumbX, bY - 4, 5, bHeight + 8, 1.5);
  ctx.fill();
  ctx.stroke();

  // Grip ribs on thumb rest
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(plungerThumbX + 2, bY - 1);
  ctx.lineTo(plungerThumbX + 2, bY + bHeight + 1);
  ctx.stroke();

  // 9. Graduation Ticks & Numbers
  const majorStep = data.syringeType === 'U100' ? 10 : 5;
  const minorStep = data.syringeType === 'U100' ? 2 : 1;
  const totalSteps = Math.round(maxUnits / minorStep);

  for (let i = 0; i <= totalSteps; i++) {
    const val = i * minorStep;
    const x = bStart + (val / maxUnits) * bWidth;
    const isMajor = val % majorStep === 0;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = isMajor ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, bY);
    ctx.lineTo(x, bY + (isMajor ? 8 : 4));
    ctx.stroke();

    if (isMajor && val > 0 && val < maxUnits) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 6.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x, bY + 16);
    }
  }
  ctx.textAlign = 'left';

  // 10. Target Indicator Arrow & Label
  if (clampedUnits > 0) {
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(pX, bY + bHeight + 2);
    ctx.lineTo(pX - 2.5, bY + bHeight + 6);
    ctx.lineTo(pX + 2.5, bY + bHeight + 6);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`▲ ${data.reconResult.syringeUnits} U`, pX, bY + bHeight + 13);
    ctx.textAlign = 'left';
  }

  // Quick SOP Boxes
  const sopY = syrBoxY + syrBoxH + 6;
  const sopW = (innerW - 6) / 2;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad, sopY, sopW, sopH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillText('RECONSTITUTION RECIPE:', padX + innerPad + 6, sopY + 11);
  ctx.fillStyle = '#1e293b';
  ctx.font = '7px system-ui, sans-serif';
  ctx.fillText(`Slowly inject ${data.waterMl} mL BAC Water down vial wall into ${data.vialMg} mg ${data.compoundName}.`, padX + innerPad + 6, sopY + 22);
  ctx.fillText('Swirl gently until dissolved. Do not shake violently.', padX + innerPad + 6, sopY + 33);

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad + sopW + 6, sopY, sopW, sopH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillText('SUB-Q 3-STEP SOP:', padX + innerPad + sopW + 12, sopY + 11);
  ctx.fillStyle = '#1e293b';
  ctx.font = '7px system-ui, sans-serif';
  ctx.fillText(`1. Wipe stopper & site (15s). 2. Draw ${data.reconResult.syringeUnits} Units (${data.reconResult.drawVolumeMl} mL).`, padX + innerPad + sopW + 12, sopY + 22);
  ctx.fillText('3. Pinch skin fold, 90° angle, depress steadily, hold 5–10s.', padX + innerPad + sopW + 12, sopY + 33);

  // ============================================================
  // 4. SECTION 2: PHARMACOKINETIC ACCUMULATION & SCHEDULE
  // ============================================================
  curY += sec1H + 8;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, contentW, sec2H, 6);
  ctx.fill();
  ctx.stroke();

  // Section 2 Header
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(padX + 11, curY + 14, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText('2. PK ACCUMULATION & SCHEDULE', padX + 20, curY + 17);

  // 4 Badges on the right: Rendered right-to-left with pill styling
  ctx.font = 'bold 6.8px monospace';
  const badges = [
    { label: `Avg: ~${data.averageConcentration.toFixed(2)}mg`, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
    { label: `Trough: ~${data.troughConcentration.toFixed(2)}mg`, color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    { label: `Peak: ~${data.peakConcentration.toFixed(2)}mg`, color: '#be123c', bg: '#fff1f2', border: '#fecdd3' },
    { label: `HL: ${(data.halfLifeHours / 24).toFixed(1)}d`, color: '#334155', bg: '#f1f5f9', border: '#cbd5e1' },
  ];

  let currentRight = width - padX - 8;
  for (const b of badges) {
    const textWidth = ctx.measureText(b.label).width;
    const bW = textWidth + 8;
    const bBadgeH = 13;
    const badgeX = currentRight - bW;
    const badgeY = curY + 8;

    ctx.fillStyle = b.bg;
    ctx.strokeStyle = b.border;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, bW, bBadgeH, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = b.color;
    ctx.textAlign = 'center';
    ctx.fillText(b.label, badgeX + bW / 2, badgeY + 9);

    currentRight = badgeX - 4;
  }
  ctx.textAlign = 'left';

  // Inner Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padX + 8, curY + 24);
  ctx.lineTo(width - padX - 8, curY + 24);
  ctx.stroke();

  // PK Curve Chart Box
  const cBoxY = curY + 28;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad, cBoxY, innerW, cBoxH, 5);
  ctx.fill();
  ctx.stroke();

  // Chart Title inside
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText(`Plasma Accumulation Trajectory (${data.simulationDays} Days Timeline)`, padX + innerPad + 6, cBoxY + 11);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#059669';
  ctx.font = '7px system-ui, sans-serif';
  ctx.fillText('● Green Dots = Injections', width - padX - innerPad - 6, cBoxY + 11);
  ctx.textAlign = 'left';

  // Draw PK Spline Curve
  const cLeft = padX + innerPad + 28;
  const cRight = width - padX - innerPad - 14;
  const cTop = cBoxY + 18;
  const cBottom = cBoxY + cBoxH - 16;
  const cW = cRight - cLeft;
  const cH = cBottom - cTop;

  const maxVal = Math.max(data.peakConcentration * 1.15, 0.1);
  const totalDays = data.dataPoints.length ? data.dataPoints[data.dataPoints.length - 1].day : data.simulationDays;

  // Y-axis ticks & gridlines
  const yTicks = [0, maxVal * 0.5, maxVal];
  ctx.setLineDash([2, 2]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.6;
  yTicks.forEach((val) => {
    const y = cBottom - (val / maxVal) * cH;
    ctx.beginPath();
    ctx.moveTo(cLeft, y);
    ctx.lineTo(cRight, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '6px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), cLeft - 3, y + 2);
  });
  ctx.setLineDash([]);
  ctx.textAlign = 'left';

  // X-axis day markers
  const xStep = totalDays <= 14 ? 2 : totalDays <= 30 ? 7 : 14;
  for (let d = 0; d <= totalDays; d += xStep) {
    const x = cLeft + (d / (totalDays || 1)) * cW;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, cTop);
    ctx.lineTo(x, cBottom);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`D${d}`, x, cBottom + 9);
  }
  ctx.textAlign = 'left';

  // Spline points calculation
  if (data.dataPoints.length > 0) {
    const coords = data.dataPoints.map((pt) => ({
      x: cLeft + (pt.day / (totalDays || 1)) * cW,
      y: cBottom - (pt.concentration / maxVal) * cH,
    }));

    // Area Gradient Fill
    const grad = ctx.createLinearGradient(0, cTop, 0, cBottom);
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.28)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.02)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(coords[0].x, cBottom);
    ctx.lineTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.lineTo(coords[coords.length - 1].x, cBottom);
    ctx.closePath();
    ctx.fill();

    // Spline Line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.stroke();

    // Injection Dots
    data.dataPoints.forEach((pt) => {
      if (!pt.isInjectionPoint) return;
      const dotX = cLeft + (pt.day / (totalDays || 1)) * cW;
      const dotY = cBottom - (pt.concentration / maxVal) * cH;

      ctx.fillStyle = '#059669';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 5.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Inj', dotX, Math.max(dotY - 4, cTop + 6));
    });
    ctx.textAlign = 'left';
  }

  // -------------------------------------------------------------
  // Dosing Schedule & Pen-Check Table
  // -------------------------------------------------------------
  const tblY = cBoxY + cBoxH + 6;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(padX + innerPad, tblY, innerW, tblH, 4);
  ctx.fill();
  ctx.stroke();

  // Table Header
  const thY = tblY;
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(padX + innerPad, thY, innerW, tblHeaderH, [4, 4, 0, 0]);
  ctx.fill();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(padX + innerPad, thY + tblHeaderH);
  ctx.lineTo(width - padX - innerPad, thY + tblHeaderH);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7px system-ui, sans-serif';
  ctx.fillText('DOSE', padX + innerPad + 6, thY + 11);
  ctx.fillText('PROTOCOL', padX + innerPad + 38, thY + 11);
  ctx.fillText('PLANNED DATE', padX + innerPad + 86, thY + 11);
  ctx.fillText('DOSE & UNITS', padX + innerPad + 152, thY + 11);
  ctx.fillText('INJECTION SITE', padX + innerPad + 228, thY + 11);
  ctx.fillText('TIME', padX + innerPad + 326, thY + 11);
  ctx.textAlign = 'center';
  ctx.fillText('DONE', width - padX - innerPad - 16, thY + 11);
  ctx.textAlign = 'left';

  // Table Rows
  rows.forEach((inj, idx) => {
    const rY = thY + tblHeaderH + idx * rowH;

    if (idx > 0) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(padX + innerPad, rY);
      ctx.lineTo(width - padX - innerPad, rY);
      ctx.stroke();
    }

    const targetUnits =
      data.concentrationMgMl > 0
        ? Number(((inj.doseMg / data.concentrationMgMl) * (data.syringeType === 'U100' ? 100 : 40)).toFixed(1))
        : 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText(`#${idx + 1}`, padX + innerPad + 6, rY + 13);

    ctx.fillStyle = '#334155';
    ctx.font = '7px system-ui, sans-serif';
    ctx.fillText(`Day ${inj.day}`, padX + innerPad + 38, rY + 13);

    ctx.fillStyle = '#64748b';
    ctx.font = '7px monospace';
    ctx.fillText('___/___/202_', padX + innerPad + 86, rY + 13);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 7px monospace';
    ctx.fillText(`${inj.doseMg.toFixed(2)}mg • ${targetUnits}U`, padX + innerPad + 152, rY + 13);

    ctx.fillStyle = '#475569';
    ctx.font = '6.8px system-ui, sans-serif';
    ctx.fillText('[ ] L-Abd  [ ] R-Abd', padX + innerPad + 228, rY + 13);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '7px monospace';
    ctx.fillText('___:___', padX + innerPad + 326, rY + 13);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillText('[  ]', width - padX - innerPad - 16, rY + 13);
    ctx.textAlign = 'left';
  });

  // ============================================================
  // 5. FOOTER
  // ============================================================
  curY += sec2H + 8;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  curY += 10;
  ctx.fillStyle = '#64748b';
  ctx.font = '7px system-ui, sans-serif';
  ctx.fillText('PepPlotter (pepplotter.com) • Reconstitution & Pharmacokinetic Engine.', padX, curY);

  curY += 9;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '6.5px system-ui, sans-serif';
  ctx.fillText('For educational & personal research logging only. Not medical prescription advice.', padX, curY);
}
