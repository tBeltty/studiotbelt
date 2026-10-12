from pathlib import Path
from contextlib import asynccontextmanager
import os,sys,threading,uuid,shutil,json,concurrent.futures

from studiotbelt import config  # Initializes hardened cross-platform PATH and environment
from studiotbelt.config import ROOT

from fastapi import FastAPI,UploadFile,File,Form,HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from studiotbelt.core.pipeline import run
RUNS=ROOT/'runs';RUNS.mkdir(exist_ok=True)
jobs={}
max_workers = int(config.setting('STUDIO_MAX_WORKERS', '2'))
executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix='studio_worker')

@asynccontextmanager
async def lifespan(app: FastAPI):
    resume_saved_generations()
    yield
    executor.shutdown(wait=False)

app=FastAPI(lifespan=lifespan)

@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.api_route('/', methods=['GET', 'HEAD'])
def index():return FileResponse(ROOT/'static/index.html')

@app.api_route('/favicon.ico', methods=['GET', 'HEAD'], include_in_schema=False)
def favicon():
    fav = ROOT / 'static/favicon.svg'
    if fav.exists():
        return FileResponse(fav, media_type='image/svg+xml')
    raise HTTPException(404)

@app.get('/api/settings')
def get_settings_endpoint():
    from studiotbelt.services.providers import get_settings
    return get_settings()

@app.post('/api/settings')
def update_settings_endpoint(payload: dict):
    from studiotbelt.services.providers import update_settings
    provider = payload.get('provider')
    key = payload.get('key')
    extra = payload.get('extra')
    return update_settings(provider, key, extra)
@app.get('/api/health')
def health_endpoint():
    from studiotbelt.config import find_binary
    bins = {}
    for b in ['ffmpeg', 'rubberband']:
        try:
            bins[b] = find_binary(b)
        except Exception as e:
            bins[b] = f"MISSING: {e}"
    bins['python'] = sys.executable
    return {'status': 'ok', 'binaries': bins}

@app.post('/jobs')
def create(video:UploadFile=File(...),prompt:str=Form('person'),provider:str=Form('auto'),mode:str=Form('depth')):
    if mode not in ['face_mesh','depth','depth_mesh','cloud_depth']:raise HTTPException(400,'Unknown workflow mode')
    if mode == 'cloud_depth': mode = 'depth'
    if provider not in ['auto','local','fal','huggingface','replicate','replicate-chenxwh']:raise HTTPException(400,'Unknown provider')
    ident=uuid.uuid4().hex;folder=RUNS/ident;folder.mkdir();src=folder/'upload.mp4'
    with src.open('wb') as out:shutil.copyfileobj(video.file,out)
    jobs[ident]={'state':'running','status':'Starting','id':ident}
    def work():
        try:
            if mode=='face_mesh':
                from studiotbelt.vision.face_mesh import run as run_mesh
                run_mesh(src,folder,lambda s:jobs[ident].update(status=s))
            elif mode=='depth_mesh':
                from studiotbelt.vision.face_mesh import run_depth
                run_depth(src,folder,prompt,provider,lambda s:jobs[ident].update(status=s))
            else:
                from studiotbelt.core.pipeline import run
                run(src,folder,prompt,provider,lambda s:jobs[ident].update(status=s))
            jobs[ident].update(state='done',status='Preparation complete · input review required')
            (folder/'status.json').write_text(json.dumps(jobs[ident]))
        except Exception as e:
            jobs[ident].update(state='error',status=str(e))
            (folder/'status.json').write_text(json.dumps(jobs[ident]))
    executor.submit(work);return jobs[ident]
@app.get('/jobs/{ident}')
def get(ident:str):
    if ident not in jobs:
        if len(ident)==32 and all(c in '0123456789abcdef' for c in ident) and (RUNS/ident/'status.json').exists():
            data = json.loads((RUNS/ident/'status.json').read_text())
        else:
            raise HTTPException(404)
    else:
        data = dict(jobs[ident])
    folder = RUNS/ident
    if folder.exists():
        files = [p.name for p in folder.iterdir() if p.is_file()]
        if (folder / 'hd').exists():
            files.extend(['hd/' + p.name for p in (folder / 'hd').iterdir() if p.is_file()])
        data['files'] = files
    return data
@app.post('/jobs/{ident}/seedance')
def seedance(ident:str,prompt:str=Form(...),sirio:UploadFile=File(...),tein:UploadFile|None=File(None)):
    if len(ident)!=32 or not all(c in '0123456789abcdef' for c in ident):raise HTTPException(404)
    folder=RUNS/ident
    if not (folder/'audio-manifest.json').exists():raise HTTPException(400,'Audio separation must complete first.')
    from studiotbelt.vision.mask_review import require_approved
    try:require_approved(folder)
    except ValueError as e:raise HTTPException(409,str(e))
    paths=[]
    for name,upload in [('sirio-reference',sirio),('tein-reference',tein)]:
        if upload is None:
            paths.append(None)
            continue
        suffix=Path(upload.filename or '').suffix.lower()
        if suffix not in (['.png','.jpg','.jpeg','.webp','.mp4','.mov','.webm'] if name=='sirio-reference' else ['.png','.jpg','.jpeg','.webp']):raise HTTPException(400,'Use an image or a character reference video.')
        path=folder/(name+suffix)
        with path.open('wb') as f:shutil.copyfileobj(upload.file,f)
        paths.append(path)
    from studiotbelt.services.seedance_bridge import submit
    try:request_id=submit(folder,prompt,*paths)
    except Exception as e:raise HTTPException(502,str(e))
    jobs[ident]={'id':ident,'state':'running','status':'Seedance rendering: '+request_id}
    def collect():
        from studiotbelt.services.seedance_bridge import wait_and_finish
        try:
            wait_and_finish(folder,request_id,lambda s:jobs[ident].update(status=s))
            jobs[ident].update(state='done',status='Final preview ready · entire original source audio',final_url='/runs/'+ident+'/final-preview.mp4')
        except Exception as e:jobs[ident].update(state='error',status=str(e))
        (folder/'status.json').write_text(json.dumps(jobs[ident]))
    executor.submit(collect)
    return {'request_id':request_id,'id':ident,'state':'running','status':jobs[ident]['status']}

