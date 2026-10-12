"""Project-local credentials and hardened environment configuration."""
import os, sys, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parent

# Hardened PATH resolution for system daemons (macOS LaunchAgents, systemd, etc.)
KNOWN_BIN_DIRS = [
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    '/usr/local/bin',
    '/usr/local/sbin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin'
]
_current_path = os.environ.get('PATH', '')
_path_parts = _current_path.split(os.pathsep) if _current_path else []
for _d in KNOWN_BIN_DIRS:
    if os.path.isdir(_d) and _d not in _path_parts:
        _path_parts.insert(0, _d)
os.environ['PATH'] = os.pathsep.join(_path_parts)

def find_binary(name: str) -> str:
    """Finds binary with absolute path fallback. Raises clean diagnostic if missing."""
    resolved = shutil.which(name)
    if resolved:
        return resolved
    for d in KNOWN_BIN_DIRS:
        candidate = Path(d) / name
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    raise RuntimeError(
        f"El binario esencial '{name}' no fue encontrado en el sistema. "
        f"Instálalo ejecutando: brew install {name}"
    )

def load_env():
    path=ROOT/'.env'
    if path.exists():
        for line in path.read_text().splitlines():
            if not line.strip() or line.lstrip().startswith('#'):continue
            key,sep,value=line.partition('=')
            if sep:os.environ.setdefault(key.strip(),value.strip().strip('\"').strip("'"))

def setting(name,default=''):
    load_env()
    value=os.getenv(name,default)
    if name=='ENHANCOR_WEBHOOK_URL' and not value:
        import json
        try:value=json.loads((ROOT/'.runtime-webhook.json').read_text())['url']
        except (OSError,ValueError,KeyError):pass
    return value

def credential(name):
    value=setting(name)
    if not value:raise ValueError(f'Set {name} in this project’s .env file.')
    return value
