# syntax=docker/dockerfile:1
FROM python:3.12-slim

# Set non-interactive and unbuffered environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8770

# Install required media processing binaries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    rubberband-cli \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and install package
COPY . .
RUN pip install --no-cache-dir -e .

# Create workspace directory for runs
RUN mkdir -p /app/runs

# Default port (can be overridden by Cloud Run / Hugging Face Spaces via PORT env)
EXPOSE 8770

# Start server
CMD ["python", "-m", "studiotbelt.cli.launch"]
