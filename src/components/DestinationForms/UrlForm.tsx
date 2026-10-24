import React, { useState } from 'react';
import { UrlFormConfig } from '../../types/qr';
import { ChevronDown, ChevronRight, Sliders } from 'lucide-react';

interface UrlFormProps {
  config: UrlFormConfig;
  onChange: (config: UrlFormConfig) => void;
  error?: string;
}

export const UrlForm: React.FC<UrlFormProps> = ({ config, onChange, error }) => {
  const [showUtm, setShowUtm] = useState(() => {
    return Boolean(config.utmSource || config.utmMedium || config.utmCampaign);
  });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="url-input" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          Website address
        </label>
        <div className="relative">
          <input
            id="url-input"
            type="text"
            value={config.url}
            onChange={(e) => onChange({ ...config, url: e.target.value })}
            placeholder="https://example.com/page"
            className={`w-full bg-white dark:bg-neutral-900 border rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
                : 'border-neutral-300 dark:border-neutral-700/80 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
            {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Enter any website address. We add https:// automatically if you leave it out.
          </p>
        )}
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-3">
        <button
          type="button"
          onClick={() => setShowUtm(!showUtm)}
          className="w-full flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Campaign tracking parameters (optional UTM tags)</span>
          </span>
          {showUtm ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {showUtm && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label htmlFor="utm-source" className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Source (utm_source)
              </label>
              <input
                id="utm-source"
                type="text"
                value={config.utmSource || ''}
                onChange={(e) => onChange({ ...config, utmSource: e.target.value })}
                placeholder="e.g. flyer, poster, print"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="utm-medium" className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Medium (utm_medium)
              </label>
              <input
                id="utm-medium"
                type="text"
                value={config.utmMedium || ''}
                onChange={(e) => onChange({ ...config, utmMedium: e.target.value })}
                placeholder="e.g. qrcode, packaging"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="utm-campaign" className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Campaign (utm_campaign)
              </label>
              <input
                id="utm-campaign"
                type="text"
                value={config.utmCampaign || ''}
                onChange={(e) => onChange({ ...config, utmCampaign: e.target.value })}
                placeholder="e.g. summer2026"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>Examples</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...config, url: 'https://docs.google.com/' })}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-600 dark:hover:decoration-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              Google Docs
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onChange({ ...config, url: 'https://github.com/' })}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-600 dark:hover:decoration-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              GitHub
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onChange({ ...config, url: 'https://linkedin.com/' })}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-600 dark:hover:decoration-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
