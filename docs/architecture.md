# Architecture Documentation — QRForge

## 1. System Overview

QRForge is a client-side single-page application built on React 19, TypeScript, and Vite. The core architectural principle of QRForge is **Zero-Telemetry Local Execution**: all data transformations, matrix calculations, canvas rendering, SVG generation, and file exports happen completely inside the browser runtime without sending data to a server.

---

## 2. Architecture & Data Flow Diagram

```mermaid
graph TD
    subgraph UI_Layer [User Interface Layer]
        Header[Header & Theme Controller]
        Tabs[Tab Switcher: Generator / Batch / Library]
        Forms[Destination Forms (11 Types)]
        Style[StyleControls: Colors, Shapes, Logos]
        Preview[QRPreviewPanel: Live Canvas & Actions]
        Batch[BatchGenerator: CSV Parser & Zip Export]
        Library[SavedLibrary: Search, Filter, JSON Backup]
        Modals[Accessible Modals (Standards, Save, PDF)]
    end

    subgraph State_and_Persistence [State & Browser Storage]
        DraftState[Form Draft State]
        SavedCodesState[Saved Codes State]
        SessionStorage[(sessionStorage: Draft)]
        LocalStorage[(localStorage: Codes & Draft)]
    end

    subgraph Logic_and_Engines [Client-Side Processing Engines]
        PayloadBuilder[qrPayloads.ts: RFC Payload Formatting]
        ContrastEngine[contrast.ts: WCAG Luminance & Contrast]
        MatrixEngine[qrcode: Raw Boolean Matrix Generator]
        Renderer[qrRenderer.ts: Custom Canvas & SVG Painter]
        ScanVerifier[jsQR: Optical Matrix Decoder]
        PdfEngine[jspdf: Vector Print PDF Generator]
        BatchEngine[batchProcessor.ts + JSZip: Archive Bundler]
    end

    Forms -->|User Input| PayloadBuilder
    PayloadBuilder -->|Payload String| DraftState
    DraftState -->|Sync (No Passwords)| SessionStorage
    DraftState -->|Sync (No Passwords)| LocalStorage

    DraftState -->|Payload & Style| Renderer
    Style -->|Color Selection| ContrastEngine
    Renderer --> MatrixEngine
    MatrixEngine -->|Boolean Modules| Renderer
    Renderer -->|Draw 2D Context| Preview
    Renderer -->|SVG XML String| Preview

    Preview -->|ImageData Pixels| ScanVerifier
    ScanVerifier -->|Decoded String Matches Payload?| Preview

    Preview -->|Canvas Export| PdfEngine
    Preview -->|Save Code| SavedCodesState
    SavedCodesState -->|Sanitize & Store| LocalStorage
    SavedCodesState -->|Export / Import| Library

    Batch -->|CSV Input| BatchEngine
    BatchEngine -->|Matrix & PNGs| BatchEngine
```

---

## 3. Component Hierarchy & Responsibilities

### UI Components
- **`src/App.tsx`**: Central application coordinator. Manages active destination configuration, draft persistence, synchronization to `sessionStorage` and `localStorage`, modal triggers, and responsive layout toggling on mobile.
- **`src/components/Header.tsx`**: Top navigation zone containing brand identity, tab switcher, theme mode toggle (`system`, `light`, `dark`), print tips trigger, and GitHub source repository link.
- **`src/components/QRPreviewPanel.tsx`**: Live optical canvas preview. Automatically runs `jsQR` scan verification on every frame update, displays contrast badges and module stats, and handles exports (PNG, SVG, PDF, clipboard copy, print dialog).
- **`src/components/StyleControls.tsx`**: Customization panel for foreground/background colors, module geometry, corner finder designs, quiet margins, and center logos.
- **`src/components/BatchGenerator.tsx`**: Bulk QR generator. Parses CSV inputs, provides row-level validation feedback, and packages generated PNGs and an RFC 4180 `manifest.csv` into a `.zip` archive via `JSZip`.
- **`src/components/SavedLibrary.tsx`**: Local repository of user-saved QR codes. Provides instant search, type filtering, one-click duplicate, PNG export, and JSON backup/restore.
- **`src/components/StandardsModal.tsx`**: Interactive print sizing calculator implementing the $D / 10$ distance rule and ISO/IEC 18004 printing best practices.

