# Architecture Decision Records (ADRs) — QRForge

This log records the key architectural and security decisions made in QRForge, along with their context and trade-offs.

---

## ADR-001: 100% Client-Side Static QR Generation (No Redirect Backend)

- **Status**: Accepted
- **Context**: Many QR generators encode an intermediary short URL (`https://qr-service.example/xYz`) to collect scan analytics or gate link longevity behind subscriptions. If the intermediary service shuts down, every printed QR code breaks permanently. Furthermore, sending Wi-Fi credentials or contact vCards to a backend server introduces unnecessary privacy risk.
- **Decision**: Encode all destination payloads directly into the ISO/IEC 18004 QR matrix inside the user's browser with zero backend servers, databases, or network requests.
- **Consequences**:
  - **Pros**: Generated QR codes never expire, require zero hosting upkeep, and expose zero user data over the network.
  - **Cons**: Codes are static—once printed, the target destination cannot be edited, and scan counts are not tracked. Longer payloads produce denser QR matrices, which we surface clearly in the UI.

---

## ADR-002: Custom HTML5 Canvas & SVG Matrix Renderer over Default Library Output

- **Status**: Accepted
- **Context**: The `qrcode` package (`QRCode.create()`) computes accurate Reed-Solomon error-corrected bit matrices, but its built-in `toCanvas` / `toString` helpers only render plain square modules without custom finder eye geometries or centered logo cutouts.
- **Decision**: Use `QRCode.create(payload, { errorCorrectionLevel })` strictly for bit-matrix computation, and maintain a dedicated renderer (`src/utils/qrRenderer.ts`) that draws identical custom module shapes (`square`, `rounded`, `dots`), finder eye shapes (`square`, `rounded`, `circle`), quiet zones, and center logo badges to both `<canvas>` (for preview/PNG/PDF) and `<svg>` (for vector export).
- **Consequences**:
  - **Pros**: Pixel-consistent parity between live preview, high-DPI PNG exports, print PDFs, and pure vector SVGs without heavyweight third-party DOM-to-canvas libraries.
  - **Cons**: Custom geometry must preserve scannability; mitigated via ADR-003 (`jsQR` optical verification).

---

## ADR-003: Real-Time Optical Verification via `jsQR`

- **Status**: Accepted
- **Context**: Allowing users to customize colors, reduce quiet zones, round modules, and overlay center logos creates a risk of generating visually appealing QR codes that smartphone cameras fail to decode.
- **Decision**: After each canvas render in `QRPreviewPanel`, extract pixel data via `ctx.getImageData(...)` and run `jsQR` to verify both (1) whether the matrix decodes and (2) whether `decoded.data === payload`. Combine this with mathematical WCAG luminance contrast checks (`src/utils/contrast.ts`) and an automatic **"Switch to H"** prompt when a logo is paired with `L` or `M` error correction.
- **Consequences**:
  - **Pros**: Immediate, objective pass/fail feedback catches inverted colors, low contrast, missing quiet zones, or oversized logo occlusion before the user prints physical materials.
  - **Cons**: Slight CPU cost per canvas update (~few milliseconds at preview resolution), kept responsive inside React's render effect lifecycle.

---

## ADR-004: Never Persist Wi-Fi Passwords to Browser Storage or JSON Exports

- **Status**: Accepted
- **Context**: QRForge auto-saves in-progress form state to `sessionStorage`/`localStorage` and allows saving items to a persistent local library with JSON backup export. Storing plaintext Wi-Fi passwords in `localStorage` or exported `.json` files risks leaking network credentials on shared workstations or when sharing template backups.
- **Decision**: Centralize storage sanitization in `sanitizeConfigForStorage` (`src/utils/qrPayloads.ts`), which strips `wifi.password` to `""` before writing drafts, saving library entries, or serializing JSON backups.
- **Consequences**:
  - **Pros**: Plaintext Wi-Fi passwords exist only in transient React memory and inside the user's explicitly exported QR image/PDF while active.
  - **Cons**: When reloading a saved Wi-Fi item from the library or refreshing the page, the user must re-type the Wi-Fi password before exporting. The Wi-Fi form explicitly informs the user of this behavior.

---

## ADR-005: Self-Hosted `@fontsource` Fonts Instead of Google Fonts CDN

- **Status**: Accepted
- **Context**: Loading fonts from `fonts.googleapis.com` / `fonts.gstatic.com` causes external network requests on page load, leaks visitor IP addresses to a third party, and fails to render intended typography in air-gapped or strict `connect-src 'none'` environments.
- **Decision**: Bundle `@fontsource/plus-jakarta-sans` and `@fontsource/jetbrains-mono` directly through Vite (`src/main.tsx`) and remove all external stylesheet links from `index.html`.
- **Consequences**:
  - **Pros**: True zero-network execution after page load, consistent offline rendering, and compatibility with strict Content Security Policies.
  - **Cons**: Slightly larger static asset folder (`dist/assets/*.woff2`), cached immutably by browsers on first visit.
