import { describe, it, expect } from 'vitest';
import {
  isPotentialUrl,
  validateGoogleMapsUrl,
  buildGoogleMapsPayload,
  sanitizeAndValidateUrl,
  buildUrlWithUtmPayload,
  buildWifiPayload,
  buildSocialPayload,
  buildPhonePayload,
  buildFilePayload,
  buildWhatsAppPayload,
  buildTextPayload,
  buildCalendarEventPayload,
} from '../src/utils/qrPayloads';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

describe('Google Maps URL & Payload Generator', () => {
  describe('isPotentialUrl', () => {
    it('detects explicit URLs with protocols', () => {
      expect(isPotentialUrl('https://maps.app.goo.gl/3QW7vJp8e9k')).toBe(true);
      expect(isPotentialUrl('http://www.google.com/maps')).toBe(true);
      expect(isPotentialUrl('https://example.com')).toBe(true);
    });

    it('detects domain-like strings without protocols', () => {
      expect(isPotentialUrl('maps.app.goo.gl/3QW7vJp8e9k')).toBe(true);
      expect(isPotentialUrl('goo.gl/maps/abc')).toBe(true);
      expect(isPotentialUrl('www.google.com/maps')).toBe(true);
      expect(isPotentialUrl('example.com/store')).toBe(true);
    });

    it('correctly identifies street addresses and place names as non-URLs', () => {
      expect(isPotentialUrl('1600 Amphitheatre Pkwy, Mountain View, CA')).toBe(false);
      expect(isPotentialUrl('Empire State Building, New York')).toBe(false);
      expect(isPotentialUrl("St. Patrick's Cathedral")).toBe(false);
      expect(isPotentialUrl('Dr. Martin Luther King Jr. Blvd, Chicago, IL')).toBe(false);
      expect(isPotentialUrl('Cafe & Bistro #10')).toBe(false);
    });
  });

  describe('validateGoogleMapsUrl', () => {
    it('validates modern Google Maps short links (maps.app.goo.gl)', () => {
      const res = validateGoogleMapsUrl('https://maps.app.goo.gl/3QW7vJp8e9k');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('https://maps.app.goo.gl/3QW7vJp8e9k');
      expect(res.isShortLink).toBe(true);
    });

    it('validates and normalizes Google Maps short links missing protocol', () => {
      const res = validateGoogleMapsUrl('maps.app.goo.gl/3QW7vJp8e9k');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('https://maps.app.goo.gl/3QW7vJp8e9k');
      expect(res.isShortLink).toBe(true);
    });

    it('validates legacy goo.gl/maps short links', () => {
      const res = validateGoogleMapsUrl('https://goo.gl/maps/w8xYz');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('https://goo.gl/maps/w8xYz');
      expect(res.isShortLink).toBe(true);
    });

    it('validates standard google.com/maps links', () => {
      const url = 'https://www.google.com/maps/place/Central+Park/@40.785091,-73.968285,17z';
      const res = validateGoogleMapsUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe(url);
      expect(res.isShortLink).toBe(false);
    });

    it('validates maps.google.com links', () => {
      const url = 'https://maps.google.com/?cid=1029384756';
      const res = validateGoogleMapsUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe(url);
    });

    it('validates international Google Maps domains', () => {
      const url = 'https://www.google.co.uk/maps/dir/?api=1&destination=Big+Ben';
      const res = validateGoogleMapsUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe(url);
    });

    it('rejects non-Google Maps URLs with informative error', () => {
      const res = validateGoogleMapsUrl('https://example.com/store');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('not a recognized Google Maps link');
    });

    it('rejects dangerous schemes', () => {
      const res = validateGoogleMapsUrl('javascript:alert(1)');
      expect(res.isValid).toBe(false);
    });
  });

  describe('buildGoogleMapsPayload', () => {
    describe('Short links handling (Regression fix)', () => {
      it('preserves maps.app.goo.gl short links entered in search mode without search wrapping', () => {
        const shortLink = 'https://maps.app.goo.gl/3QW7vJp8e9k';
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: shortLink,
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toBe(shortLink);
        expect(res.payload).not.toContain('https://www.google.com/maps/search');
        expect(res.payload).not.toContain('query=');
        expect(res.detectedType).toBe('shortlink');
      });

      it('preserves maps.app.goo.gl short links entered in url mode', () => {
        const shortLink = 'https://maps.app.goo.gl/uX8kM2q';
        const res = buildGoogleMapsPayload({
          mode: 'url',
          searchQuery: '',
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: shortLink,
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toBe(shortLink);
        expect(res.detectedType).toBe('shortlink');
      });

      it('normalizes missing protocol on short link without wrapping', () => {
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: 'maps.app.goo.gl/XYZ123',
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toBe('https://maps.app.goo.gl/XYZ123');
        expect(res.payload).not.toContain('google.com/maps/search');
      });
    });

    describe('Regular Maps URLs handling', () => {
      it('preserves full google.com/maps/place URL verbatim without double encoding', () => {
        const fullUrl = 'https://www.google.com/maps/place/Empire+State+Building/@40.7484,-73.9857,17z';
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: fullUrl,
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toBe(fullUrl);
        expect(res.payload).not.toContain('query=https%3A');
      });
    });

    describe('Place Name and Street Address Search', () => {
      it('constructs RFC 3986 compliant search URL for street addresses', () => {
        const address = '1600 Amphitheatre Pkwy, Mountain View, CA';
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: address,
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toBe(
          'https://www.google.com/maps/search/?api=1&query=1600%20Amphitheatre%20Pkwy%2C%20Mountain%20View%2C%20CA'
        );
        expect(res.detectedType).toBe('search');
      });

      it('handles special characters cleanly without double encoding', () => {
        const query = 'Café & Bakery #5';
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: query,
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toBe(
          'https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20%26%20Bakery%20%235'
        );
        // Ensure no double-encoding of % (like %2520)
        expect(res.payload).not.toContain('%25');
      });
    });

    describe('Directions URL Construction', () => {
      it('constructs directions URL with destination and travel mode', () => {
        const res = buildGoogleMapsPayload({
          mode: 'directions',
          searchQuery: '',
          destinationAddress: 'San Francisco International Airport',
          originAddress: '',
          travelMode: 'transit',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toContain('https://www.google.com/maps/dir/?');
        expect(res.payload).toContain('api=1');
        expect(res.payload).toContain('destination=San+Francisco+International+Airport');
        expect(res.payload).toContain('travelmode=transit');
      });

      it('includes origin when specified', () => {
        const res = buildGoogleMapsPayload({
          mode: 'directions',
          searchQuery: '',
          destinationAddress: 'SFO',
          originAddress: 'San Jose, CA',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(true);
        expect(res.payload).toContain('origin=San+Jose%2C+CA');
        expect(res.payload).toContain('destination=SFO');
      });

      it('rejects external website URL as directions destination', () => {
        const res = buildGoogleMapsPayload({
          mode: 'directions',
          searchQuery: '',
          destinationAddress: 'https://example.com/location',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(false);
        expect(res.error).toContain('Destination address cannot be an external website URL');
      });
    });

    describe('Distinguishing URL from address & rejecting invalid URLs', () => {
      it('rejects non-Google Maps URL in search mode rather than silently converting to search query', () => {
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: 'https://example.com/store/123',
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(false);
        expect(res.error).toContain('not a recognized Google Maps link');
        expect(res.payload).toBe('');
      });

      it('rejects non-Google Maps URL in url mode', () => {
        const res = buildGoogleMapsPayload({
          mode: 'url',
          searchQuery: '',
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: 'https://github.com/google/maps',
        });

        expect(res.isValid).toBe(false);
        expect(res.error).toContain('not a recognized Google Maps link');
      });

      it('rejects empty input', () => {
        const res = buildGoogleMapsPayload({
          mode: 'search',
          searchQuery: '   ',
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: '',
        });

        expect(res.isValid).toBe(false);
        expect(res.error).toContain('Please enter a place name or street address');
      });
    });
  });

  describe('Optical QR Generation & Decoding Acceptance Check', () => {
    function decodeQRFromMatrix(payload: string): string | null {
      const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
      const size = qr.modules.size;
      const margin = 4;
      const totalSize = size + margin * 2;
      const scale = 8;
      const imgWidth = totalSize * scale;
      const imgHeight = totalSize * scale;

      // Create RGBA image buffer
      const rgbaBuffer = new Uint8ClampedArray(imgWidth * imgHeight * 4);

      // Fill with white background
      for (let i = 0; i < rgbaBuffer.length; i += 4) {
        rgbaBuffer[i] = 255;
        rgbaBuffer[i + 1] = 255;
        rgbaBuffer[i + 2] = 255;
        rgbaBuffer[i + 3] = 255;
      }

      // Draw black modules
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (qr.modules.get(r, c)) {
            const startX = (c + margin) * scale;
            const startY = (r + margin) * scale;
            for (let y = 0; y < scale; y++) {
              for (let x = 0; x < scale; x++) {
                const idx = ((startY + y) * imgWidth + (startX + x)) * 4;
                rgbaBuffer[idx] = 0;
                rgbaBuffer[idx + 1] = 0;
                rgbaBuffer[idx + 2] = 0;
                rgbaBuffer[idx + 3] = 255;
              }
            }
          }
        }
      }

      const code = jsQR(rgbaBuffer, imgWidth, imgHeight);
      return code ? code.data : null;
    }

    it('generates a QR code for a Google Maps short link that decodes to the exact short link', () => {
      const shortLink = 'https://maps.app.goo.gl/3QW7vJp8e9k';
      const payloadResult = buildGoogleMapsPayload({
        mode: 'search',
        searchQuery: shortLink,
        destinationAddress: '',
        originAddress: '',
        travelMode: 'driving',
        pastedUrl: '',
      });

      expect(payloadResult.isValid).toBe(true);
      expect(payloadResult.payload).toBe(shortLink);

      // Optical verification: Decode the generated QR pixel buffer
      const decodedPayload = decodeQRFromMatrix(payloadResult.payload);
      expect(decodedPayload).toBe(shortLink);
    });

    it('generates a QR code for a place search that decodes to the correct Google Maps Search URL', () => {
      const address = '1600 Amphitheatre Pkwy, Mountain View, CA';
      const payloadResult = buildGoogleMapsPayload({
        mode: 'search',
        searchQuery: address,
        destinationAddress: '',
        originAddress: '',
        travelMode: 'driving',
        pastedUrl: '',
      });

      expect(payloadResult.isValid).toBe(true);

      const decodedPayload = decodeQRFromMatrix(payloadResult.payload);
      expect(decodedPayload).toBe(
        'https://www.google.com/maps/search/?api=1&query=1600%20Amphitheatre%20Pkwy%2C%20Mountain%20View%2C%20CA'
      );
    });

    it('generates a QR code for directions that decodes to the correct Google Maps Directions URL', () => {
      const payloadResult = buildGoogleMapsPayload({
        mode: 'directions',
        searchQuery: '',
        destinationAddress: 'JFK Airport',
        originAddress: '',
        travelMode: 'driving',
        pastedUrl: '',
      });

      expect(payloadResult.isValid).toBe(true);

      const decodedPayload = decodeQRFromMatrix(payloadResult.payload);
      expect(decodedPayload).toContain('https://www.google.com/maps/dir/?');
      expect(decodedPayload).toContain('destination=JFK+Airport');
      expect(decodedPayload).toContain('travelmode=driving');
    });
  });

  describe('New Destination Types & Remaining Builders', () => {
    it('validates and normalizes URLs while rejecting dangerous protocols', () => {
      expect(sanitizeAndValidateUrl('example.com/menu').isValid).toBe(true);
      expect(sanitizeAndValidateUrl('example.com/menu').normalized).toBe('https://example.com/menu');
      expect(sanitizeAndValidateUrl('javascript:alert(1)').isValid).toBe(false);
      expect(sanitizeAndValidateUrl('   ').isValid).toBe(false);
      expect(sanitizeAndValidateUrl('localhost').isValid).toBe(false);
    });

    it('builds URL with UTM parameters properly', () => {
      const res = buildUrlWithUtmPayload({
        url: 'https://example.com/landing',
        utmSource: 'newsletter',
        utmMedium: 'email',
        utmCampaign: 'spring_promo',
      });
      expect(res.isValid).toBe(true);
      expect(res.payload).toContain('utm_source=newsletter');
      expect(res.payload).toContain('utm_medium=email');
      expect(res.payload).toContain('utm_campaign=spring_promo');
    });

    it('builds Wi-Fi payloads with special character escaping, hidden flag, and open networks', () => {
      const wpa = buildWifiPayload({
        ssid: 'Cafe;Guest:5G,Main\\Lobby',
        password: 'p@ss;123:456',
        encryption: 'WPA',
        hidden: true,
      });
      expect(wpa.isValid).toBe(true);
      expect(wpa.payload).toBe('WIFI:S:Cafe\\;Guest\\:5G\\,Main\\\\Lobby;T:WPA;P:p@ss\\;123\\:456;H:true;;');

      const openNet = buildWifiPayload({
        ssid: 'Airport_Free',
        password: '',
        encryption: 'nopass',
        hidden: false,
      });
      expect(openNet.isValid).toBe(true);
      expect(openNet.payload).toBe('WIFI:S:Airport_Free;T:nopass;P:;;');

      const missingPass = buildWifiPayload({
        ssid: 'Private_Home',
        password: '',
        encryption: 'WPA',
        hidden: false,
      });
      expect(missingPass.isValid).toBe(false);
    });

    it('builds Social payloads across platforms and custom URLs', () => {
      expect(buildSocialPayload({ platform: 'github', usernameOrUrl: '@devputta' }).payload).toBe('https://github.com/devputta');
      expect(buildSocialPayload({ platform: 'linkedin', usernameOrUrl: 'jane-doe' }).payload).toBe('https://www.linkedin.com/in/jane-doe');
      expect(buildSocialPayload({ platform: 'x', usernameOrUrl: '@qrforge' }).payload).toBe('https://x.com/qrforge');
      expect(buildSocialPayload({ platform: 'instagram', usernameOrUrl: 'studio' }).payload).toBe('https://www.instagram.com/studio');
      expect(buildSocialPayload({ platform: 'youtube', usernameOrUrl: 'channel' }).payload).toBe('https://www.youtube.com/@channel');
      expect(buildSocialPayload({ platform: 'custom', usernameOrUrl: 'https://mastodon.social/@user' }).payload).toBe('https://mastodon.social/@user');
      expect(buildSocialPayload({ platform: 'github', usernameOrUrl: '  ' }).isValid).toBe(false);
    });

    it('builds Phone tel: and SMS smsto: payloads cleanly', () => {
      const tel = buildPhonePayload({ mode: 'tel', phoneNumber: '+1 (415) 555-0123', smsMessage: '' });
      expect(tel.isValid).toBe(true);
      expect(tel.payload).toBe('tel:+14155550123');

      const sms = buildPhonePayload({ mode: 'sms', phoneNumber: '+1-415-555-0123', smsMessage: 'Need callback' });
      expect(sms.isValid).toBe(true);
      expect(sms.payload).toBe('smsto:+14155550123:Need callback');
    });

    it('builds File share link payloads and validates URLs', () => {
      const valid = buildFilePayload({
        fileUrl: 'cdn.example.com/brochure.pdf',
        fileName: 'Product Brochure',
        fileType: 'PDF Document',
        accessNotice: '',
      });
      expect(valid.isValid).toBe(true);
      expect(valid.payload).toBe('https://cdn.example.com/brochure.pdf');
      expect(valid.summary).toContain('Product Brochure');

      const invalid = buildFilePayload({
        fileUrl: '',
        fileName: '',
        fileType: 'PDF Document',
        accessNotice: '',
      });
      expect(invalid.isValid).toBe(false);
    });

    it('builds WhatsApp payload with clean number and message', () => {
      const res = buildWhatsAppPayload({
        phoneNumber: '+1 (555) 123-4567',
        message: 'Hello, I would like to book an appointment!',
      });
      expect(res.isValid).toBe(true);
      expect(res.payload).toBe('https://wa.me/15551234567?text=Hello%2C%20I%20would%20like%20to%20book%20an%20appointment!');
    });

    it('builds Plain Text payload', () => {
      const res = buildTextPayload({
        text: 'Serial Number: ABC-12345-XYZ',
      });
      expect(res.isValid).toBe(true);
      expect(res.payload).toBe('Serial Number: ABC-12345-XYZ');
    });

    it('builds Calendar Event payload in timed and all-day iCalendar format', () => {
      const res = buildCalendarEventPayload({
        title: 'Team Meetup',
        location: 'Central Park',
        description: 'Bring snacks & drinks',
        startDate: '2026-10-23T14:00',
        endDate: '2026-10-23T16:00',
        allDay: false,
      });
      expect(res.isValid).toBe(true);
      expect(res.payload).toContain('BEGIN:VCALENDAR');
      expect(res.payload).toContain('SUMMARY:Team Meetup');
      expect(res.payload).toContain('LOCATION:Central Park');
      expect(res.payload).toContain('END:VEVENT');

      const allDay = buildCalendarEventPayload({
        title: 'Company Offsite',
        location: 'Denver',
        description: '',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        allDay: true,
      });
      expect(allDay.isValid).toBe(true);
      expect(allDay.payload).toContain('DTSTART;VALUE=DATE:20261110');
      expect(allDay.payload).toContain('DTEND;VALUE=DATE:20261112');
    });
  });
});
