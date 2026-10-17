from pathlib import Path
import os, json, requests, re, time, concurrent.futures
from studiotbelt.config import credential, setting
from studiotbelt.core.audio_workflow import finish_preview

def is_fal_active():
    key = setting('FAL_KEY')
    return bool(key) and not any(x in key.lower() for x in ['your_key', 'replace_me', 'placeholder'])

def submit_fal(folder, prompt, sirio, tein=None, status=print, api_key=None):
    if api_key:
        os.environ['FAL_KEY'] = api_key
    import fal_client
    folder = Path(folder)
    from studiotbelt.vision.mask_review import require_approved, is_mesh
    require_approved(folder)
    if (folder/'seedance-response.json').exists():
        raise ValueError('This job already has a provider response. Resume it; prepare a new job for a deliberate variation.')

    if not (folder/'audio-manifest.json').exists():
        raise ValueError('Audio separation must complete before submission.')

    from studiotbelt.core.audio_workflow import prepare_seedance_video
    status('Pitching isolated vocals +3 semitones and embedding in guided video')
    prepared = folder/'seedance-input.mp4' if (folder/'seedance-input.mp4').exists() else prepare_seedance_video(folder)

    status('Uploading video and character references to fal.ai high-speed CDN')
    video_url = fal_client.upload_file(str(prepared))
    ref_images = [fal_client.upload_file(str(sirio))]
    if tein:
        ref_images.append(fal_client.upload_file(str(tein)))

    model_id = setting('FAL_MODEL', 'minimax/h3-max/recast')
    status(f'Submitting to {model_id} via fal.ai')

    if 'recast' in model_id:
        args = {
            'video_url': video_url,
            'reference_image_urls': ref_images,
            'prompt': prompt,
            'resolution': setting('FAL_RECAST_RESOLUTION', '1080P'),
            'enhance_realism': True
        }
    elif 'wan' in model_id or 'replace' in model_id:
        args = {
            'video_url': video_url,
            'image_url': ref_images[0],
            'resolution': setting('FAL_WAN_RESOLUTION', '720p'),
            'guidance_scale': 1.0
        }
    elif 'live-portrait' in model_id:
        args = {
            'video_url': video_url,
            'image_url': ref_images[0]
        }
    else:
        args = {
            'video_url': video_url,
            'prompt': prompt
        }

    handler = fal_client.submit(model_id, arguments=args)
    ident = handler.request_id

    req_data = {'provider': 'fal.ai', 'model': model_id, 'arguments': args, 'prompt': prompt, 'is_draft': True}
    (folder/'seedance-request.json').write_text(json.dumps(req_data, indent=2))
    res_data = {'requestId': ident, 'provider': 'fal.ai', 'model': model_id}
    (folder/'seedance-response.json').write_text(json.dumps(res_data, indent=2))
    (folder/'generation.json').write_text(json.dumps({
        'request_id': ident,
        'prompt': prompt,
        'video': 'seedance-result.mp4',
        'mode': 'fal_recast' if 'recast' in model_id else 'fal_video',
        'provider': 'fal.ai'
    }, indent=2))
    status(f'fal.ai generation queued: {ident}')
    return ident

