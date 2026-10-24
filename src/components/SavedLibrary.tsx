import React, { useState, useRef } from 'react';
import { SavedQRCode } from '../types/qr';
import {
  Search,
  Download,
  Trash2,
  Copy,
  FolderOpen,
  ArrowRight,
  Filter,
  FileUp,
  FileDown,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { renderQRToCanvas } from '../utils/qrRenderer';
import { sanitizeSavedCodesForStorage } from '../App';

interface SavedLibraryProps {
  codes: SavedQRCode[];
  onLoadCode: (code: SavedQRCode) => void;
  onDuplicateCode: (code: SavedQRCode) => void;
  onDeleteCode: (id: string) => void;
  onCreateNew: () => void;
  onImportCodes: (imported: SavedQRCode[]) => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  codes,
  onLoadCode,
  onDuplicateCode,
  onDeleteCode,
  onCreateNew,
  onImportCodes,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = codes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.destinationPayload.toLowerCase().includes(search.toLowerCase()) ||
      c.displaySummary.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'all' || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleQuickDownload = async (code: SavedQRCode) => {
    const canvas = document.createElement('canvas');
    await renderQRToCanvas(canvas, code.destinationPayload, code.style, 1024);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${code.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}_1024px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportJSON = () => {
    try {
      const sanitized = sanitizeSavedCodesForStorage(codes);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sanitized, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `qrforge_library_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatusMessage({ type: 'success', text: `Exported ${codes.length} saved codes to JSON.` });
    } catch (e) {
      console.error('Export failed', e);
      setStatusMessage({ type: 'error', text: 'Failed to export library JSON.' });
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const list = Array.isArray(parsed) ? parsed : parsed.codes;

        if (!Array.isArray(list) || list.length === 0) {
          setStatusMessage({ type: 'error', text: 'Invalid JSON file: no saved codes found.' });
          return;
        }

        // Validate each item
        const validCodes: SavedQRCode[] = [];
        for (const item of list) {
          if (
            typeof item === 'object' &&
            item !== null &&
            typeof item.name === 'string' &&
            typeof item.destinationPayload === 'string' &&
            typeof item.type === 'string'
          ) {
            validCodes.push({
              id: item.id || `code-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: item.name.trim() || 'Untitled QR',
              type: item.type,
              destinationPayload: item.destinationPayload,
              displaySummary: item.displaySummary || item.destinationPayload,
              style: item.style || {
                fgColor: '#000000',
                bgColor: '#ffffff',
                errorCorrectionLevel: 'M',
                margin: 4,
                moduleStyle: 'square',
                eyeFrameStyle: 'square',
                logoSizePercent: 18,
                logoHasBackground: true,
              },
              createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
              updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
              config: item.config,
            });
          }
        }

        if (validCodes.length === 0) {
          setStatusMessage({ type: 'error', text: 'No valid QR code items found in file.' });
          return;
        }

        const sanitized = sanitizeSavedCodesForStorage(validCodes);
        onImportCodes(sanitized);
        setStatusMessage({ type: 'success', text: `Successfully imported ${sanitized.length} saved codes.` });
      } catch {
        setStatusMessage({ type: 'error', text: 'Could not parse JSON file. Please check format.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          role="alert"
          className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            aria-label="Dismiss notification"
            className="p-1 rounded hover:opacity-75"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved codes..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-md pl-9 pr-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import library from JSON backup"
            title="Import library from JSON backup"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={codes.length === 0}
            aria-label="Export library to JSON backup"
            title="Export library to JSON backup"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-2 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            >
              <option value="all">All ({codes.length})</option>
              <option value="url">Websites</option>
              <option value="maps">Google Maps</option>
              <option value="wifi">Wi-Fi</option>
              <option value="vcard">Contact cards</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="text">Plain text</option>
              <option value="event">Calendar events</option>
              <option value="social">Social links</option>
              <option value="email">Email</option>
              <option value="phone">Phone and SMS</option>
              <option value="file">Files</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl p-4 flex flex-col justify-between transition-colors group shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 font-medium">
                      {item.type}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onDuplicateCode(item)}
                      aria-label={`Make a copy of ${item.name}`}
                      title="Make a copy"
                      className="p-1 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDownload(item)}
                      aria-label={`Download PNG for ${item.name}`}
                      title="Download PNG"
                      className="p-1 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCode(item.id)}
                      aria-label={`Delete ${item.name}`}
                      title="Delete"
                      className="p-1 rounded text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 truncate">
                  {item.displaySummary}
                </p>
                <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-950 font-mono text-xs text-neutral-600 dark:text-neutral-400 truncate mb-4 select-all border border-neutral-150 dark:border-neutral-850">
                  {item.destinationPayload}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onLoadCode(item)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open in editor</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
            {codes.length === 0 ? 'No saved codes yet' : 'No matches found'}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            {codes.length === 0
              ? 'Codes you save will show up here so you can view, edit, or download them again anytime.'
              : 'Try clearing your search or switching the category.'}
          </p>
          {codes.length === 0 && (
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-2 inline-flex items-center gap-1.5 py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            >
              <span>Create a code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
