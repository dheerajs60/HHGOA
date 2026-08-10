import QRCode from 'qrcode';
import type { CardFormat, BuilderProfile, SquadMember } from '../types/generator';
import { generateDeterministicProfile } from './seededGenerator';

export interface RenderOptions {
  format: CardFormat;
  profile: BuilderProfile;
  imageElement?: HTMLImageElement | null;
  crop: { x: number; y: number };
  zoom: number;
  rotation?: number;
  squadMembers?: SquadMember[];
  squadImageElements?: (HTMLImageElement | null)[];
}

/**
 * Loads an image from URL into an HTMLImageElement promise.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Generates a QR Code as an HTMLCanvasElement
 */
async function generateQRCanvas(text: string, size: number, darkColor: string, lightColor: string): Promise<HTMLCanvasElement> {
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, text, {
    width: size,
    margin: 1,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'M',
  });
  return qrCanvas;
}

/**
 * Helper to draw text with a hard comic drop shadow
 */
function drawComicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  shadowColor = '#111111',
  shadowOffset = 4,
  strokeColor?: string,
  strokeWidth = 0
) {
  ctx.save();
  if (strokeColor && strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, x, y);
  }
  // Draw shadow
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x + shadowOffset, y + shadowOffset);
  // Draw fill
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Helper to draw fine diagonal hatching texture onto a canvas area
 */
