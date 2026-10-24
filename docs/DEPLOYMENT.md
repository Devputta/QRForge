# Deployment Guide — QRForge

QRForge compiles to a self-contained static bundle (`HTML`, `CSS`, `JavaScript`, and bundled `@fontsource` WOFF/WOFF2 font files). It requires **no backend runtime, database, server-side environment variables, or external CDN access**.

---

## 1. Building the Production Bundle

Run the standard verification and build pipeline locally or in CI:

```bash
# Install dependencies cleanly
npm ci

# Verify TypeScript types
npm run lint

# Run the automated test suite
npm test

# Build optimized static assets into ./dist
npm run build
```

### Build Output (`./dist`)
After `npm run build` succeeds, Vite outputs:
- `dist/index.html` — Single-page application entry point.
- `dist/assets/*.js` — Minified, hashed JavaScript chunks.
- `dist/assets/*.css` — Compiled Tailwind CSS v4 styles.
- `dist/assets/*.woff2` / `*.woff` — Self-hosted Plus Jakarta Sans and JetBrains Mono font subsets.

### Local Production Preview
To test the compiled static bundle locally before deploying:

```bash
npm run preview
```

---

## 2. Hosting Providers

Any static file server or CDN can host the `dist/` directory.

### Option A: Cloudflare Pages / Netlify / Vercel
1. Connect your Git repository (`https://github.com/Devputta/QRForge`).
2. Configure the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Node.js Version**: `20` (or `>= 18`)
3. Leave environment variables empty—no API keys are required.

### Option B: GitHub Pages
If deploying to a subpath (for example, `https://<username>.github.io/QRForge/`), build with Vite's `--base` flag so asset paths resolve relative to the repository subpath:

```bash
npx vite build --base=/QRForge/
```

Upload the resulting `dist/` artifact using `actions/upload-pages-artifact` and `actions/deploy-pages` in a GitHub Actions workflow.

### Option C: Nginx / Self-Hosted Static Server
Copy the contents of `dist/` to `/usr/share/nginx/html` (or your web root) and configure Nginx with long-lived immutable caching for hashed assets:

```nginx
server {
    listen 80;
    server_name qrforge.example.com;
    root /usr/share/nginx/html;
    index index.html;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 3. Recommended Security Headers

Because QRForge executes 100% locally in the browser, makes zero network calls (`connect-src 'none'`), and uses `data:` / `blob:` URLs for local logo uploads and file downloads, you can enforce a strict Content Security Policy (CSP) at your edge host or reverse proxy:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

> **Note on Development Mode**: Only apply `connect-src 'none'` to production static builds (`dist/`). During local development (`npm run dev`), Vite uses local HTTP/WebSocket connections on `localhost` to serve modules.

---

## 4. Rollback & Cache Invalidation

- Vite hashes all filenames under `dist/assets/`.
- Ensure `dist/index.html` is served with `Cache-Control: no-cache` (or short TTL) so browsers immediately pick up new asset hashes upon redeployment or rollback.
