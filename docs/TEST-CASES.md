# Test Cases & QA Verification Matrix — QRForge

This document provides the structured QA verification matrix for **QRForge (`v0.1.0`)**, mapping core functional, security, accessibility, and responsive requirements to verification steps and automated Vitest coverage.

---

## 1. Automated Test Suite Summary

Run `npm test` to execute all 86 automated assertions across 7 suites in `/tests/`:

| Suite File | Focus Area | Tests | Status |
| :--- | :--- | :---: | :---: |
| `tests/payloads.test.ts` | All 11 payload builders, UTM tags, RFC escaping, & `jsQR` optical decode | 35 | Pass |
| `tests/security-and-fixes.test.ts` | XSS-safe print DOM, Wi-Fi password stripping, CSV rules, & config rehydration | 18 | Pass |
| `tests/components.test.tsx` | All 10 destination forms, `StyleControls`, `BatchGenerator`, `Header`, modals, & `SavedLibrary` | 15 | Pass |
| `tests/renderer.test.ts` | QR bit-matrix (`L`/`M`/`Q`/`H`), SVG module/eye shapes, `LOGO_PRESETS`, & WCAG contrast tiers | 6 | Pass |
| `tests/workflow.test.ts` | End-to-end payload → sanitize → library JSON export/import & batch workflows | 6 | Pass |
| `tests/responsive.test.ts` | Viewport width overflow checks (`320px`–`1440px`) and 1:1 matrix aspect ratios | 4 | Pass |
| `tests/hooks-and-a11y.test.tsx` | `useModalA11y` focus trap (`Tab`/`Shift+Tab`/`Escape`/focus restore) & `useTheme` cycling | 2 | Pass |

---

## 2. Functional & Edge-Case Verification Matrix

### A. QR Destination Builders

| ID | Scenario | Steps | Expected Result | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Website + UTM Parameters | Select **Website**, enter `example.com/shop`, expand UTM fields, enter `source=newsletter`, `medium=print`, `campaign=spring`. | Prepends `https://`, appends URL-encoded `utm_*` query parameters, renders valid QR, shows **Scan verified**. | Automated + Manual |
| TC-02 | Invalid URL Rejection | Enter `javascript:alert(1)` or empty string in **Website**. | Shows inline validation message; disables download/export actions; never executes script. | Automated + Manual |
| TC-03 | Google Maps Search & Directions | Switch between **Place search**, **Directions**, and **Maps link**; include spaces and punctuation. | Encodes valid `https://www.google.com/maps/...` URI with travel mode. | Automated + Manual |
| TC-04 | Wi-Fi Special Characters & Privacy | Enter SSID `Cafe; "Guest"\Net` and WPA password `p@ss:123`; save to Library and reload page. | Escapes `\`, `;`, `,`, `"`, `:` in `WIFI:` payload; strips password from `localStorage`, `sessionStorage`, and JSON export. | Automated + Manual |
| TC-05 | vCard 3.0 Escaping | Enter commas, semicolons, backslashes, and multiline notes in **Contact**. | Escapes `\`, `,`, `;`, and `\n` per RFC 2426 in `BEGIN:VCARD` output. | Automated + Manual |
| TC-06 | Email `mailto:` Spaces | Enter subject `Hello World` and body `Line 1` in **Email**. | Encodes spaces as `%20` via `encodeURIComponent` (never `+`). | Automated + Manual |
| TC-07 | WhatsApp & Phone/SMS | Enter `+1 (415) 555-0199` with prefilled message in **WhatsApp** and **SMS**. | Strips non-digits for `wa.me/14155550199?text=...`; formats `smsto:` and `tel:` cleanly. | Automated + Manual |
| TC-08 | Calendar Event (Timed & All-Day) | Toggle **All-day event** vs timed start/end in **Event**. | Generates valid `BEGIN:VCALENDAR` / `BEGIN:VEVENT` with `VALUE=DATE` or UTC `YYYYMMDDTHHMMSSZ` timestamps. | Automated + Manual |

### B. Customization, Scan Verification & Exports

| ID | Scenario | Steps | Expected Result | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| TC-09 | Low Contrast & Inverted Colors | Set Dark color to `#e5e7eb` and Light color to `#ffffff` (or dark background + light modules). | Displays contrast ratio warning (`< 4.5:1`) or inverted color warning; `jsQR` updates scan badge in real time. | Automated + Manual |
| TC-10 | Center Logo + Low Error Correction | Upload or select a preset logo while Error Correction is `L` or `M`. | Displays inline warning banner with working **Switch to H** button that upgrades error correction to `H`. | Automated + Manual |
| TC-11 | PNG, SVG & Print PDF Export | Export PNG (`1024px`), SVG, and PDF (`5.5 cm` print width). | Downloads non-empty `.png`, valid `<svg>` markup, and `.pdf` sized accurately in centimeters. | Manual + Unit |
| TC-12 | XSS-Safe Print Sheet | Enter `<img src=x onerror=alert(1)>` in Plain Text and click **Print**. | Print window renders literal text safely via `textContent` with zero HTML injection or script execution. | Code Audit + Manual |

### C. Batch CSV & Local Library

| ID | Scenario | Steps | Expected Result | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| TC-13 | Batch CSV Header & Unsupported Types | Upload CSV where row 1 is data vs `Name,Type,Destination`, include duplicate names and an unsupported type (`ftp`). | Treats row 1 as header only on exact match; flags `ftp` row with error message (does not silently fall back to `url`); suffixes duplicate filenames (`_1.png`); escapes quotes in `manifest.csv`. | Automated + Manual |
| TC-14 | Library Full State Restore & JSON Import | Save items across all types, export JSON, import malformed JSON, then import valid backup. | Malformed JSON shows inline error banner (no `alert()`); valid backup restores items and reloads full form + style configuration. | Automated + Manual |

---

## 3. Accessibility & Responsive Viewport Checklist

| Viewport / Check | Target | Verified Behavior |
| :--- | :--- | :--- |
| `320 × 568` (Small Mobile) | Zero horizontal overflow | Header wraps cleanly (`New`), mobile `Edit details` / `Preview & export` toggle switches views, QR canvas scales (`220px`) without clipping. |
| `375 × 667` / `390 × 844` (Mobile) | Touch usability | Destination tabs, stacked single-column inputs (`VCardForm`, `StyleControls`), and export buttons maintain comfortable tap targets (`>= 38px`). |
| `768 × 1024` (Tablet) | Balanced stacking | Multi-column form fields (`sm:grid-cols-2`) activate cleanly; modals fit within viewport with internal scroll if needed. |
| `1024 × 768` / `1440 × 900` (Desktop) | Split two-column workspace | Sticky right-hand live QR preview alongside left-hand configuration workspace (`lg:grid-cols-12`). |
| Keyboard & Screen Reader | WCAG 2.2 AA | All 3 modals (`StandardsModal`, Clear Library dialog, `PdfExportModal`) have `role="dialog"`, `aria-modal="true"`, trap `Tab`/`Shift+Tab`, close on `Escape`, and restore focus to trigger button. |
| Reduced Motion & Theme | User preference respect | Honors `prefers-color-scheme` (with manual override) and `prefers-reduced-motion: reduce`. |
