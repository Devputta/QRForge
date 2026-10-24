# Changelog

All notable changes to **QRForge** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-24

### Added
- **11 Static QR Destination Types**:
  - Website URL with optional UTM campaign parameter builder (`utm_source`, `utm_medium`, `utm_campaign`).
  - Google Maps (Place Search, Turn-by-Turn Directions with travel modes, and direct Maps links).
  - Wi-Fi Network (`WPA/WPA2`, `WEP`, and Open networks, plus hidden SSID toggle).
  - Contact Card (`vCard 3.0`) with full RFC 2426 field escaping.
  - WhatsApp Chat (`https://wa.me/...`) with international number normalization and prefilled message.
  - Plain Text notes and raw string payloads.
  - Calendar Event (`iCalendar 2.0 / VEVENT`) supporting timed UTC and all-day events.
  - Social Profile links (LinkedIn, X/Twitter, GitHub, Instagram, YouTube, Custom).
  - Email (`mailto:` with `encodeURIComponent` subject and body encoding).
  - Phone Call (`tel:`) and SMS (`smsto:`).
  - Shared File / Document HTTPS links.
- **Real-Time Optical Verification (`jsQR`)**: Automatically decodes the rendered HTML5 canvas and displays a "Scan verified" or "Scan check failed" status badge comparing decoded output against the target payload.
- **Multi-Format Client-Side Exports**:
  - High-resolution PNG export (`512px`, `1024px`, `2048px`).
  - Clean vector SVG export supporting custom module and corner shapes.
  - Print-ready PDF export (`jsPDF`) at user-specified physical dimensions in centimeters (`1 cm` – `50 cm`).
  - Clipboard image copy and safe DOM-based browser print sheet.
- **Visual Customization & Safety Guardrails**:
  - Custom foreground/background colors, curated palettes, and live WCAG relative luminance contrast warnings.
  - Module styles (`Square`, `Rounded`, `Dots`), finder corner styles (`Square`, `Rounded`, `Circle`), error correction levels (`L`, `M`, `Q`, `H`), and quiet zone borders (`0`–`4` modules).
  - Custom center logo uploads and built-in vector presets with one-click **"Switch to H"** safety prompt when error correction is set to `L` or `M`.
- **Batch CSV Generator**: Multi-row CSV parser with strict header detection, row-level validation reporting, duplicate filename disambiguation, RFC 4180 `manifest.csv` escaping, and `.zip` archive download.
- **Local Library & Session Persistence**:
  - Save, search, filter, reload (full configuration across all 11 types), duplicate, and delete codes in `localStorage`.
  - Validated JSON library export and import.
  - Automatic draft persistence in `sessionStorage` and `localStorage` across page refreshes.
- **Theme & Responsive Mobile UX**:
  - System-aware light/dark theme (`prefers-color-scheme`) with manual header toggle.
  - Mobile segmented workspace switcher (`Edit details` / `Preview & export`) and responsive grids tested down to `320px` width without horizontal overflow.
- **Accessibility (WCAG 2.2 AA)**:
  - Reusable `useModalA11y` hook providing focus trapping, `Escape` dismissal, and focus restoration across Print Distance Specs, Clear Library Confirmation, and Print PDF Export dialogs.
  - Accessible labels on all icon buttons and dynamic `aria-label` on the QR `<canvas>`.
  - `prefers-reduced-motion` CSS media query support.
- **Self-Hosted Typography & Tooling**:
  - Bundled `@fontsource/plus-jakarta-sans` and `@fontsource/jetbrains-mono` for zero external network requests.
  - Automated Vitest + Happy-DOM test suite (unit, security/regression, component, workflow, and responsive/contrast tests) and GitHub Actions CI workflow.

### Security
- Replaced `document.write` HTML string interpolation in print preview with safe DOM node construction (`document.createElement` + `textContent`) to eliminate XSS vectors.
- Stripped Wi-Fi passwords (`sanitizeConfigForStorage`) prior to saving drafts, persisting library records, or exporting JSON backups, and removed hardcoded demo credentials.
- Replaced blocking `window.alert()` calls with inline, accessible validation and status banners.
