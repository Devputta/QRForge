# QRForge — Universal QR Code Platform

A fast, private, client-side QR code generator that runs entirely in your web browser. QRForge creates, validates, customizes, and exports scannable QR codes for websites, turn-by-turn Google Maps directions, Wi-Fi credentials, digital contact cards (vCards), WhatsApp chats, calendar events, and media documents—with zero telemetry and no server intermediaries.

- **Source Code**: [https://github.com/Devputta/QRForge](https://github.com/Devputta/QRForge)
- **License**: MIT License
- **Runtime**: Client-side single-page application (React 19 + TypeScript + Vite)

---

## Problem Statement & Purpose

Many web-based QR generators route user scans through proprietary URL redirect servers, inject sponsored landing pages, or require recurring subscription fees to keep static codes active. Furthermore, sensitive credentials (such as office Wi-Fi passwords, personal telephone numbers, and private contact vCards) are routinely transmitted to third-party databases.

QRForge was created to solve this:
1. **Direct Encoding**: Every QR code directly encodes the destination payload into the visual matrix. Scanners connect directly to the target destination without redirection.
2. **Strict Privacy**: Execution happens locally in the browser. No tracking cookies, no server-side telemetry, no API keys, and no database persistence.
3. **Self-Hosted Assets**: Fonts and dependencies run locally without third-party CDN tracking requests.

---

## User Interface & Features

```
+-------------------------------------------------------------------------------+
| [QRForge]             Generator      Batch export      Library (3)   Print tips|
|                                                                               |
|  What should the code open?                                                   |
|  [ Website ] [ Maps ] [ Wi-Fi ] [ Contact ] [ WhatsApp ] [ Text ] [ Event ]   |
|                                                                               |
|  Website address: [ https://example.com/portal                              ] |
|  [+] Campaign tracking parameters (optional UTM tags)                         |
|                                                                               |
|  Colors and shapes:                                  +---------------------+  |
|  - Dark color: [ #000000 ]  Light color: [ #ffffff ] |                     |  |
|  - Dots: [ Square ] [ Rounded ] [ Dots ]             |   [ QR MATRIX ]     |  |
|  - Corners: [ Square ] [ Rounded ] [ Circle ]        |                     |  |
|  - Error correction: [ L ] [ M ] [ Q ] [ H ]         +---------------------+  |
|  - Center logo: [ Upload file / Select icon ]         [✓] Scan verified (jsQR)|
|                                                       [ Download PNG ] [ SVG ]|
|                                                       [ Export Print PDF ]    |
+-------------------------------------------------------------------------------+
```

### Core Capabilities
- **Scan Verified in Real Time**: Renders and immediately decodes the generated canvas using `jsQR` to confirm camera readability before downloading.
- **Multiple Export Formats**:
  - High-Resolution PNG (512px, 1024px, 2048px).
  - Clean Vector SVG for signage, banners, and vector design tools.
  - Print-Ready PDF with custom physical size selection in centimeters (cm).
  - Quick browser printing and 1-click clipboard image copy.
- **Visual Customization**:
  - High-contrast color pairings with real-time WCAG contrast ratio analysis.
  - Module shapes (Square, Rounded, Dots) and Finder corner markers (Square, Rounded, Circle).
  - Error correction levels (`L` ~7%, `M` ~15%, `Q` ~25%, `H` ~30%).
  - Configurable quiet border zones (0, 1, 2, or 4 modules).
  - Embedded center logos and presets with automatic error-correction warnings.
- **Batch CSV Processing**: Generate multiple QR codes at once from CSV files with zip packaging, collision-safe filenames, and an RFC 4180 index manifest.
- **Local Library with JSON Backup**: Save configurations locally in `localStorage`, organize, re-edit, duplicate, and export or import your library via validated JSON files.
- **Session Auto-Drafting**: In-progress forms are automatically preserved in `sessionStorage` and `localStorage` so unsaved work is never lost on refresh.
- **Full Theme Support**: Light and dark themes that respect your operating system's `prefers-color-scheme`, with a 1-click manual toggle.

---

## Static Codes Architecture

All QR codes created in QRForge are **static QR codes**:
- **No Expiration**: Once printed, the code works indefinitely as long as your destination remains online.
- **No Redirection or Middlemen**: The scanner connects straight to your URL or reads the plain text directly.
- **No Scan Analytics**: Because no central server processes the scan event, scans are completely private and untracked.
- **Non-Editable Once Printed**: Ensure your URLs, Wi-Fi credentials, and phone numbers are verified before printing physical collateral.

---

## Supported QR Types

| Type | Format / Payload Standard | Notes |
| ---- | ------------------------- | ----- |
| **Website** | `https://...` with optional UTM builder | Validates HTTP/HTTPS protocols and encodes campaign parameters. |
| **Google Maps** | Universal Maps Search, Turn-by-Turn Directions, or direct URLs | Supports driving, transit, walking, and bicycling travel modes. |
| **Wi-Fi Network** | `WIFI:S:<ssid>;T:<type>;P:<pass>;;` | Supports WPA/WPA2/WPA3, WEP, and open networks. Passwords are never saved to disk. |
| **Contact Card** | vCard 3.0 (`BEGIN:VCARD` ... `END:VCARD`) | Full RFC 2426 character escaping for commas, semicolons, backslashes, and newlines. |
| **WhatsApp** | `https://wa.me/<number>?text=<encoded_msg>` | Formats international phone numbers and optional prefilled messages. |
| **Plain Text** | Raw string representation | Displays plain notes, serial identifiers, access codes, or instructions directly on scan. |
| **Calendar Event** | iCalendar 2.0 (`BEGIN:VCALENDAR` ... `BEGIN:VEVENT`) | Opens in Google Calendar, Apple Calendar, and Outlook with all-day and timed support. |
| **Social Links** | Direct HTTPS profile URLs | Supports LinkedIn, X (Twitter), GitHub, YouTube, Instagram, and custom URLs. |
| **Email** | `mailto:<recipient>?subject=...&body=...` | Formats RFC 6068 mailto URIs with URI-encoded subject and body lines. |
| **Phone & SMS** | `tel:<number>` / `smsto:<number>:<message>` | Direct dialer triggers and pre-addressed SMS text messages. |
| **File Link** | HTTPS share links for PDFs, presentations, and media | Reminds users to set proper cloud sharing permissions. |

---

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **QR Encoding**: `qrcode`
- **QR Verification**: `jsQR`
- **Vector & PDF Generation**: `jspdf`
- **Archive Packing**: `jszip`
- **Icons**: `lucide-react`
- **Typography**: `@fontsource/plus-jakarta-sans` and `@fontsource/jetbrains-mono` (100% self-hosted)
- **Testing**: Vitest 5 + Happy-DOM

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/Devputta/QRForge.git
cd QRForge

# Install dependencies
npm install
```

### Development
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Automated Testing
```bash
# Run unit, component, integration, and responsive tests
npm test
```

### Linting & Type Checking
```bash
# Run TypeScript compilation checks
npm run lint
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
QRForge/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── docs/                        # Project documentation
│   ├── PRD.md                   # Product Requirements Document
│   ├── architecture.md          # Architecture & data flow diagram
│   ├── SETUP.md                 # Setup & troubleshooting guide
│   ├── TESTING.md               # Testing strategy & coverage notes
│   ├── SECURITY.md              # Threat model & security design
│   ├── ACCESSIBILITY.md         # WCAG 2.2 AA accessibility documentation
│   ├── DEPLOYMENT.md            # Static build & hosting guide
│   ├── CHANGELOG.md             # Version history
│   ├── ROADMAP.md               # Roadmap of completed vs planned features
│   ├── DECISIONS.md             # Technical Architecture Decision Records (ADRs)
│   └── TEST-CASES.md            # Manual QA test verification matrix
├── src/
│   ├── components/              # UI components
│   │   ├── DestinationForms/    # Type-specific destination input forms
│   │   ├── BatchGenerator.tsx   # Batch CSV upload, processor, and zip generator
│   │   ├── Header.tsx           # Global header with navigation, theme, & GitHub link
│   │   ├── QRPreviewPanel.tsx   # Live canvas preview, jsQR check, & export actions
│   │   ├── SavedLibrary.tsx     # Local saved codes library, JSON backup & restore
│   │   ├── StandardsModal.tsx   # Print distance calculator and ISO/IEC 18004 tips
│   │   └── StyleControls.tsx    # Palette, shapes, error correction, & logo controls
│   ├── types/
│   │   └── qr.ts                # TypeScript domain models and configurations
│   ├── utils/
│   │   ├── batchProcessor.ts    # CSV parser, cell escaping, and ZIP creator
│   │   ├── contrast.ts          # WCAG relative luminance & contrast algorithm
│   │   ├── presetLogos.ts       # Built-in SVG logo presets
│   │   ├── qrPayloads.ts        # RFC payload builders & sanitizers
│   │   ├── qrRenderer.ts        # Canvas & SVG matrix drawer
│   │   ├── theme.ts             # Theme management hook (system/light/dark)
│   │   └── useModalA11y.ts      # WCAG focus trap and modal accessibility hook
│   ├── App.tsx                  # Main application state & routing layout
│   ├── index.css                # Tailwind CSS v4 styling & base typography
│   └── main.tsx                 # Application entry point
├── tests/                       # Automated Vitest + Happy-DOM test suites (86 tests)
│   ├── payloads.test.ts         # All 11 QR payload builders, RFC escaping, & jsQR checks
│   ├── renderer.test.ts         # QR bit-matrix, SVG shapes, preset logos, & WCAG contrast
│   ├── security-and-fixes.test.ts # XSS-safe print DOM, Wi-Fi password stripping, & CSV rules
│   ├── hooks-and-a11y.test.tsx  # Modal focus trap (Tab/Shift+Tab/Escape) & theme cycling
│   ├── components.test.tsx      # All destination forms, StyleControls, Batch, & Library UI
│   ├── workflow.test.ts         # End-to-end creation, sanitization, & JSON backup flows
│   └── responsive.test.ts       # Viewport width bounds (320px–1440px) & aspect ratios
├── .env.example                 # Environment configuration notes
├── .gitignore                   # Standard git exclusions
├── LICENSE                      # MIT License
├── README.md                    # Project documentation & disclaimer
├── CONTRIBUTING.md               # Contribution guidelines
├── SECURITY.md                  # Vulnerability disclosure policy
└── CODE_OF_CONDUCT.md           # Contributor Covenant v2.1
```

---

## Accessibility & Security Notes

- **Keyboard & Screen Reader Access**: Modals implement full focus trapping (`Tab` cycle), Escape-key dismissal, and return focus to triggering buttons.
- **Touch-Friendly Controls**: Minimum tap target sizes of $\ge 38\text{px}$ to $\ge 44\text{px}$ across mobile viewports.
- **No Tracking**: No telemetry or third-party tracking scripts.
- **Sanitized Outputs**: DOM construction in print previews uses explicit DOM text nodes (`createElement` + `textContent`) to avoid XSS risks.
- **Wi-Fi Credential Hygiene**: Wi-Fi passwords are automatically stripped prior to storing drafts or backing up to JSON.

---

## Known Limitations

- **Physical Medium Dependency**: Once a static QR code is printed on a brochure, billboard, or business card, its destination cannot be changed.
- **URL Payload Size vs Density**: Very long URLs (>300 characters) generate higher-density matrices with smaller modules. For dense payloads, choose higher error correction and adequate print dimensions.
- **Logo Coverage**: Center logos obstruct the underlying data modules. When adding custom logos, Level `H` error correction (~30% recovery) is recommended.

---

## Disclaimer

> **Disclaimer**
>
> QRForge is provided for general-purpose QR code generation. Users are responsible for verifying the content encoded in a QR code and ensuring that they have the rights and permissions necessary to use the information, logos, or other assets they provide.
>
> QR codes may contain links or information that lead to malicious, misleading, or unsafe destinations. Always verify a destination before opening it or sharing the code.
>
> The software is provided “as is,” to the extent permitted by applicable law, without warranties of any kind. The maintainers are not responsible for misuse of generated QR codes, third-party destinations, or resulting losses, subject to applicable law.
>
> This project is not affiliated with or endorsed by any third-party brand or service unless explicitly stated.
