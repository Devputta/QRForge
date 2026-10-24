import React, { useState } from 'react';
import { X, Ruler, Shield, BookOpen } from 'lucide-react';
import { useModalA11y } from '../utils/useModalA11y';

interface StandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandardsModal: React.FC<StandardsModalProps> = ({ isOpen, onClose }) => {
  const [distanceMeters, setDistanceMeters] = useState<number>(1.0);
  const modalRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  // Formula: Minimum QR Size = Scan Distance / 10
  const minSizeCm = Math.max(2.0, Math.round((distanceMeters * 100) / 10));
  const minSizeInches = (minSizeCm / 2.54).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="standards-modal-title"
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 id="standards-modal-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Print sizing and QR tips
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-200 font-semibold">
              <Ruler className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Print size calculator</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              A handy rule of thumb for scanning distance: make the QR code width at least 1/10th of how far away someone stands to scan it.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Expected scanning distance:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {distanceMeters >= 1 ? `${distanceMeters.toFixed(1)} meters` : `${Math.round(distanceMeters * 100)} cm`}
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={5.0}
                step={0.1}
                value={distanceMeters}
                onChange={(e) => setDistanceMeters(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>20 cm (Desk)</span>
                <span>1 meter (Poster)</span>
                <span>3 meters (Sign)</span>
                <span>5 meters (Billboard)</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block uppercase tracking-wider">
                  Recommended minimum size
                </span>
                <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {minSizeCm} cm × {minSizeCm} cm
                </span>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                (~{minSizeInches}&quot; × {minSizeInches}&quot;)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Helpful tips for printing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-lg border border-neutral-200 dark:border-neutral-800/80 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">Leave a blank border</span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Keep a small empty margin around the code so phone cameras can recognize the corners quickly.
                </p>
              </div>

              <div className="p-3 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-lg border border-neutral-200 dark:border-neutral-800/80 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">Error correction</span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Higher error correction helps if the code gets scratched, dirty, or if you place a logo in the middle.
                </p>
              </div>

              <div className="p-3 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-lg border border-neutral-200 dark:border-neutral-800/80 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">Paper and lighting</span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Matte paper is easiest to scan. Glossy paper or glass can create glares that throw off camera lenses.
                </p>
              </div>

              <div className="p-3 bg-neutral-50/80 dark:bg-neutral-950/60 rounded-lg border border-neutral-200 dark:border-neutral-800/80 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">Vector files for large prints</span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Export as SVG when printing large posters or signs so edges remain sharp at any scale.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-200">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Everything runs right in your browser. No links, passwords, or contacts ever leave your computer.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end bg-neutral-50 dark:bg-neutral-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
