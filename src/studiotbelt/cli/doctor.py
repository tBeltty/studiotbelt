"""Offline checks; never prints credential values or starts paid calls."""
import argparse,importlib,shutil,sys
from studiotbelt.config import setting, ROOT

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--require-keys',action='store_true');parser.add_argument('--mesh',action='store_true');args=parser.parse_args()
    failed=sys.version_info<(3,12)
    print('Python:',sys.version.split()[0], '(3.12+ required)')
    for name in ['av','numpy','PIL','requests','fastapi','uvicorn','multipart','gradio_client','scipy']:
        try:importlib.import_module(name);print(name+': OK')
        except Exception as exc:print(name+': FAILED ('+type(exc).__name__+')');failed=True
    binary_ffmpeg=shutil.which('ffmpeg');print('ffmpeg:', 'OK' if binary_ffmpeg else 'MISSING — install via brew or apt');failed=failed or not binary_ffmpeg
    binary_rubber=shutil.which('rubberband');print('rubberband:', 'OK' if binary_rubber else 'OPTIONAL (FFmpeg pitch filter active)')
    if args.mesh:
        import subprocess
        worker=ROOT/'.venv-face/bin/python'
        ready=worker.exists() and subprocess.run([str(worker),'-c','import mediapipe,av,PIL,numpy'],capture_output=True).returncode==0
        print('Face mesh worker: '+('OK' if ready else 'MISSING — run bash setup-face-mesh.sh'))
        failed=failed or not ready
    from studiotbelt.services.providers import PROVIDER_SPECS, is_provider_configured, get_active_provider
    active = get_active_provider()
    configured_providers = [p for p in PROVIDER_SPECS if is_provider_configured(p)]

    print(f"Active provider: {active if active else 'None (configure in Settings or set ACTIVE_PROVIDER)'}")
    for pid, spec in PROVIDER_SPECS.items():
        is_conf = is_provider_configured(pid)
        marker = ' [ACTIVE]' if pid == active else ''
        state_str = 'configured' if is_conf else 'not configured'
        print(f"  {spec['name']} ({spec['env_var']}): {state_str}{marker}")

    webhook_missing = False
    if active == 'enhancor':
        if not setting('ENHANCOR_WEBHOOK_URL'):
            print('  Enhancor Webhook: not running/configured — install cloudflared and launch the app, or set ENHANCOR_WEBHOOK_URL')
            webhook_missing = True

    if failed:
        print('DEPENDENCIES NOT READY')
        return 1

    has_valid_provider = bool(configured_providers)
    if active and not is_provider_configured(active):
        has_valid_provider = False

    if not has_valid_provider or (active == 'enhancor' and webhook_missing):
        print('LOCAL UI READY; GENERATION BLOCKED until your chosen provider key is configured.')
        return 2 if args.require_keys else 0
    print('LOCAL SETUP READY; provider access/balance has not been verified by this offline check.')
    return 0
if __name__=='__main__':sys.exit(main())
