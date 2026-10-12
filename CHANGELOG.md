# Changelog

All notable changes to **tBelt Studio** (`studiotbelt`) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-12

### Added
- **Provider-Agnostic Generation Architecture (`providers.py`, `seedance_bridge.py`)**:
  - Modular provider registry supporting `fal.ai`, `Enhancor` (Seedance 2.5), `Replicate`, and local self-hosted `ComfyUI`.
  - Automated engine auto-detection with fallback to the user's active configured key.
  - Endpoints `GET /api/settings` and `POST /api/settings` for runtime configuration without manual terminal intervention.
- **In-App Engine Settings Modal & Onboarding (`static/index.html`, `static/i18n.js`)**:
  - Interactive settings modal (Settings) with provider selector cards, connection indicators, and key persistence.
  - Active engine indicator badge in top navigation and Step 03 character creation panel.
  - Non-intrusive onboarding banner displayed when no generation engine is configured.
- **Daemon Environment & Binary Resolution Hardening (`config.py`, `pipeline.py`, `audio_workflow.py`)**:
  - Implemented centralized `find_binary()` with automatic PATH injection across all macOS launchd and system daemon runners.
  - Added `/api/health` diagnostic endpoint reporting runtime binary resolution (FFmpeg, Rubberband, Python).
  - Sanitized frontend URL state (`history.replaceState`) on job failure to prevent error persistence across browser reloads.

### Security
- **Strict Credential Encapsulation**:
  - Settings API endpoints return Boolean configuration status (`configured: true|false`), completely masking private keys from browser inspection.
  - File permissions enforced on `.env` updates (`chmod 600`).

---

## [1.0.0] - 2026-10-12

### Added
- **Native CPU MediaPipe Face Mesh Pipeline (`mesh_worker.py`)**:
  - 478 3D landmark extraction via quantized TensorFlow Lite model (`face_landmarker.task`, 3.6 MB).
  - Dynamic centered portrait cropping (`x0=0.20*w, cw=0.60*w, ch=0.75*h`) to stabilize facial tracking on wide and medium cinematic shots.
  - Temporal landmark smoothing across momentary head turns and occlusions, eliminating tracking gap crashes.
- **Local Audio Stem Isolation & Pitch Modulation (`audio_workflow.py`)**:
  - Embedded local Demucs (`htdemucs` CPU) vocal separation, removing external paid API audio dependencies.
  - Sample-accurate +3 semitone pitch-shift via Rubber Band / FFmpeg with tempo and timing strictly preserved.
  - Automated multiplexing of pitched vocal stems into the synthesis guidance composite video.
- **Modern Cloud Synthesis with fal.ai (`seedance_bridge.py`)**:
  - Direct integration with `fal.ai` Live Portrait and Video-to-Video models.
  - Async generation workflow with polling, request ID tracking, and two-stage draft validation before 1080p export.
- **Production SPA Frontend with Real-Time Feedback (`static/index.html`)**:
  - Live upload progress indicator via `XMLHttpRequest` (0% to 30%) with exact uploaded bytes and total size (`X.X MB / Y.Y MB`).
  - Active session stopwatch (`mm:ss`) displaying real-time execution duration.
  - 4-phase visual pipeline milestone tracker:
    1. Upload & Normalization
    2. Face Mesh (MediaPipe)
    3. Vocal Isolation (Demucs)
    4. Ready for Review
  - In-memory manifest Set lookup for file artifacts (`jobFiles.has()`), eliminating 100% of blind HTTP `HEAD` probing and resolving console 404 errors.
  - Dedicated `/favicon.ico` route serving vector brand assets.
- **Full Bilingual i18n Architecture (`static/i18n.js`)**:
  - Instant client-side language switching between Spanish (`es`) and English (`en`).
  - LocalStorage persistence for user language preferences.
- **Production Infrastructure & Daemons**:
  - Decoupled server (`online.tbelt.studio-server`) and Cloudflare Named Tunnel (`online.tbelt.studio-tunnel`) managed as native macOS `LaunchAgents`.
  - Secure public deployment via `https://studio.tbelt.online`.

### Changed
- **Accelerated Video Normalization (`pipeline.py`)**:
  - Replaced frame-by-frame PIL image resizing loops with hardware-accelerated FFmpeg filters (`fps=24,scale='min(960,iw)':-2`), reducing normalization runtime from 30 seconds to under 3 seconds.
- **API Status & Manifest Contract (`app.py`)**:
  - Enhanced `/jobs/{id}` endpoint to return a dynamic `files: [...]` payload listing all confirmed disk artifacts.
  - Enabled `GET` and `HEAD` method support across root and static endpoints.

### Fixed
- Resolved unhandled loop indentation and crash scenarios in `mesh_worker.py` when processing fast motion frames.
- Eliminated full-page reload on video submission (`location.href`), enabling fluid SPA state transitions.
- Fixed 404 console cascades by removing exploratory HEAD network requests in favor of manifest sets.

### Security
- Hardened secret management: API keys (`FAL_KEY`) isolated in environment variables with strict file permissions (`chmod 600 .env`).
- Sanitized input validation on `/jobs/{id}` paths using strict 32-character hexadecimal regex.
