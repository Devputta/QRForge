# Accessibility (a11y) Guide — QRForge

QRForge is engineered to meet **WCAG 2.2 Level AA** accessibility standards. As utility software, it is designed to be fully operable via keyboard, screen readers, and low-vision assistive tools.

---

## 1. Semantic Structure & Landmark Regions

- **`<header>`**: Global navigation bar with clean branding and landmark structure.
- **`<main>`**: Primary application workspace enclosing the form configuration and live preview.
- **`<footer>`**: Secondary links, offline indicators, and print standards triggers.
- **Headings**: Hierarchical `<h1>`, `<h2>`, and `<h3>` tags without skipping levels.

---

## 2. Keyboard Navigation & Focus Management

- **Full Keyboard Operability**: Every button, input, tab, selector, and modal action is reachable and activatable using standard keyboard keys (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `Arrow keys`).
- **Visible Focus Rings**: All interactive controls feature high-contrast visible focus indicators (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`).
- **Modal Focus Trapping (`useModalA11y`)**:
  - Automatically traps focus within the open dialog so keyboard users cannot accidentally tab into inert background content.
  - Automatically focuses the first interactive element or dialog body on open.
  - Closes immediately when the `Escape` key is pressed.
  - Restores keyboard focus back to the initiating trigger button upon close.

---

## 3. Color Contrast & Low-Vision Support

- **Text Contrast**: All UI text meets or exceeds WCAG 2.2 AA requirements:
  - Normal text: $\ge 4.5:1$ contrast ratio against its background.
  - Large text & headings: $\ge 3.0:1$ contrast ratio.
- **Interactive Controls**: Buttons, borders, and input focus outlines meet $\ge 3.0:1$ contrast ratio against adjacent surfaces.
- **QR Contrast Checker**: The application includes an in-app contrast checker (`calculateContrast`) that calculates the exact relative luminance ratio between the chosen dark and light colors and displays a prominent warning badge if the contrast falls below recommended optical thresholds.
- **No Color-Only State Indicators**: Statuses use both color and accompanying text/icons (e.g. green checkmarks with "Scan verified" text; red alert icons with descriptive validation error copy).

---

## 4. Screen Reader Announcements & ARIA Attributes

- **QR Canvas Accessible Name**: The `<canvas>` element features `role="img"` and a dynamic `aria-label` describing the encoded destination (e.g. `aria-label="QR code for https://example.com/pricing"`).
- **Icon Buttons**: Icon-only controls (e.g. Copy, Quick Download, Delete, Theme toggle) feature explicit `aria-label` and `title` attributes.
- **Dialogs**: All modal overlays feature `role="dialog"`, `aria-modal="true"`, and are linked to their respective headings via `aria-labelledby`.
- **Validation Messages**: Form error messages are placed adjacent to their corresponding input fields with descriptive text.

---

## 5. Motion & Touch Accommodations

- **Reduced Motion**: CSS `@media (prefers-reduced-motion: reduce)` overrides disable non-essential animations, transitions, and smooth scrolling for users sensitive to motion.
- **Touch Target Sizing**: Primary interactive elements have touch targets of at least $38\text{px} \times 38\text{px}$ to $44\text{px} \times 44\text{px}$ to prevent accidental activation on mobile touchscreens.
- **No Hover-Only Functions**: Action buttons (such as duplicate, delete, and download in the library) are always discoverable and operable via touch or keyboard focus without requiring a hover state.
