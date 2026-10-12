"""Start the app plus optional callback-only tunnel, never expose the app itself."""
import os,subprocess,sys,time,shutil
from config import ROOT,setting
process=None
try:
    if not setting('ENHANCOR_WEBHOOK_URL') and shutil.which('cloudflared'):
        (ROOT/'.runtime-webhook.json').unlink(missing_ok=True)
        process=subprocess.Popen([sys.executable,str(ROOT/'webhook.py')])
        for _ in range(60):
            if setting('ENHANCOR_WEBHOOK_URL'):break
            if process.poll() is not None:break
            time.sleep(1)
    from providers import get_active_provider
    if get_active_provider() == 'enhancor' and not setting('ENHANCOR_WEBHOOK_URL'):
        print('UI available, but Enhancor generation needs a webhook. Install cloudflared and restart, or set ENHANCOR_WEBHOOK_URL.',flush=True)
    import uvicorn
    uvicorn.run('app:app',host=os.getenv('HOST','127.0.0.1'),port=int(os.getenv('PORT','8770')))
finally:
    if process:
        import signal
        process.send_signal(signal.SIGINT)
        try:process.wait(timeout=5)
        except subprocess.TimeoutExpired:process.terminate()
        (ROOT/'.runtime-webhook.json').unlink(missing_ok=True)
