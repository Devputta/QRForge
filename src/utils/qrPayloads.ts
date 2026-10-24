import {
  GoogleMapsConfig,
  WifiConfig,
  VCardConfig,
  SocialConfig,
  EmailConfig,
  PhoneConfig,
  FileConfig,
  WhatsAppConfig,
  TextConfig,
  CalendarEventConfig,
  UrlFormConfig,
} from '../types/qr';

function escapeWifiString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');
}

export function sanitizeAndValidateUrl(input: string): { isValid: boolean; normalized: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, normalized: '', error: 'Please enter a web address.' };
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = 'https://' + candidate;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, normalized: candidate, error: 'Web addresses need to start with http:// or https://.' };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { isValid: false, normalized: candidate, error: "That doesn't look like a web address. Try example.com." };
    }
    return { isValid: true, normalized: parsed.href };
  } catch {
    return { isValid: false, normalized: candidate, error: "That doesn't look like a web address. Try example.com." };
  }
}

export function buildUrlWithUtmPayload(config: UrlFormConfig | string): {
  isValid: boolean;
  payload: string;
  summary: string;
  error?: string;
} {
  const rawUrl = typeof config === 'string' ? config : config.url;
  const validation = sanitizeAndValidateUrl(rawUrl);
  if (!validation.isValid) {
    return { isValid: false, payload: '', summary: '', error: validation.error };
  }

  if (typeof config === 'string') {
    return { isValid: true, payload: validation.normalized, summary: validation.normalized };
  }

  const { utmSource, utmMedium, utmCampaign } = config;
  const hasUtm = Boolean(utmSource?.trim() || utmMedium?.trim() || utmCampaign?.trim());

  if (!hasUtm) {
    return { isValid: true, payload: validation.normalized, summary: validation.normalized };
  }

  try {
    const parsed = new URL(validation.normalized);
    if (utmSource?.trim()) parsed.searchParams.set('utm_source', utmSource.trim());
    if (utmMedium?.trim()) parsed.searchParams.set('utm_medium', utmMedium.trim());
    if (utmCampaign?.trim()) parsed.searchParams.set('utm_campaign', utmCampaign.trim());

    return {
      isValid: true,
      payload: parsed.href,
      summary: `${parsed.hostname}${parsed.pathname} (+ UTM tags)`,
    };
  } catch {
    return { isValid: true, payload: validation.normalized, summary: validation.normalized };
  }
}

export function isPotentialUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return true;
  }

  if (/^(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.|www\.google\.[a-z.]+\/maps|google\.[a-z.]+\/maps)/i.test(trimmed)) {
    return true;
  }

  if (/\s/.test(trimmed)) {
    return false;
  }

  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/?#].*)?$/.test(trimmed)) {
    return true;
  }

  return false;
}

export function validateGoogleMapsUrl(input: string): {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
  isShortLink: boolean;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Google Maps link is required.',
      isShortLink: false,
    };
  }

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate)) {
    candidate = 'https://' + candidate;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Please enter a valid Google Maps web address.',
      isShortLink: false,
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Web links need to start with http:// or https://.',
      isShortLink: false,
    };
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  const isMapsAppShortLink = host === 'maps.app.goo.gl';
  const isGooGlMapsShortLink = host === 'goo.gl' && (path.startsWith('/maps') || path === '/maps');
  const isMapsGoogleSubdomain = /^maps\.google\.[a-z.]+$/.test(host);
  const isGoogleMapsPath = /(^|\.)google\.[a-z.]+$/.test(host) && (path.startsWith('/maps') || path === '/maps');

  if (isMapsAppShortLink || isGooGlMapsShortLink || isMapsGoogleSubdomain || isGoogleMapsPath) {
    if (parsed.protocol === 'http:') {
      candidate = 'https://' + candidate.substring('http://'.length);
    }
    return {
      isValid: true,
      normalizedUrl: candidate,
      isShortLink: isMapsAppShortLink || isGooGlMapsShortLink,
    };
  }

  return {
    isValid: false,
    normalizedUrl: '',
    error: 'The URL entered is not a recognized Google Maps link. Please provide a Google Maps share link (e.g., https://maps.app.goo.gl/...) or enter a place name/address.',
    isShortLink: false,
  };
}