def wait_and_finish_fal(folder, request_id, status=print):
    import fal_client
    folder = Path(folder)
    resp_file = folder/'seedance-response.json'
    model_id = 'minimax/h3-max/recast'
    if resp_file.exists():
        model_id = json.loads(resp_file.read_text()).get('model', model_id)

    status('Rendering video through fal.ai…')
    for _ in range(180):
        s = fal_client.status(model_id, request_id, with_logs=True)
        status_str = getattr(s, 'status', str(s))
        (folder/'provider-status.json').write_text(json.dumps({'status': status_str, 'request_id': request_id}, indent=2))
        status(f'fal.ai status: {status_str}')

        if 'COMPLETED' in status_str or 'OK' in status_str or type(s).__name__ == 'Completed':
            status('Retrieving result from fal.ai')
            res = fal_client.result(model_id, request_id)
            video_url = None
            if isinstance(res, dict):
                if 'video' in res and isinstance(res['video'], dict):
                    video_url = res['video'].get('url')
                elif 'output' in res and isinstance(res['output'], dict):
                    video_url = res['output'].get('url')
                elif 'video_url' in res:
                    video_url = res['video_url']

            if not video_url:
                raise ValueError(f'Could not find video URL in fal.ai result: {res}')

            r = requests.get(video_url, timeout=180)
            r.raise_for_status()
            (folder/'seedance-result.mp4').write_bytes(r.content)
            status('Restoring entire untouched original source audio · discarding generated audio')
            finish_preview(folder/'seedance-result.mp4', folder)
            return

        if 'FAILED' in status_str or 'CANCELED' in status_str:
            raise RuntimeError(f'fal.ai task {status_str}')

        time.sleep(5)
    raise TimeoutError('fal.ai task is still pending. Request ID saved.')

def submit_hd_fal(folder):
    folder = Path(folder)
    if (folder/'hd/response.json').exists():
        raise ValueError('HD already submitted. Resume its saved request.')
    original = json.loads((folder/'seedance-request.json').read_text())
    if not (folder/'final-preview.mp4').exists():
        raise ValueError('A completed draft is required before generating high resolution.')

    hd = folder/'hd'
    hd.mkdir(exist_ok=True)
    source = hd/'upload.mp4'
    if not source.exists():
        import shutil; shutil.copy2(folder/'upload.mp4', source)

    import fal_client
    model_id = original.get('model', 'minimax/h3-max/recast')
    args = dict(original.get('arguments', {}))
    args['resolution'] = setting('FAL_HD_RESOLUTION', '1080P')

    handler = fal_client.submit(model_id, arguments=args)
    ident = handler.request_id
    res_data = {'requestId': ident, 'provider': 'fal.ai', 'model': model_id}
    (hd/'request.json').write_text(json.dumps(args, indent=2))
    (hd/'response.json').write_text(json.dumps(res_data, indent=2))
    (hd/'seedance-response.json').write_text(json.dumps(res_data, indent=2))
    return ident

def submit_replicate(folder, prompt, sirio, tein=None, status=print, api_key=None):
    import replicate
    folder = Path(folder)
    from studiotbelt.vision.mask_review import require_approved, is_mesh
    require_approved(folder)
    if (folder/'seedance-response.json').exists():
        raise ValueError('Este trabajo ya tiene una respuesta de proveedor registrada.')

    if not (folder/'audio-manifest.json').exists():
        raise ValueError('El aislamiento de audio debe completarse antes de enviar.')

    from studiotbelt.core.audio_workflow import prepare_seedance_video
    status('Preparando video guía con audio aislado embedido...')
    prepared = folder/'seedance-input.mp4' if is_mesh(folder) else prepare_seedance_video(folder)

    status('Iniciando tarea en Replicate (LivePortrait)...')
    model = setting('REPLICATE_MODEL', 'fofr/live-portrait')
    token = api_key or os.environ.get('REPLICATE_API_TOKEN') or setting('REPLICATE_API_TOKEN')
    if api_key:
        os.environ['REPLICATE_API_TOKEN'] = api_key
    client = replicate.Client(api_token=token)

    with open(prepared, 'rb') as vf, open(sirio, 'rb') as imgf:
        prediction = client.predictions.create(
            model=model,
            input={
                'driving_video': vf,
                'source_image': imgf
            }
        )
    ident = prediction.id
    res_data = {'requestId': ident, 'provider': 'replicate', 'model': model}
    (folder/'seedance-request.json').write_text(json.dumps({'provider': 'replicate', 'model': model, 'prompt': prompt}, indent=2))
    (folder/'seedance-response.json').write_text(json.dumps(res_data, indent=2))
    (folder/'generation.json').write_text(json.dumps({
        'request_id': ident,
        'prompt': prompt,
        'video': 'seedance-result.mp4',
        'provider': 'replicate',
        'model': model
    }, indent=2))
    status(f'Tarea en Replicate enviada: {ident}')
    return ident

