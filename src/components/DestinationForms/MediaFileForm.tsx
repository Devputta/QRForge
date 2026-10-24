import React from 'react';
import { FileConfig } from '../../types/qr';
import { Info } from 'lucide-react';

interface MediaFileFormProps {
  config: FileConfig;
  onChange: (config: FileConfig) => void;
  error?: string;
}

export const MediaFileForm: React.FC<MediaFileFormProps> = ({ config, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file-url" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
          File link
        </label>
        <input
          id="file-url"
          type="text"
          value={config.fileUrl}
          onChange={(e) => onChange({ ...config, fileUrl: e.target.value })}
          placeholder="https://example.com/menu.pdf"
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
            {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Paste a shareable link from Google Drive, Dropbox, iCloud, or your website.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="file-name" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
            File title (optional)
          </label>
          <input
            id="file-name"
            type="text"
            value={config.fileName}
            onChange={(e) => onChange({ ...config, fileName: e.target.value })}
            placeholder="e.g. Menu or Portfolio"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="file-type" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
            File format
          </label>
          <select
            id="file-type"
            value={config.fileType}
            onChange={(e) => onChange({ ...config, fileType: e.target.value })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="PDF Document">PDF (.pdf)</option>
            <option value="Spreadsheet">Spreadsheet (.xlsx / Sheets)</option>
            <option value="Presentation">Presentation (.pptx / Slides)</option>
            <option value="Image Asset">Image (.png / .jpg)</option>
            <option value="Video Media">Video (.mp4)</option>
            <option value="General Archive">Archive (.zip)</option>
          </select>
        </div>
      </div>

      <div className="p-3 bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-md space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-300">
          <Info className="w-4 h-4 text-indigo-600 dark:text-neutral-400 shrink-0" />
          <span>File sharing tips</span>
        </div>
        <p>
          QR codes store links, not the files themselves. Make sure the file&apos;s sharing setting allows anyone with the link to view it.
        </p>
      </div>
    </div>
  );
};
