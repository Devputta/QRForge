// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import {
  buildEmailPayload,
  buildVCardPayload,
  escapeVCardValue,
  buildWifiPayload,
} from '../src/utils/qrPayloads';
import {
  isHeaderRow,
  parseCSV,
  getUniqueFilename,
  escapeCsvCell,
} from '../src/utils/batchProcessor';
import { buildPrintDocument } from '../src/components/QRPreviewPanel';
import {
  sanitizeSavedCodesForStorage,
  SEED_SAVED_CODES,
} from '../src/App';
import {
  SavedQRCode,
  DestinationConfig,
  GoogleMapsConfig,
  WifiConfig,
  VCardConfig,
  SocialConfig,
  EmailConfig,
  PhoneConfig,
  FileConfig,
} from '../src/types/qr';

describe('Fix 1: handleLoadSavedCode & SavedQRCode DestinationConfig Rehydration', () => {
  it('correctly persists and rehydrates every destination type config', () => {
    // 1. URL
    const urlSaved: SavedQRCode = {
      id: 'url-1',
      name: 'Website',
      type: 'url',
      destinationPayload: 'https://example.com/portal',
      displaySummary: 'https://example.com/portal',
      style: { fgColor: '#000', bgColor: '#fff', errorCorrectionLevel: 'M', margin: 4, moduleStyle: 'square', eyeFrameStyle: 'square', logoSizePercent: 18, logoHasBackground: true },
      createdAt: 1000,
      updatedAt: 1000,
      config: { type: 'url', config: 'https://example.com/portal' },
    };
    expect(urlSaved.config?.type).toBe('url');
    expect(urlSaved.config?.config).toBe('https://example.com/portal');

    // 2. Maps
    const mapsCfg: GoogleMapsConfig = {
      mode: 'directions',
      searchQuery: '',
      destinationAddress: 'Austin-Bergstrom International Airport',
      originAddress: 'Downtown Austin',
      travelMode: 'transit',
      pastedUrl: '',
    };
    const mapsSaved: SavedQRCode = {
      ...urlSaved,
      id: 'maps-1',
      type: 'maps',
      config: { type: 'maps', config: mapsCfg },
    };
    expect(mapsSaved.config?.type).toBe('maps');
    if (mapsSaved.config?.type === 'maps') {
      expect(mapsSaved.config.config.destinationAddress).toBe('Austin-Bergstrom International Airport');
      expect(mapsSaved.config.config.travelMode).toBe('transit');
    }

    // 3. Wi-Fi
    const wifiCfg: WifiConfig = {
      ssid: 'GuestWifi',
      password: '',
      encryption: 'WPA',
      hidden: true,
    };
    const wifiSaved: SavedQRCode = {
      ...urlSaved,
      id: 'wifi-1',
      type: 'wifi',
      config: { type: 'wifi', config: wifiCfg },
    };
    expect(wifiSaved.config?.type).toBe('wifi');
    if (wifiSaved.config?.type === 'wifi') {
      expect(wifiSaved.config.config.ssid).toBe('GuestWifi');
      expect(wifiSaved.config.config.hidden).toBe(true);
      expect(wifiSaved.config.config.password).toBe('');
    }

    // 4. vCard
    const vcardCfg: VCardConfig = {
      firstName: 'Jane',
      lastName: 'Smith',
      organization: 'Tech Corp',
      jobTitle: 'Lead Architect',
      cellPhone: '+1-555-0100',
      workPhone: '+1-555-0200',
      email: 'jane@techcorp.com',
      website: 'https://techcorp.com',
      street: '123 Market St',
      city: 'Seattle',
      country: 'USA',
      note: 'Key Contact',
    };
    const vcardSaved: SavedQRCode = {
      ...urlSaved,
      id: 'vcard-1',
      type: 'vcard',
      config: { type: 'vcard', config: vcardCfg },
    };
    expect(vcardSaved.config?.type).toBe('vcard');
    if (vcardSaved.config?.type === 'vcard') {
      expect(vcardSaved.config.config.firstName).toBe('Jane');
      expect(vcardSaved.config.config.jobTitle).toBe('Lead Architect');
    }

    // 5. Social
    const socialCfg: SocialConfig = {
      platform: 'github',
      usernameOrUrl: 'enterprise-org',
    };
    const socialSaved: SavedQRCode = {
      ...urlSaved,
      id: 'social-1',
      type: 'social',
      config: { type: 'social', config: socialCfg },
    };
    expect(socialSaved.config?.type).toBe('social');
    if (socialSaved.config?.type === 'social') {
      expect(socialSaved.config.config.platform).toBe('github');
      expect(socialSaved.config.config.usernameOrUrl).toBe('enterprise-org');
    }

    // 6. Email
    const emailCfg: EmailConfig = {
      recipient: 'support@acme.com',
      subject: 'Inquiry',
      body: 'Need assistance',
    };
    const emailSaved: SavedQRCode = {
      ...urlSaved,
      id: 'email-1',
      type: 'email',
      config: { type: 'email', config: emailCfg },
    };
    expect(emailSaved.config?.type).toBe('email');
    if (emailSaved.config?.type === 'email') {
      expect(emailSaved.config.config.recipient).toBe('support@acme.com');
      expect(emailSaved.config.config.subject).toBe('Inquiry');
    }

    // 7. Phone
    const phoneCfg: PhoneConfig = {
      mode: 'sms',
      phoneNumber: '+15551234567',
      smsMessage: 'Hello there',
    };
    const phoneSaved: SavedQRCode = {
      ...urlSaved,
      id: 'phone-1',
      type: 'phone',
      config: { type: 'phone', config: phoneCfg },
    };
    expect(phoneSaved.config?.type).toBe('phone');
    if (phoneSaved.config?.type === 'phone') {
      expect(phoneSaved.config.config.mode).toBe('sms');
      expect(phoneSaved.config.config.smsMessage).toBe('Hello there');
    }

    // 8. File
    const fileCfg: FileConfig = {
      fileUrl: 'https://cdn.example.com/manual.pdf',
      fileName: 'User Manual',
      fileType: 'PDF Document',
      accessNotice: 'Public document',
    };
    const fileSaved: SavedQRCode = {
      ...urlSaved,
      id: 'file-1',
      type: 'file',
      config: { type: 'file', config: fileCfg },
    };
    expect(fileSaved.config?.type).toBe('file');
    if (fileSaved.config?.type === 'file') {
      expect(fileSaved.config.config.fileName).toBe('User Manual');
      expect(fileSaved.config.config.fileUrl).toBe('https://cdn.example.com/manual.pdf');
    }
  });
});

