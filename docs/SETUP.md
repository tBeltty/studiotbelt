# Installation & Setup Guide

This guide walks you through setting up **tBelt Studio** on your local machine or server.

---

## 1. System Prerequisites

The application requires **Python 3.12+** and media processing tools:

### macOS (Apple Silicon / Intel)
```bash
# Install system packages via Homebrew
brew install ffmpeg rubberband python@3.12 cloudflared
```

### Ubuntu / Debian / WSL2
```bash
sudo apt update
sudo apt install -y ffmpeg rubberband-cli python3 python3-venv python3-pip
# Optional: install cloudflared for callback tunnels
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared
```

### Windows
For Windows, running inside **WSL2 (Ubuntu)** is required to ensure compatibility with audio processing, MediaPipe, and shell scripts:
```bash
wsl --install -d Ubuntu
```

---

## 2. Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/tBeltty/studiotbelt.git
cd studiotbelt

# 2. Run automated setup script (creates virtual environment & installs dependencies)
bash setup.sh
```

Alternatively, set up manually:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

---

## 3. Optional: Local Face Mesh Tracking (MediaPipe)

To enable offline 2D/3D facial mesh tracking on CPU (MediaPipe 478-point landmark tracker):

```bash
bash setup-face-mesh.sh
```
This creates an isolated `.venv-face` environment with MediaPipe. The model (`face_landmarker.task`) downloads from Google's official storage on first use.

---

## 4. Verification & Diagnostics

Verify that all dependencies and binaries are correctly detected:

```bash
# Run unit test suite
python -m unittest discover tests

# Run environment diagnostics
python -m studiotbelt.cli.doctor
```

If everything is ready, launch the studio:
```bash
bash start.sh
# Or directly via Python module:
python -m studiotbelt.cli.launch
```
Then open your browser at **http://127.0.0.1:8770**.

---

## 5. Automated Setup via Coding Agent

If you are using an agentic coding assistant with shell and filesystem access (such as Codex, Claude Code, Cursor, or Antigravity), provide the following prompt:

```text
Set up this tBelt Studio project. Read docs/SETUP.md and follow it end to end:
1. Detect my OS and install missing system prerequisites (Python 3.12+, FFmpeg, Rubber Band, cloudflared) using the platform package manager.
2. Create the main virtual environment (.venv) and install dependencies (pip install -r requirements.txt && pip install -e .).
3. If local face mesh tracking is supported, configure the face mesh environment via bash setup-face-mesh.sh.
4. Create .env from .env.example without overwriting existing files or keys.
5. Run the test suite (python -m unittest discover tests) and environment diagnostics (python -m studiotbelt.cli.doctor).
6. Launch the application via bash start.sh (which manages the app and callback tunnel on a free port), verify that the UI responds, and output the local URL.
Work autonomously, respecting system permission prompts. Do not submit paid generations. If provider API keys are missing, launch the UI and state which keys are unconfigured.
```