function drawDiagonalHatching(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  lineColor = 'rgba(245, 239, 224, 0.05)',
  spacing = 10
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.5;

  const totalDist = width + height;
  for (let d = -height; d <= totalDist; d += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + d, y);
    ctx.lineTo(x + d + height, y + height);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws rounded rectangle with optional fill and stroke
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string,
  stroke?: string,
  strokeWidth = 2,
  shadowOffset = 0,
  shadowColor = '#111111'
) {
  ctx.save();
  if (shadowOffset > 0) {
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.roundRect(x + shadowOffset, y + shadowOffset, w, h, r);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Helper to draw a barcode
 */
function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, seed: number) {
  ctx.save();
  ctx.fillStyle = '#111111';
  let curX = x;
  let s = seed;
  while (curX < x + width) {
    s = (s * 16807) % 2147483647;
    const barWidth = 2 + (s % 5);
    const gap = 1 + ((s >> 3) % 4);
    if (curX + barWidth <= x + width) {
      ctx.fillRect(curX, y, barWidth, height);
    }
    curX += barWidth + gap;
  }
  ctx.restore();
}

/**
 * Main Master Canvas Compositor
 */
export async function renderCardToCanvas(
  targetCanvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const { format, profile, imageElement, crop, zoom, rotation = 0, squadMembers = [], squadImageElements = [] } = options;

  // Determine output dimensions
  const isPfp = format === 'pfp';
  const width = 1080;
  const height = isPfp ? 1080 : 1350;

  targetCanvas.width = width;
  targetCanvas.height = height;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Compute deterministic seed data
  const meta = generateDeterministicProfile(profile.name, profile.role || 'Full Stack', profile.tagline);
  const builderClass = profile.customClass || meta.builderClass;
  const gate = profile.departureGate || meta.gate;
  const seat = profile.seatNumber || meta.seat;
  const flightNo = meta.flightNo;
  const shippingText = profile.customCurrentlyShipping || meta.currentlyShipping;

  const qrUrl = `https://hhgoa.com?ref=${encodeURIComponent(profile.handle || profile.name)}&class=${encodeURIComponent(builderClass)}`;
  const qrCanvas = await generateQRCanvas(qrUrl, 180, '#111111', '#F5EFE0');

  if (format === 'pfp') {
    await renderPfpFormat(ctx, width, height, profile, meta, builderClass, gate, seat, imageElement, crop, zoom, rotation, qrCanvas);
  } else if (format === 'squad') {
    await renderSquadFormat(ctx, width, height, squadMembers, squadImageElements, qrCanvas);
  } else {
    // Boarding Pass Builder ID (Format B)
    await renderBoardingPassFormat(ctx, width, height, profile, meta, builderClass, gate, seat, flightNo, shippingText, imageElement, crop, zoom, rotation, qrCanvas);
  }
}

/**
 * FORMAT 1: PASSPORT STAMP PFP (1080x1080)
 */
async function renderPfpFormat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  profile: BuilderProfile,
  meta: ReturnType<typeof generateDeterministicProfile>,
  builderClass: string,
  gate: string,
  seat: string,
  imageElement: HTMLImageElement | null | undefined,
  crop: { x: number; y: number },
  zoom: number,
  rotation: number,
  qrCanvas: HTMLCanvasElement
) {
  // 1. Deep Forest Green Background
  ctx.fillStyle = '#0B3B2E';
  ctx.fillRect(0, 0, w, h);

  // 2. Diagonal Hatching Texture
  drawDiagonalHatching(ctx, 0, 0, w, h, 'rgba(245, 239, 224, 0.04)', 12);

  // 3. Vintage Outer Passport Rings
  const centerX = w / 2;
  const centerY = h / 2 - 20;
  const outerRadius = 450;
  const photoRadius = 350;

  // Outer border with Gold
  ctx.save();
  ctx.strokeStyle = '#F4C430';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Dotted Inner Ring
  ctx.strokeStyle = '#F5EFE0';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius - 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 4. Stamped Arc Text around the ring
  ctx.save();
  ctx.fillStyle = '#F4C430';
  ctx.font = 'bold 36px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Curved text: HACKER HOUSE GOA · 2026
  drawCurvedText(ctx, '★ HACKER HOUSE GOA ★ 2026 ★', centerX, centerY, outerRadius - 40, -Math.PI * 0.78, Math.PI * 0.78);
  drawCurvedText(ctx, 'LESS NOISE · MORE SIGNAL · BUILD TO SHIP', centerX, centerY, outerRadius - 40, Math.PI * 0.22, Math.PI * 0.78, true);
  ctx.restore();

  // 5. Draw User Photo clipped in circular aperture
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoRadius, 0, Math.PI * 2);
  ctx.clip();

  // Fallback background in aperture
  ctx.fillStyle = '#F5EFE0';
  ctx.fillRect(centerX - photoRadius, centerY - photoRadius, photoRadius * 2, photoRadius * 2);

  if (imageElement) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    const aspect = imageElement.naturalWidth / imageElement.naturalHeight;
    const baseW = aspect >= 1 ? photoRadius * 2 * aspect : photoRadius * 2;
    const baseH = aspect >= 1 ? photoRadius * 2 : (photoRadius * 2) / aspect;
    const renderW = baseW * zoom;
    const renderH = baseH * zoom;
    const offsetX = (crop.x / 100) * (photoRadius * 2);
    const offsetY = (crop.y / 100) * (photoRadius * 2);

    ctx.drawImage(
      imageElement,
      -renderW / 2 + offsetX,
      -renderH / 2 + offsetY,
      renderW,
      renderH
    );
    ctx.restore();
  } else {
    // Graphic placeholder
    ctx.fillStyle = '#07241C';
    ctx.font = 'bold 120px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌴', centerX, centerY - 30);
    ctx.font = '700 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#111111';
    ctx.fillText('UPLOAD PHOTO', centerX, centerY + 60);
  }
  ctx.restore();

  // Circular Gold & Pink Bezel Frame
  ctx.save();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#F4C430';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoRadius - 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 6. Devanagari "गोवा" Accent Badge Stamp at Top Right
  drawDevanagariGoaBadge(ctx, centerX + 260, centerY - 280, 75, '#E8146B', '#F4C430');

  // 7. Verified Beach Visa Stamp at Top Left
  drawVisaStampSeal(ctx, centerX - 270, centerY - 260, 65, meta.visaCode, meta.stampTilt);

  // 8. Bottom Builder Class Banner Ribbon
  const ribbonY = centerY + photoRadius - 40;
  drawRoundedRect(ctx, centerX - 360, ribbonY, 720, 96, 16, '#E8146B', '#111111', 5, 8, '#111111');

  // Builder Class Text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 44px "Anton", sans-serif';
  drawComicText(ctx, builderClass.toUpperCase(), centerX, ribbonY + 48, '#F5EFE0', '#111111', 4);
  ctx.restore();

  // 9. Lower Status Card (Name + Gate/Seat + Flight)
  const bottomCardY = h - 140;
  drawRoundedRect(ctx, 60, bottomCardY, w - 120, 96, 16, '#F5EFE0', '#111111', 4, 6, '#111111');

  // Name & Handle
  ctx.save();
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111111';
  const displayName = (profile.name || 'HACKER').toUpperCase();
  ctx.fillText(displayName, 90, bottomCardY + 36);

  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#E8146B';
  ctx.fillText(profile.handle || '@builder', 90, bottomCardY + 68);

  // Gate & Seat on Right
  ctx.textAlign = 'right';
  ctx.font = 'bold 30px "Anton", sans-serif';
  ctx.fillStyle = '#0B3B2E';
  ctx.fillText(`${gate} · ${seat}`, w - 180, bottomCardY + 40);

  ctx.font = '700 18px "Rajdhani", sans-serif';
  ctx.fillStyle = '#111111';
  ctx.fillText('HH-2026 · FLIGHT TO PARADISE', w - 180, bottomCardY + 68);

  // Mini QR code inside the bottom card
  ctx.drawImage(qrCanvas, w - 160, bottomCardY + 12, 72, 72);
  ctx.restore();
}