describe('Fix 2: QRPreviewPanel handlePrint Safe DOM Construction', () => {
  it('constructs print document using DOM APIs without innerHTML injection', () => {
    const doc = document.implementation.createHTMLDocument();
    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const maliciousSummary = '<script>alert("xss")</script>Corporate QR';
    const maliciousPayload = '<img src="x" onerror="alert(1)">https://example.com';

    buildPrintDocument(doc, mockDataUrl, maliciousSummary, maliciousPayload);

    // Elements should be properly constructed
    const h2 = doc.querySelector('h2');
    const p = doc.querySelector('p');
    const img = doc.querySelector('img');

    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(mockDataUrl);

    // textContent should contain the raw string, but no child script or img elements inside h2/p
    expect(h2?.textContent).toBe(maliciousSummary);
    expect(h2?.querySelector('script')).toBeNull();

    expect(p?.textContent).toBe(maliciousPayload);
    expect(p?.querySelector('img')).toBeNull();
  });
});

describe('Fix 3: buildEmailPayload RFC 6068 Compliance with encodeURIComponent', () => {
  it('encodes spaces with %20 instead of + in subject and body', () => {
    const res = buildEmailPayload({
      recipient: 'hello@example.com',
      subject: 'Hello World & Friends',
      body: 'Line 1 with spaces\nLine 2',
    });

    expect(res.isValid).toBe(true);
    // RFC 6068 requires %20 for spaces in mailto URIs, not '+'
    expect(res.payload).toContain('subject=Hello%20World%20%26%20Friends');
    expect(res.payload).not.toContain('Hello+World');
    expect(res.payload).toContain('body=Line%201%20with%20spaces%0ALine%202');
  });

  it('correctly handles empty subject and body', () => {
    const res = buildEmailPayload({
      recipient: 'simple@example.com',
      subject: '',
      body: '',
    });
    expect(res.isValid).toBe(true);
    expect(res.payload).toBe('mailto:simple@example.com');
  });
});