def wait_and_finish_replicate(folder, request_id, status=print):
    import replicate
    folder = Path(folder)
    token = os.environ.get('REPLICATE_API_TOKEN') or setting('REPLICATE_API_TOKEN')
    client = replicate.Client(api_token=token)
    status('Procesando video en Replicate…')
    for _ in range(180):
        prediction = client.predictions.get(request_id)
        if prediction.status == 'succeeded':
            status('Descargando resultado de Replicate...')
            output_url = prediction.output
            if isinstance(output_url, list):
                output_url = output_url[0]
            r = requests.get(str(output_url), timeout=180)
            r.raise_for_status()
            (folder/'seedance-result.mp4').write_bytes(r.content)
            status('Restaurando audio original...')
            finish_preview(folder/'seedance-result.mp4', folder)
            return
        elif prediction.status in ['failed', 'canceled']:
            raise RuntimeError(f'Tarea de Replicate fallida: {prediction.error}')
        time.sleep(5)
    raise TimeoutError('La tarea de Replicate sigue pendiente.')

def submit_enhancor(folder, prompt, sirio, tein=None, status=print, api_key=None):
    folder = Path(folder)
    from studiotbelt.vision.mask_review import require_approved, is_mesh
    require_approved(folder)
    if (folder/'seedance-response.json').exists():raise ValueError('This job already has a provider response. Resume it; prepare a new job for a deliberate variation.')
    key = api_key or credential('ENHANCOR_API_KEY')
    if not setting('ENHANCOR_WEBHOOK_URL'):raise ValueError('Webhook URL required. Install cloudflared and restart the app, or set ENHANCOR_WEBHOOK_URL.')
    if not (folder/'audio-manifest.json').exists():raise ValueError('Audio separation must complete before submission.')
    from studiotbelt.core.audio_workflow import prepare_seedance_video
    status('Pitching isolated vocals +3 semitones and embedding in colored-depth video')
    prepared=folder/'seedance-input.mp4' if is_mesh(folder) else prepare_seedance_video(folder)
    status('Uploading video with embedded vocals and character references')
    from studiotbelt.services.media_host import upload
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:urls=list(pool.map(upload,[prepared,sirio]+([tein] if tein else [])))
    enh_res = setting('ENHANCOR_DRAFT_RESOLUTION', '1080p')
    p={'resolution':enh_res,'output_format':'mp4','pass_faces':True,'webhook_url':setting('ENHANCOR_WEBHOOK_URL','')}
    p.update(mode='edit',is_draft=True,aspect_ratio='adaptive',videos=[urls[0]],audios=[],images=urls[1:],prompt=prompt.replace('@Audio1', 'the audio embedded in @Video1')+'\n@Video1 contains the colored-depth composite and embedded isolated vocals pitched up three semitones, without the music bed; use its embedded audio for performance and lip synchronization. '+('@Image1 is the primary character reference; @Image2 is the secondary character reference.' if tein else '@Image1 is the only replacement character reference.'));p.pop('duration',None)
    if Path(sirio).suffix.lower() in ['.mp4','.mov','.webm']:
        import av
        with av.open(str(prepared)) as source:
            seconds=float(source.duration/av.time_base)
            stream=source.streams.video[0]
            ratio=stream.width/stream.height
        ratios={'16:9':16/9,'9:16':9/16,'1:1':1,'4:3':4/3,'3:4':3/4,'21:9':21/9}
        p.update(mode='multi_reference',duration=str(max(4,min(30,round(seconds)))),aspect_ratio=min(ratios,key=lambda r:abs(ratios[r]-ratio)))
        p['videos']=[urls[0],urls[1]]
        p['images']=urls[2:]
        p['prompt']=prompt+'\n@Video1 is the source edit and contains isolated vocals pitched +3 semitones. @Video2 is only the primary character visual identity reference. Use only @Video1 audio for speech timing.'
    if is_mesh(folder):
        mesh_mode=json.loads((folder/'workflow-mode.json').read_text()).get('mode')
        description='depth composite with face mesh overlay' if mesh_mode=='depth_mesh' else 'original video with face mesh overlay'
        p['prompt']=p['prompt'].replace('colored-depth composite',description)+' Remove all face mesh lines and any depth colors from the output; use them only for expression and lip motion guidance. Replace the entire original identity including hair. Preserve the exact embedded dialogue and timing.'
    (folder/'seedance-request.json').write_text(json.dumps(p,indent=2));h={'x-api-key':key};base=setting('ENHANCOR_BASE_URL','https://apireq.enhancor.ai/api/seedance2.5/v1').rstrip('/')+'/'
    r=requests.post(base+'queue',headers=h,json=p,timeout=90);
    if not r.ok:
        (folder/'submission-error.json').write_text(r.text)
        raise ValueError(f'Enhancor rejected submission ({r.status_code}): {r.text[:500]}')
    j=r.json();(folder/'seedance-response.json').write_text(json.dumps(j))
    ident=j.get('requestId')
    if not ident:raise ValueError('Seedance did not return a request ID.')
    (folder/'generation.json').write_text(json.dumps({'request_id':ident,'prompt':p['prompt'],'video':'seedance-result.mp4','mode':p['mode'], 'provider': 'enhancor'}))
    status('Seedance draft submitted: '+ident)
    return ident

