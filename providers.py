from pathlib import Path
import os, json, time, requests, concurrent.futures
from config import setting, credential

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / '.env'

PROVIDER_SPECS = {
    'fal': {
        'id': 'fal',
        'name': 'fal.ai',
        'description': 'Pay-as-you-go video recasting: Wan 2.2 Animate Replace ($0.04-$0.08/s) & MiniMax H3 Max Recast ($0.30-$0.45/s)',
        'env_var': 'FAL_KEY',
        'help_url': 'https://fal.ai/dashboard/keys'
    },
    'enhancor': {
        'id': 'enhancor',
        'name': 'Enhancor (Seedance 2.5)',
        'description': 'ByteDance Seedance 2.5 Edit & Omni ($45/mo plan required for API; ~$0.15-$0.35/draft in credits)',
        'env_var': 'ENHANCOR_API_KEY',
        'help_url': 'https://app.enhancor.ai/api-dashboard'
    },
    'replicate': {
        'id': 'replicate',
        'name': 'Replicate',
        'description': 'Wan 2.2 Animate Replace & video-to-video diffusion on serverless GPUs (billed per GPU-second)',
        'env_var': 'REPLICATE_API_TOKEN',
        'help_url': 'https://replicate.com/account/api-tokens'
    },
    'comfy': {
        'id': 'comfy',
        'name': 'ComfyUI Local',
        'description': 'Self-hosted local video recasting workflow (100% free with dedicated local GPU)',
        'env_var': 'COMFY_URL',
        'help_url': 'http://127.0.0.1:8188'
    }
}

def get_active_provider():
    pref = os.environ.get('ACTIVE_PROVIDER') or setting('ACTIVE_PROVIDER')
    if pref in PROVIDER_SPECS and is_provider_configured(pref):
        return pref
    # Auto-detection based on configured keys
    for p in ['fal', 'enhancor', 'replicate', 'comfy']:
        if is_provider_configured(p):
            return p
    return 'fal'

def is_provider_configured(provider_id):
    spec = PROVIDER_SPECS.get(provider_id)
    if not spec:
        return False
    val = os.environ.get(spec['env_var']) or setting(spec['env_var']) or ''
    val = val.strip()
    return bool(val) and not any(x in val.lower() for x in ['your_key', 'replace_me', 'placeholder'])

def get_settings():
    active = get_active_provider()
    providers_info = {}
    for pid, spec in PROVIDER_SPECS.items():
        providers_info[pid] = {
            'id': pid,
            'name': spec['name'],
            'description': spec['description'],
            'configured': is_provider_configured(pid),
            'env_var': spec['env_var'],
            'help_url': spec['help_url']
        }
    return {
        'active_provider': active,
        'has_any_provider': any(p['configured'] for p in providers_info.values()),
        'providers': providers_info
    }

def update_settings(provider_id, key=None, extra=None):
    if provider_id not in PROVIDER_SPECS:
        raise ValueError(f'Proveedor desconocido: {provider_id}')

    os.environ['ACTIVE_PROVIDER'] = provider_id
    updates = {'ACTIVE_PROVIDER': provider_id}

    if key:
        env_var = PROVIDER_SPECS[provider_id]['env_var']
        os.environ[env_var] = key.strip()
        updates[env_var] = key.strip()

    ALLOWED_ENV_VARS = {
        'ACTIVE_PROVIDER',
        'FAL_KEY',
        'ENHANCOR_API_KEY',
        'ENHANCOR_BASE_URL',
        'ENHANCOR_WEBHOOK_URL',
        'REPLICATE_API_TOKEN',
        'COMFY_URL',
        'MEDIA_HOST',
        'MEDIA_HOST_FALLBACKS',
        'CATBOX_USERHASH'
    }

    if extra and isinstance(extra, dict):
        for k, v in extra.items():
            if k in ALLOWED_ENV_VARS and v is not None:
                cleaned = str(v).strip()
                os.environ[k] = cleaned
                updates[k] = cleaned

    # Safely persist to .env
    lines = []
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text().splitlines()

    for k, v in updates.items():
        lines = [line for line in lines if not line.strip().startswith(f'{k}=')]
        lines.append(f'{k}="{v}"')

    ENV_PATH.write_text('\n'.join(lines) + '\n')
    try:
        os.chmod(ENV_PATH, 0o600)
    except Exception:
        pass

    return get_settings()