/**
 * FORMAT 2: BOARDING PASS BUILDER ID (1080x1350)
 */
async function renderBoardingPassFormat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  profile: BuilderProfile,
  meta: ReturnType<typeof generateDeterministicProfile>,
  builderClass: string,
  gate: string,
  seat: string,
  flightNo: string,
  shippingText: string,
  imageElement: HTMLImageElement | null | undefined,
  crop: { x: number; y: number },
  zoom: number,
  rotation: number,
  qrCanvas: HTMLCanvasElement
) {
  // 1. Overall Dark Background canvas
  ctx.fillStyle = '#07241C';
  ctx.fillRect(0, 0, w, h);
  drawDiagonalHatching(ctx, 0, 0, w, h, 'rgba(245, 239, 224, 0.03)', 14);

  // 2. Main Boarding Pass Card Stock Bounds
  const marginX = 48;
  const marginY = 48;
  const cardW = w - marginX * 2;
  const cardH = h - marginY * 2;
  const cardX = marginX;
  const cardY = marginY;

  // Hard Comic Shadow behind entire Boarding Pass Card
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(cardX + 12, cardY + 12, cardW, cardH, 28);
  ctx.fill();

  // Card Body Stock
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = '#F5EFE0';
  ctx.fill();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.clip(); // Keep interior elements within the rounded ticket bounds

  // 3. Top Flight Header Bar (Deep Forest Green)
  const headerH = 155;
  ctx.fillStyle = '#0B3B2E';
  ctx.fillRect(cardX, cardY, cardW, headerH);
  drawDiagonalHatching(ctx, cardX, cardY, cardW, headerH, 'rgba(244, 196, 48, 0.08)', 10);

  // Golden underline divider
  ctx.fillStyle = '#F4C430';
  ctx.fillRect(cardX, cardY + headerH - 6, cardW, 6);

  // Header Typography
  ctx.save();
  ctx.font = 'bold 56px "Anton", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawComicText(ctx, 'BOARDING PASS TO PARADISE', cardX + 36, cardY + 26, '#F4C430', '#111111', 4);

  ctx.font = 'bold 22px "Rajdhani", sans-serif';
  ctx.fillStyle = '#F5EFE0';
  ctx.fillText('HACKER HOUSE GOA 2026 · OFFICIAL BUILDER MANIFEST', cardX + 38, cardY + 92);

  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FF2E83';
  ctx.fillText(`FLIGHT ${flightNo} · ${meta.terminalCode}`, cardX + 38, cardY + 120);

  // Devanagari Goa Top Right Accent
  drawDevanagariGoaBadge(ctx, cardX + cardW - 100, cardY + 68, 52, '#E8146B', '#F4C430');
  ctx.restore();

  // 4. Ticket Cutout Notches & Perforation Tear Line (at Y: 940)
  const tearY = cardY + 915;

  // Left & Right Scalloped Cutout Notches
  ctx.save();
  ctx.fillStyle = '#07241C';
  ctx.beginPath();
  ctx.arc(cardX, tearY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cardX + cardW, tearY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dotted / Perforated Line
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(cardX + 30, tearY);
  ctx.lineTo(cardX + cardW - 30, tearY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // "TEAR HERE" mini label
  ctx.save();
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  ctx.fillText('✂ · · · · TEAR-OFF BUILDER STUB · · · · ✂', cardX + cardW / 2, tearY - 8);
  ctx.restore();

  // 5. Left Column: Photo Well & Verified Visa Seal
  const photoX = cardX + 38;
  const photoY = cardY + headerH + 32;
  const photoW = 340;
  const photoH = 430;

  // Photo Frame with Comic Shadow
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 18, '#E4D8BE', '#111111', 5, 8, '#111111');

  // Photo Content
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 18);
  ctx.clip();

  if (imageElement) {
    ctx.save();
    ctx.translate(photoX + photoW / 2, photoY + photoH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    const aspect = imageElement.naturalWidth / imageElement.naturalHeight;
    const baseW = aspect >= photoW / photoH ? photoH * aspect : photoW;
    const baseH = aspect >= photoW / photoH ? photoH : photoW / aspect;
    const renderW = baseW * zoom;
    const renderH = baseH * zoom;
    const offsetX = (crop.x / 100) * photoW;
    const offsetY = (crop.y / 100) * photoH;

    ctx.drawImage(
      imageElement,
      -renderW / 2 + offsetX,
      -renderH / 2 + offsetY,
      renderW,
      renderH
    );
    ctx.restore();
  } else {
    // Graphic placeholder
    ctx.fillStyle = '#0B3B2E';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = '#F4C430';
    ctx.font = 'bold 90px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✈️', photoX + photoW / 2, photoY + photoH / 2 - 20);
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.fillText('PHOTO HERE', photoX + photoW / 2, photoY + photoH / 2 + 50);
  }

  // Stamped overlay on photo: "VERIFIED HH BUILDER"
  ctx.restore();
  drawPhotoBadgeOverlay(ctx, photoX + 16, photoY + photoH - 48, 160, 36, '#E8146B', 'VERIFIED');

  // 6. Right Column: Passenger Manifest Data
  const infoX = photoX + photoW + 36;
  let curY = photoY + 12;

  // Passenger Name
  ctx.save();
  ctx.font = 'bold 15px "Rajdhani", sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText('PASSENGER / BUILDER NAME', infoX, curY);

  curY += 36;
  ctx.font = 'bold 44px "Anton", sans-serif';
  const nameStr = (profile.name || 'ANON BUILDER').toUpperCase();
  drawComicText(ctx, nameStr, infoX, curY, '#111111', '#E8146B', 3);

  // Handle & Role
  curY += 26;
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#0B3B2E';
  ctx.fillText(profile.handle || '@builder', infoX, curY);

  // Builder Class Pill Badge
  curY += 24;
  const pillW = 460;
  drawRoundedRect(ctx, infoX, curY, pillW, 54, 12, '#E8146B', '#111111', 3, 5, '#111111');
  ctx.font = 'bold 28px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawComicText(ctx, `BUILDER CLASS: ${builderClass.toUpperCase()}`, infoX + pillW / 2, curY + 28, '#F5EFE0', '#111111', 2);

  // Flight Route Grid (Origin ✈ GOA)
  curY += 76;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Origin & Dest box
  drawRoundedRect(ctx, infoX, curY, 220, 80, 10, '#FFFFFF', '#111111', 2, 4);
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.fillStyle = '#888888';
  ctx.fillText('ORIGIN AIRPORT', infoX + 14, curY + 10);
  ctx.font = 'bold 30px "Anton", sans-serif';
  ctx.fillStyle = '#111111';
  ctx.fillText(profile.originAirport || 'BLR / SFO', infoX + 14, curY + 28);

  drawRoundedRect(ctx, infoX + 240, curY, 220, 80, 10, '#0B3B2E', '#111111', 2, 4);
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.fillStyle = '#F4C430';
  ctx.fillText('DESTINATION', infoX + 254, curY + 10);
  ctx.font = 'bold 30px "Anton", sans-serif';
  ctx.fillStyle = '#F5EFE0';
  ctx.fillText('GOA (GOI)', infoX + 254, curY + 28);

  // Gate, Seat, and Boarding Group Row
  curY += 98;
  drawRoundedRect(ctx, infoX, curY, 140, 72, 8, '#F4C430', '#111111', 2, 4);
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.fillStyle = '#111111';
  ctx.fillText('GATE', infoX + 14, curY + 10);
  ctx.font = 'bold 30px "Anton", sans-serif';
  ctx.fillText(gate.replace('GATE ', ''), infoX + 14, curY + 26);

  drawRoundedRect(ctx, infoX + 155, curY, 140, 72, 8, '#F4C430', '#111111', 2, 4);
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.fillText('SEAT', infoX + 169, curY + 10);
  ctx.font = 'bold 30px "Anton", sans-serif';
  ctx.fillText(seat.replace('SEAT ', ''), infoX + 169, curY + 26);

  drawRoundedRect(ctx, infoX + 310, curY, 150, 72, 8, '#FFFFFF', '#111111', 2, 4);
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.fillStyle = '#888888';
  ctx.fillText('BOARDING', infoX + 322, curY + 10);
  ctx.font = 'bold 22px "Anton", sans-serif';
  ctx.fillStyle = '#E8146B';
  ctx.fillText('GROUP 1', infoX + 322, curY + 28);
  ctx.restore();

  // 7. Middle Row: "Currently Shipping" Terminal Box
  const shipBoxY = photoY + photoH + 28;
  const shipBoxW = cardW - 76;
  drawRoundedRect(ctx, photoX, shipBoxY, shipBoxW, 90, 14, '#07241C', '#111111', 4, 6, '#111111');

  ctx.save();
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#F4C430';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('> CURRENTLY_SHIPPING_LIVE.sh', photoX + 20, shipBoxY + 14);

  ctx.font = '600 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#F5EFE0';
  ctx.fillText(`"${shippingText}"`, photoX + 20, shipBoxY + 44);
  ctx.restore();

  // 8. Beach Bag Manifest (3 Stamped Icons)
  const bagY = shipBoxY + 106;
  ctx.save();
  ctx.font = 'bold 14px "Rajdhani", sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText('OFFICIAL BEACH BAG MANIFEST (DETERMINISTIC ASSIGNMENT):', photoX, bagY);

  const itemW = (shipBoxW - 24) / 3;
  meta.beachBag.forEach((item, idx) => {
    const itemX = photoX + idx * (itemW + 12);
    drawRoundedRect(ctx, itemX, bagY + 14, itemW, 58, 10, '#FFFFFF', '#111111', 2, 3);

    ctx.font = '24px sans-serif';
    ctx.fillText(item.emoji, itemX + 12, bagY + 48);

    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#111111';
    ctx.fillText(item.name, itemX + 48, bagY + 42);

    ctx.font = '600 10px "Rajdhani", sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText(item.category.toUpperCase(), itemX + 48, bagY + 58);
  });
  ctx.restore();

  // 9. BOTTOM TEAR-OFF STUB (Below tear line)
  const stubY = tearY + 28;
  const stubH = cardY + cardH - stubY - 24;

  // Stamped Visa Seal on Stub
  drawVisaStampSeal(ctx, cardX + 110, stubY + stubH / 2 + 10, 58, meta.visaCode, -4);

  // Barcode
  const barcodeX = cardX + 220;
  const barcodeY = stubY + 36;
  const barcodeW = 440;
  const barcodeH = 80;
  drawBarcode(ctx, barcodeX, barcodeY, barcodeW, barcodeH, meta.seed || 12345);

  ctx.save();
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.fillText(`*HH-GOA-2026-${gate.replace('GATE ', '')}-${seat.replace('SEAT ', '')}*`, barcodeX + barcodeW / 2, barcodeY + barcodeH + 22);

  // Mini summary text on stub
  ctx.font = 'bold 28px "Anton", sans-serif';
  ctx.fillStyle = '#0B3B2E';
  ctx.fillText(`${(profile.name || 'HACKER').toUpperCase()} · ${seat}`, barcodeX + barcodeW / 2, barcodeY - 14);

  // Scannable QR Code on Stub (built-in viral loop)
  const qrX = cardX + cardW - 190;
  const qrY = stubY + 20;
  ctx.drawImage(qrCanvas, qrX, qrY, 140, 140);

  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#111111';
  ctx.fillText('SCAN FOR INVITE', qrX + 70, qrY + 152);
  ctx.restore();

  ctx.restore(); // Close ticket clip
}