def get_openrouter_credit_stats(key=None):
    key = key or setting('OPENROUTER_API_KEY')
    if not key:
        return None
    try:
        r = requests.get('https://openrouter.ai/api/v1/auth/key', headers={'Authorization': f'Bearer {key}'}, timeout=10)
        if r.status_code == 200:
            return r.json().get('data', {})
    except Exception:
        pass
    return None

def submit_openrouter(folder, prompt, sirio, tein=None, status=print, api_key=None):
    folder = Path(folder)
    from studiotbelt.vision.mask_review import require_approved, is_mesh
    require_approved(folder)
    if (folder/'seedance-response.json').exists():
        raise ValueError('Este trabajo ya tiene una respuesta de proveedor registrada.')

    if not (folder/'audio-manifest.json').exists():
        raise ValueError('El aislamiento de audio debe completarse antes de enviar.')

    key = api_key or setting('OPENROUTER_API_KEY')
    if not key:
        raise ValueError('OPENROUTER_API_KEY no está configurada en .env ni en la solicitud.')

    # Registro de créditos iniciales
    initial_credits = get_openrouter_credit_stats(key)
    if initial_credits:
        status(f"OpenRouter saldo/uso inicial: ${initial_credits.get('usage', 0.0):.4f} USD gastados (Límite: {initial_credits.get('limit') or 'Ilimitado'})")
        (folder/'openrouter-credits.json').write_text(json.dumps({
            'initial': initial_credits,
            'timestamp_start': time.time()
        }, indent=2))

    from studiotbelt.core.audio_workflow import prepare_seedance_video
    status('Preparando video guía con audio aislado embedido...')
    prepared = folder/'seedance-input.mp4' if is_mesh(folder) else prepare_seedance_video(folder)

    from studiotbelt.services.media_host import upload
    status('Subiendo video y referencias para OpenRouter...')
    video_url = upload(str(prepared))
    ref_image_url = upload(str(sirio))
    ref_urls = [ref_image_url]
    if tein:
        ref_urls.append(upload(str(tein)))

    model_id = setting('OPENROUTER_MODEL', 'alibaba/wan-3.0')
    resolution = setting('OPENROUTER_RESOLUTION', '480p')

    duration = 15
    try:
        import av
        with av.open(str(prepared)) as inp:
            duration = int(round(float(inp.duration / av.time_base))) if inp.duration else 15
    except Exception:
        pass
    duration = max(2, min(duration, 30))

    status(f'Enviando a OpenRouter ({model_id} @ {resolution}, {duration}s)...')

    full_prompt = prompt
    if is_mesh(folder):
        mesh_mode = json.loads((folder/'workflow-mode.json').read_text()).get('mode')
        desc = 'depth composite with face mesh overlay' if mesh_mode == 'depth_mesh' else 'original video with face mesh overlay'
        full_prompt = full_prompt + f' Remove all face mesh lines and any tracking overlays from output. Replace character identity with the reference. Match dialogue timing exactly.'

    input_references = [
        {'type': 'image_url', 'image_url': {'url': ref_image_url}},
        {'type': 'video_url', 'video_url': {'url': video_url}}
    ]
    if tein:
        input_references.append({'type': 'image_url', 'image_url': {'url': upload(str(tein))}})

    if '@Image1' not in full_prompt and '@Video1' not in full_prompt:
        full_prompt = f"Using character reference in @Image1, follow the motion, timing, and depth guidance in @Video1. {full_prompt}"

    payload = {
        'model': model_id,
        'prompt': full_prompt,
        'duration': duration,
        'resolution': resolution,
        'aspect_ratio': '16:9',
        'input_references': input_references
    }

    headers = {
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/tBeltty/studiotbelt',
        'X-Title': 'tBelt Studio'
    }

    r = requests.post('https://openrouter.ai/api/v1/videos', json=payload, headers=headers, timeout=60)
    if r.status_code not in [200, 201, 202]:
        (folder/'submission-error.json').write_text(r.text)
        raise RuntimeError(f'Error al enviar tarea a OpenRouter ({r.status_code}): {r.text[:500]}')

    res = r.json()
    ident = res.get('id')
    polling_url = res.get('polling_url') or f'https://openrouter.ai/api/v1/videos/{ident}'

    req_data = {'provider': 'openrouter', 'model': model_id, 'arguments': payload, 'prompt': full_prompt, 'is_draft': True, 'api_key': key}
    (folder/'seedance-request.json').write_text(json.dumps(req_data, indent=2))
    res_data = {'requestId': ident, 'provider': 'openrouter', 'model': model_id, 'polling_url': polling_url}
    (folder/'seedance-response.json').write_text(json.dumps(res_data, indent=2))
    (folder/'generation.json').write_text(json.dumps({
        'request_id': ident,
        'prompt': full_prompt,
        'video': 'seedance-result.mp4',
        'provider': 'openrouter',
        'model': model_id
    }, indent=2))

    status(f'Tarea en OpenRouter encolada: {ident}')
    return ident

