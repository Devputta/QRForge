// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import {
  buildUrlWithUtmPayload,
  buildGoogleMapsPayload,
  buildWifiPayload,
  buildVCardPayload,
  buildWhatsAppPayload,
  buildTextPayload,
  buildCalendarEventPayload,
  buildSocialPayload,
  buildEmailPayload,
  buildPhonePayload,
  buildFilePayload,
} from '../src/utils/qrPayloads';
import {
  parseCSV,
  splitCsvLine,
  isHeaderRow,
  escapeCsvCell,
  getUniqueFilename,
} from '../src/utils/batchProcessor';
import {
  sanitizeSavedCodesForStorage,
  DEFAULT_STYLE,
} from '../src/App';
import { SavedQRCode } from '../src/types/qr';

describe('Workflow & Integration Tests', () => {
  it('executes full URL creation flow with UTM campaign tracking', () => {
    const config = {
      url: 'example.com/pricing',
      utmSource: 'billboard',
      utmMedium: 'outdoor',
      utmCampaign: 'launch2026',
    };
    const res = buildUrlWithUtmPayload(config);
    expect(res.isValid).toBe(true);
    expect(res.payload).toBe('https://example.com/pricing?utm_source=billboard&utm_medium=outdoor&utm_campaign=launch2026');
    expect(res.summary).toContain('example.com/pricing');
    expect(res.summary).toContain('UTM tags');
  });

  it('executes Google Maps directions flow with travel mode', () => {
    const config = {
      mode: 'directions' as const,
      searchQuery: '',
      destinationAddress: 'Grand Central Terminal, New York',
      originAddress: 'JFK Airport',
      travelMode: 'transit' as const,
      pastedUrl: '',
    };
    const res = buildGoogleMapsPayload(config);
    expect(res.isValid).toBe(true);
    expect(res.payload).toContain('https://www.google.com/maps/dir/?api=1');
    expect(res.payload).toContain('travelmode=transit');
    expect(res.payload).toContain('Grand+Central+Terminal');
  });

  it('executes WhatsApp direct chat flow with international number and message', () => {
    const config = {
      phoneNumber: '+1 (555) 987-6543',
      message: 'Hello from QRForge!',
    };
    const res = buildWhatsAppPayload(config);
    expect(res.isValid).toBe(true);
    expect(res.payload).toBe('https://wa.me/15559876543?text=Hello%20from%20QRForge!');
    expect(res.summary).toBe('WhatsApp chat: +15559876543');
  });

  it('executes Calendar Event flow with RFC 5545 iCalendar serialization', () => {
    const config = {
      title: 'Annual General Meeting',
      location: 'Grand Ballroom & Virtual',
      description: 'Vote on board members and review fiscal year.',
      startDate: '2026-10-30T14:00',
      endDate: '2026-10-30T16:00',
      allDay: false,
    };
    const res = buildCalendarEventPayload(config);
    expect(res.isValid).toBe(true);
    expect(res.payload).toContain('BEGIN:VCALENDAR');
    expect(res.payload).toContain('VERSION:2.0');
    expect(res.payload).toContain('BEGIN:VEVENT');
    expect(res.payload).toContain('SUMMARY:Annual General Meeting');
    expect(res.payload).toContain('LOCATION:Grand Ballroom & Virtual');
    expect(res.payload).toContain('END:VEVENT');
    expect(res.payload).toContain('END:VCALENDAR');
  });

  it('executes complete storage lifecycle: saving, password stripping, and library JSON backup', () => {
    const item: SavedQRCode = {
      id: 'test-wifi-item',
      name: 'Executive Suite Wi-Fi',
      type: 'wifi',
      destinationPayload: 'WIFI:S:Executive_Net;T:WPA;P:SuperSecretPass123!;;',
      displaySummary: 'Wi-Fi: Executive_Net',
      style: DEFAULT_STYLE,
      createdAt: 1000,
      updatedAt: 1000,
      config: {
        type: 'wifi',
        config: {
          ssid: 'Executive_Net',
          password: 'SuperSecretPass123!',
          encryption: 'WPA',
          hidden: false,
        },
      },
    };

    // 1. Sanitize before writing to storage
    const sanitized = sanitizeSavedCodesForStorage([item]);
    expect(sanitized[0].destinationPayload).toBe('WIFI:S:Executive_Net;T:WPA;P:;;');
    if (sanitized[0].config?.type === 'wifi') {
      expect(sanitized[0].config.config.password).toBe('');
      expect(sanitized[0].config.config.ssid).toBe('Executive_Net');
    }

    // 2. Export to JSON string
    const jsonString = JSON.stringify(sanitized);
    expect(jsonString).not.toContain('SuperSecretPass123!');

    // 3. Re-import and validate schema
    const parsed = JSON.parse(jsonString);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].name).toBe('Executive Suite Wi-Fi');
    expect(parsed[0].type).toBe('wifi');
  });

  it('executes batch CSV processing workflow with quote escaping and duplicate naming', () => {
    const csvContent = `Name,Type,Destination
Branch Store,url,https://example.com/store1
Branch Store,url,https://example.com/store2
Office Wi-Fi,wifi,HQ-Network:corpPass
Unknown Service,custom-service,xyz`;

    const items = parseCSV(csvContent);
    expect(items.length).toBe(4);

    expect(items[0].isValid).toBe(true);
    expect(items[0].payload).toBe('https://example.com/store1');

    expect(items[1].isValid).toBe(true);
    expect(items[1].name).toBe('Branch Store');

    // Duplicate filename handling
    const counts = new Map<string, number>();
    const file1 = getUniqueFilename('Branch Store', 1024, counts);
    const file2 = getUniqueFilename('Branch Store', 1024, counts);
    expect(file1).toBe('Branch_Store_1024px.png');
    expect(file2).toBe('Branch_Store_1024px_1.png');

    // Unsupported type error row
    expect(items[3].isValid).toBe(false);
    expect(items[3].errorMessage).toContain('Unsupported destination type');

    // CSV cell quote escaping
    expect(escapeCsvCell('Hello "World"')).toBe('"Hello ""World"""');
  });
});