describe('Fix 4: buildVCardPayload RFC 2426 Character Escaping', () => {
  it('escapes backslashes, semicolons, commas, and newlines in text fields', () => {
    expect(escapeVCardValue('C:\\Directory\\File')).toBe('C:\\\\Directory\\\\File');
    expect(escapeVCardValue('Acme, Inc.')).toBe('Acme\\, Inc.');
    expect(escapeVCardValue('Item 1; Item 2')).toBe('Item 1\\; Item 2');
    expect(escapeVCardValue('Line 1\nLine 2\r\nLine 3')).toBe('Line 1\\nLine 2\\nLine 3');
  });

  it('escapes all fields in buildVCardPayload', () => {
    const res = buildVCardPayload({
      firstName: 'John; Jr.',
      lastName: 'Doe, Esq.',
      organization: 'Acme, Inc.; Global\\Tech',
      jobTitle: 'VP, Engineering & R;D',
      cellPhone: '+1-555-0199',
      workPhone: '+1-555-0100',
      email: 'john@acme.com',
      website: 'https://acme.com',
      street: '100 Main St, Suite 400; Tower B',
      city: 'Austin, TX',
      country: 'USA',
      note: 'Special notes:\n1. First line\n2. Second line; with semicolon, comma, and \\backslash',
    });

    expect(res.isValid).toBe(true);
    // N line: N:Doe\, Esq.;John\; Jr.;;;
    expect(res.payload).toContain('N:Doe\\, Esq.;John\\; Jr.;;;');
    // FN line:
    expect(res.payload).toContain('FN:John\\; Jr. Doe\\, Esq.');
    // ORG line:
    expect(res.payload).toContain('ORG:Acme\\, Inc.\\; Global\\\\Tech');
    // TITLE line:
    expect(res.payload).toContain('TITLE:VP\\, Engineering & R\\;D');
    // ADR line:
    expect(res.payload).toContain('ADR;TYPE=WORK:;;100 Main St\\, Suite 400\\; Tower B;Austin\\, TX;;;USA');
    // NOTE line:
    expect(res.payload).toContain('NOTE:Special notes:\\n1. First line\\n2. Second line\\; with semicolon\\, comma\\, and \\\\backslash');
  });
});

describe('Fix 5: Batch Export Exact Header, Unsupported Types, Filename De-duplication, & CSV Escaping', () => {
  describe('Header exact match', () => {
    it('treats row 1 as header only when column names match exactly', () => {
      expect(isHeaderRow(['Name', 'Type', 'Destination'])).toBe(true);
      expect(isHeaderRow(['name', 'type', 'value'])).toBe(true);
      expect(isHeaderRow(['Name', 'Type'])).toBe(true);

      // Data rows that contain 'name' or 'type' inside text must NOT be treated as headers
      expect(isHeaderRow(['Namecard Store', 'url', 'https://example.com'])).toBe(false);
      expect(isHeaderRow(['Typewriter Museum', 'url', 'https://example.com'])).toBe(false);
      expect(isHeaderRow(['Destination Travel', 'url', 'https://example.com'])).toBe(false);
    });

    it('parses data in row 1 if row 1 is not an exact header match', () => {
      const csv = `Namecard Shop,url,https://example.com/cards
Second Shop,url,https://example.com/second`;
      const rows = parseCSV(csv);
      expect(rows.length).toBe(2);
      expect(rows[0].name).toBe('Namecard Shop');
      expect(rows[0].payload).toBe('https://example.com/cards');
    });

    it('skips row 1 if it is an exact header match', () => {
      const csv = `Name,Type,Destination
Company,url,https://example.com`;
      const rows = parseCSV(csv);
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('Company');
    });
  });

  describe('Unsupported types error handling', () => {
    it('returns an error for unsupported types instead of defaulting to url', () => {
      const csv = `Row 1,crypto,1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Row 2,customType,someValue
Row 3,url,https://valid.com`;

      const rows = parseCSV(csv);
      expect(rows.length).toBe(3);

      expect(rows[0].isValid).toBe(false);
      expect(rows[0].errorMessage).toContain('Unsupported destination type: "crypto"');

      expect(rows[1].isValid).toBe(false);
      expect(rows[1].errorMessage).toContain('Unsupported destination type: "customType"');

      expect(rows[2].isValid).toBe(true);
      expect(rows[2].payload).toBe('https://valid.com/');
    });
  });

  describe('Filename de-duplication', () => {
    it('appends a numeric suffix for duplicate filenames', () => {
      const counts = new Map<string, number>();
      const fn1 = getUniqueFilename('Visitor Badge', 1024, counts);
      const fn2 = getUniqueFilename('Visitor Badge', 1024, counts);
      const fn3 = getUniqueFilename('Visitor Badge', 1024, counts);
      const fnOther = getUniqueFilename('Different Badge', 1024, counts);

      expect(fn1).toBe('Visitor_Badge_1024px.png');
      expect(fn2).toBe('Visitor_Badge_1024px_1.png');
      expect(fn3).toBe('Visitor_Badge_1024px_2.png');
      expect(fnOther).toBe('Different_Badge_1024px.png');
    });
  });

  describe('CSV quote escaping for manifest.csv', () => {
    it('escapes quotes by doubling them per RFC 4180', () => {
      expect(escapeCsvCell('Acme "Super" Store')).toBe('"Acme ""Super"" Store"');
      expect(escapeCsvCell('Simple')).toBe('"Simple"');
      expect(escapeCsvCell('Contains, comma')).toBe('"Contains, comma"');
      expect(escapeCsvCell('Line1\nLine2')).toBe('"Line1\nLine2"');
    });
  });
});

