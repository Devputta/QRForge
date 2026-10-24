import React, { useState, useRef } from 'react';
import { StyleOptions, BatchRowItem } from '../types/qr';
import { parseCSV, generateBatchZip } from '../utils/batchProcessor';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  FileDown,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

interface BatchGeneratorProps {
  style: StyleOptions;
}

const SAMPLE_CSV = `Name,Type,Destination
Portfolio,url,https://example.com/work
Park directions,maps,Central Park New York
Guest Wi-Fi,wifi,CafeGuest
Help desk,email,hello@example.com
Phone line,phone,+15550123`;

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({ style }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [items, setItems] = useState<BatchRowItem[]>(() => parseCSV(SAMPLE_CSV));
  const [resolution, setResolution] = useState<number>(1024);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    setCsvText(text);
    const parsed = parseCSV(text);
    setItems(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleTextChange(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrforge_batch_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validCount = items.filter((i) => i.isValid).length;
  const invalidCount = items.filter((i) => !i.isValid).length;

  const handleGenerateZip = async () => {
    if (validCount === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: validCount });
    setErrorMessage(null);

    try {
      const blob = await generateBatchZip(
        items,
        style,
        resolution,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrforge_batch_${resolution}px_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Batch generation failed', err);
      setErrorMessage('Could not create zip file. Please check your data and try again.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss error"
            className="p-1 rounded text-red-500 hover:text-red-700 dark:hover:text-red-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Batch export</span>
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Export multiple QR codes at once as a zip file with an index sheet.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Example CSV</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="csv-input" className="font-semibold text-neutral-800 dark:text-neutral-200">
            CSV data
          </label>
          <span className="text-neutral-500 text-xs">
            {items.length} rows
          </span>
        </div>
        <textarea
          id="csv-input"
          rows={5}
          value={csvText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Name,Type,Destination..."
          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md p-3 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Supported types: <code className="text-neutral-800 dark:text-neutral-300 font-semibold">url</code>, <code className="text-neutral-800 dark:text-neutral-300 font-semibold">maps</code>, <code className="text-neutral-800 dark:text-neutral-300 font-semibold">wifi</code>, <code className="text-neutral-800 dark:text-neutral-300 font-semibold">email</code>, <code className="text-neutral-800 dark:text-neutral-300 font-semibold">phone</code>.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Status</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} ready
            </span>
            {invalidCount > 0 && (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                <XCircle className="w-3.5 h-3.5" /> {invalidCount} need attention
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-600 dark:text-neutral-400">Size:</span>
              <select
                value={resolution}
                onChange={(e) => setResolution(Number(e.target.value))}
                className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={512}>512px (Small)</option>
                <option value={1024}>1024px (Standard)</option>
                <option value={2048}>2048px (Large)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerateZip}
              disabled={validCount === 0 || isProcessing}
              className="flex items-center gap-2 py-1.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Generating ({progress?.current}/{progress?.total})...
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download zip ({validCount})</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-950/70 text-neutral-600 dark:text-neutral-400">
                <th className="py-2.5 px-4 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold">Destination</th>
                <th className="py-2.5 px-4 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-neutral-900 dark:text-neutral-200 truncate max-w-[180px]">
                    {row.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60 font-medium">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 text-xs truncate max-w-[240px]">
                    {row.input}
                  </td>
                  <td className="py-2.5 px-4">
                    {row.isValid ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-xs truncate max-w-[280px]">
                          {row.payload}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{row.errorMessage || 'Invalid format'}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