/**
 * FORMAT 3: SQUAD FRAME MODE (Multi-teammate composite)
 */
async function renderSquadFormat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  squadMembers: SquadMember[],
  squadImageElements: (HTMLImageElement | null)[],
  qrCanvas: HTMLCanvasElement
) {
  // Deep forest green background
  ctx.fillStyle = '#0B3B2E';
  ctx.fillRect(0, 0, w, h);
  drawDiagonalHatching(ctx, 0, 0, w, h, 'rgba(245, 239, 224, 0.05)', 12);

  // Outer Border & Header
  ctx.strokeStyle = '#F4C430';
  ctx.lineWidth = 8;
  ctx.strokeRect(36, 36, w - 72, h - 72);

  // Top Squad Banner
  drawRoundedRect(ctx, 60, 60, w - 120, 130, 20, '#F5EFE0', '#111111', 5, 8, '#111111');

  ctx.save();
  ctx.font = 'bold 58px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  drawComicText(ctx, 'SQUAD BOARDING PARTY · GOA 2026', w / 2, 80, '#E8146B', '#111111', 4);

  ctx.font = 'bold 22px "Rajdhani", sans-serif';
  ctx.fillStyle = '#0B3B2E';
  ctx.fillText('FLIGHT HH-2026 · ALL SYSTEMS GO · SQUADRON MANIFEST', w / 2, 146);
  ctx.restore();

  // Draw 2 or 3 Teammate Overlapping Circular Portraits
  const memberCount = Math.min(squadMembers.length, 3);
  const layout = getSquadLayout(memberCount, w, h);

  for (let i = 0; i < memberCount; i++) {
    const member = squadMembers[i];
    const imgEl = squadImageElements[i];
    const pos = layout[i];
    const radius = pos.radius;

    // Hard drop shadow behind portrait
    ctx.save();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(pos.x + 8, pos.y + 8, radius, 0, Math.PI * 2);
    ctx.fill();

    // Clip image in circular aperture
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#F5EFE0';
    ctx.fillRect(pos.x - radius, pos.y - radius, radius * 2, radius * 2);

    if (imgEl) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      const aspect = imgEl.naturalWidth / imgEl.naturalHeight;
      const baseW = aspect >= 1 ? radius * 2 * aspect : radius * 2;
      const baseH = aspect >= 1 ? radius * 2 : (radius * 2) / aspect;
      const renderW = baseW * (member.zoom || 1);
      const renderH = baseH * (member.zoom || 1);
      const offsetX = ((member.crop?.x || 0) / 100) * (radius * 2);
      const offsetY = ((member.crop?.y || 0) / 100) * (radius * 2);

      ctx.drawImage(imgEl, -renderW / 2 + offsetX, -renderH / 2 + offsetY, renderW, renderH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#07241C';
      ctx.font = 'bold 70px "Anton", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌴', pos.x, pos.y - 15);
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#F4C430';
      ctx.fillText(`MEMBER ${i + 1}`, pos.x, pos.y + 40);
    }
    ctx.restore();

    // Portrait Golden Bezel
    ctx.save();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#F4C430';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius - 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Name & Role Tag beneath each portrait
    const tagW = radius * 1.8;
    const tagH = 68;
    const tagX = pos.x - tagW / 2;
    const tagY = pos.y + radius - 20;

    drawRoundedRect(ctx, tagX, tagY, tagW, tagH, 12, '#E8146B', '#111111', 3, 4, '#111111');

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px "Anton", sans-serif';
    drawComicText(ctx, (member.name || `Teammate ${i + 1}`).toUpperCase(), pos.x, tagY + 22, '#F5EFE0', '#111111', 2);

    ctx.font = 'bold 15px "Rajdhani", sans-serif';
    ctx.fillStyle = '#F4C430';
    ctx.fillText((member.role || 'BUILDER').toUpperCase(), pos.x, tagY + 48);
    ctx.restore();
  }

  // Devanagari Goa stamp
  drawDevanagariGoaBadge(ctx, 140, h - 220, 60, '#E8146B', '#F4C430');

  // Bottom Squad Summary Card
  const bottomY = h - 160;
  drawRoundedRect(ctx, 60, bottomY, w - 120, 110, 18, '#F5EFE0', '#111111', 4, 6, '#111111');

  ctx.save();
  ctx.font = 'bold 36px "Anton", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111111';
  ctx.fillText('CABIN CLASS: SQUADRON VIP', 100, bottomY + 38);

  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#E8146B';
  ctx.fillText('SEATS: 14A · 14B · 14C · DESTINATION: GOA (GOI)', 100, bottomY + 76);

  ctx.drawImage(qrCanvas, w - 170, bottomY + 10, 90, 90);
  ctx.restore();
}

