# tBelt Studio

> **Lightweight local video preparation, facial motion tracking, and provider-agnostic character synthesis.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://python.org)
[![Generative Engines: fal.ai | Enhancor | Replicate | ComfyUI](https://img.shields.io/badge/Generative%20Engines-Agnostic-orange.svg)](providers.py)
[![i18n: ES / EN](https://img.shields.io/badge/i18n-ES%20%7C%20EN-green.svg)](static/i18n.js)

**tBelt Studio** is an open-source, hybrid pipeline designed for photorealistic character replacement and motion transfer in video. It pairs lightweight local CPU signal processing (FFmpeg, MediaPipe Face Mesh, and Demucs) with a provider-agnostic character generation layer supporting **fal.ai**, **Enhancor (Seedance 2.5)**, **Replicate**, and self-hosted **ComfyUI**.

The entire source audio (vocal stems, music, sound design, and ambience) is preserved and restored into the final export, while character motion, facial expressions, and lip-sync are transferred onto a new identity.

---

## Key Features & Architecture

**tBelt Studio** combines local CPU signal processing with flexible neural synthesis:

1. **Local Audio Stem Isolation & Pitch Modulation**:
   - Vocal isolation runs locally via Demucs (`htdemucs`) on CPU, separating speech and music tracks.
   - Vocals are frequency-modulated by +3 semitones while retaining sample-accurate duration and syllable timing.
   - Guidance audio is embedded into the synthesis stream, with full original source audio restored on final export.

2. **Native MediaPipe 478-Point Face Mesh**:
   - Real-time 3D facial landmark calculation using Google's quantized TensorFlow Lite model (`face_landmarker.task`, ~3.6 MB).
   - Adaptive portrait cropping (`x0=0.20*w, cw=0.60*w, ch=0.75*h`) for facial detection across both close-ups and wide cinematic shots.
   - Temporal smoothing across rapid head turns to maintain continuous tracking coordinates.

3. **Provider-Agnostic Video Recasting & In-App Settings**:
   - Connect and switch generative video backends through the in-app Settings modal (⚙️ Settings) or environment variables.
   - Strictly engineered for **Video Recasting / Character Replacement with Identity Transfer** (not potato talking-head avatars, not camera-hallucinating text-to-video).
   - Supported engines & transparent pricing:
     - **fal.ai — Wan 2.2 Animate Replace (`fal-ai/wan/v2.2-14b/animate/replace`)**: Budget pay-as-you-go ($0.04/s at 480p, $0.08/s at 720p; ~$0.60–$1.20 for 15s). No monthly subscription required.
     - **fal.ai — MiniMax H3 Max Recast (`minimax/h3-max/recast`)**: Premium cinematic quality ($0.45/s at 1080p, $0.30/s at 768p; ~$6.75 for 15s). Multi-subject tracking and cinematic lighting.
     - **Enhancor (Seedance 2.5 Edit / Omni)**: Subscription-gated ($45/month plan required to unlock API; ~$0.15–$0.35/draft in subscription credits).
     - **Replicate**: Wan 2.2 Animate Replace & video-to-video on serverless GPUs (billed per GPU-second).
     - **ComfyUI Local**: Self-hosted local AnimateDiff / Wan workflows for offline generation (100% free with local GPU).
   - Two-stage workflow: draft preview validation before committing to full 1080p high-definition generation.

4. **Single Page Application with Live Progress**:
   - Asynchronous upload tracking via `XMLHttpRequest` with exact byte counts and percentage indicators (`X.X MB / Y.Y MB`).
   - Active session timer (`⏱ mm:ss`) and 4-phase milestone tracking (Normalization, Mesh, Audio, Review).
   - In-memory artifact manifest (`Set.has()`) for zero-overhead validation and clean browser console logs.
   - Smooth client-side state transitions with `history.pushState` and quick error dismissal.

5. **Bilingual Interface (i18n)**:
   - Client-side language toggling between Spanish (`es`) and English (`en`) with persisted preferences.

6. **macOS System Daemons & Public Tunneling**:
   - Managed background execution via macOS `LaunchAgents` and Cloudflare Named Tunnels for SSL remote access without terminal dependencies.

---

## Exact Model Category: Video Recasting vs. Talking Heads & Text-to-Video

To achieve cinematic, shot-for-shot character replacement with full body motion, lighting, and dialogue retention, **tBelt Studio** enforces a strict model taxonomy:

- ❌ **Generic Text-to-Video / Image-to-Video** (e.g. Sora, Runway Gen-2/3, standard Kling/Hailuo): These hallucinate brand new camera angles, alter pacing, and fail to preserve existing multi-shot choreography.
- ❌ **Talking-Head / Avatar mesh retargeters** (e.g. LivePortrait, SadTalker): These crop down to 512×512 facial bounding boxes, warp faces like rubber, cut off actor bodies, and distort aspect ratios.
- ✅ **Video Recasting (Subject Identity Transfer)**: Models that accept a driving composite video + character reference images, track subject motion, gestures, camera framing, cuts, and lighting, and transfer the new identity across the full body while leaving the background and choreography intact.

### Provider & Pricing Trade-Off Matrix

| Provider & Model | Pricing Structure | Estimated Cost (15s Clip) | Best For | Subscription Required? |
|---|---|---|---|---|
| **fal.ai — Wan 2.2 Animate Replace** | Pay-as-you-go ($0.04/s at 480p, $0.08/s at 720p) | **$0.60 – $1.20 USD** | Fast test iterations & budget production | **No** (Prepaid balance) |
| **Enhancor (ByteDance Seedance 2.5)** | Subscription credits (~$0.15–$0.35/draft) | **~$0.25 USD** (in credits) | High-volume production | **Yes** ($45/mo to unlock API) |
| **fal.ai — MiniMax H3 Max Recast** | Pay-as-you-go ($0.30/s at 768p, $0.45/s at 1080p) | **$4.50 – $6.75 USD** | Premium 1080p cinematic delivery | **No** (Prepaid balance) |
| **Replicate (Wan 2.2 / Video2Video)** | Serverless GPU-seconds (~$0.0005–$0.001/s) | **$0.40 – $0.90 USD** | Scalable cloud rendering | **No** (Pay per second) |
| **ComfyUI Local** | Self-hosted local GPU hardware | **$0.00** | Offline privacy & local setups | **No** (Free open weights) |

---

## Workflow Architecture

```mermaid
flowchart LR
    A[Input Video\nMP4 / MOV] --> B[FFmpeg Fast Normalization\n24 fps, Scaled]
    B --> C[MediaPipe Face Mesh\n478 3D Landmarks]
    B --> D[Demucs Vocal Separation\nCPU htdemucs]
    D --> E[Pitch Shift +3 st\nLocked Duration]
    C & E --> F[Guidance Composite\nseedance-input.mp4]
    F --> G[Visual Review Gate\nInteractive SPA]
    G --> H[Agnostic Generative Engine\nfal.ai · Enhancor · Replicate · ComfyUI]
    H --> I[Original Audio Restoration\nMaster Export 1080p]
```

---

## Resource & Performance Profile

Benchmarked on an entry-level Apple Silicon Mac mini (8 GB unified memory):

| Pipeline Stage | Engine | Execution Time (10s Clip) | Peak RAM Consumption |
|---|---|---|---|
| **Video Normalization** | FFmpeg C-Filters | 2.5 seconds | ~80 MB |
| **Face Mesh Tracking** | MediaPipe (TFLite CPU) | 6.8 seconds | ~150 MB |
| **Vocal Isolation** | Demucs (`htdemucs` CPU) | 16.2 seconds | ~850 MB (peak) |
| **Pitch Modulation** | FFmpeg / Rubber Band | 1.1 seconds | ~40 MB |
| **Total Local Prep** | — | **~26.6 seconds** | **~1.1 GB max** |

The Mac mini remains responsive throughout local execution, leaving over 6 GB of system RAM free.

---

## Quickstart

### Prerequisites
- macOS or Linux
- Python 3.12+
- `ffmpeg`, `sox`, `rubberband`
- An API key for your chosen video engine (fal.ai, Enhancor, or Replicate) or a local ComfyUI URL.

```bash
# macOS installation
brew install ffmpeg sox rubberband python@3.12
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tBeltty/studiotbelt.git
cd studiotbelt

# 2. Create and activate virtual environment
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Configure credentials
# Either configure through the in-app Settings modal (⚙️ Ajustes)
# or populate your .env file:
cp .env.example .env
# Set FAL_KEY, ENHANCOR_API_KEY, REPLICATE_API_TOKEN, or COMFY_URL
```

### Running the Application

```bash
# Development server
python -m uvicorn app:app --host 127.0.0.1 --port 8770 --reload

# Open in browser
open http://127.0.0.1:8770
```

---

## Step-by-Step Usage

1. **Step 01 — Upload & Preparation**:
   - Drag and drop your original video clip (up to 30 seconds).
   - Observe instant file verification (size and filename).
   - Click **⚡ 1-Click: Prepare Video**. Watch the real-time upload bar and milestone indicators progress through normalization, MediaPipe mesh tracking, and Demucs stem isolation.
2. **Step 02 — Verification & Review**:
   - Review the prepared motion guide with isolated vocal tracks.
   - Inspect individual audio stems (`vocals.wav`, `vocals-plus3.wav`, `music.wav`).
   - Click **✓ Approve & Continue to Character**.
3. **Step 03 — Character Synthesis**:
   - Upload the reference photo of the new character (face or body).
   - Verify prompt synthesis instructions.
   - Select your active generative engine (fal.ai, Enhancor, Replicate, or ComfyUI).
   - Click **✨ 2-Click: Generate Character** to dispatch draft generation.
4. **Step 04 — Master Export**:
   - Inspect the draft preview with pristine original source audio restored.
   - Approve 1080p high-definition upgrade when satisfied.

---

## Project Structure

```
studiotbelt/
├── app.py                  # FastAPI application server and REST endpoints
├── audio_workflow.py       # Demucs vocal separation & pitch shift engine
├── face_mesh.py            # MediaPipe Face Mesh tracking controller
├── mesh_worker.py          # 478 3D landmark extractor with temporal smoothing
├── pipeline.py             # FFmpeg-accelerated video normalization
├── providers.py            # Multi-provider dispatch & settings configuration
├── seedance_bridge.py      # Agnostic cloud synthesis adapter (fal, Enhancor, Replicate)
├── mask_review.py          # Quality gate review state manager
├── static/
│   ├── index.html          # SPA interface with real-time progress dashboard
│   ├── i18n.js             # Bilingual Spanish/English translation engine
│   └── favicon.svg         # Studio vector brand mark
├── docs/
│   └── ARCHITECTURE.md     # In-depth technical architecture specification
├── CHANGELOG.md            # Release history following Keep a Changelog
├── CONTRIBUTING.md         # Contribution guidelines and standards
├── SECURITY.md             # Vulnerability reporting and security posture
├── LICENSE                 # MIT License
└── requirements.txt        # Python dependency manifest
```

---

## Acknowledgements & Attribution

This project builds upon foundational workflow concepts pioneered by **[Sirio Berati](https://github.com/sirioberati)** in the open-source video AI community. We express our respect and gratitude to Sirio for sharing his subject replacement research under the MIT license, establishing the basis for motion-guided character transfer.

---

## License

This project is licensed under the [MIT License](LICENSE).  
Copyright (c) 2026 Sirio Berati  
Copyright (c) 2026 tBelt Online (https://tbelt.online)
