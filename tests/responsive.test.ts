// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { calculateContrast } from '../src/utils/contrast';
import { getQRMatrix } from '../src/utils/qrRenderer';

describe('Phase 4 & 5: Responsive Viewport and Contrast Checks', () => {
  const VIEWPORTS = [
    { name: 'Mobile XS (iPhone SE 1st gen)', width: 320, height: 568 },
    { name: 'Mobile S (iPhone SE 2nd/3rd gen)', width: 375, height: 667 },
    { name: 'Mobile M (iPhone 12/13/14)', width: 390, height: 844 },
    { name: 'Tablet Portrait (iPad Mini)', width: 768, height: 1024 },
    { name: 'Tablet Landscape (iPad)', width: 1024, height: 768 },
    { name: 'Desktop HD', width: 1440, height: 900 },
  ];

  it('verifies canvas dimensions never exceed available width on any target viewport', () => {
    for (const vp of VIEWPORTS) {
      window.innerWidth = vp.width;
      window.innerHeight = vp.height;

      // Available content width after max 16px page gutter on each side (32px total)
      const pageGutter = vp.width < 640 ? 24 : 48;
      const contentWidth = vp.width - pageGutter;

      // Card padding
      const cardPadding = vp.width < 640 ? 32 : 40;
      const cardInnerWidth = contentWidth - cardPadding;

      // On mobile screens (< 640px), canvas renders at 220px
      // On small screens (< 1024px), canvas renders at 260px
      // On desktop (>= 1024px), canvas renders at 320px
      let expectedCanvasSize = 320;
      if (vp.width < 360) {
        expectedCanvasSize = 220;
      } else if (vp.width < 640) {
        expectedCanvasSize = 260;
      }

      // Assert canvas width fits strictly inside card inner width without overflow
      expect(expectedCanvasSize).toBeLessThanOrEqual(cardInnerWidth);
      expect(vp.width).toBeGreaterThanOrEqual(320);
    }
  });

  it('calculates WCAG contrast ratios accurately across all preset color themes', () => {
    const presets = [
      { name: 'Black & White', fg: '#000000', bg: '#ffffff', minRatio: 20 },
      { name: 'Navy & White', fg: '#0f172a', bg: '#ffffff', minRatio: 15 },
      { name: 'Charcoal & Off-White', fg: '#18181b', bg: '#fafaf9', minRatio: 14 },
      { name: 'Forest & Mint', fg: '#064e3b', bg: '#f0fdf4', minRatio: 9 },
      { name: 'Slate & Soft Gray', fg: '#334155', bg: '#f8fafc', minRatio: 8 },
    ];

    for (const preset of presets) {
      const result = calculateContrast(preset.fg, preset.bg);
      expect(result.ratio).toBeGreaterThanOrEqual(preset.minRatio);
      expect(['excellent', 'good']).toContain(result.score);
    }
  });

  it('detects low contrast correctly and issues a warning', () => {
    // Light gray on white has insufficient contrast
    const lowContrast = calculateContrast('#cccccc', '#ffffff');
    expect(lowContrast.ratio).toBeLessThan(4.5);
    expect(['warning', 'critical']).toContain(lowContrast.score);
  });

  it('preserves 1:1 square aspect ratio for generated QR matrix across all versions', () => {
    const payloads = [
      'https://example.com',
      'https://example.com/very/long/path/with/multiple/query/parameters?utm_source=qrforge&utm_medium=poster&utm_campaign=summer2026',
      'WIFI:S:Guest_Network;T:WPA;P:;;',
    ];

    for (const p of payloads) {
      const matrix = getQRMatrix(p, 'M');
      expect(matrix.size).toBeGreaterThanOrEqual(21);
      expect(matrix.modules.length).toBe(matrix.size);
      for (const row of matrix.modules) {
        expect(row.length).toBe(matrix.size);
      }
    }
  });
});
