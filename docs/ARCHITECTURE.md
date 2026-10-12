# System Architecture & Technical Specifications

**tBelt Studio** (`studiotbelt`) is an automated system for video character synthesis and motion transfer. It combines local CPU-efficient signal processing (computer vision and digital audio) with cloud-accelerated neural diffusion models.

---

## 1. Architectural Philosophy: Division of Labor

The system decouples processing stages based on computational efficiency between consumer CPU hardware and cloud GPU clusters:

```mermaid
flowchart TD
    subgraph Client ["Client Browser (SPA)"]
        UI["Modern Web Interface\n(Bilingual ES/EN, Zero Reloads)"]
        Upload["XHR Upload\n(Live Bytes & Percentage)"]
        Tracker["Real-time Progress Tracker\n(4 Milestones + Timer)"]
    end

    subgraph Local ["Local Server (Apple Silicon / CPU)"]
        Norm["FFmpeg Acceleration\n(24 fps, Scaled, ~2.8s)"]
        Mesh["MediaPipe Face Mesh\n(478 3D Landmarks, TFLite CPU)"]
        Audio["Demucs Vocal Isolation\n(CPU htdemucs) + Pitch Shift (+3 st)"]
        Mux["Audio Multiplexer\n(Embedded Guidance Stream)"]
    end

    subgraph Cloud ["Cloud GPU Infrastructure"]
        Fal["fal.ai Live Portrait / Video-to-Video\n(Enterprise A100 Clusters)"]
        Draft["Draft Synthesis Validation"]
        HD["Approved 1080p Render"]
    end

    UI --> Upload --> Norm
    Norm --> Mesh
    Norm --> Audio
    Mesh & Audio --> Mux
    Mux --> Tracker
    Tracker --> Draft --> Fal
    Fal --> HD
    HD --> UI
```

1. **Local CPU (Preparation & Signal Isolation):**
   - **Video Normalization:** Frame rate adjustment to 24 fps and downscaling via FFmpeg native C-filters.
   - **Facial Landmark Mesh:** 478 3D points calculated in real time using Google MediaPipe FaceLandmarker via TensorFlow Lite CPU inference.
   - **Audio Separation & Modulation:** Local Demucs (`htdemucs`) isolates vocals and instrumental tracks. Vocals are pitch-shifted +3 semitones while retaining identical temporal alignment.
   - **Resource Footprint:** Maximum RAM peak of ~1.1 GB, allowing smooth execution on low-memory devices (such as entry-level Mac mini 8GB).

2. **Cloud GPU (Neural Synthesis & Diffusion):**
   - Heavy diffusion steps (Live Portrait and Video-to-Video character replacement) are dispatched to **fal.ai** enterprise GPU infrastructure.
   - Two-stage lifecycle: rapid low-cost draft preview followed by explicit human approval for full 1080p master export.

---

## 2. Facial Landmark & Motion Guidance

### Dynamic Cropping Geometry
MediaPipe's neural model was optimized on portrait-framing datasets. In wide or cinematic video footage, passing raw 1080p frames often reduces detection confidence. The engine applies an adaptive bounding box:

$$\text{Crop} = \left[ x_0 = 0.20 \cdot W, \, y_0 = 0, \, w = 0.60 \cdot W, \, h = 0.75 \cdot H \right]$$

### Temporal Occlusion Smoothing
During rapid head turns, yaw rotations, or brief downward glances, detection confidence can drop momentarily. Instead of terminating execution with a tracking fault, the landmark processor carries forward the previous valid landmark matrix and linearly interpolates coordinates until re-acquisition, guaranteeing uninterrupted guidance frames.

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

- **Zero Plain-Text Exposure:** API credentials (`FAL_KEY`) are managed strictly via environment variables with `chmod 600` access controls.
- **Persistent Service Architecture:** The API server (`uvicorn`) and secure Cloudflare Tunnel (`cloudflared`) run as isolated macOS `LaunchAgents`, decoupled from terminal shells.