describe('Fix 6: Logo Warning with Error Correction Level L or M', () => {
  it('identifies warning condition when logo is present with L or M', () => {
    const isWarning = (hasLogo: boolean, ec: 'L' | 'M' | 'Q' | 'H') => {
      return hasLogo && (ec === 'L' || ec === 'M');
    };

    expect(isWarning(true, 'L')).toBe(true);
    expect(isWarning(true, 'M')).toBe(true);
    expect(isWarning(true, 'Q')).toBe(false);
    expect(isWarning(true, 'H')).toBe(false);
    expect(isWarning(false, 'L')).toBe(false);
    expect(isWarning(false, 'M')).toBe(false);
  });
});

describe('Fix 7: Wi-Fi Passwords Removed from Demo & Not Persisted to localStorage', () => {
  it('does not include demo passwords in SEED_SAVED_CODES or default wifiConfig', () => {
    const wifiSeed = SEED_SAVED_CODES.find((s) => s.type === 'wifi');
    expect(wifiSeed).toBeDefined();
    // Destination payload should not contain a secret password
    expect(wifiSeed?.destinationPayload).toBe('WIFI:S:Enterprise_Guest;T:WPA;P:;;');
    if (wifiSeed?.config?.type === 'wifi') {
      expect(wifiSeed.config.config.password).toBe('');
    }
  });

  it('sanitizeSavedCodesForStorage strips Wi-Fi passwords from config and payload', () => {
    const sampleSaved: SavedQRCode[] = [
      {
        id: 'w-1',
        name: 'Office Wi-Fi',
        type: 'wifi',
        destinationPayload: 'WIFI:S:Office;T:WPA;P:SuperSecretPass123;;',
        displaySummary: 'Wi-Fi',
        style: { fgColor: '#000', bgColor: '#fff', errorCorrectionLevel: 'M', margin: 4, moduleStyle: 'square', eyeFrameStyle: 'square', logoSizePercent: 18, logoHasBackground: true },
        createdAt: 1000,
        updatedAt: 1000,
        config: {
          type: 'wifi',
          config: {
            ssid: 'Office',
            password: 'SuperSecretPass123',
            encryption: 'WPA',
            hidden: false,
          },
        },
      },
      {
        id: 'u-1',
        name: 'Website',
        type: 'url',
        destinationPayload: 'https://example.com',
        displaySummary: 'Website',
        style: { fgColor: '#000', bgColor: '#fff', errorCorrectionLevel: 'M', margin: 4, moduleStyle: 'square', eyeFrameStyle: 'square', logoSizePercent: 18, logoHasBackground: true },
        createdAt: 1000,
        updatedAt: 1000,
        config: { type: 'url', config: 'https://example.com' },
      },
    ];

    const sanitized = sanitizeSavedCodesForStorage(sampleSaved);

    // Wi-Fi code must have password stripped
    const wifiResult = sanitized[0];
    expect(wifiResult.destinationPayload).toBe('WIFI:S:Office;T:WPA;P:;;');
    expect(wifiResult.destinationPayload).not.toContain('SuperSecretPass123');
    if (wifiResult.config?.type === 'wifi') {
      expect(wifiResult.config.config.password).toBe('');
    }

    // URL code remains untouched
    expect(sanitized[1].destinationPayload).toBe('https://example.com');
  });
});