export function buildGoogleMapsPayload(config: GoogleMapsConfig): {
  isValid: boolean;
  payload: string;
  summary: string;
  error?: string;
  detectedType?: 'shortlink' | 'maps_url' | 'search' | 'directions';
} {
  if (config.mode === 'search') {
    const q = config.searchQuery.trim();
    if (!q) {
      return { isValid: false, payload: '', summary: '', error: 'Please enter a place name or street address.' };
    }

    if (isPotentialUrl(q)) {
      const mapsCheck = validateGoogleMapsUrl(q);
      if (mapsCheck.isValid) {
        return {
          isValid: true,
          payload: mapsCheck.normalizedUrl,
          summary: mapsCheck.isShortLink
            ? 'Google Maps share link (preserved verbatim)'
            : 'Google Maps direct link (preserved verbatim)',
          detectedType: mapsCheck.isShortLink ? 'shortlink' : 'maps_url',
        };
      }
      return {
        isValid: false,
        payload: '',
        summary: '',
        error: mapsCheck.error,
      };
    }

    const payload = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    return {
      isValid: true,
      payload,
      summary: `Google Maps place search: "${q}"`,
      detectedType: 'search',
    };
  }

  if (config.mode === 'directions') {
    const dest = config.destinationAddress.trim();
    if (!dest) {
      return { isValid: false, payload: '', summary: '', error: 'Destination address is required.' };
    }

    if (isPotentialUrl(dest)) {
      const mapsCheck = validateGoogleMapsUrl(dest);
      if (mapsCheck.isValid) {
        return {
          isValid: true,
          payload: mapsCheck.normalizedUrl,
          summary: 'Google Maps destination link (preserved verbatim)',
          detectedType: 'directions',
        };
      }
      return {
        isValid: false,
        payload: '',
        summary: '',
        error: 'Destination address cannot be an external website URL. Please enter an address, landmark, or coordinates.',
      };
    }

    const origin = config.originAddress.trim();
    if (origin && isPotentialUrl(origin)) {
      return {
        isValid: false,
        payload: '',
        summary: '',
        error: 'Origin address cannot be an external website URL. Please enter an address, landmark, or coordinates.',
      };
    }

    const params = new URLSearchParams({
      api: '1',
      destination: dest,
      travelmode: config.travelMode,
    });
    if (origin) {
      params.set('origin', origin);
    }
    const payload = `https://www.google.com/maps/dir/?${params.toString()}`;
    return {
      isValid: true,
      payload,
      summary: `Directions to "${dest}" via ${config.travelMode}`,
      detectedType: 'directions',
    };
  }

  const pasted = config.pastedUrl.trim();
  if (!pasted) {
    return { isValid: false, payload: '', summary: '', error: 'Paste a valid Google Maps link.' };
  }

  if (!isPotentialUrl(pasted)) {
    return {
      isValid: false,
      payload: '',
      summary: '',
      error: 'Please enter a valid Google Maps web address (e.g. https://maps.app.goo.gl/...), or switch to "Place / Address" for street addresses.',
    };
  }

  const validated = validateGoogleMapsUrl(pasted);
  if (!validated.isValid) {
    return {
      isValid: false,
      payload: '',
      summary: '',
      error: validated.error,
    };
  }

  return {
    isValid: true,
    payload: validated.normalizedUrl,
    summary: validated.isShortLink
      ? 'Google Maps share link (preserved verbatim)'
      : 'Google Maps direct link (preserved verbatim)',
    detectedType: validated.isShortLink ? 'shortlink' : 'maps_url',
  };
}

export function buildWifiPayload(config: WifiConfig): { isValid: boolean; payload: string; summary: string; error?: string } {
  const ssid = config.ssid.trim();
  if (!ssid) {
    return { isValid: false, payload: '', summary: '', error: 'Network Name (SSID) is required.' };
  }
  if (config.encryption !== 'nopass' && !config.password) {
    return { isValid: false, payload: '', summary: '', error: 'Password is required for encrypted Wi-Fi networks.' };
  }

  const escapedSsid = escapeWifiString(ssid);
  const escapedPassword = config.encryption === 'nopass' ? '' : escapeWifiString(config.password);
  const hiddenFlag = config.hidden ? 'H:true;' : '';

  const payload = `WIFI:S:${escapedSsid};T:${config.encryption};P:${escapedPassword};${hiddenFlag};`;
  return {
    isValid: true,
    payload,
    summary: `Wi-Fi Network "${ssid}" (${config.encryption})`,
  };
}

