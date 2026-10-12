# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

We take the security of **tBelt Studio** seriously. If you discover a security vulnerability, please do NOT file a public issue on GitHub.

Instead, please send an advisory email directly to:
**security@tbelt.online** (or jhonatan@tbelt.online).

Please include:
1. A description of the vulnerability and its potential impact.
2. Step-by-step instructions or proof-of-concept code to reproduce the issue.
3. Your recommended remediation, if known.

We will acknowledge receipt within 48 hours and work with you on a resolution before any public disclosure.

---

## Security Guarantees & Posture

- **API Secrets:** Third-party API tokens (`FAL_KEY`) are read strictly from environment variables or a local `.env` file with `chmod 600` permissions. They are never rendered into client HTML, logs, or response payloads.
- **Path Traversal Protection:** All file endpoints require strict 32-character hexadecimal path parameters (`[0-9a-f]{32}`), preventing arbitrary filesystem traversal.
- **Media Sanitization:** Client-uploaded video inputs are sanitized and re-encoded using FFmpeg prior to any downstream processing.
