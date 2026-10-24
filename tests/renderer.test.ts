import { describe, it, expect } from 'vitest';
import { getQRMatrix, generateQRSvg } from '../src/utils/qrRenderer';
import { LOGO_PRESETS } from '../src/utils/presetLogos';
import { calculateContrast } from '../src/utils/contrast';
import { StyleOptions } from '../src/types/qr';

const BASE_STYLE: StyleOptions = {
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 4,
  moduleStyle: 'square',
  eyeFrameStyle: 'square',
  logoSizePercent: 18,
  logoHasBackground: true,
};

describe('QR Matrix & Vector SVG Renderer Tests', () => {
  it('computes valid QR matrices across all error correction levels (L, M, Q, H)', () => {
    const levels = ['L', 'M', 'Q', 'H'] as const;
    const payload = 'https://github.com/Devputta/QRForge';

    const sizes = levels.map((lvl) => {
      const info = getQRMatrix(payload, lvl);
      expect(info.errorCorrectionLevel).toBe(lvl);
      expect(info.version).toBeGreaterThanOrEqual(1);
      expect(info.modules.length).toBe(info.size);
      return info.size;
    });

    // Higher redundancy (H) requires >= modules than lowest redundancy (L)
    expect(sizes[3]).toBeGreaterThanOrEqual(sizes[0]);
  });

  it('generates valid SVG markup for square, rounded, and circular dot module styles', () => {
    const squareSvg = generateQRSvg('https://example.com', { ...BASE_STYLE, moduleStyle: 'square' }, 512);
    expect(squareSvg).toContain('<svg');
    expect(squareSvg).toContain('viewBox="0 0 512 512"');
    expect(squareSvg).toContain('fill="#0f172a"');

    const roundedSvg = generateQRSvg('https://example.com', { ...BASE_STYLE, moduleStyle: 'rounded' }, 512);
    expect(roundedSvg).toContain('rx="');

    const dotsSvg = generateQRSvg('https://example.com', { ...BASE_STYLE, moduleStyle: 'dots' }, 512);
    expect(dotsSvg).toContain('<circle cx="');
  });

  it('generates distinct finder eye frames for square, rounded, and circle styles', () => {
    const circleEyesSvg = generateQRSvg(
      'https://example.com',
      { ...BASE_STYLE, moduleStyle: 'square', eyeFrameStyle: 'circle' },
      512
    );
    expect(circleEyesSvg).toContain('<circle');

    const roundedEyesSvg = generateQRSvg(
      'https://example.com',
      { ...BASE_STYLE, moduleStyle: 'square', eyeFrameStyle: 'rounded' },
      512
    );
    expect(roundedEyesSvg).toContain('rx="');
  });

  it('embeds center logo <image> and background padding <rect> in SVG output when configured', () => {
    const preset = LOGO_PRESETS[0];
    const withLogoBg = generateQRSvg(
      'https://example.com',
      {
        ...BASE_STYLE,
        errorCorrectionLevel: 'H',
        logoDataUrl: preset.dataUrl,
        logoHasBackground: true,
      },
      512
    );
    expect(withLogoBg).toContain(`<image href="${preset.dataUrl}"`);

    const withoutLogoBg = generateQRSvg(
      'https://example.com',
      {
        ...BASE_STYLE,
        errorCorrectionLevel: 'H',
        logoDataUrl: preset.dataUrl,
        logoHasBackground: false,
      },
      512
    );
    expect(withoutLogoBg).toContain(`<image href="${preset.dataUrl}"`);
    expect(withoutLogoBg.length).toBeLessThan(withLogoBg.length);
  });

  it('provides valid UTF-8 encoded SVG data URLs for all built-in LOGO_PRESETS', () => {
    expect(LOGO_PRESETS.length).toBeGreaterThanOrEqual(8);
    for (const preset of LOGO_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.dataUrl.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
      const decoded = decodeURIComponent(preset.dataUrl.replace('data:image/svg+xml;charset=utf-8,', ''));
      expect(decoded).toContain('<svg');
      expect(decoded).toContain('</svg>');
    }
  });

  it('evaluates 3-digit shorthand hex colors, inverted polarity, and all 4 WCAG contrast tiers', () => {
    // Shorthand 3-char hex (#000 on #fff -> 21:1)
    const maxContrast = calculateContrast('#000', '#fff');
    expect(maxContrast.ratio).toBe(21);
    expect(maxContrast.score).toBe('excellent');
    expect(maxContrast.isDarkOnLight).toBe(true);

    // Inverted (white dots on black background -> 21:1, isDarkOnLight: false)
    const inverted = calculateContrast('#ffffff', '#000000');
    expect(inverted.isDarkOnLight).toBe(false);
    expect(inverted.message).toContain('dark dots on a light background');

    // Good tier (4.5 <= ratio < 7.0)
    const good = calculateContrast('#595959', '#eaeaea');
    expect(good.ratio).toBeGreaterThanOrEqual(4.5);
    expect(good.ratio).toBeLessThan(7.0);
    expect(good.score).toBe('good');

    // Warning tier (3.0 <= ratio < 4.5)
    const warning = calculateContrast('#767676', '#e0e0e0');
    expect(warning.ratio).toBeGreaterThanOrEqual(3.0);
    expect(warning.ratio).toBeLessThan(4.5);
    expect(warning.score).toBe('warning');

    // Critical tier (< 3.0)
    const critical = calculateContrast('#d4d4d4', '#ffffff');
    expect(critical.ratio).toBeLessThan(3.0);
    expect(critical.score).toBe('critical');
  });
});