export function escapeVCardValue(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function buildVCardPayload(config: VCardConfig): { isValid: boolean; payload: string; summary: string; error?: string } {
  const rawFn = `${config.firstName.trim()} ${config.lastName.trim()}`.trim();
  if (!rawFn && !config.organization.trim()) {
    return { isValid: false, payload: '', summary: '', error: 'Please provide either a Contact Name or Organization.' };
  }

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  if (config.lastName.trim() || config.firstName.trim()) {
    lines.push(`N:${escapeVCardValue(config.lastName.trim())};${escapeVCardValue(config.firstName.trim())};;;`);
  }
  if (rawFn) {
    lines.push(`FN:${escapeVCardValue(rawFn)}`);
  }
  if (config.organization.trim()) {
    lines.push(`ORG:${escapeVCardValue(config.organization.trim())}`);
  }
  if (config.jobTitle.trim()) {
    lines.push(`TITLE:${escapeVCardValue(config.jobTitle.trim())}`);
  }
  if (config.cellPhone.trim()) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(config.cellPhone.trim())}`);
  }
  if (config.workPhone.trim()) {
    lines.push(`TEL;TYPE=WORK:${escapeVCardValue(config.workPhone.trim())}`);
  }
  if (config.email.trim()) {
    lines.push(`EMAIL;TYPE=WORK:${escapeVCardValue(config.email.trim())}`);
  }
  if (config.website.trim()) {
    let url = config.website.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    lines.push(`URL:${escapeVCardValue(url)}`);
  }
  if (config.street.trim() || config.city.trim() || config.country.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(config.street.trim())};${escapeVCardValue(config.city.trim())};;;${escapeVCardValue(config.country.trim())}`);
  }
  if (config.note.trim()) {
    lines.push(`NOTE:${escapeVCardValue(config.note.trim())}`);
  }

  lines.push('END:VCARD');
  const payload = lines.join('\r\n');

  return {
    isValid: true,
    payload,
    summary: `Contact Card for ${rawFn || config.organization.trim()}`,
  };
}

export function buildSocialPayload(config: SocialConfig): { isValid: boolean; payload: string; summary: string; error?: string } {
  const val = config.usernameOrUrl.trim();
  if (!val) {
    return { isValid: false, payload: '', summary: '', error: 'Please enter a username or profile URL.' };
  }

  if (val.startsWith('http://') || val.startsWith('https://')) {
    const v = sanitizeAndValidateUrl(val);
    if (!v.isValid) return { isValid: false, payload: '', summary: '', error: v.error };
    return { isValid: true, payload: v.normalized, summary: `${config.platform.toUpperCase()} profile` };
  }

  const cleanHandle = val.replace(/^@/, '');
  let fullUrl = '';
  switch (config.platform) {
    case 'linkedin':
      fullUrl = `https://www.linkedin.com/in/${cleanHandle}`;
      break;
    case 'x':
      fullUrl = `https://x.com/${cleanHandle}`;
      break;
    case 'github':
      fullUrl = `https://github.com/${cleanHandle}`;
      break;
    case 'instagram':
      fullUrl = `https://www.instagram.com/${cleanHandle}`;
      break;
    case 'youtube':
      fullUrl = `https://www.youtube.com/@${cleanHandle}`;
      break;
    default:
      fullUrl = `https://${cleanHandle}`;
      break;
  }

  return {
    isValid: true,
    payload: fullUrl,
    summary: `${config.platform.toUpperCase()} profile (@${cleanHandle})`,
  };
}

