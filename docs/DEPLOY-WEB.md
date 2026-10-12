# Web Deployment & Cloud Processing Guide

This guide details how to deploy and operate **tBelt Studio** in a **100% web environment**, allowing users to access the studio through a web browser without installing Python, FFmpeg, local models, or possessing a local GPU.

---

## Architecture: Distributed Cloud vs. Local Workloads

The pipeline delegates compute-intensive tasks to serverless APIs or lightweight container environments:

| Stage | Component | 100% Cloud Processing | Local Execution |
|---|---|---|---|
| **01. Vocal Separation** | Demucs (`htdemucs`) | **Replicate API** (`REPLICATE_API_TOKEN`) | CPU Demucs in container |
| **02. 3D Depth** | Video Depth Anything | **Replicate** / **HF ZeroGPU** (Free) / **fal.ai** | No local GPU needed |
| **03. Segmentation** | SAM 3 Video Mask | **Replicate** / **HF ZeroGPU** (Free) / **fal.ai** | No local GPU needed |
| **04. Pitch Modulation** | Pitch +3 semitones | **Native FFmpeg** (`asetrate` + `atempo`) in container | Rubber Band CLI |
| **05. Character Synthesis** | Video-to-Video Recast | **Replicate** / **Enhancor** / **fal.ai** | Self-hosted ComfyUI |

---

## Option 1: Hugging Face Spaces (Free with Docker)

Hugging Face Spaces provides container hosting with a public SSL URL at no cost.

1. **Create a new Space**:
   - Navigate to [huggingface.co/new-space](https://huggingface.co/new-space).
   - Space Name: `studiotbelt` (or your preferred name).
   - Space SDK: Select **Docker** -> **Blank**.
   - Hardware: **CPU Basic (2 vCPU, 16 GB RAM)** — Free.
2. **Upload Repository**:
   - Connect your GitHub repository or push directly via `git push`.
3. **Configure Environment Variables (Secrets)**:
   - In your Space **Settings** -> **Repository Secrets**, define:
     - `PORT`: `7860`
     - `ACTIVE_PROVIDER`: `replicate` (or `enhancor` or `fal`)
     - Credentials for your chosen engine (`REPLICATE_API_TOKEN`, `ENHANCOR_API_KEY`, `FAL_KEY`, or `HF_TOKEN`)
4. **Access**: The application will be reachable at `https://huggingface.co/spaces/<user>/studiotbelt`.

---

## Option 2: PaaS Platforms (Railway, Render, Fly.io, Cloud Run)

Any container-compatible hosting platform can build and deploy the project:

### Railway
1. Sign in to [railway.app](https://railway.app) and select **New Project** -> **Deploy from GitHub repo**.
2. Select the `studiotbelt` repository. Railway automatically detects the included `Dockerfile`.
3. Open **Variables** and configure your API credentials (`REPLICATE_API_TOKEN`, `ENHANCOR_API_KEY`, `FAL_KEY`, etc.).
4. In **Settings** -> **Networking**, generate a public domain.

### Google Cloud Run
```bash
# Build and deploy to Cloud Run
gcloud run deploy studiotbelt \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "ACTIVE_PROVIDER=replicate,REPLICATE_API_TOKEN=your_token"
```

### Render
1. Create a new **Web Service** connected to your repository.
2. Render detects the **Docker** runtime environment.
3. Configure your environment variables in the dashboard and deploy.

---

## Option 3: VPS Server with Docker

For dedicated virtual private servers (Ubuntu, Debian):

```bash
# 1. Clone repository
git clone https://github.com/tBeltty/studiotbelt.git
cd studiotbelt

# 2. Configure environment
cp .env.example .env
nano .env  # Enter your API credentials (REPLICATE_API_TOKEN, ENHANCOR_API_KEY, FAL_KEY, etc.)

# 3. Build Docker container
docker build -t studiotbelt .

# 4. Run container
docker run -d \
  --name studiotbelt \
  -p 8770:8770 \
  --env-file .env \
  --restart unless-stopped \
  studiotbelt
```

To expose the service with SSL, configure Nginx as a reverse proxy or use Cloudflare Tunnel:
```bash
cloudflared tunnel --url http://127.0.0.1:8770
```

---

## Zero Local Compute Setup (100% Serverless APIs)

To ensure the web server only orchestrates jobs without CPU-heavy stem separation:

1. **Cloud Audio Isolation**:
   Set `REPLICATE_API_TOKEN` in your environment. The `separate()` method in `audio_workflow.py` automatically routes Demucs execution to Replicate GPU infrastructure.
2. **Cloud Depth & Segmentation**:
   Select `depth` mode with `huggingface` (free ZeroGPU via `HF_TOKEN`), `replicate`, or `fal` (via `FAL_KEY`). All masks and depth frames process in the cloud.
3. **Character Recasting**:
   Select your engine in `ACTIVE_PROVIDER`: `replicate` (Wan 2.2 / LivePortrait), `enhancor` (ByteDance Seedance 2.5), or `fal`. Ingestion and rendering occur on remote GPU clusters.
