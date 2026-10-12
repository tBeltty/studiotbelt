# System Architecture & Technical Specifications

**tBelt Studio** (`studiotbelt`) is an automated system for video character synthesis and motion transfer. It combines local CPU-efficient signal processing (computer vision and digital audio) with cloud-accelerated neural diffusion models.

---

## 1. Architectural Philosophy: Division of Labor

The system decouples processing stages based on computational efficiency between consumer CPU hardware and cloud GPU clusters:

```mermaid
flowchart TD
    subgraph Client ["1. Client Interface (Modular SPA)"]
        UI["tBelt Studio Web UI<br/>(static/index.html & styles.css)"]
        Upload["XHR Telemetry & State<br/>(static/js/app.js)"]
    end

    subgraph API ["2. API & Orchestration (src/studiotbelt/api)"]
        FastAPI["FastAPI Web Server<br/>(REST Endpoints & Static Mounts)"]
        Workers["Thread Pool Executor<br/>(Background Job Queue)"]
        Tunnel["Cloudflare Quick Tunnel<br/>(webhook.py Receiver)"]
    end

    subgraph LocalEngine ["3. Local Processing & CV (src/studiotbelt/core & vision)"]
        Normalize["FFmpeg Normalization<br/>(24 fps · C-Filters · Downscaling)"]
        Mesh["MediaPipe Face Mesh<br/>(478 3D Landmarks · CPU TFLite)"]
        Audio["Demucs Vocal Isolation<br/>(htdemucs + Pitch Shift +3 st)"]
        Mux["Guidance Multiplexer<br/>(seedance-input.mp4)"]
    end

    subgraph Gate ["4. Quality Review Gate (src/studiotbelt/vision)"]
        ReviewGate["Visual Review Gate (mask_review.py)<br/>Human / Agent Quality Verification"]
    end

    subgraph CloudLayer ["5. Generative Synthesis (src/studiotbelt/services)"]
        Router["Provider Router (providers.py)<br/>fal.ai · Enhancor · Replicate · ComfyUI"]
        Restoration["Master Audio Restoration<br/>(Original Source PCM Audio Restored)"]
        Output["Master 1080p Video<br/>(final-preview.mp4)"]
    end

    UI --> Upload
    Upload -->|POST /jobs| FastAPI
    FastAPI --> Workers
    Tunnel -.->|Async Callback| Workers
    Workers --> Normalize
    Normalize --> Mesh
    Normalize --> Audio
    Mesh --> Mux
    Audio --> Mux
    Mux --> ReviewGate
    ReviewGate -->|Approved Submission| Router
    Router --> Restoration
    Restoration --> Output
    Output -->|Stream / Download| UI
```

1. **Local CPU (Preparation & Signal Isolation):**
   - **Video Normalization:** Frame rate adjustment to 24 fps and downscaling via FFmpeg native C-filters.
   - **Facial Landmark Mesh:** 478 3D points calculated in real time using Google MediaPipe FaceLandmarker via TensorFlow Lite CPU inference (`src/studiotbelt/vision/face_mesh.py`).
   - **Audio Separation & Modulation:** Local Demucs (`htdemucs`) isolates vocals and instrumental tracks. Vocals are pitch-shifted +3 semitones while retaining identical temporal alignment (`src/studiotbelt/core/audio_workflow.py`).
   - **Resource Footprint:** Maximum RAM peak of ~1.1 GB, allowing execution on low-memory hardware (benchmark tests on Apple Silicon M1 with 8 GB RAM).

2. **Generative Synthesis (Provider-Agnostic Abstraction Layer):**
   - The preparation stage yields a normalized guidance video `seedance-input.mp4` with pitched audio.
   - The character generation layer is decoupled into `src/studiotbelt/services/providers.py`, allowing dynamic routing to:
     - **Replicate**: Serverless Wan 2.2 video-to-video execution and LivePortrait billed by GPU-seconds.
     - **Enhancor**: ByteDance Seedance 2.5 Edit & Omni motion transfer and facial identity preservation.
     - **ComfyUI**: Self-hosted local instances for fully offline workflows.
     - **fal.ai**: Wan 2.2 Animate Replace and MiniMax H3 Max Recast.
   - Credentials and engine selection are managed dynamically via `/api/settings` and stored securely with `chmod 600`.

