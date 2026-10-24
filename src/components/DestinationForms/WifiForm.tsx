import React, { useState } from 'react';
import { WifiConfig } from '../../types/qr';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface WifiFormProps {
  config: WifiConfig;
  onChange: (config: WifiConfig) => void;
  error?: string;
}

export const WifiForm: React.FC<WifiFormProps> = ({ config, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="wifi-ssid" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          Network name (SSID)
        </label>
        <input
          id="wifi-ssid"
          type="text"
          value={config.ssid}
          onChange={(e) => onChange({ ...config, ssid: e.target.value })}
          placeholder="e.g. Home_Guest"
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="wifi-enc" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
            Security
          </label>
          <select
            id="wifi-enc"
            value={config.encryption}
            onChange={(e) => onChange({ ...config, encryption: e.target.value as any })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="WPA">WPA / WPA2 / WPA3</option>
            <option value="WEP">WEP (Older)</option>
            <option value="nopass">None (Open network)</option>
          </select>
        </div>

        <div>
          <label htmlFor="wifi-pass" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="wifi-pass"
              type={showPassword ? 'text' : 'password'}
              disabled={config.encryption === 'nopass'}
              value={config.encryption === 'nopass' ? '' : config.password}
              onChange={(e) => onChange({ ...config, password: e.target.value })}
              placeholder={config.encryption === 'nopass' ? 'Open network' : 'Enter password'}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md pl-3.5 pr-10 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            {config.encryption !== 'nopass' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          id="wifi-hidden"
          type="checkbox"
          checked={config.hidden}
          onChange={(e) => onChange({ ...config, hidden: e.target.checked })}
          className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
        />
        <label htmlFor="wifi-hidden" className="text-xs text-neutral-700 dark:text-neutral-300 select-none cursor-pointer">
          Hidden network (name is not broadcasted)
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
          {error}
        </p>
      )}

      <div className="p-2.5 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-md flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
        <ShieldAlert className="w-4 h-4 text-amber-500/90 shrink-0 mt-0.5" />
        <span>
          Anyone who scans this code can read the password in plain text. Only share it with people you trust.
        </span>
      </div>
    </div>
  );
};
