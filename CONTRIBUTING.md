# Contributing to QRForge

Thank you for your interest in contributing to QRForge! We welcome pull requests, bug reports, and suggestions that help make private, client-side QR code creation reliable and accessible for everyone.

---

## 1. Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat everyone with empathy and respect.

---

## 2. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended).
- **npm**: v9.0.0 or later.
- Modern browser (Chromium, Firefox, Safari).

### Fork & Clone
1. Fork the repository on GitHub: [https://github.com/Devputta/QRForge](https://github.com/Devputta/QRForge).
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/QRForge.git
   cd QRForge
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 3. Branch Naming Conventions

Use descriptive branch names with short prefixes:
- `feat/<feature-name>` for new capabilities (e.g. `feat/vcard-photo-support`)
- `fix/<bug-description>` for bug fixes (e.g. `fix/wifi-hidden-character-escaping`)
- `docs/<doc-topic>` for documentation improvements (e.g. `docs/setup-guide`)
- `refactor/<module>` for internal refactoring without behavior change

---

## 4. Coding & Architecture Standards

1. **Client-Side Only**: QRForge must execute entirely within the client browser. Do NOT introduce backend dependencies, tracking analytics, external fonts, or network API telemetry.
2. **TypeScript**: Strict type safety. Standard enums or literal unions only; avoid `any`.
3. **Styling**: Tailwind CSS v4. Maintain clean, utility-first design without decorative fluff or arbitrary inline styles.
4. **Accessibility (WCAG 2.2 AA)**:
   - All interactive elements must have accessible labels (`aria-label`, visible text, or associated `<label>`).
   - Modals must implement focus trapping and Escape-key dismissal via `useModalA11y`.
   - Ensure high contrast ($\ge 4.5:1$ for body copy, $\ge 3:1$ for large text/icons).
5. **No Secrets or Personal Data**: Never commit credentials, passwords, or personal test data. Wi-Fi passwords must never be stored in persistent storage or seed records.

---

## 5. Testing & Verification Requirements

Before submitting any Pull Request, ensure that all linting, automated tests, and production build checks pass cleanly:

```bash
# 1. Type-check / Linting
npm run lint

# 2. Automated Test Suite (Vitest)
npm test

# 3. Production Build
npm run build
```

Every new feature or bug fix must include corresponding tests in `src/fixes.test.ts`, `src/utils/qrPayloads.test.ts`, `src/components.test.tsx`, or `src/workflow.test.ts`.

---

## 6. Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push origin <branch-name>
   ```
2. Open a Pull Request against the `main` branch of `Devputta/QRForge`.
3. Fill out the PR template:
   - Description of the change and rationale.
   - Related issue numbers.
   - Testing steps and confirmation that `npm test` and `npm run lint` pass.
   - Responsive check confirmation (e.g. tested on mobile and desktop viewports).
