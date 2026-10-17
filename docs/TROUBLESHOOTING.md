# Troubleshooting

- **Webhook URL required**: Install `cloudflared` and launch via `bash start.sh`, or specify an external public HTTPS callback via `ENHANCOR_WEBHOOK_URL`. Never expose the application or `runs/` directory directly to the internet; the launcher maintains an isolated callback-only tunnel for asynchronous notifications.
- **Missing Rubber Band**: Install the `rubberband` CLI package (`brew install rubberband` or `sudo apt install rubberband-cli`) and verify with `python -m studiotbelt.cli.doctor`.
- **Missing credentials**: Add provider keys to `.env` in the repository root or enter them via the in-app **Settings** modal. Never write secrets to chat logs or console output.
- **401/403 or missing model**: Verify token balance, permissions, and active engine in Settings. When using OpenRouter or fal.ai, confirm your account has sufficient credits.
- **Invalid image or media download failure**: Provide real PNG, JPEG, or WebP character images and reachable URLs. The uploader rejects HTML error pages and empty responses.
- **Mask holes, edge noise, or background spill**: In Step 02, reject the mask, run RGB repair, and review the full clip again. Heuristic segmentation cleanups require human or automated visual verification.
- **Frame count or index mismatch**: Composition halts if frame counts differ. Verify that the output FPS and frame count match the source before passing the composite forward.
- **Original audio duration mismatch**: The exporter permits a short final-frame hold for small (0.25–0.5s) provider rounding deltas, recording `duration-adjustment.json`. Larger discrepancies halt export to prevent drift. Audio is never artificially time-stretched or looped.
- **No source audio**: Source videos must contain an audio track to extract pacing and lip-sync cues.
- **Job recovery**: Retrieve completed or pending jobs using `python -m studiotbelt.core.workflow resume <JOB_ID>` (or `--hd`), avoiding duplicate submission charges. Completed exports persist in `runs/<id>/`.