### Destination Input Sub-forms (`src/components/DestinationForms/`)
1. `UrlForm.tsx`: Web addresses with optional UTM parameters.
2. `GoogleMapsForm.tsx`: Places, turn-by-turn directions with travel modes, or map links.
3. `WifiForm.tsx`: SSID, encryption (WPA/WEP/None), password toggle, and hidden status.
4. `VCardForm.tsx`: Complete vCard 3.0 fields with RFC 2426 escaping.
5. `WhatsAppForm.tsx`: Phone number and prefilled messages.
6. `TextForm.tsx`: Plain text with live character counter.
7. `CalendarEventForm.tsx`: iCalendar 2.0 events with date/time pickers and all-day toggle.
8. `SocialForm.tsx`: Profile handles and direct links.
9. `CommunicationForm.tsx`: Mailto and dialer/SMS configurations.
10. `MediaFileForm.tsx`: Cloud share links for documents and assets.

---

## 4. Processing Engines & Data Flow

### 1. Payload Serialization (`src/utils/qrPayloads.ts`)
Each destination type has a dedicated builder function that produces a normalized payload string:
- `buildUrlWithUtmPayload`: Appends `utm_source`, `utm_medium`, and `utm_campaign` using the standard `URL` Web API.
- `buildGoogleMapsPayload`: Constructs Google Maps Universal URLs (`/maps/search/` and `/maps/dir/`).
- `buildWifiPayload`: Formats `WIFI:S:...;T:...;P:...;;` strings with backslash escaping (`\\`, `\;`, `\:`, `\,`).
- `buildVCardPayload`: Formats vCard 3.0 text with CRLF line endings (`\r\n`) and RFC 2426 escaping (`\\`, `\,`, `\;`, `\n`).
- `buildCalendarEventPayload`: Serializes iCalendar 2.0 VEVENT records with UTC timestamp formatting.

### 2. Custom Matrix Rendering (`src/utils/qrRenderer.ts`)
Rather than relying on default canvas rendering from the `qrcode` library:
1. `getQRMatrix(payload, ecLevel)` extracts the raw $N \times N$ boolean module matrix.
2. `renderQRToCanvas()` identifies the 3 corner finder patterns ($7 \times 7$ modules) and isolates the center logo exclusion zone.
3. Modules are custom-painted using Canvas 2D path primitives according to the selected geometry:
   - `square`: standard rectangles (`ctx.fillRect`).
   - `rounded`: smooth rounded rectangles (`drawRoundedRect`).
   - `dots`: circular arcs (`ctx.arc`).
4. Finder eye corners are rendered independently to support square, rounded, or concentric circle eye patterns.
5. If a center logo is specified, it is rendered centered with an optional background shield matching the background color.

### 3. Verification Engine (`jsQR`)
Once the canvas finishes rendering, the preview panel retrieves the raw pixel buffer (`ctx.getImageData()`) and passes it into `jsQR(data, width, height)`. If the decoded content matches the intended payload string identically, a **Scan verified** badge is displayed; otherwise, an **Unreadable scan** warning is shown.

---

## 5. Security & Privacy Guarantees

1. **No External Network Requests**: The application makes no network calls to external APIs. All generation, decoding, and packaging happens in memory.
2. **Credential Sanitization**: The helper `sanitizeSavedCodesForStorage` strips all `P:<pass>;` patterns and clears `config.password` before writing to `localStorage`, `sessionStorage`, or exporting to JSON.
3. **Safe Print Preview**: The print dialog builds DOM elements using explicit DOM APIs (`createElement` and `textContent`) instead of HTML string interpolation, preventing script injection.
