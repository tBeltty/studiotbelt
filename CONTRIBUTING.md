# Contributing to tBelt Studio

Thank you for your interest in contributing to **tBelt Studio**. We welcome pull requests, bug reports, and suggestions that adhere to the engineering standards described below.

---

## 1. Development Principles

1. **Lightweight Local Footprint:** All local operations (MediaPipe, FFmpeg, Demucs) must remain viable on consumer-grade hardware (including Apple Silicon with 8 GB unified memory). Heavy inference must be delegated to cloud providers.
2. **Deterministic Audio Synchronization:** Audio timing must remain sample-accurate. Any modifications to audio pipelines must preserve duration and syllable alignment.
3. **No Page Reloads:** All UI enhancements must respect the Single Page Application (SPA) architecture. Use `history.pushState` and reactive state updates.
4. **Bilingual i18n:** Every user-facing UI string must include entries in both Spanish (`es`) and English (`en`) inside `static/i18n.js`.

---

## 2. Setting Up the Local Environment

```bash
# 1. Clone the repository
git clone https://github.com/tBeltty/studiotbelt.git
cd studiotbelt

# 2. Set up the Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Configure credentials
cp .env.example .env
# Edit .env and supply your FAL_KEY

# 4. Launch development server
python -m uvicorn app:app --host 127.0.0.1 --port 8770 --reload
```

---

## 3. Pull Request Guidelines

- **Atomic Commits:** Structure commits using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `perf:`, `refactor:`).
- **No Console Warnings/Errors:** Ensure your changes do not introduce 404s, unhandled promise rejections, or memory leaks in the browser console.
- **Documentation Updates:** When changing endpoints or configuration, update `README.md`, `docs/ARCHITECTURE.md`, and `CHANGELOG.md`.
