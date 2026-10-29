import { getQRCode } from './qrcode';

export interface ShareCardData {
  shareUrl: string;
  compoundName: string;
  vialMg: number;
  waterMl: number;
  doseMcg: number;
  syringeUnits: number;
  drawVolumeMl: number;
  syringeType: string;
}

/**
 * Renders a crisp 2x Retina share card with custom compound parameters
 * and a high-contrast QR code for instant mobile scanning and screenshot forwarding.
 */
export function renderShareCardToCanvas(
  canvas: HTMLCanvasElement,
  data: ShareCardData
): void {
  const width = 420;
  const height = 440;
  const scale = 2; // 2x Retina clarity

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // 1. Background (Dark Slate Clinical Theme)
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 16);
  ctx.fill();

  // Subtle Outer Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 2. Header: Brand Logo & Title
  const curY = 16;

  // Pulse Icon Badge
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.beginPath();
  ctx.arc(28, curY + 10, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(28, curY + 10, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PepPlotter', 46, curY + 8);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 8px system-ui, sans-serif';
  ctx.fillText('Precision Peptide Reconstitution & PK Simulator', 46, curY + 18);

  // Right Badge: Live Protocol
  ctx.font = 'bold 7px system-ui, sans-serif';
  const badgeText = 'LIVE PROTOCOL';
  const badgeW = ctx.measureText(badgeText).width + 10;
  const badgeX = width - 18 - badgeW;
  ctx.fillStyle = 'rgba(6, 78, 59, 0.8)';
  ctx.beginPath();
  ctx.roundRect(badgeX, curY + 2, badgeW, 16, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.lineWidth = 0.75;
  ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.fillText(badgeText, badgeX + 5, curY + 13);

  // Divider Line
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, curY + 28);
  ctx.lineTo(width - 18, curY + 28);
  ctx.stroke();

  // 3. Medication & Dosage Parameter Strip
  const paramY = curY + 36;
  const paramH = 50;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(18, paramY, width - 36, paramH, 8);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Compound Name & Reconstitution specs
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText(data.compoundName || 'Custom Peptide', 28, paramY + 18);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 8.5px system-ui, sans-serif';
  ctx.fillText(`${data.vialMg} mg vial  •  ${data.waterMl} mL BAC water`, 28, paramY + 32);

  // Target Dose Pill (Right aligned)
  const doseLabel = data.doseMcg >= 1000
    ? `${(data.doseMcg / 1000).toFixed(2).replace(/\.00$/, '')} mg`
    : `${data.doseMcg} mcg`;
  const targetSummary = `Target: ${doseLabel} (${data.syringeUnits} Units · ${data.drawVolumeMl} mL)`;
  ctx.font = 'bold 9px monospace';
  const targetW = ctx.measureText(targetSummary).width + 12;
  const targetX = width - 28 - targetW;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.beginPath();
  ctx.roundRect(targetX, paramY + 14, targetW, 22, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.lineWidth = 0.75;
  ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.fillText(targetSummary, targetX + 6, paramY + 28);

  // 4. Centered White QR Code Container
  const qrBoxW = 180;
  const qrBoxH = 196;
  const qrBoxX = (width - qrBoxW) / 2;
  const qrBoxY = paramY + paramH + 12;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 12);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Generate QR Code with shareUrl
  const qr = getQRCode(data.shareUrl || 'https://pepplotter.com');
  const modCount = qr.moduleCount;
  const qrSize = 148;
  const modSize = qrSize / modCount;
  const qrOffsetX = qrBoxX + (qrBoxW - qrSize) / 2;
  const qrOffsetY = qrBoxY + 12;

  ctx.fillStyle = '#090d16';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(
          qrOffsetX + c * modSize,
          qrOffsetY + r * modSize,
          modSize + 0.1, // tiny overlap avoids anti-aliasing gaps
          modSize + 0.1
        );
      }
    }
  }

  // Text below QR Code in white box
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 6.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan with camera to open live calculation', width / 2, qrBoxY + qrBoxH - 12);

  // 5. Short Link Bar
  const linkY = qrBoxY + qrBoxH + 10;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(18, linkY, width - 36, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 8.5px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('pepplotter.com', 28, linkY + 16);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 7.5px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Deep Link Preserved', width - 28, linkY + 16);

  // 6. Clinical Harm-Reduction Slogan
  ctx.fillStyle = '#64748b';
  ctx.font = '500 7px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Evidence-based harm reduction & PK accumulation simulation. Not medical advice.',
    width / 2,
    linkY + 42
  );
}
