# Product Roadmap — QRForge

This document separates **implemented capabilities** currently shipping in QRForge (`v0.1.0`) from **planned future enhancements**. QRForge will remain a 100% client-side, zero-telemetry static QR utility throughout future milestones.

---

## Shipped in v0.1.0 (Completed)

- [x] **11 Static QR Destination Builders**: Website (with UTM tags), Google Maps, Wi-Fi, Contact (vCard 3.0), WhatsApp, Plain Text, Calendar Event (iCal), Social Profile, Email, Phone/SMS, and File URL.
- [x] **Custom Canvas & Vector Renderer**: Square, rounded, and circular dot modules; square, rounded, and circular finder eyes; configurable quiet zones; custom/preset center logos.
- [x] **Live Scannability Guardrails**: Real-time `jsQR` optical decode verification, WCAG luminance contrast warnings, and one-click `Switch to H` error correction prompt for logos.
- [x] **Production Export Formats**: Raster PNG (`512px`–`2048px`), scalable vector SVG, physical dimension PDF (`cm`), clipboard copy, and XSS-safe browser print sheet.
- [x] **Batch CSV Processing**: Client-side CSV parsing, row-level error reporting, collision-safe filenames, and ZIP bundle export with manifest.
- [x] **Local Library & Draft Persistence**: Full form state restoration across all 11 types, Wi-Fi password stripping on disk/export, and schema-validated JSON import/export.
- [x] **Responsive & Accessible Interface**: Mobile `Edit details` / `Preview & export` view toggle (`320px+`), light/dark theme toggle, self-hosted fonts, and WCAG 2.2 AA modal focus management.

---

## Planned / Candidate Enhancements (Not Yet Implemented)

### Milestone 1 — Offline Installability (PWA)
- [ ] **Web App Manifest & Service Worker**: Allow users to install QRForge as a standalone desktop or mobile Progressive Web App that launches without an internet connection even after closing the browser tab.

### Milestone 2 — Print & Signage Ergonomics
- [ ] **Optional Call-to-Action Frames**: Optional vector borders/badges below the quiet zone (e.g., *"Scan for Wi-Fi"*, *"View Menu"*) included cleanly in PNG, SVG, and PDF exports.
- [ ] **Multi-Up Label Sheet PDF Export**: Arrange multiple saved or batch QR codes onto standard A4 / US Letter printable label grids (e.g., 2×4 or 3×7 sheets) with optional crop marks.
- [ ] **Additional Physical Units**: Support millimeters (`mm`) and inches (`in`) alongside centimeters (`cm`) in the PDF export dialog.

### Milestone 3 — Extended Batch & Inspection Tools
- [ ] **Expanded Batch CSV Payload Types**: Support `vcard`, `whatsapp`, and `event` multi-column templates in Batch CSV mode (currently supports `url`, `text`, `email`, `phone`, `sms`, `maps`, and `wifi`).
- [ ] **Client-Side QR Inspector**: Optional utility tab using `jsQR` to upload an existing QR image file and inspect its raw decoded payload locally before printing or sharing.

---

## Explicit Non-Goals

To preserve user privacy and long-term reliability, the following items are **intentionally out of scope**:
- Hosted URL shorteners or redirect servers ("dynamic QR codes").
- Scan tracking, user accounts, cloud databases, or analytics pixels.
- Paid tiers or expiring QR links.
