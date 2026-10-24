import QRCode from 'qrcode';
import { StyleOptions } from '../types/qr';

export interface QRMatrixInfo {
  size: number;
  version: number;
  errorCorrectionLevel: string;
  modules: boolean[][];
}

// Building a raw boolean matrix lets us draw custom dot shapes, rounded corners, and mask the center logo area without regenerating the QR encoding.
export function getQRMatrix(payload: string, ecLevel: 'L' | 'M' | 'Q' | 'H'): QRMatrixInfo {
  const qr = QRCode.create(payload, { errorCorrectionLevel: ecLevel });
  const size = qr.modules.size;
  const matrix: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(Boolean(qr.modules.get(r, c)));
    }
    matrix.push(row);
  }

  return {
    size,
    version: qr.version,
    errorCorrectionLevel: ecLevel,
    modules: matrix,
  };
}

// The three 7x7 corner targets establish position and orientation for scanners, so they are kept separate from data dots.
function isFinderPattern(r: number, c: number, size: number): boolean {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= size - 7) return true;
  if (r >= size - 7 && c < 7) return true;
  return false;
}

// Clearing data dots underneath a center logo prevents dark modules from showing through transparent icons.
function isInLogoArea(r: number, c: number, size: number, logoRadiusModules: number): boolean {
  const center = (size - 1) / 2;
  const distR = Math.abs(r - center);
  const distC = Math.abs(c - center);
  return distR <= logoRadiusModules && distC <= logoRadiusModules;
}

