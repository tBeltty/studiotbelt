# Independent video workflow

For installation/onboarding requests, follow `docs/SETUP-AGENT.md` first. Do not run paid inference during setup. Distinguish a running UI from a generation-ready configuration.

Carry authorized jobs through preparation, quality review, generation and delivery without stopping after each processing stage. Ask only for missing creative choices or submission approval not already given. Never automatically purchase an HD upgrade: the user approves that step.

1. Preserve the source file and complete original audio.
2. Isolate vocals with Demucs, pitch +3 semitones with timing preserved, and embed them in the prepared composite. Do not attach separate audio to Seedance.
3. Generate depth with lucataco/depth-anything-video and retain its exact colors.
4. Obtain raw SAM 3 masks. If depth segmentation misses the subject or includes background, retry using original RGB detail and composite the original colored depth through those masks. Record this fallback.
5. Mandatory visual mask QA before EVERY generation: review the full clip, including all cuts, subject extremities, hair, hands, clothing, background spill, holes, alignment and flicker. Automated checks and sampled contact sheets alone do not establish full visual approval. Repair failures independently within the authorized task, then review again. Never approve a known-bad mask. Use mask_review to bind approval to current artifacts. User approval of the current mask may be recorded as such, without falsely claiming agent full-clip review.
6. Match the references and prompt to the actual subjects. A single Sirio replacement uses only Sirio's reference; never carry over the previous two-person mapping.
7. Show the exact creative prompt before submission. Existing explicit authorization to submit is sufficient; do not ask again unnecessarily. Submit through Enhancor as Seedance Edit draft by default.
8. Retrieve results and restore the entire untouched original source audio, discarding generated audio. Preserve draft artifacts. Report failures honestly; never claim submission or completion without an actual result.
9. On explicit approval, complete the draft at 1080p using draft_id and webhook_url, then restore original audio again.
10. Show the final preview and download. Keep status persisted and UI preview selection stable. Never expose credentials.

## Exact Model Category Requirement: Video Recasting / Character Replacement
The character generation stage (Step 03) requires a **Video Recasting / Video Character Replacement with Identity Transfer** model. It MUST NOT be confused with or substituted by:
- ❌ **Generic Text-to-Video or Image-to-Video models** (e.g. Sora, Runway Gen-2/3, standard Kling/Hailuo): These hallucinate brand new camera paths, change choreographies, and ruin shot-for-shot pacing.
- ❌ **Talking-Head / Avatar mesh retargeters** (e.g. LivePortrait, SadTalker): These crop down to 512×512 facial bounding boxes, warp faces into uncanny rubber, cut off actor bodies, and distort aspect ratios.
- ✅ **Video Recasting Models (Subject Identity Transfer)**: Models that accept a driving composite video + character reference images, track subject motion, gestures, camera framing, cuts, and lighting, and transfer the new character's identity across the full body while leaving background and choreography intact.

### Provider & Pricing Matrix for Video Recasting
The system maintains a provider-agnostic architecture allowing instant switching:

1. **Enhancor (ByteDance Seedance 2.5 Edit / Omni)**:
   - **Cost**: ~\$0.15 – \$0.35 USD per generation (via subscription credits).
   - **Best for**: Routine production and high-volume iterations.
   - **Routing**: Image reference uses Seedance Edit; video reference uses Omni multi-reference.
2. **fal.ai — Wan 2.2 Animate Replace (`fal-ai/wan/v2.2-14b/animate/replace`)**:
   - **Cost**: **\$0.08 / second** at 720p (~\$0.90 – \$1.20 for 15s) | **\$0.04 / second** at 480p (~\$0.60 for 15s).
   - **Best for**: Ultra-budget cloud testing without a fixed subscription. Open-weights video character swap preserving motion and scene lighting.
3. **fal.ai — MiniMax H3 Max Recast (`minimax/h3-max/recast`)**:
   - **Cost**: **\$0.45 / second** at 1080p (~\$6.75 for 15s) | **\$0.30 / second** at 768p (~\$4.50 for 15s).
   - **Best for**: Premium, high-end cinematic delivery where multi-person tracking, camera cuts, and maximum photorealism are strictly required.
4. **Replicate / ComfyUI Local**:
   - Replicate: Wan 2.2 Animate Replace on serverless GPUs.
   - ComfyUI Local: Free (\$0.00) using local AnimateDiff / IP-Adapter Video / Wan workflows on capable local GPUs.

## Reference-mode routing (required)
Enhancor Edit accepts exactly one video: the prepared source. If the replacement identity reference is a video, use multi_reference (Omni), with prepared source @Video1 and identity reference @Video2. Use the identity clip for appearance only unless the user explicitly asks to use its voice or performance. Do not convert that reference to pictures without permission. For image references, default to Edit. Show the actual mode in the UI and saved generation metadata. Omni requires duration and aspect ratio; use the source framing and nearest supported duration. Preserve the full source audio in the final export and disclose any necessary short last-frame hold.


## Step 01 Preparation & Motion Guidance Options

The system supports four distinct motion guidance and segmentation pipelines during Step 01:

### 1. Cloud SAM 3 + Depth Anything (via fal.ai)
- **Endpoints**: `fal-ai/sam-3/video` (\$0.005) and `fal-ai/depth-anything-video` (\$0.012).
- **Total Cost**: **~\$0.017 USD** for the entire clip.
- **Multi-Person Support**: ✅ **Full Multi-Subject Tracking**. Seamlessly tracks multiple people, bodies, clothing, background elements, and rapid camera cuts across the entire frame.
- **Speed**: Cloud serverless GPUs (~15–20s execution).

### 2. Free Cloud Hugging Face Spaces (Original Repo Default)
- **Endpoints**: `linoyts/SAM3-Video` and `depth-anything/Video-Depth-Anything`.
- **Requirements**: Free Hugging Face account and `HF_TOKEN`.
- **Total Cost**: **\$0.00 (100% Free)**.
- **Multi-Person Support**: ✅ **Full Multi-Subject Tracking**.
- **Trade-off**: Queue wait times on Hugging Face ZeroGPU during peak global traffic.

### 3. Free Local Face Mesh on Mac (MediaPipe TFLite)
- **Setup**: Install isolated worker via `bash setup-face-mesh.sh` (Python 3.12 required; `.venv-face`).
- **Engine**: Google Face Landmarker 478-point 3D landmark model via TensorFlow Lite CPU.
- **Total Cost**: **\$0.00 (100% Free, Zero API calls, 100% offline)**.
- ⚠️ **CRITICAL LOCAL / MAC LIMITATION — SINGLE CENTERED SPEAKER ONLY**:
  - The local pipeline relies on an adaptive portrait crop (`[x0=0.20*w, cw=0.60*w, ch=0.75*h]`) and single-landmark matrix interpolation.
  - **It CANNOT track multiple faces or bodies simultaneously** (e.g. duo dialogue scenes like Quavo & Takeoff).
  - In multi-person scenes, the local detector suffers tracking jumps, flickers, or locks onto only one actor, leaving other subjects unmasked.
  - **Rule**: For scenes containing 2 or more subjects, **always choose Depth + SAM 3** (Option 1 or Option 2). Never use Fast Face Mesh on multi-person footage.

### 4. Combined Depth + Face Mesh
- Select **Advanced + Face mesh** in UI or `workflow.py prepare VIDEO --mode depth_mesh`.
- Runs Depth/SAM segmentation first, then overlays the 478-point landmark mesh on the depth composite.
- Review BOTH mask coverage and facial tracking before signing off. Artifact hashes gate downstream submission.
