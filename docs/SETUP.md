# Setup & Local Development Guide — QRForge

This guide walks you through setting up, developing, testing, and building QRForge on your local machine.

---

## 1. Prerequisites

Before setting up QRForge, ensure you have the following installed:
- **Node.js**: Version 18.0.0 or higher (Node 20+ LTS recommended).
- **npm**: Version 9.0.0 or higher (comes bundled with Node.js).
- **Git**: For version control.
- **Modern Web Browser**: Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge.

Check your current versions:
```bash
node -v
npm -v
```

---

## 2. Repository Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Devputta/QRForge.git
   cd QRForge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## 3. Environment Variables

QRForge is a client-side utility and **does not require any API keys or environment variables**.

A `.env.example` file is included for documentation:
```bash
# No environment variables or API keys are required.
# All QR code generation runs locally in the browser.
```

---

## 4. Development Server

Start the local Vite development server:
```bash
npm run dev
```

The application will start on:
`http://localhost:3000`

---

## 5. Available Scripts

The following scripts are defined in `package.json`:

| Command | Action |
| ------- | ------ |
| `npm run dev` | Starts the Vite development server on port 3000 with hot reload. |
| `npm run build` | Compiles TypeScript and generates an optimized production build in `/dist`. |
| `npm run preview` | Starts a local static web server to preview the `/dist` production build. |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to verify strict type correctness. |
| `npm test` | Runs the automated test suite via Vitest. |
| `npm run clean` | Deletes the `/dist` build directory. |

---

## 6. Testing & Quality Verification

Run the full automated test suite:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npx vitest
```

To run type checking:
```bash
npm run lint
```

---

## 7. Production Build & Deployment

To generate a static production build:
```bash
npm run build
```

This generates optimized static HTML, CSS, JavaScript, and asset bundles inside the `/dist` directory. The contents of `/dist` can be hosted on any static hosting platform (e.g. GitHub Pages, Cloudflare Pages, Netlify, Vercel, or AWS S3).

---

## 8. Troubleshooting

### Port 3000 already in use
If another application is using port 3000, specify an alternate port:
```bash
npx vite --port 3001
```

### Node version mismatch
If you encounter syntax errors during build, verify that your Node version is 18+:
```bash
node -v
```
Use `nvm` or your system package manager to switch to Node 18 or 20.
