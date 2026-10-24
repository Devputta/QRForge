# Product Requirements Document (PRD) — QRForge

## 1. Executive Summary
**QRForge** is a privacy-first, client-side web platform for creating, validating, customizing, and exporting ISO/IEC 18004 compliant QR codes. Unlike commercial tools that route user scans through proprietary redirect services or charge recurring subscriptions, QRForge executes 100% in the user's browser, guaranteeing that encoded data remains private and that generated codes remain operational indefinitely without third-party dependence.

---

## 2. Target Users & Problem Statement

### Target Users
- **Small Business Owners & Hospitality**: Generating tabletop menu links, guest Wi-Fi cards, and review links.
- **Event Organizers & Marketers**: Creating print collateral, posters, conference schedules (iCalendar), and campaign URLs with UTM parameters.
- **Developers & IT Administrators**: Creating batch Wi-Fi setup codes, hardware serial identification tags, and repository links.
- **Designers & Agencies**: Exporting high-resolution vector SVGs and CM-dimensioned print PDFs for signage and print packaging.

### Problem Statement
Standard QR code generators often:
1. Wrap user links in proprietary URL shorteners to enforce paywalls, expiration dates, or advertisements.
2. Store credentials, phone numbers, and contact information on third-party servers.
3. Lack optical verification before print, resulting in wasted print runs when colors or logos reduce scannability.

---

## 3. Scope & Supported Functionality

### Core Functional Requirements
1. **Destination Types**:
   - **Website / URL**: Standard HTTP/HTTPS addresses with an optional UTM campaign builder (`utm_source`, `utm_medium`, `utm_campaign`).
   - **Google Maps**: Universal search queries, turn-by-turn directions with travel modes (driving, transit, walking, bicycling), and direct map share links.
   - **Wi-Fi**: WPA/WPA2/WPA3, WEP, and open network configurations with automatic password stripping on save.
   - **Contact Card (vCard 3.0)**: RFC 2426 compliant personal and business cards with character escaping.
   - **WhatsApp**: Direct chat links with phone numbers and optional prefilled messages.
   - **Plain Text**: Unformatted text for notes, inventory barcodes, or serials.
   - **Calendar Event (iCalendar 2.0)**: Event titles, locations, start/end dates, and all-day toggle compatible with Google Calendar, Apple Calendar, and Outlook.
   - **Social Links**: One-click handle formatting for LinkedIn, X (Twitter), GitHub, YouTube, and Instagram.
   - **Email & Phone/SMS**: RFC 6068 mailto URIs and dialer/SMS triggers.
   - **File Links**: Verified cloud share links with permission guidance.

2. **Optical Preview & Scan Verification**:
   - Real-time client-side QR rendering using HTML5 Canvas.
   - Automatic decoding via `jsQR` to verify that smartphone cameras can read the exact payload.
   - Real-time WCAG 2.2 contrast ratio analysis between foreground and background colors with warnings for low contrast.

3. **Styling & Customization**:
   - Modular dot shapes: Square, Rounded, Dots.
   - Corner finder eye frames: Square, Rounded, Circle.
   - Error correction levels: `L` (~7%), `M` (~15%), `Q` (~25%), `H` (~30%).
   - Center logos: Custom image upload (up to 2MB) or SVG presets with automatic scannability warnings when error correction is below `H`.
   - Quiet border zone customization (0, 1, 2, or 4 modules).

4. **Exports**:
   - High-resolution PNGs at 512px, 1024px, and 2048px.
   - Scalable Vector Graphics (SVG).
   - Print-ready PDF at user-specified centimeter dimensions.
   - Direct browser print dialog and clipboard copy.

5. **Batch CSV Processing**:
   - Upload CSV or paste text with columns: `Name,Type,Destination`.
   - Multi-item validation with detailed error indicators per row.
   - Export all valid codes inside a ZIP file alongside an RFC 4180 `manifest.csv`.

6. **Saved Library & Persistence**:
   - Auto-saving draft in `sessionStorage` and `localStorage`.
   - Saved codes library with search, filtering, duplicating, and re-editing.
   - JSON export and schema-validated JSON import for backup and cross-device migration.

---

## 4. Non-Functional Requirements

- **Zero-Telemetry & Privacy**: No network requests for QR generation; fonts self-hosted; zero analytics cookies.
- **Performance**: Sub-100ms QR render latency on desktop and mobile devices.
- **Responsiveness**: Fully responsive across viewports from 320px (iPhone SE) to 1440px+ desktop.
- **Accessibility**: Compliance with WCAG 2.2 AA standards (semantic markup, visible focus indicators, focus trapping on modals, text contrast $\ge 4.5:1$).
- **Browser Compatibility**: Full functionality in all modern Chromium browsers, Firefox, and WebKit/Safari.

---

## 5. Acceptance Criteria

1. Every supported destination type produces a valid, scannable QR payload matching the target specification.
2. In-progress drafts persist across page refreshes without storing sensitive Wi-Fi passwords.
3. Batch CSV processor generates unique filenames without colliding or corrupting quote characters.
4. Exported PDFs match the requested physical centimeter width when printed.
5. All automated test suites (unit, component, integration, responsive) pass with zero errors.