def wait_and_finish_openrouter(folder, request_id, status=print):
    folder = Path(folder)
    req_file = folder/'seedance-request.json'
    key = None
    if req_file.exists():
        try: key = json.loads(req_file.read_text()).get('api_key')
        except Exception: pass
    key = key or setting('OPENROUTER_API_KEY')
    resp_file = folder/'seedance-response.json'
    polling_url = f'https://openrouter.ai/api/v1/videos/{request_id}'
    if resp_file.exists():
        polling_url = json.loads(resp_file.read_text()).get('polling_url', polling_url)

    headers = {
        'Authorization': f'Bearer {key}',
        'HTTP-Referer': 'https://github.com/tBeltty/studiotbelt',
        'X-Title': 'tBelt Studio'
    }

    status('Renderizando video en OpenRouter…')
    for _ in range(180):
        r = requests.get(polling_url, headers=headers, timeout=30)
        if r.status_code == 200:
            data = r.json()
            st = data.get('status', 'processing')
            (folder/'provider-status.json').write_text(json.dumps(data, indent=2))
            status(f'OpenRouter estado: {st}')

            if st in ['completed', 'succeeded', 'COMPLETED']:
                status('Descargando resultado de OpenRouter...')
                urls = data.get('urls') or data.get('unsigned_urls') or []
                video_url = urls[0] if urls else data.get('result') or data.get('video_url')
                if not video_url:
                    raise ValueError(f'No se encontró URL de video en la respuesta: {data}')

                vr = requests.get(video_url, headers=headers if ('unsigned' in str(video_url) or 'openrouter.ai' in str(video_url)) else {}, timeout=180)
                vr.raise_for_status()
                (folder/'seedance-result.mp4').write_bytes(vr.content)

                status('Restaurando audio original...')
                finish_preview(folder/'seedance-result.mp4', folder)

                final_credits = get_openrouter_credit_stats(key)
                credits_file = folder/'openrouter-credits.json'
                credits_data = {}
                if credits_file.exists():
                    try: credits_data = json.loads(credits_file.read_text())
                    except Exception: pass
                if final_credits:
                    init_usage = credits_data.get('initial', {}).get('usage', 0.0)
                    fin_usage = final_credits.get('usage', 0.0)
                    diff = max(0.0, fin_usage - init_usage)
                    credits_data['final'] = final_credits
                    credits_data['cost_usd'] = diff
                    credits_file.write_text(json.dumps(credits_data, indent=2))
                    status(f"OpenRouter: Tarea completada. Costo exacto registrado: ${diff:.4f} USD.")
                return

            if st in ['failed', 'FAILED', 'error']:
                raise RuntimeError(f"OpenRouter falló: {data.get('error') or st}")

        time.sleep(5)
    raise TimeoutError('La tarea de OpenRouter sigue pendiente.')

