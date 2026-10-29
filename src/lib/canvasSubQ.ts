import { getQRCode } from './qrcode';

export interface SubQCanvasData {
  compoundName?: string;
  syringeUnits?: number;
  drawVolumeMl?: number;
  syringeType?: string;
}

const SUBQ_STAGES = [
  {
    num: '01',
    title: 'Aseptic Supplies Setup',
    subtitle: 'Gather sterile supplies on clean surface and warm refrigerated solution to room temperature.',
    photoSrc: '/guide/step1-photo.jpg',
    points: [
      'Vial Acclimation: 5–10 min room temp to prevent sting',
      'Syringe: 31G ultra-fine single-use sterile syringe',
      'Antisepsis: 2 separate 70% isopropyl alcohol prep pads',
    ],
    doRule: 'Allow vial to reach room temperature before drawing liquid.',
    dontRule: 'Never microwave, freeze, or shake peptide vials vigorously.',
  },
  {
    num: '02',
    title: 'Site Selection & Cleansing',
    subtitle: 'Select lower abdomen (≥2" from navel) or outer thigh; allow alcohol to air-dry 15 seconds.',
    photoSrc: '/guide/step2-photo.jpg',
    points: [
      'Site Selection: Lower abdomen or outer thigh fat fold',
      'Cleanse: Spiral outward from center with alcohol pad',
      'Evaporation: Full 15s air-dry until skin turns matte',
    ],
    doRule: 'Wait 15s for alcohol to air-dry completely before puncture.',
    dontRule: 'Never fan, wipe dry, or blow breath onto sterilized skin.',
  },
  {
    num: '03',
    title: 'Precision Medication Draw',
    subtitle: 'Invert vial vertically 180°, submerge needle tip in liquid pool, and align plunger to exact mark.',
    photoSrc: '/guide/step3-photo.jpg',
    points: [
      'Air Equalization: Inject room air equal to dose volume',
      'Inversion: Hold vial 180° vertical to keep needle tip submerged',
      'Plunger Alignment: Align top ring of black plunger to target mark',
    ],
    doRule: 'Flick syringe barrel gently to dislodge micro air bubbles.',
    dontRule: 'Never draw medication while vial is sitting upright on a table.',
  },
  {
    num: '04',
    title: '90° Injection & 10s Dwell',
    subtitle: 'Pinch 2-inch skin fold, insert at 90°, depress smoothly, and hold 10 seconds before withdrawal.',
    photoSrc: '/guide/step4-photo.jpg',
    points: [
      'Grip & Angle: Gentle 2-inch fold, insert at 90° like a dart',
      'Smooth Plunger: Depress plunger steadily without hesitating',
      '10s Dwell: Hold needle in place 10 seconds to stop backflow',
    ],
    doRule: 'Maintain 10-second needle dwell to ensure full depot absorption.',
    dontRule: 'Never rub, massage, or apply direct heat to the injection site.',
  },
];

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  // 1. Check if the image element is already loaded in the DOM (e.g. from the preview modal)
  const domImg = document.querySelector(`img[src="${src}"]`) as HTMLImageElement | null;
  if (domImg && domImg.complete && domImg.naturalWidth > 0) {
    return Promise.resolve(domImg);
  }

  // 2. Load via Image object (do NOT require anonymous CORS on same-origin local files)
  return new Promise((resolve) => {
    const img = new Image();
    if (src.startsWith('http') && !src.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (img.naturalWidth > 0) resolve(img);
      else resolve(null);
    };
    img.onerror = () => {
      console.warn('Canvas image load fallback for:', src);
      resolve(null);
    };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
    }
  });
}

