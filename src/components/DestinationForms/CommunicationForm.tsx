import React from 'react';
import { EmailConfig, PhoneConfig } from '../../types/qr';
import { Phone, MessageSquare } from 'lucide-react';

interface CommunicationFormProps {
  type: 'email' | 'phone';
  emailConfig: EmailConfig;
  phoneConfig: PhoneConfig;
  onEmailChange: (config: EmailConfig) => void;
  onPhoneChange: (config: PhoneConfig) => void;
  error?: string;
}

export const CommunicationForm: React.FC<CommunicationFormProps> = ({
  type,
  emailConfig,
  phoneConfig,
  onEmailChange,
  onPhoneChange,
  error,
}) => {
  if (type === 'email') {
    return (
      <div className="space-y-3">
        <div>
          <label htmlFor="email-rec" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Recipient email
          </label>
          <div className="relative">
            <input
              id="email-rec"
              type="email"
              value={emailConfig.recipient}
              onChange={(e) => onEmailChange({ ...emailConfig, recipient: e.target.value })}
              placeholder="hello@example.com"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email-subj" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Subject (optional)
          </label>
          <input
            id="email-subj"
            type="text"
            value={emailConfig.subject}
            onChange={(e) => onEmailChange({ ...emailConfig, subject: e.target.value })}
            placeholder="Quick question"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email-body" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Message (optional)
          </label>
          <textarea
            id="email-body"
            rows={3}
            value={emailConfig.body}
            onChange={(e) => onEmailChange({ ...emailConfig, body: e.target.value })}
            placeholder="Hi, I wanted to ask about..."
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
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <button
          type="button"
          onClick={() => onPhoneChange({ ...phoneConfig, mode: 'tel' })}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            phoneConfig.mode === 'tel'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone call</span>
        </button>
        <button
          type="button"
          onClick={() => onPhoneChange({ ...phoneConfig, mode: 'sms' })}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            phoneConfig.mode === 'sms'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Text message (SMS)</span>
        </button>
      </div>

      <div>
        <label htmlFor="phone-number" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          Phone number
        </label>
        <input
          id="phone-number"
          type="tel"
          value={phoneConfig.phoneNumber}
          onChange={(e) => onPhoneChange({ ...phoneConfig, phoneNumber: e.target.value })}
          placeholder="+1 555 0123"
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Add your country code so phones can dial reliably (like +1 or +44).
        </p>
      </div>

      {phoneConfig.mode === 'sms' && (
        <div>
          <label htmlFor="phone-sms" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
            Message (optional)
          </label>
          <input
            id="phone-sms"
            type="text"
            value={phoneConfig.smsMessage}
            onChange={(e) => onPhoneChange({ ...phoneConfig, smsMessage: e.target.value })}
            placeholder="e.g. Hi there!"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