/**
 * Calculates portrait positions for Squad Frame
 */
function getSquadLayout(count: number, w: number, h: number) {
  const centerY = h / 2 - 20;
  if (count === 2) {
    return [
      { x: w / 2 - 220, y: centerY, radius: 210 },
      { x: w / 2 + 220, y: centerY, radius: 210 },
    ];
  }
  // 3 members: triangle layout
  return [
    { x: w / 2, y: centerY - 140, radius: 185 },
    { x: w / 2 - 240, y: centerY + 160, radius: 175 },
    { x: w / 2 + 240, y: centerY + 160, radius: 175 },
  ];
}

/**
 * Draws curved text along a circular arc
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  inward = false
) {
  const angleSpan = endAngle - startAngle;
  const step = angleSpan / (text.length - 1 || 1);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charAngle = startAngle + i * step;

    ctx.save();
    ctx.translate(centerX + radius * Math.cos(charAngle), centerY + radius * Math.sin(charAngle));
    ctx.rotate(charAngle + (inward ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
}

/**
 * Draws authentic Devanagari "गोवा" Badge
 */
function drawDevanagariGoaBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  bgColor: string,
  textColor: string
) {
  ctx.save();
  // Shadow
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(x + 5, y + 5, radius, 0, Math.PI * 2);
  ctx.fill();

  // Circle background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(x, y, radius - 6, 0, Math.PI * 2);
  ctx.stroke();

  // Text "गोवा"
  ctx.font = `bold ${Math.round(radius * 0.72)}px sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('गोवा', x, y + 2);
  ctx.restore();
}

/**
 * Draws circular airport passport visa seal stamp
 */
function drawVisaStampSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  code: string,
  tiltDeg: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tiltDeg * Math.PI) / 180);

  // Outer stamp circle
  ctx.strokeStyle = '#E8146B';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Visa text
  ctx.fillStyle = '#E8146B';
  ctx.font = 'bold 12px "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ IMMIGRATION ★', 0, -radius + 18);
  ctx.font = 'bold 15px "Anton", sans-serif';
  ctx.fillText('ACCEPTED', 0, -4);
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText(code, 0, 16);
  ctx.font = 'bold 11px "Rajdhani", sans-serif';
  ctx.fillText('GOA 2026', 0, radius - 16);
  ctx.restore();
}

/**
 * Draws small verified overlay badge
 */
function drawPhotoBadgeOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  text: string
) {
  drawRoundedRect(ctx, x, y, w, h, 8, color, '#111111', 2, 3, '#111111');
  ctx.save();
  ctx.font = 'bold 16px "Anton", sans-serif';
  ctx.fillStyle = '#F5EFE0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`★ ${text} ★`, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}
