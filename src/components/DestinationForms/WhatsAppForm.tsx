import React from 'react';
import { WhatsAppConfig } from '../../types/qr';

interface WhatsAppFormProps {
  config: WhatsAppConfig;
  onChange: (config: WhatsAppConfig) => void;
  error?: string;
}

export const WhatsAppForm: React.FC<WhatsAppFormProps> = ({ config, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="wa-phone" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          WhatsApp phone number
        </label>
        <input
          id="wa-phone"
          type="tel"
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="e.g. +1 555 123 4567 or 447911123456"
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Include your country code. Any spaces, dashes, or parentheses will be cleaned automatically.
        </p>
      </div>

      <div>
        <label htmlFor="wa-msg" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          Prefilled message (optional)
        </label>
        <textarea
          id="wa-msg"
          rows={3}
          value={config.message}
          onChange={(e) => onChange({ ...config, message: e.target.value })}
          placeholder="Hi! I saw your QR code and would like more information..."
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
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
