import React from 'react';
import { QrCode, Plus, Sun, Moon, Monitor } from 'lucide-react';
import { ThemeMode } from '../utils/theme';

interface HeaderProps {
  currentTab: 'generator' | 'batch' | 'library';
  onTabChange: (tab: 'generator' | 'batch' | 'library') => void;
  onOpenSpecs: () => void;
  onNewCode: () => void;
  savedCount: number;
  theme: ThemeMode;
  onCycleTheme: () => void;
}

export const GithubMark: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenSpecs,
  onNewCode,
  savedCount,
  theme,
  onCycleTheme,
}) => {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-8">
        <div>
          <button
            type="button"
            onClick={() => onTabChange('generator')}
            className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              QRForge
            </span>
          </button>
        </div>

        <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onTabChange('generator')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'generator'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Generator
          </button>
          <button
            type="button"
            onClick={() => onTabChange('batch')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'batch'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Batch export
          </button>
          <button
            type="button"
            onClick={() => onTabChange('library')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'library'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span>Library</span>
            {savedCount > 0 && (
              <span className="text-xs text-neutral-500">
                ({savedCount})
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSpecs}
            className="whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors py-1 hidden sm:block"
          >
            Print tips
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onCycleTheme}
            aria-label={`Current theme: ${theme}. Click to switch theme.`}
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
            className="p-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4" />}
          </button>

          <a
            href="https://github.com/Devputta/QRForge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="QRForge on GitHub"
            title="View source on GitHub"
            className="flex items-center gap-1.5 border border-neutral-300 dark:border-neutral-700 rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <GithubMark className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <button
            type="button"
            onClick={onNewCode}
            aria-label="Create new QR code"
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs whitespace-nowrap shrink-0 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New code</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
