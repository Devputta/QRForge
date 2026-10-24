import React, { useEffect, useRef, useState } from 'react';
import { StyleOptions, QRMatrixInfo } from '../types/qr';
import { renderQRToCanvas, generateQRSvg } from '../utils/qrRenderer';
import { calculateContrast } from '../utils/contrast';
import { jsPDF } from 'jspdf';
import jsQR from 'jsqr';
import { useModalA11y } from '../utils/useModalA11y';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Printer,
  BookmarkPlus,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react';

interface QRPreviewPanelProps {
  payload: string;
  summary: string;
  isValid: boolean;
  style: StyleOptions;
  onSaveToLibrary: () => void;
}

export function buildPrintDocument(
  doc: Document,
  dataUrl: string,
  summary: string,
  payload: string
): void {
  while (doc.firstChild) {
    doc.removeChild(doc.firstChild);
  }

  const html = doc.createElement('html');
  const head = doc.createElement('head');
  const title = doc.createElement('title');
  title.textContent = 'Print QR Code - QRForge';
  head.appendChild(title);

  const styleEl = doc.createElement('style');
  styleEl.textContent = `
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; padding: 24px; }
    img { max-width: 320px; width: 100%; height: auto; border: 1px solid #e2e8f0; }
    h2 { font-size: 18px; margin: 16px 0 4px; color: #0f172a; text-align: center; }
    p { font-size: 13px; color: #475569; word-break: break-all; max-width: 480px; text-align: center; }
    .meta { font-size: 12px; color: #94a3b8; margin-top: 12px; }
  `;
  head.appendChild(styleEl);

  const body = doc.createElement('body');
  const img = doc.createElement('img');
  img.src = dataUrl;
  img.alt = 'QR Code';
  body.appendChild(img);

  const h2 = doc.createElement('h2');
  h2.textContent = summary || 'QR Code';
  body.appendChild(h2);

  const p = doc.createElement('p');
  p.textContent = payload;
  body.appendChild(p);

  const meta = doc.createElement('div');
  meta.className = 'meta';
  meta.textContent = 'Created with QRForge';
  body.appendChild(meta);

  html.appendChild(head);
  html.appendChild(body);
  doc.appendChild(html);
}

