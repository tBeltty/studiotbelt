"""Start the app plus optional callback-only tunnel, never expose the app itself."""
import os,subprocess,sys,time,shutil
from studiotbelt.config import ROOT,setting

def main():
    process=None
    try:
        if not setting('ENHANCOR_WEBHOOK_URL') and shutil.which('cloudflared'):
            (ROOT/'.runtime-webhook.json').unlink(missing_ok=True)
            webhook_script = ROOT / 'webhook.py'
            if webhook_script.exists():
                process=subprocess.Popen([sys.executable,str(webhook_script)])
            else:
                process=subprocess.Popen([sys.executable, '-m', 'studiotbelt.api.webhook'])
            for _ in range(60):
                if setting('ENHANCOR_WEBHOOK_URL'):break
                if process.poll() is not None:break
                time.sleep(1)
        from studiotbelt.services.providers import get_active_provider
        if get_active_provider() == 'enhancor' and not setting('ENHANCOR_WEBHOOK_URL'):
            print('UI available, but Enhancor generation needs a webhook. Install cloudflared and restart, or set ENHANCOR_WEBHOOK_URL.',flush=True)
        import uvicorn
        uvicorn.run('studiotbelt.api.app:app',host=os.getenv('HOST','127.0.0.1'),port=int(os.getenv('PORT','8770')))
    finally:
        if process:
            import signal
            process.send_signal(signal.SIGINT)
            try:process.wait(timeout=5)
            except subprocess.TimeoutExpired:process.terminate()
            (ROOT/'.runtime-webhook.json').unlink(missing_ok=True)

if __name__ == '__main__':
    main()

