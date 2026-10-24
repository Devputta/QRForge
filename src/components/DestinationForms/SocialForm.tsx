import React from 'react';
import { SocialConfig } from '../../types/qr';

interface SocialFormProps {
  config: SocialConfig;
  onChange: (config: SocialConfig) => void;
  error?: string;
}

export const SocialForm: React.FC<SocialFormProps> = ({ config, onChange, error }) => {
  const platforms = [
    { id: 'linkedin', label: 'LinkedIn', prefix: 'linkedin.com/in/' },
    { id: 'x', label: 'X (Twitter)', prefix: 'x.com/' },
    { id: 'github', label: 'GitHub', prefix: 'github.com/' },
    { id: 'youtube', label: 'YouTube', prefix: 'youtube.com/@' },
    { id: 'instagram', label: 'Instagram', prefix: 'instagram.com/' },
    { id: 'custom', label: 'Other', prefix: 'https://' },
  ];

  const currentPlatform = platforms.find((p) => p.id === config.platform) || platforms[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          Platform
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          {platforms.map((p) => {
            const isSelected = config.platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ...config, platform: p.id as any })}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors text-center truncate focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="social-input" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          {config.platform === 'custom' ? 'Direct profile link' : 'Username or handle'}
        </label>
        <div className="flex rounded-md border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden">
          <span className="inline-flex items-center px-3 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 border-r border-neutral-200 dark:border-neutral-800 select-none">
            {currentPlatform.prefix}
          </span>
          <input
            id="social-input"
            type="text"
            value={config.usernameOrUrl}
            onChange={(e) => onChange({ ...config, usernameOrUrl: e.target.value })}
            placeholder={config.platform === 'custom' ? 'example.com/profile' : 'yourname'}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