export const QRPreviewPanel: React.FC<QRPreviewPanelProps> = ({
  payload,
  summary,
  isValid,
  style,
  onSaveToLibrary,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matrixInfo, setMatrixInfo] = useState<QRMatrixInfo | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pngResolution, setPngResolution] = useState<number>(1024);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scanVerified, setScanVerified] = useState<'pass' | 'fail' | null>(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfSizeCm, setPdfSizeCm] = useState<number>(10);

  useEffect(() => {
    if (!isValid || !payload) {
      setMatrixInfo(null);
      setScanVerified(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;

    renderQRToCanvas(canvas, payload, style, 440)
      .then((info) => {
        if (!isMounted) return;
        setMatrixInfo(info);
        setRenderError(null);

        // Scan verification check using jsQR
        try {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imgData.data, imgData.width, imgData.height);
            if (decoded && decoded.data === payload) {
              setScanVerified('pass');
            } else {
              setScanVerified('fail');
            }
          }
        } catch (e) {
          console.warn('Scan verification failed', e);
          setScanVerified(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('QR Render failed:', err);
          setRenderError(err.message || 'Failed to render QR matrix');
          setScanVerified(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [payload, style, isValid]);

  const contrast = calculateContrast(style.fgColor, style.bgColor);

  const handleDownloadPNG = async () => {
    if (!isValid || !payload) return;
    setIsExporting(true);

    try {
      const exportCanvas = document.createElement('canvas');
      await renderQRToCanvas(exportCanvas, payload, style, pngResolution);

      const url = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrforge_${pngResolution}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download PNG failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSVG = () => {
    if (!isValid || !payload) return;
    try {
      const svgContent = generateQRSvg(payload, style, 1024);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrforge_vector.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download SVG failed', e);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isValid || !payload) return;
    try {
      const exportCanvas = document.createElement('canvas');
      await renderQRToCanvas(exportCanvas, payload, style, 1500);
      const imgData = exportCanvas.toDataURL('image/png');

      const marginCm = 1.0;
      const totalWidth = pdfSizeCm + marginCm * 2;
      const totalHeight = pdfSizeCm + marginCm * 2 + 1.2;

      const doc = new jsPDF({
        orientation: totalWidth > totalHeight ? 'landscape' : 'portrait',
        unit: 'cm',
        format: [totalWidth, totalHeight],
      });

      doc.addImage(imgData, 'PNG', marginCm, marginCm, pdfSizeCm, pdfSizeCm);

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const cleanSummary = summary || 'QR Code';
      const labelText = cleanSummary.length > 50 ? `${cleanSummary.slice(0, 47)}...` : cleanSummary;
      doc.text(labelText, totalWidth / 2, marginCm + pdfSizeCm + 0.6, { align: 'center' });

      doc.save(`qrforge_${pdfSizeCm}cm.pdf`);
      setShowPdfDialog(false);
    } catch (e) {
      console.error('Export PDF failed', e);
    }
  };

  const handleCopyImage = async () => {
    if (!isValid || !payload) return;
    try {
      const exportCanvas = document.createElement('canvas');
      await renderQRToCanvas(exportCanvas, payload, style, 800);
      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }, 'image/png');
    } catch (e) {
      console.error('Copy to clipboard failed', e);
    }
  };

  const handleCopyPayload = () => {
    if (!payload) return;
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handlePrint = () => {
    if (!isValid || !payload) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataUrl = canvas.toDataURL('image/png');
    buildPrintDocument(printWindow.document, dataUrl, summary, payload);

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 150);
  };

  const isWebUrl = /^https?:\/\//i.test(payload);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 flex flex-col space-y-4 sm:space-y-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Live preview</h2>
        </div>

        <button
          type="button"
          onClick={onSaveToLibrary}
          disabled={!isValid || !payload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Save to library</span>
        </button>
      </div>

      <div className="flex items-center justify-center p-3 sm:p-6 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800/80 min-h-[240px] sm:min-h-[320px] relative overflow-hidden">
        {isValid && payload ? (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`QR code for ${summary || payload}`}
            className="w-[220px] h-[220px] xs:w-[260px] xs:h-[260px] sm:w-[320px] sm:h-[320px] max-w-full aspect-square rounded shadow-sm transition-transform"
          />
        ) : (
          <div className="text-center p-8 space-y-2">
            <div className="w-12 h-12 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center mx-auto text-neutral-400 dark:text-neutral-500 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-300">Waiting for a destination</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[240px]">
              Fill in the details on the left to create your QR code.
            </p>
          </div>
        )}

        {renderError && (
          <div className="absolute inset-0 bg-white/95 dark:bg-neutral-950/90 flex items-center justify-center p-6 text-center">
            <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
              <p className="font-semibold">Rendering issue</p>
              <p>{renderError}</p>
            </div>
          </div>
        )}
      </div>

      {isValid && matrixInfo && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">Scan check</span>
            <div className="flex items-center gap-3">
              {scanVerified === 'pass' && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scan verified</span>
                </span>
              )}
              {scanVerified === 'fail' && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Scan unreadable</span>
                </span>
              )}
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  contrast.score === 'excellent' || contrast.score === 'good'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {contrast.score === 'excellent' || contrast.score === 'good' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {contrast.score.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-neutral-50 dark:bg-neutral-950/60 rounded border border-neutral-200 dark:border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Grid size</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                v{matrixInfo.version} ({matrixInfo.size}x{matrixInfo.size})
              </span>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-950/60 rounded border border-neutral-200 dark:border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Contrast ratio</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">{contrast.ratio}:1</span>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-950/60 rounded border border-neutral-200 dark:border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Characters</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">{payload.length}</span>
            </div>
          </div>
        </div>
      )}

      {payload && (
        <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Where this code points
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                title="Copy content"
                aria-label="Copy encoded payload"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
              </button>
              {isWebUrl && (
                <a
                  href={payload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                  title="Open link in new tab"
                  aria-label="Open link in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open link</span>
                </a>
              )}
            </div>
          </div>
          <p className="text-xs font-mono text-neutral-800 dark:text-neutral-300 break-all select-all line-clamp-3">
            {payload}
          </p>
        </div>
      )}

      {/* Note about static QR codes */}
      <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
        <p>
          <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">Static code:</strong> Scanners connect directly to your destination without middleman servers, tracking, or scan analytics.
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">PNG image resolution</span>
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-950 rounded border border-neutral-200 dark:border-neutral-800">
            {[512, 1024, 2048].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setPngResolution(res)}
                className={`px-2 py-0.5 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  pngResolution === res
                    ? 'bg-indigo-600 text-white shadow-xs font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {res}px
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={!isValid || !payload || isExporting}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSVG}
            disabled={!isValid || !payload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPdfDialog(true)}
            disabled={!isValid || !payload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            disabled={!isValid || !payload}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedImage ? 'Copied' : 'Copy image'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!isValid || !payload}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Accessible PDF Export Size Dialog */}
      <PdfExportModal
        isOpen={showPdfDialog}
        onClose={() => setShowPdfDialog(false)}
        pdfSizeCm={pdfSizeCm}
        setPdfSizeCm={setPdfSizeCm}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
};

const PdfExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  pdfSizeCm: number;
  setPdfSizeCm: (size: number) => void;
  onDownload: () => void;
}> = ({ isOpen, onClose, pdfSizeCm, setPdfSizeCm, onDownload }) => {
  const modalRef = useModalA11y(isOpen, onClose);
  if (!isOpen) return null;

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
        aria-labelledby="pdf-dialog-title"
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl focus:outline-none"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between">
          <h3 id="pdf-dialog-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Export print PDF
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PDF dialog"
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Select the intended physical size of the QR code in centimeters.
        </p>

        <div className="grid grid-cols-4 gap-1.5">
          {[5, 10, 15, 20].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPdfSizeCm(size)}
              className={`py-1.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                pdfSizeCm === size
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-neutral-800 text-indigo-700 dark:text-neutral-100 font-medium'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              {size} cm
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="custom-cm" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Custom width (cm)
          </label>
          <input
            id="custom-cm"
            type="number"
            min={2}
            max={100}
            step={0.5}
            value={pdfSizeCm}
            onChange={(e) => setPdfSizeCm(Math.max(2, parseFloat(e.target.value) || 2))}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
