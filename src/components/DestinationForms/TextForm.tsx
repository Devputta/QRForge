import React from 'react';
import { TextConfig } from '../../types/qr';

interface TextFormProps {
  config: TextConfig;
  onChange: (config: TextConfig) => void;
  error?: string;
}

export const TextForm: React.FC<TextFormProps> = ({ config, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="raw-text" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Plain text content
          </label>
          <span className="text-xs text-neutral-500">
            {config.text.length} characters
          </span>
        </div>
        <textarea
          id="raw-text"
          rows={6}
          value={config.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Enter text, instructions, serial numbers, codes, or notes..."
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md p-3.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          Scanners will display this text directly on the screen without opening a web browser.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