export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  style: StyleOptions,
  targetSize: number = 512
): Promise<QRMatrixInfo> {
  const matrixInfo = getQRMatrix(payload, style.errorCorrectionLevel);
  const { size, modules } = matrixInfo;

  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = style.bgColor;
  ctx.fillRect(0, 0, targetSize, targetSize);

  const marginModules = style.margin;
  const totalModules = size + marginModules * 2;
  const moduleSize = targetSize / totalModules;
  const offset = marginModules * moduleSize;

  const hasLogo = Boolean(style.logoDataUrl);
  const logoDiameterModules = hasLogo ? Math.floor(size * (style.logoSizePercent / 100)) : 0;
  const logoRadiusModules = Math.floor(logoDiameterModules / 2);

  ctx.fillStyle = style.fgColor;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;

      // Corner patterns are handled separately to support styled frames (rounded, circle).
      if (isFinderPattern(r, c, size)) continue;
      if (hasLogo && isInLogoArea(r, c, size, logoRadiusModules)) continue;

      const x = offset + c * moduleSize;
      const y = offset + r * moduleSize;

      if (style.moduleStyle === 'dots') {
        const radius = moduleSize * 0.44;
        ctx.beginPath();
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (style.moduleStyle === 'rounded') {
        const radius = moduleSize * 0.28;
        drawRoundedRect(ctx, x, y, moduleSize, moduleSize, radius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }

  drawEye(ctx, offset, offset, moduleSize, style);
  drawEye(ctx, offset + (size - 7) * moduleSize, offset, moduleSize, style);
  drawEye(ctx, offset, offset + (size - 7) * moduleSize, moduleSize, style);

  if (hasLogo && style.logoDataUrl) {
    try {
      await drawLogoOnCanvas(ctx, style.logoDataUrl, targetSize, style.logoSizePercent, style.logoHasBackground, style.bgColor);
    } catch (e) {
      console.warn('Failed to draw logo on canvas:', e);
    }
  }

  return matrixInfo;
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  modSize: number,
  style: StyleOptions
) {
  const outerWidth = 7 * modSize;
  const innerWidth = 3 * modSize;
  const eyeStyle = style.eyeFrameStyle;

  ctx.fillStyle = style.fgColor;

  if (eyeStyle === 'circle') {
    ctx.beginPath();
    ctx.arc(x + outerWidth / 2, y + outerWidth / 2, outerWidth / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.bgColor;
    ctx.beginPath();
    ctx.arc(x + outerWidth / 2, y + outerWidth / 2, (5 * modSize) / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.fgColor;
    ctx.beginPath();
    ctx.arc(x + outerWidth / 2, y + outerWidth / 2, innerWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (eyeStyle === 'rounded') {
    const outerRadius = modSize * 1.8;
    drawRoundedRect(ctx, x, y, outerWidth, outerWidth, outerRadius);
    ctx.fill();

    ctx.fillStyle = style.bgColor;
    const cutX = x + modSize;
    const cutY = y + modSize;
    const cutWidth = 5 * modSize;
    drawRoundedRect(ctx, cutX, cutY, cutWidth, cutWidth, outerRadius * 0.65);
    ctx.fill();

    ctx.fillStyle = style.fgColor;
    const pupilX = x + 2 * modSize;
    const pupilY = y + 2 * modSize;
    drawRoundedRect(ctx, pupilX, pupilY, innerWidth, innerWidth, outerRadius * 0.4);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, outerWidth, outerWidth);

    ctx.fillStyle = style.bgColor;
    ctx.fillRect(x + modSize, y + modSize, 5 * modSize, 5 * modSize);

    ctx.fillStyle = style.fgColor;
    ctx.fillRect(x + 2 * modSize, y + 2 * modSize, innerWidth, innerWidth);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Padding around the logo prevents neighboring QR dots from crowding the mark and interfering with readability.
function drawLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  logoUrl: string,
  canvasSize: number,
  sizePercent: number,
  hasBackground: boolean,
  bgColor: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const logoSize = Math.floor(canvasSize * (sizePercent / 100));
      const pad = hasBackground ? Math.max(6, Math.floor(logoSize * 0.12)) : 0;
      const totalBox = logoSize + pad * 2;
      const x = (canvasSize - totalBox) / 2;
      const y = (canvasSize - totalBox) / 2;

      if (hasBackground) {
        ctx.fillStyle = bgColor;
        const radius = Math.floor(totalBox * 0.18);
        drawRoundedRect(ctx, x, y, totalBox, totalBox, radius);
        ctx.fill();
      }

      ctx.drawImage(img, x + pad, y + pad, logoSize, logoSize);
      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = logoUrl;
  });
}

// SVGs stay infinitely crisp when printed at large format sizes like posters and signage.
export function generateQRSvg(
  payload: string,
  style: StyleOptions,
  viewBoxSize: number = 512
): string {
  const matrixInfo = getQRMatrix(payload, style.errorCorrectionLevel);
  const { size, modules } = matrixInfo;
  const marginModules = style.margin;
  const totalModules = size + marginModules * 2;
  const moduleSize = viewBoxSize / totalModules;
  const offset = marginModules * moduleSize;

  const hasLogo = Boolean(style.logoDataUrl);
  const logoDiameterModules = hasLogo ? Math.floor(size * (style.logoSizePercent / 100)) : 0;
  const logoRadiusModules = Math.floor(logoDiameterModules / 2);

  const elements: string[] = [];
  elements.push(`<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${style.bgColor}" />`);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;
      if (isFinderPattern(r, c, size)) continue;
      if (hasLogo && isInLogoArea(r, c, size, logoRadiusModules)) continue;

      const x = offset + c * moduleSize;
      const y = offset + r * moduleSize;

      if (style.moduleStyle === 'dots') {
        const radius = moduleSize * 0.44;
        elements.push(
          `<circle cx="${(x + moduleSize / 2).toFixed(2)}" cy="${(y + moduleSize / 2).toFixed(2)}" r="${radius.toFixed(2)}" fill="${style.fgColor}" />`
        );
      } else if (style.moduleStyle === 'rounded') {
        const radius = (moduleSize * 0.28).toFixed(2);
        elements.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" rx="${radius}" ry="${radius}" fill="${style.fgColor}" />`
        );
      } else {
        elements.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="${style.fgColor}" />`
        );
      }
    }
  }

  const eyes = [
    { x: offset, y: offset },
    { x: offset + (size - 7) * moduleSize, y: offset },
    { x: offset, y: offset + (size - 7) * moduleSize },
  ];

  eyes.forEach(({ x, y }) => {
    const outerWidth = 7 * moduleSize;
    const innerWidth = 3 * moduleSize;

    if (style.eyeFrameStyle === 'circle') {
      const cx = (x + outerWidth / 2).toFixed(2);
      const cy = (y + outerWidth / 2).toFixed(2);
      elements.push(`<circle cx="${cx}" cy="${cy}" r="${(outerWidth / 2).toFixed(2)}" fill="${style.fgColor}" />`);
      elements.push(`<circle cx="${cx}" cy="${cy}" r="${((5 * moduleSize) / 2).toFixed(2)}" fill="${style.bgColor}" />`);
      elements.push(`<circle cx="${cx}" cy="${cy}" r="${(innerWidth / 2).toFixed(2)}" fill="${style.fgColor}" />`);
    } else if (style.eyeFrameStyle === 'rounded') {
      const outerR = (moduleSize * 1.8).toFixed(2);
      elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${outerWidth.toFixed(2)}" height="${outerWidth.toFixed(2)}" rx="${outerR}" ry="${outerR}" fill="${style.fgColor}" />`);
      elements.push(`<rect x="${(x + moduleSize).toFixed(2)}" y="${(y + moduleSize).toFixed(2)}" width="${(5 * moduleSize).toFixed(2)}" height="${(5 * moduleSize).toFixed(2)}" rx="${(moduleSize * 1.1).toFixed(2)}" fill="${style.bgColor}" />`);
      elements.push(`<rect x="${(x + 2 * moduleSize).toFixed(2)}" y="${(y + 2 * moduleSize).toFixed(2)}" width="${innerWidth.toFixed(2)}" height="${innerWidth.toFixed(2)}" rx="${(moduleSize * 0.7).toFixed(2)}" fill="${style.fgColor}" />`);
    } else {
      elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${outerWidth.toFixed(2)}" height="${outerWidth.toFixed(2)}" fill="${style.fgColor}" />`);
      elements.push(`<rect x="${(x + moduleSize).toFixed(2)}" y="${(y + moduleSize).toFixed(2)}" width="${(5 * moduleSize).toFixed(2)}" height="${(5 * moduleSize).toFixed(2)}" fill="${style.bgColor}" />`);
      elements.push(`<rect x="${(x + 2 * moduleSize).toFixed(2)}" y="${(y + 2 * moduleSize).toFixed(2)}" width="${innerWidth.toFixed(2)}" height="${innerWidth.toFixed(2)}" fill="${style.fgColor}" />`);
    }
  });

  // Center logo if present in SVG
  if (hasLogo && style.logoDataUrl) {
    const logoSize = Math.floor(viewBoxSize * (style.logoSizePercent / 100));
    const pad = style.logoHasBackground ? Math.max(6, Math.floor(logoSize * 0.12)) : 0;
    const totalBox = logoSize + pad * 2;
    const x = (viewBoxSize - totalBox) / 2;
    const y = (viewBoxSize - totalBox) / 2;

    if (style.logoHasBackground) {
      const radius = Math.floor(totalBox * 0.18);
      elements.push(
        `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${totalBox.toFixed(2)}" height="${totalBox.toFixed(2)}" rx="${radius}" ry="${radius}" fill="${style.bgColor}" />`
      );
    }

    elements.push(
      `<image href="${style.logoDataUrl}" x="${(x + pad).toFixed(2)}" y="${(y + pad).toFixed(2)}" width="${logoSize.toFixed(2)}" height="${logoSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`
    );
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
  ${elements.join('\n  ')}
</svg>`;
}
