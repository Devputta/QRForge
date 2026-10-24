import React, { useRef, useState } from 'react';
import { StyleOptions, ErrorCorrectionLevel, ModuleStyle, EyeFrameStyle } from '../types/qr';
import { calculateContrast } from '../utils/contrast';
import { LOGO_PRESETS } from '../utils/presetLogos';
import { RotateCcw, Upload, X, AlertTriangle, AlertCircle } from 'lucide-react';

interface StyleControlsProps {
  style: StyleOptions;
  onChange: (newStyle: StyleOptions) => void;
  onReset: () => void;
}

const COLOR_PRESETS = [
  { name: 'Black & White', fg: '#000000', bg: '#ffffff' },
  { name: 'Navy & White', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Charcoal & Off-White', fg: '#18181b', bg: '#fafaf9' },
  { name: 'Forest & Mint', fg: '#064e3b', bg: '#f0fdf4' },
  { name: 'Slate & Soft Gray', fg: '#334155', bg: '#f8fafc' },
];

export const StyleControls: React.FC<StyleControlsProps> = ({ style, onChange, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const contrast = calculateContrast(style.fgColor, style.bgColor);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo file must be under 2MB.');
      return;
    }
    setLogoError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({
          ...style,
          logoDataUrl: reader.result,
          logoType: 'custom',
          logoPresetName: file.name,
          errorCorrectionLevel: 'H',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = LOGO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setLogoError(null);

    onChange({
      ...style,
      logoDataUrl: preset.dataUrl,
      logoType: 'preset',
      logoPresetName: preset.name,
      errorCorrectionLevel: 'H',
    });
  };

  const handleRemoveLogo = () => {
    setLogoError(null);
    onChange({
      ...style,
      logoDataUrl: undefined,
      logoType: 'none',
      logoPresetName: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Colors and contrast
          </h3>
          <div
            className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
              contrast.score === 'excellent'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : contrast.score === 'good'
                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                : contrast.score === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
            }`}
          >
            <span className="font-mono font-medium">{contrast.ratio}:1</span>
            <span className="capitalize text-xs">({contrast.score})</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((p) => {
            const isSelected =
              style.fgColor.toLowerCase() === p.fg.toLowerCase() &&
              style.bgColor.toLowerCase() === p.bg.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => onChange({ ...style, fgColor: p.fg, bgColor: p.bg })}
                title={p.name}
                aria-label={`Color preset: ${p.name}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0"
                  style={{ backgroundColor: p.fg }}
                />
                <span className="truncate max-w-[120px]">{p.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label htmlFor="fg-color" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Dark color (dots)
            </label>
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-md px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <input
                id="fg-color"
                type="color"
                value={style.fgColor}
                onChange={(e) => onChange({ ...style, fgColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                aria-label="Dark color picker"
              />
              <input
                type="text"
                value={style.fgColor}
                onChange={(e) => onChange({ ...style, fgColor: e.target.value })}
                className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 uppercase focus:outline-none"
                aria-label="Dark color hex code"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bg-color" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Light color (background)
            </label>
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-md px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <input
                id="bg-color"
                type="color"
                value={style.bgColor}
                onChange={(e) => onChange({ ...style, bgColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                aria-label="Light color picker"
              />
              <input
                type="text"
                value={style.bgColor}
                onChange={(e) => onChange({ ...style, bgColor: e.target.value })}
                className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 uppercase focus:outline-none"
                aria-label="Light color hex code"
              />
            </div>
          </div>
        </div>

        {contrast.score === 'warning' || contrast.score === 'critical' ? (
          <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{contrast.message}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Shapes and corners
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Dots</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {(['square', 'rounded', 'dots'] as ModuleStyle[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ ...style, moduleStyle: m })}
                  className={`py-2 text-xs font-medium rounded capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    style.moduleStyle === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Corners</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {(['square', 'rounded', 'circle'] as EyeFrameStyle[]).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => onChange({ ...style, eyeFrameStyle: e })}
                  className={`py-2 text-xs font-medium rounded capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    style.eyeFrameStyle === e
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Error correction</label>
              <span className="text-xs text-neutral-500">
                {style.errorCorrectionLevel === 'L' && '~7% recovery'}
                {style.errorCorrectionLevel === 'M' && '~15% recovery'}
                {style.errorCorrectionLevel === 'Q' && '~25% recovery'}
                {style.errorCorrectionLevel === 'H' && '~30% recovery'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange({ ...style, errorCorrectionLevel: lvl })}
                  className={`py-1.5 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    style.errorCorrectionLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Quiet border</label>
              <span className="text-xs text-neutral-500">{style.margin} modules</span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {[0, 1, 2, 4].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ ...style, margin: m })}
                  className={`py-1.5 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    style.margin === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {m === 4 ? '4 border' : `${m}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {Boolean(style.logoDataUrl) &&
          (style.errorCorrectionLevel === 'L' || style.errorCorrectionLevel === 'M') && (
            <div
              data-testid="logo-ec-warning"
              className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Logo present with Error Correction Level {style.errorCorrectionLevel}
                  </span>
                  <span className="text-xs text-amber-700 dark:text-amber-400/90 block mt-0.5">
                    A center logo covers part of the code. We recommend Level H (~30% recovery) so phones scan it reliably.
                  </span>
                </div>
              </div>
              <button
                type="button"
                data-testid="switch-to-h-button"
                onClick={() => onChange({ ...style, errorCorrectionLevel: 'H' })}
                className="shrink-0 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Switch to Level H
              </button>
            </div>
          )}
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Center logo or icon
          </h3>
          {style.logoDataUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>

        {logoError && (
          <div
            role="alert"
            className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{logoError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLogoError(null)}
              aria-label="Dismiss error"
              className="p-0.5 rounded text-red-500 hover:text-red-700 dark:hover:text-red-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {LOGO_PRESETS.map((p) => {
            const isPresetActive = style.logoPresetName === p.name;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.id)}
                aria-label={`Select logo preset: ${p.name}`}
                className={`py-1.5 px-2 rounded-md border text-xs text-left transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isPresetActive
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                <img src={p.dataUrl} alt={p.name} className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload custom logo (PNG or SVG)</span>
          </button>
          {style.logoPresetName && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[160px]">
              Active: {style.logoPresetName}
            </span>
          )}
        </div>

        {style.logoDataUrl && (
          <div className="space-y-2 p-3 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">Logo size</span>
              <span className="text-neutral-800 dark:text-neutral-300">{style.logoSizePercent}% of width</span>
            </div>
            <input
              type="range"
              min={12}
              max={22}
              step={1}
              value={style.logoSizePercent}
              onChange={(e) => onChange({ ...style, logoSizePercent: Number(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                id="logo-bg-pad"
                type="checkbox"
                checked={style.logoHasBackground}
                onChange={(e) => onChange({ ...style, logoHasBackground: e.target.checked })}
                className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="logo-bg-pad" className="text-xs text-neutral-700 dark:text-neutral-300 select-none cursor-pointer">
                Add background padding behind logo
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to standard look</span>
        </button>
      </div>
    </div>
  );
};
