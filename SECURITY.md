# Security Policy

The QRForge maintainers take the security and privacy of this project seriously. Because QRForge is a client-side application designed to protect user privacy by executing entirely in the browser, vulnerabilities typically involve client-side injection, unescaped payloads, or unexpected data exfiltration vectors.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

We provide security patches for the latest minor version in the `main` branch.

---

## Reporting a Security Vulnerability

If you discover a potential security vulnerability or privacy flaw in QRForge, please report it **responsibly and privately** rather than opening a public issue.

### How to Report

1. **GitHub Private Advisory (Preferred)**:
   Navigate to the [QRForge Security Advisories page](https://github.com/Devputta/QRForge/security/advisories) and click **"Report a vulnerability"**. This allows secure, private triage without disclosing details publicly before a fix is available.
2. **Repository Maintainer Contact**:
   If private advisories are not enabled on the fork, please contact the maintainer directly through their GitHub profile ([https://github.com/Devputta](https://github.com/Devputta)) or configure a dedicated security contact email in repository settings.

### What to Include in Your Report

To help us evaluate and address the issue efficiently, please include:
- A clear description of the vulnerability.
- Steps to reproduce or proof-of-concept (PoC) input.
- Affected browser(s), operating system, and viewport.
- The potential impact (e.g. DOM injection, payload corruption, credential persistence).
- Any suggested remediations or code references.

---

## Response Process

- **Acknowledgment**: We aim to acknowledge receipt of reports within a reasonable timeframe (typically within 3 to 5 business days).
- **Assessment**: The maintainers will investigate and determine the validity and severity of the report.
- **Remediation**: Once verified, a fix will be developed, tested through automated test suites, and merged into `main`.
- **Disclosure**: We follow responsible disclosure practices. Public advisories and release notes will acknowledge the reporter (unless anonymity is requested) once the fix has been published.

---

## Security Principles of QRForge

1. **Local Execution**: All QR code encoding, canvas rendering, SVG generation, and PDF exports run strictly in client-side JavaScript. No user data (URLs, passwords, coordinates, contact cards) is transmitted to external servers.
2. **Credential Hygiene**: Sensitive credentials, such as Wi-Fi pre-shared keys, are never written to `localStorage`, `sessionStorage`, or backup JSON exports.
3. **Payload Sanitization**: Form inputs are validated and formatted to avoid injection into rendered HTML or print document contexts.
4. **Static Code Responsibility**: QR codes are static representations of data. QRForge does not validate whether a user-provided destination URL is safe, benign, or free of malware. Users remain responsible for verifying their destinations before sharing or scanning.