export function buildEmailPayload(config: EmailConfig): { isValid: boolean; payload: string; summary: string; error?: string } {
  const rec = config.recipient.trim();
  if (!rec) {
    return { isValid: false, payload: '', summary: '', error: 'Recipient email address is required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec)) {
    return { isValid: false, payload: '', summary: '', error: 'Please enter a valid email format.' };
  }

  const queryParts: string[] = [];
  if (config.subject.trim()) {
    queryParts.push(`subject=${encodeURIComponent(config.subject.trim())}`);
  }
  if (config.body.trim()) {
    queryParts.push(`body=${encodeURIComponent(config.body.trim())}`);
  }

  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const payload = `mailto:${rec}${query}`;

  return {
    isValid: true,
    payload,
    summary: `Email to ${rec}`,
  };
}

export function buildPhonePayload(config: PhoneConfig): { isValid: boolean; payload: string; summary: string; error?: string } {
  const num = config.phoneNumber.trim().replace(/[\s\-\(\)]/g, '');
  if (!num) {
    return { isValid: false, payload: '', summary: '', error: 'Phone number is required.' };
  }

  if (config.mode === 'sms') {
    const payload = config.smsMessage.trim()
      ? `smsto:${num}:${config.smsMessage.trim()}`
      : `smsto:${num}`;
    return {
      isValid: true,
      payload,
      summary: `SMS to ${num}`,
    };
  }

  return {
    isValid: true,
    payload: `tel:${num}`,
    summary: `Call ${num}`,
  };
}

export function buildFilePayload(config: FileConfig): { isValid: boolean; payload: string; summary: string; error?: string } {
  const url = config.fileUrl.trim();
  if (!url) {
    return { isValid: false, payload: '', summary: '', error: 'File share URL is required.' };
  }
  const v = sanitizeAndValidateUrl(url);
  if (!v.isValid) {
    return { isValid: false, payload: '', summary: '', error: v.error };
  }

  const name = config.fileName.trim() || 'Shared Document';
  return {
    isValid: true,
    payload: v.normalized,
    summary: `${name} (${config.fileType || 'Document'})`,
  };
}

export function buildWhatsAppPayload(config: WhatsAppConfig): {
  isValid: boolean;
  payload: string;
  summary: string;
  error?: string;
} {
  const rawNum = config.phoneNumber.trim().replace(/[^0-9]/g, '');
  if (!rawNum) {
    return { isValid: false, payload: '', summary: '', error: 'Phone number with country code is required.' };
  }

  const msg = config.message.trim();
  const query = msg ? `?text=${encodeURIComponent(msg)}` : '';
  const payload = `https://wa.me/${rawNum}${query}`;

  return {
    isValid: true,
    payload,
    summary: `WhatsApp chat: +${rawNum}`,
  };
}

export function buildTextPayload(config: TextConfig): {
  isValid: boolean;
  payload: string;
  summary: string;
  error?: string;
} {
  const text = config.text.trim();
  if (!text) {
    return { isValid: false, payload: '', summary: '', error: 'Text content is required.' };
  }

  const snippet = text.length > 40 ? `${text.slice(0, 37)}...` : text;
  return {
    isValid: true,
    payload: config.text,
    summary: `Plain text: "${snippet}"`,
  };
}

function formatICalDate(dateStr: string, allDay: boolean): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());

  if (allDay) {
    return `${year}${month}${day}`;
  }

  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function buildCalendarEventPayload(config: CalendarEventConfig): {
  isValid: boolean;
  payload: string;
  summary: string;
  error?: string;
} {
  const title = config.title.trim();
  if (!title) {
    return { isValid: false, payload: '', summary: '', error: 'Event title is required.' };
  }
  if (!config.startDate) {
    return { isValid: false, payload: '', summary: '', error: 'Start date and time are required.' };
  }

  const dtStart = formatICalDate(config.startDate, config.allDay);
  if (!dtStart) {
    return { isValid: false, payload: '', summary: '', error: 'Please enter a valid start date.' };
  }

  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT'];

  lines.push(`SUMMARY:${escapeVCardValue(title)}`);

  if (config.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    if (config.endDate) {
      const dtEnd = formatICalDate(config.endDate, true);
      if (dtEnd) lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    }
  } else {
    lines.push(`DTSTART:${dtStart}`);
    if (config.endDate) {
      const dtEnd = formatICalDate(config.endDate, false);
      if (dtEnd) lines.push(`DTEND:${dtEnd}`);
    }
  }

  if (config.location?.trim()) {
    lines.push(`LOCATION:${escapeVCardValue(config.location.trim())}`);
  }
  if (config.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeVCardValue(config.description.trim())}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return {
    isValid: true,
    payload: lines.join('\r\n'),
    summary: `Event: ${title}`,
  };
}