def submit(folder, prompt, sirio, tein=None, status=print, override_key=None, override_provider=None):
    from studiotbelt.services.providers import get_active_provider, is_provider_configured
    active = override_provider or get_active_provider()
    if active == 'openrouter':
        return submit_openrouter(folder, prompt, sirio, tein, status, api_key=override_key)
    elif active == 'replicate':
        return submit_replicate(folder, prompt, sirio, tein, status, api_key=override_key)
    elif active == 'enhancor':
        return submit_enhancor(folder, prompt, sirio, tein, status, api_key=override_key)
    elif active in ['fal', 'fal.ai']:
        return submit_fal(folder, prompt, sirio, tein, status, api_key=override_key)
    elif active == 'comfy':
        raise NotImplementedError("ComfyUI local integration is not yet connected to the backend. Please select fal.ai, Enhancor, or Replicate.")
    else:
        if override_key:
            return submit_openrouter(folder, prompt, sirio, tein, status, api_key=override_key)
        for p, fn in [('openrouter', submit_openrouter), ('replicate', submit_replicate), ('enhancor', submit_enhancor), ('fal', submit_fal)]:
            if is_provider_configured(p):
                return fn(folder, prompt, sirio, tein, status)
        raise ValueError("No generative AI provider configured. Please configure an API key for OpenRouter, Enhancor, Replicate, or fal.ai in Settings or .env.")

def wait_and_finish_enhancor(folder, request_id, status=print):
    folder = Path(folder)
    key = credential('ENHANCOR_API_KEY')
    for _ in range(360):
        r = requests.post(setting('ENHANCOR_BASE_URL', 'https://apireq.enhancor.ai/api/seedance2.5/v1').rstrip('/') + '/status',
                          headers={'x-api-key': key}, json={'request_id': request_id}, timeout=30)
        r.raise_for_status()
        j = r.json()
        (folder / 'provider-status.json').write_text(json.dumps(j, indent=2))
        status(f"Seedance status: {j.get('status')}")
        if j.get('status') == 'COMPLETED':
            url = j.get('result')
            if not isinstance(url, str) or not url.startswith('https://'):
                raise ValueError('Seedance result URL missing.')
            r = requests.get(url, timeout=180)
            r.raise_for_status()
            (folder / 'seedance-result.mp4').write_bytes(r.content)
            status('Restoring entire original source audio · discarding generated audio')
            finish_preview(folder / 'seedance-result.mp4', folder)
            return
        if j.get('status') in ['FAILED', 'CANCELED']:
            raise RuntimeError('Seedance failed: ' + str(j.get('error') or j.get('status')))
        time.sleep(10)
    raise TimeoutError('Seedance is still pending. Request ID saved; do not resubmit automatically.')

