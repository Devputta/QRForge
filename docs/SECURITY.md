# Security Design & Threat Model — QRForge

This document describes the security architecture, threat model, input validation mechanisms, and data privacy safeguards implemented in QRForge.

For instructions on reporting security vulnerabilities, please refer to the root [SECURITY.md](../SECURITY.md).

---

## 1. Threat Model & Boundaries

| Asset / Threat | Risk Description | Remediation in QRForge |
| -------------- | ---------------- | ---------------------- |
| **User Inputs** | XSS or injection via payloads in preview or print window. | Safe DOM creation via `createElement` and `textContent`; no `document.write` with unescaped HTML strings. |
| **Wi-Fi Passwords** | Exposure of local network credentials in shared devices or backups. | Passwords are never saved to `localStorage`, `sessionStorage`, or JSON backups. |
| **Center Logos** | Oversized or malicious image files crashing browser or causing memory exhaustion. | Strict 2MB file size enforcement; image data processed locally via FileReader without remote uploads. |
| **Third-Party Tracking** | User deanonymization and scan profiling. | 100% client-side execution; self-hosted typography; zero third-party analytics or beacon scripts. |
| **Batch CSV Injection** | Formula injection (`=CMD`, `@`, `+`) or corrupted CSV formatting in exported spreadsheets. | Quotes escaped per RFC 4180 (`""`); cells wrapped in quotes in `manifest.csv`. |

---

## 2. Input Validation & Sanitization

### Web Addresses (URL)
- Candidate inputs are checked against allowed protocols (`http:`, `https:`).
- Malformed inputs or non-web protocols (e.g. `javascript:`, `data:`, `file:`) are rejected.
- Protocols default to `https://` when omitted.
- Query parameters and UTM tags are parsed and encoded using the native Web `URL` API.

### Wi-Fi Credentials
- Pre-shared keys (WPA/WPA2/WPA3) and SSIDs are escaped against standard MeCard separator characters (`\`, `;`, `:`, `,`).
- Network passwords are intentionally cleared by `sanitizeSavedCodesForStorage` prior to committing drafts or library records to browser disk.

### Digital Business Cards (vCard 3.0)
- Complies with RFC 2426 specification.
- Backslashes, commas, semicolons, and newlines in all text fields (names, job titles, addresses, notes) are escaped with a preceding backslash (`\`).
- Payloads use standard CRLF (`\r\n`) line terminations.

### Email (RFC 6068)
- Recipient email address validated against standard format (`[^\s@]+@[^\s@]+\.[^\s@]+`).
- Subject and body fields are encoded using `encodeURIComponent` so spaces are represented as `%20` (as required by RFC 6068 mailto URIs) rather than `+` (which represents literal plus signs in mailto query components).

---

## 3. QR-Specific Security Risks & User Awareness

### 1. Malicious Destinations & Phishing
QR codes are an optical encoding medium. They do not validate whether the destination website is trustworthy, safe, or free of malware. A QR code can encode a phishing URL or credential-harvesting site.
- **Remediation in QRForge**: QRForge displays the decoded destination payload in full so the creator can visually verify where the code points. Furthermore, QRForge includes prominent disclaimers advising users that they remain responsible for verifying destinations.

### 2. Physical Tampering (Attestation)
In physical environments (e.g. restaurant tables, parking meters, public flyers), malicious actors can paste malicious QR stickers over legitimate QR codes.
- **Guidance**: Users printing QR codes for physical deployment should use durable materials and periodically inspect deployed codes.

---

## 4. Dependencies & Supply Chain Security

QRForge minimizes its dependency footprint:
- Production dependencies are restricted to established, audited libraries:
  - `qrcode`: standards-compliant QR matrix generation.
  - `jsqr`: pure JavaScript QR barcode reader.
  - `jspdf`: vector PDF rendering.
  - `jszip`: zip compression.
  - `lucide-react`: UI icon set.
- All fonts (`@fontsource/plus-jakarta-sans`, `@fontsource/jetbrains-mono`) are self-hosted via npm packages to eliminate Google Fonts CDN network calls.
- Automated vulnerability scanning via `npm audit` is performed during CI runs.
