from pathlib import Path
import json, requests, re, time, concurrent.futures
from config import credential, setting
from audio_workflow import finish_preview

def is_fal_active():
    key = setting('FAL_KEY')
    return bool(key) and not any(x in key.lower() for x in ['your_key', 'replace_me', 'placeholder'])

def submit_fal(folder, prompt, sirio, tein=None, status=print):
    import fal_client
    folder = Path(folder)
    from mask_review import require_approved, is_mesh
    require_approved(folder)
    if (folder/'seedance-response.json').exists():
        raise ValueError('This job already has a provider response. Resume it; prepare a new job for a deliberate variation.')

    if not (folder/'audio-manifest.json').exists():
        raise ValueError('Audio separation must complete before submission.')

    from audio_workflow import prepare_seedance_video
    status('Pitching isolated vocals +3 semitones and embedding in guided video')
    prepared = folder/'seedance-input.mp4' if is_mesh(folder) else prepare_seedance_video(folder)

    status('Uploading video and character references to fal.ai high-speed CDN')
    video_url = fal_client.upload_file(str(prepared))
    image_url = fal_client.upload_file(str(sirio))

    model_id = setting('FAL_MODEL', 'fal-ai/live-portrait')
    status(f'Submitting to {model_id} via fal.ai')

    if 'live-portrait' in model_id:
        args = {
            'video_url': video_url,
            'image_url': image_url
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
        'mode': 'fal_live_portrait' if 'live-portrait' in model_id else 'fal_video',
        'provider': 'fal.ai'
    }, indent=2))
    status(f'fal.ai generation queued: {ident}')
    return ident

def wait_and_finish_fal(folder, request_id, status=print):
    import fal_client
    folder = Path(folder)
    resp_file = folder/'seedance-response.json'
    model_id = 'fal-ai/live-portrait'
    if resp_file.exists():
        model_id = json.loads(resp_file.read_text()).get('model', model_id)

    status('Rendering video through fal.ai…')
    for _ in range(180):
        s = fal_client.status(model_id, request_id, with_logs=True)
        status_str = getattr(s, 'status', str(s))
        (folder/'provider-status.json').write_text(json.dumps({'status': status_str, 'request_id': request_id}, indent=2))

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
        raise ValueError('A completed draft is required before generating 1080p.')

    hd = folder/'hd'
    hd.mkdir(exist_ok=True)
    source = hd/'upload.mp4'
    if not source.exists():
        import shutil; shutil.copy2(folder/'upload.mp4', source)

    import fal_client
    model_id = original.get('model', 'fal-ai/live-portrait')
    args = dict(original.get('arguments', {}))

    handler = fal_client.submit(model_id, arguments=args)
    ident = handler.request_id
    res_data = {'requestId': ident, 'provider': 'fal.ai', 'model': model_id}
    (hd/'request.json').write_text(json.dumps(args, indent=2))
    (hd/'response.json').write_text(json.dumps(res_data, indent=2))
    (hd/'seedance-response.json').write_text(json.dumps(res_data, indent=2))
    return ident

def submit(folder, prompt, sirio, tein=None, status=print):
    if is_fal_active():
        return submit_fal(folder, prompt, sirio, tein, status)

    folder = Path(folder)
    from mask_review import require_approved, is_mesh
    require_approved(folder)
    if (folder/'seedance-response.json').exists():raise ValueError('This job already has a provider response. Resume it; prepare a new job for a deliberate variation.')
    key=credential('ENHANCOR_API_KEY')
    if not setting('ENHANCOR_WEBHOOK_URL'):raise ValueError('Webhook URL required. Install cloudflared and restart the app, or set ENHANCOR_WEBHOOK_URL.')
    if not (folder/'audio-manifest.json').exists():raise ValueError('Audio separation must complete before submission.')
    from audio_workflow import prepare_seedance_video
    status('Pitching isolated vocals +3 semitones and embedding in colored-depth video')
    prepared=folder/'seedance-input.mp4' if is_mesh(folder) else prepare_seedance_video(folder)
    status('Uploading video with embedded vocals and character references')
    from media_host import upload
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:urls=list(pool.map(upload,[prepared,sirio]+([tein] if tein else [])))
    p={'resolution':'1080p','output_format':'mp4','pass_faces':True,'webhook_url':setting('ENHANCOR_WEBHOOK_URL','')}
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
    (folder/'generation.json').write_text(json.dumps({'request_id':ident,'prompt':p['prompt'],'video':'seedance-result.mp4','mode':p['mode']}))
    status('Seedance draft submitted: '+ident)
    return ident

def wait_and_finish(folder, request_id, status=print):
    if is_fal_active():
        return wait_and_finish_fal(folder, request_id, status)

    folder=Path(folder)
    key=credential('ENHANCOR_API_KEY')
    for _ in range(360):
        r=requests.post(setting('ENHANCOR_BASE_URL','https://apireq.enhancor.ai/api/seedance2.5/v1').rstrip('/')+'/status',headers={'x-api-key':key},json={'request_id':request_id},timeout=30);r.raise_for_status();j=r.json()
        (folder/'provider-status.json').write_text(json.dumps(j,indent=2))
        if j.get('status')=='COMPLETED':
            url=j.get('result')
            if not isinstance(url,str) or not url.startswith('https://'):raise ValueError('Seedance result URL missing.')
            r=requests.get(url,timeout=180);r.raise_for_status();(folder/'seedance-result.mp4').write_bytes(r.content)
            status('Restoring entire original source audio · discarding generated audio')
            finish_preview(folder/'seedance-result.mp4',folder)
            return
        if j.get('status') in ['FAILED','CANCELED']:raise RuntimeError('Seedance failed: '+str(j.get('error') or j.get('status')))
        time.sleep(10)
    raise TimeoutError('Seedance is still pending. Request ID saved; do not resubmit automatically.')

def submit_hd(folder):
    if is_fal_active():
        return submit_hd_fal(folder)

    folder=Path(folder)
    if (folder/'hd/response.json').exists():raise ValueError('HD already submitted. Resume its saved request.')
    generation=json.loads((folder/'generation.json').read_text())
    original=json.loads((folder/'seedance-request.json').read_text())
    if not original.get('is_draft') or not (folder/'final-preview.mp4').exists():
        raise ValueError('A completed draft is required before generating 1080p.')
    payload={'draft_id':generation['request_id'],'webhook_url':original['webhook_url']}
    key=credential('ENHANCOR_API_KEY')
    hd=folder/'hd';hd.mkdir(exist_ok=True)
    source=hd/'upload.mp4'
    if not source.exists():__import__('shutil').copy2(folder/'upload.mp4',source)
    (hd/'request.json').write_text(json.dumps(payload,indent=2))
    response=requests.post(setting('ENHANCOR_BASE_URL','https://apireq.enhancor.ai/api/seedance2.5/v1').rstrip('/')+'/queue',headers={'x-api-key':key},json=payload,timeout=90)
    response.raise_for_status();data=response.json()
    (hd/'response.json').write_text(json.dumps(data))
    ident=data.get('requestId')
    if not ident:raise ValueError('Enhancor did not return a request ID.')
    return ident