def wait_and_finish(folder, request_id, status=print):
    folder = Path(folder)
    provider = None
    for candidate in [folder / 'seedance-response.json', folder / 'generation.json', folder / 'response.json', folder.parent / 'seedance-response.json', folder.parent / 'generation.json']:
        if candidate.exists():
            try:
                resp = json.loads(candidate.read_text())
                if 'provider' in resp and resp['provider']:
                    provider = resp['provider']
                    break
            except Exception:
                pass
    if not provider:
        from studiotbelt.services.providers import get_active_provider
        provider = get_active_provider()

    if provider == 'openrouter':
        return wait_and_finish_openrouter(folder, request_id, status)
    elif provider == 'replicate':
        return wait_and_finish_replicate(folder, request_id, status)
    elif provider in ['fal.ai', 'fal']:
        return wait_and_finish_fal(folder, request_id, status)
    elif provider == 'enhancor':
        return wait_and_finish_enhancor(folder, request_id, status)
    else:
        raise ValueError(f"Unknown or unconfigured provider '{provider}' for job completion.")

def submit_hd_enhancor(folder):
    folder = Path(folder)
    if (folder / 'hd/response.json').exists():
        raise ValueError('HD already submitted. Resume its saved request.')
    generation = json.loads((folder / 'generation.json').read_text())
    original = json.loads((folder / 'seedance-request.json').read_text())
    if not original.get('is_draft') or not (folder / 'final-preview.mp4').exists():
        raise ValueError('A completed draft is required before generating high resolution.')
    payload = {'draft_id': generation['request_id'], 'webhook_url': original['webhook_url']}
    key = credential('ENHANCOR_API_KEY')
    hd = folder / 'hd'
    hd.mkdir(exist_ok=True)
    source = hd / 'upload.mp4'
    if not source.exists():
        __import__('shutil').copy2(folder / 'upload.mp4', source)
    (hd / 'request.json').write_text(json.dumps(payload, indent=2))
    response = requests.post(setting('ENHANCOR_BASE_URL', 'https://apireq.enhancor.ai/api/seedance2.5/v1').rstrip('/') + '/queue',
                             headers={'x-api-key': key}, json=payload, timeout=90)
    response.raise_for_status()
    data = response.json()
    (hd / 'response.json').write_text(json.dumps(data))
    ident = data.get('requestId')
    if not ident:
        raise ValueError('Enhancor did not return a request ID.')
    return ident

def submit_hd(folder):
    folder = Path(folder)
    provider = None
    if (folder / 'seedance-response.json').exists():
        try:
            resp = json.loads((folder / 'seedance-response.json').read_text())
            provider = resp.get('provider')
        except Exception:
            pass
    if not provider and (folder / 'generation.json').exists():
        try:
            gen = json.loads((folder / 'generation.json').read_text())
            provider = gen.get('provider')
        except Exception:
            pass
    if not provider:
        from studiotbelt.services.providers import get_active_provider
        provider = get_active_provider()

    if provider in ['fal', 'fal.ai']:
        return submit_hd_fal(folder)
    elif provider == 'enhancor':
        return submit_hd_enhancor(folder)
    elif provider == 'replicate':
        raise NotImplementedError("Replicate renders at native resolution and does not require an HD draft upgrade step.")
    else:
        raise ValueError(f"Unknown or unconfigured provider '{provider}' for HD generation.")