---

## 2. Facial Landmark & Motion Guidance

### Dynamic Cropping Geometry
MediaPipe's neural model was optimized on portrait-framing datasets. In wide or cinematic video footage, passing raw 1080p frames often reduces detection confidence. The engine applies an adaptive bounding box:

$$\text{Crop} = \left[ x_0 = 0.20 \cdot W, \, y_0 = 0, \, w = 0.60 \cdot W, \, h = 0.75 \cdot H \right]$$

### Temporal Occlusion Smoothing
During rapid head turns, yaw rotations, or brief downward glances, detection confidence can drop momentarily. Instead of terminating execution with a tracking fault, the landmark processor carries forward the previous valid landmark matrix and linearly interpolates coordinates until re-acquisition, guaranteeing uninterrupted guidance frames.

### Multi-Subject Limitations
The local MediaPipe FaceLandmarker processor evaluates a single bounding crop:
$$\text{Crop} = \left[ x_0 = 0.20 \cdot W, \, y_0 = 0, \, w = 0.60 \cdot W, \, h = 0.75 \cdot H \right]$$

Because tracking is constrained to one face per frame, multi-subject scenes require full-frame semantic segmentation (SAM 3).

### Step 01 Preparation Mode Comparison

| Mode | Engine | Cost | Multi-Person? | Latency | Infrastructure |
|---|---|---|---|---|---|
| **Cloud SAM 3 + Depth** | `fal-ai/sam-3/video` + `fal-ai/depth-anything-video` | **~$0.017 USD** | Yes (Full frame) | ~15–20s | Serverless GPUs |
| **Free Cloud Spaces** | `linoyts/SAM3-Video` + `depth-anything/Video-Depth-Anything` | **$0.00 (Free)** | Yes (Full frame) | Variable (Queue) | HF ZeroGPU |
| **Local Face Mesh** | MediaPipe TFLite (CPU) via `setup-face-mesh.sh` | **$0.00 (Free)** | No (Single speaker) | ~6–8s | Local CPU |

---

## 3. Audio Engineering: Demucs + Pitch Shift

1. **Vocal Isolation:** The source audio is extracted as uncompressed PCM WAV and processed through Demucs (`htdemucs` architecture), generating:
   - `vocals.wav` (Clean isolated speech/vocals)
   - `music.wav` (Isolated instrumental/backing track)
2. **Frequency Shift (+3 Semitones):** The vocal stem is frequency-shifted by +3 semitones without altering speed or duration. This modifies acoustic characteristics to avoid identity bleed while keeping syllable timing and lip-sync alignment locked.
3. **Guidance Multiplexing:** The shifted vocal track is re-muxed into `seedance-input.mp4`. No standalone audio files are sent to the synthesis API.
4. **Master Restoration:** When the generative model outputs the synthesized character video, its raw audio track is stripped and replaced with the pristine original uncompressed source audio.

---

## 4. Frontend & Network State Architecture

### Zero-Reload SPA Flow
The frontend avoids traditional form submissions and page reloads. When a video file is dispatched:
1. `XMLHttpRequest.upload.onprogress` tracks network transfer (0% – 30%), rendering exact byte counts.
2. The URL updates unobtrusively using `history.pushState(null, '', '/?job=' + jobId)`.
3. An active session stopwatch begins, counting elapsed wall-clock seconds.

### In-Memory Artifact Manifest
To prevent browser console pollution (404 errors), the backend `/jobs/{id}` response includes a `files: [...]` payload. Client-side existence checks use an in-memory `Set.has(filename)` lookup, eliminating redundant HTTP `HEAD` probing.

---

## 5. Security & Daemon Management

- **Zero Plain-Text Exposure:** API credentials (`FAL_KEY`, `ENHANCOR_API_KEY`, `REPLICATE_API_TOKEN`) are never exposed via client JSON payloads. The settings API exposes only a Boolean configuration status, and values are persisted locally in `.env` with strict `chmod 600` access controls.
- **Persistent Service Architecture:** The API server (`uvicorn`) and secure Cloudflare Tunnel (`cloudflared`) run as isolated macOS `LaunchAgents`, decoupled from terminal shells.