@app.post('/jobs/{ident}/finish')
def finish(ident:str,video:UploadFile=File(...)):
    if len(ident)!=32 or not all(c in '0123456789abcdef' for c in ident):raise HTTPException(404)
    folder=RUNS/ident
    if not (folder/'upload.mp4').exists():raise HTTPException(400,'Original source is required.')
    target=folder/'seedance-result.mp4'
    with target.open('wb') as f:shutil.copyfileobj(video.file,f)
    from studiotbelt.core.audio_workflow import finish_preview
    try:finish_preview(target,folder)
    except Exception as e:raise HTTPException(400,str(e))
    return {'url':'/runs/'+ident+'/final-preview.mp4'}

app.mount('/runs' ,StaticFiles(directory=RUNS),name='runs')

hd_jobs={}
hd_lock=threading.Lock()

def hd_folder(ident):
    if len(ident)!=32 or not all(c in '0123456789abcdef' for c in ident):raise HTTPException(404)
    folder=RUNS/ident
    if not folder.exists():raise HTTPException(404)
    return folder

@app.get('/jobs/{ident}/hd')
def get_hd(ident:str):
    folder=hd_folder(ident)
    if ident in hd_jobs:return hd_jobs[ident]
    saved=folder/'hd/status.json'
    if saved.exists():return json.loads(saved.read_text())
    return {'state':'idle','status':'Approve your draft to generate 1080p.'}

@app.post('/jobs/{ident}/hd')
def create_hd(ident:str):
    folder=hd_folder(ident)
    with hd_lock:
        previous=get_hd(ident)
        if previous['state'] in ['running','done']:return previous
        if not (folder/'final-preview.mp4').exists():raise HTTPException(400,'Complete and review a draft first.')
        hd=folder/'hd';hd.mkdir(exist_ok=True)
        hd_jobs[ident]={'state':'running','status':'Submitting approved draft for 1080p','id':ident}
        def save(): (hd/'status.json').write_text(json.dumps(hd_jobs[ident]))
        save()
    def work_hd():
        from studiotbelt.services.seedance_bridge import submit_hd,wait_and_finish
        try:
            request_id=submit_hd(folder)
            hd_jobs[ident].update(request_id=request_id,status='Generating 1080p HD render');save()
            wait_and_finish(hd,request_id,lambda s:hd_jobs[ident].update(status=s))
            hd_jobs[ident].update(state='done',status='1080p ready · original source audio restored')
        except Exception as e:hd_jobs[ident].update(state='error',status=str(e))
        save()
    executor.submit(work_hd)
    return hd_jobs[ident]

@app.get('/jobs/{ident}/mask-review')
def get_mask_review(ident:str):
    from studiotbelt.vision.mask_review import state
    return state(hd_folder(ident))

@app.post('/jobs/{ident}/mask-review')
def save_mask_review(ident:str,approved:bool=Form(...),fingerprint:str=Form(...),note:str=Form('')):
    from studiotbelt.vision.mask_review import review
    try:return review(hd_folder(ident),approved,note,fingerprint)
    except ValueError as e:raise HTTPException(409,str(e))

app.mount('/static',StaticFiles(directory=ROOT/'static'),name='static')

def resume_saved_generations():
    """Resume collection only: never requeue a paid prediction on restart."""
    from studiotbelt.services.seedance_bridge import wait_and_finish
    for root in RUNS.iterdir():
        if not root.is_dir() or len(root.name)!=32:continue
        for folder,response_file,registry in [(root,'seedance-response.json',jobs),(root/'hd','response.json',hd_jobs)]:
            response=folder/response_file
            if not response.exists() or (folder/'final-preview.mp4').exists():continue
            try:request_id=json.loads(response.read_text()).get('requestId')
            except (ValueError,OSError):continue
            if not request_id:continue
            registry[root.name]={'id':root.name,'state':'running','status':'Resuming saved request '+request_id}
            def collect_saved(folder=folder,ident=root.name,request_id=request_id,registry=registry):
                try:
                    wait_and_finish(folder,request_id,lambda message:registry[ident].update(status=message))
                    registry[ident].update(state='done',status='Final preview ready · original source audio')
                except Exception as e:registry[ident].update(state='error',status=str(e))
                (folder/'status.json').write_text(json.dumps(registry[ident]))
            executor.submit(collect_saved)

@app.get('/health')
def health():
    return {'status':'ok','service':'tBelt Studio'}
