import React from 'react';
import { VCardConfig } from '../../types/qr';

interface VCardFormProps {
  config: VCardConfig;
  onChange: (config: VCardConfig) => void;
  error?: string;
}

export const VCardForm: React.FC<VCardFormProps> = ({ config, onChange, error }) => {
  const updateField = (field: keyof VCardConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vc-fname" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            First name
          </label>
          <input
            id="vc-fname"
            type="text"
            value={config.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Jane"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="vc-lname" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Last name
          </label>
          <input
            id="vc-lname"
            type="text"
            value={config.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Doe"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vc-org" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Company or studio
          </label>
          <input
            id="vc-org"
            type="text"
            value={config.organization}
            onChange={(e) => updateField('organization', e.target.value)}
            placeholder="Coffee Roasters"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="vc-title" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Job title
          </label>
          <input
            id="vc-title"
            type="text"
            value={config.jobTitle}
            onChange={(e) => updateField('jobTitle', e.target.value)}
            placeholder="Designer"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vc-mobile" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Mobile phone
          </label>
          <input
            id="vc-mobile"
            type="text"
            value={config.cellPhone}
            onChange={(e) => updateField('cellPhone', e.target.value)}
            placeholder="+1 555 0123"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="vc-workphone" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Work phone
          </label>
          <input
            id="vc-workphone"
            type="text"
            value={config.workPhone}
            onChange={(e) => updateField('workPhone', e.target.value)}
            placeholder="+1 555 0124"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="vc-email" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Email address
          </label>
          <input
            id="vc-email"
            type="email"
            value={config.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="jane@example.com"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="vc-web" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Website
          </label>
          <input
            id="vc-web"
            type="text"
            value={config.website}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <label htmlFor="vc-street" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Street address
          </label>
          <input
            id="vc-street"
            type="text"
            value={config.street}
            onChange={(e) => updateField('street', e.target.value)}
            placeholder="123 Main St"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="vc-city" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            City and state
          </label>
          <input
            id="vc-city"
            type="text"
            value={config.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="Portland, OR"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
          {error}
        </p>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Creates a standard contact card. Adding fewer fields keeps the QR code easier to scan.
      </p>
    </div>
  );
};
