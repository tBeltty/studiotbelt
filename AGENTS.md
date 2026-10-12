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

## Model Requirements
Step 03 requires video-to-video character replacement models with full-body identity transfer that accept a driving composite video alongside character reference assets, maintaining original camera framing, cuts, lighting, and motion choreography.

### Provider & Pricing Matrix for Video Recasting
The system maintains a provider-agnostic architecture:

1. **Enhancor (ByteDance Seedance 2.5 Edit / Omni)**:
   - Cost: ~\$0.15 – \$0.35 USD per generation (subscription credits, \$45/mo plan required for API).
   - Routing: Image reference uses Seedance Edit; video reference uses Omni multi-reference.
2. **fal.ai — Wan 2.2 Animate Replace (`fal-ai/wan/v2.2-14b/animate/replace`)**:
   - Cost: \$0.08/s at 720p (~\$1.20 for 15s) | \$0.04/s at 480p (~\$0.60 for 15s). Pay-as-you-go.
3. **fal.ai — MiniMax H3 Max Recast (`minimax/h3-max/recast`)**:
   - Cost: \$0.45/s at 1080p (~\$6.75 for 15s) | \$0.30/s at 768p (~\$4.50 for 15s). Pay-as-you-go.
4. **Replicate / ComfyUI Local**:
   - Replicate: Wan 2.2 on serverless GPUs.
   - ComfyUI Local: Free (\$0.00) with local GPU.

## Reference-mode routing (required)
Enhancor Edit accepts exactly one video: the prepared source. If the replacement identity reference is a video, use multi_reference (Omni), with prepared source @Video1 and identity reference @Video2. Use the identity clip for appearance only unless the user explicitly asks to use its voice or performance. Do not convert that reference to pictures without permission. For image references, default to Edit. Show the actual mode in the UI and saved generation metadata. Omni requires duration and aspect ratio; use the source framing and nearest supported duration. Preserve the full source audio in the final export and disclose any necessary short last-frame hold.


## Step 01 Preparation & Motion Guidance Options

The system supports three motion guidance pipelines:

1. **Cloud SAM 3 + Depth Anything (fal.ai)**:
   - Endpoints: `fal-ai/sam-3/video` (\$0.005) + `fal-ai/depth-anything-video` (\$0.012).
   - Cost: ~\$0.017 USD per clip. Full multi-subject tracking across the entire frame.
2. **Free Cloud Hugging Face Spaces**:
   - Endpoints: `linoyts/SAM3-Video` + `depth-anything/Video-Depth-Anything` via free `HF_TOKEN`.
   - Cost: \$0.00 (Free). Full multi-subject tracking. Subject to ZeroGPU queue times.
3. **Free Local Face Mesh on Mac (MediaPipe TFLite)**:
   - Setup: `bash setup-face-mesh.sh` (Python 3.12, `.venv-face`).
   - Cost: \$0.00 (Free, offline).
   - Limitation: Single-subject only. The local TFLite crop window (`[x0=0.20*w, cw=0.60*w, ch=0.75*h]`) tracks one face per frame. Multi-subject scenes require Depth + SAM 3.
4. **Combined Depth + Face Mesh**:
   - Select `depth_mesh` mode. Runs Depth/SAM first, then overlays the 478-point landmark mesh on the depth composite.
