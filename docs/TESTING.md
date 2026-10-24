# Testing Strategy — QRForge

This document details the automated testing architecture, test suites inside `/tests/`, execution commands, and coverage strategy for QRForge.

---

## 1. Test Architecture & Stack

QRForge utilizes **Vitest** paired with **Happy-DOM** for fast, deterministic client-side and DOM testing:
- **Test Directory**: `/tests/`
- **Test Runner**: Vitest 5.x
- **DOM Environment**: Happy-DOM 21.x
- **Component Testing**: Native React 19 `act` and `createRoot` testing
- **Assertion Library**: Vitest `expect`

---

## 2. Test Suites & Categorization (86 Tests Across 7 Suites)

All automated tests live in the root `/tests/` directory:

### 1. `tests/payloads.test.ts` (Unit Tests — 35 tests)
Verifies input validation, formatting, optical decoding, and edge cases across all 11 QR types:
- URL validation, protocol normalization, and dangerous scheme rejection (`javascript:`).
- UTM campaign tag composition (`utm_source`, `utm_medium`, `utm_campaign`).
- Google Maps Search, Directions with travel modes, and short link preservation (`maps.app.goo.gl`).
- Wi-Fi SSID/password special character escaping (`;`, `:`, `\`, `,`), encryption modes (`WPA`, `WEP`, `nopass`), and hidden network flags.
- Social media platform handle prefixing (LinkedIn, X, GitHub, Instagram, YouTube, Custom).
- Phone (`tel:`) & SMS (`smsto:`) dialer formatting.
- Shared File URL normalization and validation.
- WhatsApp direct chat URL formatting with international phone sanitization.
- Plain text payload generation.
- iCalendar 2.0 (`VEVENT`) timed UTC and all-day (`VALUE=DATE`) timestamp generation.
- Optical `jsQR` pixel buffer verification against generated matrices.

### 2. `tests/security-and-fixes.test.ts` (Security & Regression Tests — 18 tests)
Guards against security and data regressions:
- Safe DOM construction in print previews (`buildPrintDocument`) to prevent XSS.
- RFC 6068 `mailto:` URI encoding (`%20` instead of `+` for spaces).
- vCard 3.0 RFC 2426 character escaping (`\\`, `\,`, `\;`, `\n`) across all contact fields.
- Full rehydration of all destination configurations (`SavedQRCode.config`) with backward compatibility.
- Strict CSV header matching (`Name,Type,Destination`), duplicate filename deduplication, quote escaping in `manifest.csv`, and unsupported type error reporting.
- Automatic Wi-Fi password stripping (`sanitizeSavedCodesForStorage`) from local storage, seed data, and JSON exports.

### 3. `tests/components.test.tsx` (Component Tests — 15 tests)
Verifies interactive React 19 UI components:
- Destination Forms: `UrlForm`, `GoogleMapsForm`, `WifiForm`, `VCardForm`, `TextForm`, `WhatsAppForm`, `CalendarEventForm`, `CommunicationForm` (Email & Phone/SMS), `SocialForm`, and `MediaFileForm`.
- Workspace & Modals: `StyleControls` (including low-EC logo warning banner and `Switch to Level H` action), `BatchGenerator`, `Header`, `StandardsModal` (`Distance / 10` print size calculator), and `SavedLibrary` search filtering.

### 4. `tests/renderer.test.ts` (Renderer, Presets & Contrast Tests — 6 tests)
Verifies visual encoding and contrast mathematics:
- QR boolean matrix computation across error correction levels (`L`, `M`, `Q`, `H`).
- Vector SVG generation for `square`, `rounded`, and `dots` modules and `square`, `rounded`, and `circle` finder eyes.
- Center logo `<image>` embedding and padded `<rect>` background cutouts in SVG output.
- UTF-8 SVG data URL integrity across all built-in `LOGO_PRESETS`.
- WCAG contrast calculation across 3-digit shorthand hexes, inverted light-on-dark polarity, and all 4 score tiers (`excellent`, `good`, `warning`, `critical`).

### 5. `tests/workflow.test.ts` (Integration & Workflow Tests — 6 tests)
Verifies multi-step end-to-end user flows:
- URL + UTM creation and summary display.
- Google Maps turn-by-turn transit directions.
- WhatsApp message encoding with country codes.
- iCalendar serialization from form inputs.
- Complete storage lifecycle: saving, Wi-Fi password removal, JSON export, and JSON re-import.
- Batch CSV parsing, validation, duplicate naming, and cell escaping.

### 6. `tests/responsive.test.ts` (Responsive & Aspect Ratio Tests — 4 tests)
Verifies responsive bounds across target viewports (`320×568` through `1440×900`), preset color contrast compliance ($\ge 4.5:1$), and 1:1 square QR matrix aspect ratios.

### 7. `tests/hooks-and-a11y.test.tsx` (Accessibility & Theme Hook Tests — 2 tests)
Verifies custom hooks:
- `useModalA11y`: `Tab` / `Shift+Tab` keyboard focus wrapping, `Escape` dismissal, and trigger focus restoration on close.
- `useTheme` & `getInitialTheme`: `localStorage` persistence, `document.documentElement` `.dark` class toggling, and `system` → `light` → `dark` → `system` cycling.

---

## 3. Test Execution Commands

```bash
# Run all 7 test suites in /tests once
npm test

# Run tests in interactive watch mode
npx vitest

# Run a single test file
npx vitest run tests/components.test.tsx

# Run tests matching a specific description
npx vitest run -t "vCard"
```

---

## 4. Known Headless Testing Limitations

- **HTML5 Canvas 2D Context**: Headless DOM environments (`happy-dom`) simulate DOM nodes rather than GPU rasterization. Boolean matrix computation, SVG geometry, and `Uint8ClampedArray` pixel decoding (`jsQR`) are verified directly in unit tests, while physical camera scanning should be spot-checked in a real browser when modifying custom module radii.
