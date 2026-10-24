import JSZip from 'jszip';
import { BatchRowItem, DestinationType, StyleOptions } from '../types/qr';
import {
  sanitizeAndValidateUrl,
  buildGoogleMapsPayload,
  buildWifiPayload,
  buildEmailPayload,
  buildPhonePayload,
} from './qrPayloads';
import { renderQRToCanvas } from './qrRenderer';

// RFC 4180 specifies doubling quotation marks so spreadsheets do not misread commas or quotes inside values.
export function escapeCsvCell(val: string): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

// Only treat row 1 as a header when column titles match keywords, so users without headers don't lose their first code.
export function isHeaderRow(parts: string[]): boolean {
  if (parts.length < 2) return false;
  const p0 = parts[0].toLowerCase().trim();
  const p1 = parts[1].toLowerCase().trim();
  if (p0 !== 'name' || p1 !== 'type') return false;
  if (parts.length >= 3) {
    const p2 = parts[2].toLowerCase().trim();
    return p2 === 'destination' || p2 === 'value';
  }
  return true;
}

export function parseCSV(content: string): BatchRowItem[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const results: BatchRowItem[] = [];

  const firstLineParts = splitCsvLine(lines[0]);
  const startIndex = isHeaderRow(firstLineParts) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const parts = splitCsvLine(rawLine);
    if (parts.length < 2) continue;

    const name = parts[0] || `Code_${i}`;
    const rawType = (parts[1] || '').trim().toLowerCase();
    const input = (parts.length >= 3 ? parts[2] : parts[1] || '').trim();

    let type: DestinationType | null = null;
    if (['url', 'website', 'link'].includes(rawType)) type = 'url';
    else if (['maps', 'map', 'location'].includes(rawType)) type = 'maps';
    else if (['wifi', 'wi-fi', 'network'].includes(rawType)) type = 'wifi';
    else if (['email', 'mail'].includes(rawType)) type = 'email';
    else if (['phone', 'tel', 'call'].includes(rawType)) type = 'phone';

    if (!type) {
      results.push({
        id: `row-${i}-${Date.now()}`,
        name,
        type: 'url',
        input,
        payload: '',
        isValid: false,
        errorMessage: `Unsupported destination type: "${parts[1]}". Supported types: url, maps, wifi, email, phone.`,
      });
      continue;
    }

    const validation = validateBatchItem(type, input);

    results.push({
      id: `row-${i}-${Date.now()}`,
      name,
      type,
      input,
      payload: validation.payload,
      isValid: validation.isValid,
      errorMessage: validation.errorMessage,
    });
  }

  return results;
}

export function splitCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function validateBatchItem(type: DestinationType, input: string): { isValid: boolean; payload: string; errorMessage?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, payload: '', errorMessage: 'Destination value is empty' };
  }

  if (type === 'url') {
    const res = sanitizeAndValidateUrl(trimmed);
    return {
      isValid: res.isValid,
      payload: res.normalized,
      errorMessage: res.error,
    };
  }

  if (type === 'maps') {
    const res = buildGoogleMapsPayload({
      mode: 'search',
      searchQuery: trimmed,
      destinationAddress: '',
      originAddress: '',
      travelMode: 'driving',
      pastedUrl: trimmed,
    });
    return {
      isValid: res.isValid,
      payload: res.payload,
      errorMessage: res.error,
    };
  }

  if (type === 'wifi') {
    // Expected format: SSID:password or SSID
    const wifiParts = trimmed.split(':');
    const ssid = wifiParts[0] || '';
    const pass = wifiParts[1] || '';
    const res = buildWifiPayload({
      ssid,
      password: pass,
      encryption: pass ? 'WPA' : 'nopass',
      hidden: false,
    });
    return {
      isValid: res.isValid,
      payload: res.payload,
      errorMessage: res.error,
    };
  }

  if (type === 'email') {
    const res = buildEmailPayload({
      recipient: trimmed,
      subject: '',
      body: '',
    });
    return {
      isValid: res.isValid,
      payload: res.payload,
      errorMessage: res.error,
    };
  }

  if (type === 'phone') {
    const res = buildPhonePayload({
      mode: 'tel',
      phoneNumber: trimmed,
      smsMessage: '',
    });
    return {
      isValid: res.isValid,
      payload: res.payload,
      errorMessage: res.error,
    };
  }

  return { isValid: false, payload: '', errorMessage: 'Unsupported destination type' };
}

// Strips filesystem control characters so files can be saved safely on Windows, macOS, and Linux.
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 60);
}

// Appends numbers when items share identical labels so images never overwrite each other in the archive.
export function getUniqueFilename(
  baseName: string,
  resolution: number,
  counts: Map<string, number>
): string {
  const clean = sanitizeFilename(baseName || 'qr');
  const baseKey = `${clean}_${resolution}px`;
  const count = counts.get(baseKey) || 0;
  counts.set(baseKey, count + 1);

  if (count === 0) {
    return `${baseKey}.png`;
  }
  return `${baseKey}_${count}.png`;
}

// Generates high-resolution PNGs on an offscreen canvas to keep files sharp for print production.
export async function generateBatchZip(
  items: BatchRowItem[],
  style: StyleOptions,
  resolution: number = 1024,
  onProgress?: (completed: number, total: number) => void
): Promise<Blob> {
  const validItems = items.filter((it) => it.isValid && it.payload);
  if (validItems.length === 0) {
    throw new Error('No valid rows available to export.');
  }

  const zip = new JSZip();
  const offscreenCanvas = document.createElement('canvas');
  let completed = 0;
  const filenameCounts = new Map<string, number>();

  const manifestRows: string[] = ['Filename,Label,DestinationType,Payload'];

  for (const item of validItems) {
    await renderQRToCanvas(offscreenCanvas, item.payload, style, resolution);

    const dataUrl = offscreenCanvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const filename = getUniqueFilename(item.name || 'qr', resolution, filenameCounts);

    zip.file(filename, base64Data, { base64: true });
    manifestRows.push(
      [
        escapeCsvCell(filename),
        escapeCsvCell(item.name),
        escapeCsvCell(item.type),
        escapeCsvCell(item.payload),
      ].join(',')
    );

    completed++;
    if (onProgress) onProgress(completed, validItems.length);
  }

  zip.file('manifest.csv', manifestRows.join('\r\n'));

  return await zip.generateAsync({ type: 'blob' });
}