export async function renderSubQToCanvas(
  canvas: HTMLCanvasElement,
  data: SubQCanvasData = {}
): Promise<void> {
  const width = 500;
  const scale = 2; // 2x Retina clarity
  const padX = 14;
  const contentW = width - padX * 2; // 472px

  const compoundName = data.compoundName || 'Subcutaneous Peptide';
  const syringeUnits = data.syringeUnits ?? 10;
  const drawVolumeMl = data.drawVolumeMl ?? 0.1;
  const syringeType = data.syringeType || 'U100';

  // Card dimensions
  const cardH = 96;
  const cardGap = 8;
  const totalStagesH = SUBQ_STAGES.length * cardH + (SUBQ_STAGES.length - 1) * cardGap;

  let curY = 14;
  curY += 46; // Header & subtitle
  curY += 28; // Target Dose bar + gap
  curY += totalStagesH;
  curY += 28; // Footer
  curY += 14; // Bottom padding

  const totalHeight = curY;

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(totalHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // Try pre-loading photos
  const loadedImages = await Promise.all(
    SUBQ_STAGES.map((st) => loadImage(st.photoSrc))
  );

  curY = 14;

  // ============================================================
  // 1. HEADER
  // ============================================================
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  const mainTitle = 'PEPPLOTTER • SUB-Q INJECTION PROTOCOL';
  ctx.fillText(mainTitle, padX, curY + 11);

  // Memo Badge
  const titleW = ctx.measureText(mainTitle).width;
  ctx.font = 'bold 7px system-ui, -apple-system, sans-serif';
  const memoText = 'ADA / FITTER S.O.P.';
  const memoW = ctx.measureText(memoText).width + 8;
  const memoX = padX + titleW + 7;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(memoX, curY + 1, memoW, 12, 2.5);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(memoText, memoX + 4, curY + 9.5);

  // Right date & domain
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, width - padX, curY + 8);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText('pepplotter.com', width - padX, curY + 17.5);
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 6.5px system-ui, sans-serif';
  ctx.fillText('CLINICAL GUIDE • FREE', width - padX, curY + 26);
  ctx.textAlign = 'left';

  // QR Code linking to pepplotter.com/#guide with generous breathing room
  const qr = getQRCode('https://pepplotter.com/#guide');
  const qrBoxW = 25;
  const qrBoxH = 25;
  // Width of 'CLINICAL GUIDE • FREE' is ~82px; leave a generous 26px breathing room gap
  const qrBoxX = width - padX - 82 - 26 - qrBoxW;
  const qrBoxY = curY;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 2.5);
  ctx.fill();
  ctx.stroke();

  // QR Modules
  ctx.fillStyle = '#090d16';
  const modCount = qr.moduleCount;
  const modSize = 0.88;
  const modOffsetX = qrBoxX + (qrBoxW - modCount * modSize) / 2;
  const modOffsetY = qrBoxY + (qrBoxH - modCount * modSize) / 2;
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(modOffsetX + c * modSize, modOffsetY + r * modSize, modSize, modSize);
      }
    }
  }

  // QR Label
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 5.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN GUIDE', qrBoxX + qrBoxW / 2, qrBoxY + qrBoxH + 4.5);
  ctx.textAlign = 'left';

  // Subtitle
  curY += 27;
  ctx.fillStyle = '#64748b';
  ctx.font = '7px system-ui, sans-serif';
  ctx.fillText('Evidence-Based Sub-Q Protocol: Aseptic Prep, 45°–90° Pinch, & Safe Sharps Disposal', padX, curY);

  // Divider
  curY += 9;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  // ============================================================
  // 2. TARGET DOSE SPECIFICATION STRIP
  // ============================================================
  curY += 8;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(padX, curY, contentW, 20, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  ctx.fillText('MEDICATION:', padX + 8, curY + 12.5);
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 8.5px system-ui, sans-serif';
  ctx.fillText(compoundName, padX + 65, curY + 12.5);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7.5px system-ui, sans-serif';
  const rightDoseX = width - padX - 8;
  ctx.textAlign = 'right';
  ctx.fillText(
    `TARGET DOSE: ${syringeUnits} Units (${drawVolumeMl} mL on ${syringeType})`,
    rightDoseX,
    curY + 12.5
  );
  ctx.textAlign = 'left';

  curY += 26;

  // ============================================================
  // 3. 4 STAGE CARDS
  // ============================================================
  SUBQ_STAGES.forEach((stage, idx) => {
    const cardY = curY;

    // Card background
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(padX, cardY, contentW, cardH, 6);
    ctx.fill();
    ctx.stroke();

    // Photo Box on Left (width 110, height 78)
    const imgX = padX + 8;
    const imgY = cardY + 9;
    const imgW = 110;
    const imgH = 78;

    const img = loadedImages[idx];
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 4);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      ctx.restore();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 4);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 4);
      ctx.fill();
    }

    // Step Badge over photo
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(imgX + 4, imgY + 4, 38, 12, 2.5);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 6.5px monospace';
    ctx.fillText(`STEP ${stage.num}`, imgX + 7, imgY + 12.5);

    // Text Content on Right (width ~335)
    const textX = padX + 128;
    let tY = cardY + 13;

    // Title
    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${stage.num}. ${stage.title}`, textX, tY);

    // Subtitle
    tY += 10;
    ctx.fillStyle = '#64748b';
    ctx.font = '6.5px system-ui, sans-serif';
    ctx.fillText(stage.subtitle, textX, tY);

    // 3 Bullet Points
    tY += 11;
    ctx.fillStyle = '#334155';
    ctx.font = '6.5px system-ui, sans-serif';
    stage.points.forEach((pt) => {
      ctx.fillStyle = '#059669';
      ctx.fillText('•', textX, tY);
      ctx.fillStyle = '#334155';
      ctx.fillText(pt, textX + 6, tY);
      tY += 8.5;
    });

    // DO & DON'T Rules
    tY += 2;
    ctx.font = 'bold 6.5px system-ui, sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText(`✓ DO: ${stage.doRule}`, textX, tY);

    tY += 8.5;
    ctx.fillStyle = '#e11d48';
    ctx.fillText(`✗ DON'T: ${stage.dontRule}`, textX, tY);

    curY += cardH + cardGap;
  });

  // ============================================================
  // 4. FOOTER
  // ============================================================
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  curY += 10;
  ctx.fillStyle = '#64748b';
  ctx.font = '6.5px system-ui, sans-serif';
  ctx.fillText(
    'PepPlotter.com • Harm-reduction clinical protocol based on FITTER and ADA subcutaneous injection guidelines.',
    padX,
    curY
  );

  curY += 9;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '6px system-ui, sans-serif';
  ctx.fillText(
    'For educational and personal logging only. Not medical prescription advice. Always dispose needles in an FDA-cleared sharps container.',
    padX,
    curY
  );
}
