import React from 'react';
import { CalendarEventConfig } from '../../types/qr';

interface CalendarEventFormProps {
  config: CalendarEventConfig;
  onChange: (config: CalendarEventConfig) => void;
  error?: string;
}

export const CalendarEventForm: React.FC<CalendarEventFormProps> = ({ config, onChange, error }) => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="evt-title" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          Event title
        </label>
        <input
          id="evt-title"
          type="text"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="e.g. Design Team Meetup"
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <input
          id="evt-allday"
          type="checkbox"
          checked={config.allDay}
          onChange={(e) => onChange({ ...config, allDay: e.target.checked })}
          className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="evt-allday" className="text-xs text-neutral-700 dark:text-neutral-300 select-none cursor-pointer">
          All-day event
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="evt-start" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Start {config.allDay ? 'date' : 'date & time'}
          </label>
          <input
            id="evt-start"
            type={config.allDay ? 'date' : 'datetime-local'}
            value={config.startDate}
            onChange={(e) => onChange({ ...config, startDate: e.target.value })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="evt-end" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            End {config.allDay ? 'date' : 'date & time'} (optional)
          </label>
          <input
            id="evt-end"
            type={config.allDay ? 'date' : 'datetime-local'}
            value={config.endDate}
            onChange={(e) => onChange({ ...config, endDate: e.target.value })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="evt-loc" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          Location (optional)
        </label>
        <input
          id="evt-loc"
          type="text"
          value={config.location}
          onChange={(e) => onChange({ ...config, location: e.target.value })}
          placeholder="e.g. Room 4B or Zoom Link"
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="evt-desc" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          Description or notes (optional)
        </label>
        <textarea
          id="evt-desc"
          rows={2}
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Agenda, dial-in codes, or instructions..."
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
          {error}
        </p>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Creates a standard calendar invite (iCalendar) that opens in Google Calendar, Apple Calendar, and Outlook.
      </p>
    </div>
  );
};