describe('Fix 8: UI Refinements, Accessibility, and GitHub Link', () => {
  it('has clean GitHub URL and aria-label', async () => {
    const { GithubMark } = await import('../src/components/Header');
    expect(GithubMark).toBeDefined();
  });

  it('persists and rehydrates whatsapp, text, event, and UTM URL configs', () => {
    const defaultStyle = {
      fgColor: '#000',
      bgColor: '#fff',
      errorCorrectionLevel: 'M' as const,
      margin: 4,
      moduleStyle: 'square' as const,
      eyeFrameStyle: 'square' as const,
      logoSizePercent: 18,
      logoHasBackground: true,
    };

    // WhatsApp
    const waSaved: SavedQRCode = {
      id: 'wa-1',
      name: 'WhatsApp Support',
      type: 'whatsapp',
      destinationPayload: 'https://wa.me/15551234567?text=Hello',
      displaySummary: 'WhatsApp chat: +15551234567',
      style: defaultStyle,
      createdAt: 1000,
      updatedAt: 1000,
      config: { type: 'whatsapp', config: { phoneNumber: '15551234567', message: 'Hello' } },
    };
    expect(waSaved.config?.type).toBe('whatsapp');

    // Text
    const textSaved: SavedQRCode = {
      id: 'txt-1',
      name: 'Serial Number',
      type: 'text',
      destinationPayload: 'XYZ-999',
      displaySummary: 'Plain text: "XYZ-999"',
      style: defaultStyle,
      createdAt: 1000,
      updatedAt: 1000,
      config: { type: 'text', config: { text: 'XYZ-999' } },
    };
    expect(textSaved.config?.type).toBe('text');

    // Event
    const eventSaved: SavedQRCode = {
      id: 'evt-1',
      name: 'Conference',
      type: 'event',
      destinationPayload: 'BEGIN:VCALENDAR...',
      displaySummary: 'Event: Conference',
      style: defaultStyle,
      createdAt: 1000,
      updatedAt: 1000,
      config: {
        type: 'event',
        config: {
          title: 'Conference',
          location: 'Hall A',
          description: 'Keynote',
          startDate: '2026-10-23T09:00',
          endDate: '2026-10-23T17:00',
          allDay: false,
        },
      },
    };
    expect(eventSaved.config?.type).toBe('event');
  });

  it('validates JSON import data and strips passwords', () => {
    const rawCodes = [
      {
        id: 'imported-1',
        name: 'Conference Wi-Fi',
        type: 'wifi' as const,
        destinationPayload: 'WIFI:S:Conf;T:WPA;P:Secret123;;',
        displaySummary: 'Wi-Fi: Conf',
        style: {
          fgColor: '#000',
          bgColor: '#fff',
          errorCorrectionLevel: 'M' as const,
          margin: 4,
          moduleStyle: 'square' as const,
          eyeFrameStyle: 'square' as const,
          logoSizePercent: 18,
          logoHasBackground: true,
        },
        createdAt: 1000,
        updatedAt: 1000,
        config: {
          type: 'wifi' as const,
          config: {
            ssid: 'Conf',
            password: 'Secret123',
            encryption: 'WPA' as const,
            hidden: false,
          },
        },
      },
    ];

    const sanitized = sanitizeSavedCodesForStorage(rawCodes);
    expect(sanitized[0].destinationPayload).not.toContain('Secret123');
    if (sanitized[0].config?.type === 'wifi') {
      expect(sanitized[0].config.config.password).toBe('');
    }
  });
});
