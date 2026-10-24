// Standard relative luminance formula helps phone cameras tell dots apart from the background.

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export interface ContrastResult {
  ratio: number;
  score: 'excellent' | 'good' | 'warning' | 'critical';
  isDarkOnLight: boolean;
  message: string;
}

export function calculateContrast(fgHex: string, bgHex: string): ContrastResult {
  const fg = hexToRgb(fgHex) || { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };

  const lumFg = getLuminance(fg.r, fg.g, fg.b);
  const lumBg = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  const roundedRatio = Math.round(ratio * 10) / 10;
  const isDarkOnLight = lumFg < lumBg;

  if (ratio >= 7.0) {
    return {
      ratio: roundedRatio,
      score: 'excellent',
      isDarkOnLight,
      message: isDarkOnLight
        ? 'Great contrast. Very easy to scan.'
        : 'Great contrast. Some older camera apps prefer dark dots on a light background.',
    };
  }

  if (ratio >= 4.5) {
    return {
      ratio: roundedRatio,
      score: 'good',
      isDarkOnLight,
      message: 'Good contrast. Scans fine on most phones.',
    };
  }

  if (ratio >= 3.0) {
    return {
      ratio: roundedRatio,
      score: 'warning',
      isDarkOnLight,
      message: 'Low contrast. Might be tricky to scan in dim light.',
    };
  }

  return {
    ratio: roundedRatio,
    score: 'critical',
    isDarkOnLight,
    message: 'Colors are too similar. Phones probably will not be able to scan this.',
  };
}
