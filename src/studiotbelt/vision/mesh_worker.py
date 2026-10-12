from pathlib import Path
from fractions import Fraction
import os, av, mediapipe as mp, numpy as np, sys, json, urllib.request
from PIL import ImageDraw

root = Path(sys.argv[1]).resolve()
source = root / 'original.mp4'
model = Path(__file__).resolve().parent / 'models/face_landmarker.task'
if not model.exists():
    repo_model = Path(__file__).resolve().parents[3] / 'models/face_landmarker.task'
    if repo_model.exists():
        model = repo_model
MODEL_SHA256 = os.getenv('FACE_LANDMARKER_SHA256', '64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff')
MODEL_URL = os.getenv('FACE_LANDMARKER_URL', 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task')
if not model.exists():
    import hashlib
    model.parent.mkdir(exist_ok=True)
    temporary = model.with_suffix('.download')
    urllib.request.urlretrieve(MODEL_URL, str(temporary))
    digest = hashlib.sha256(temporary.read_bytes()).hexdigest()
    if digest != MODEL_SHA256:
        temporary.unlink(missing_ok=True)
        raise ValueError(f"Model integrity verification failed: expected {MODEL_SHA256}, got {digest}")
    temporary.replace(model)

min_conf = float(os.getenv('FACE_CONFIDENCE', '0.15'))
opts = mp.tasks.vision.FaceLandmarkerOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=str(model)),
    running_mode=mp.tasks.vision.RunningMode.VIDEO,
    num_faces=int(os.getenv('FACE_NUM_FACES', '1')),
    min_face_detection_confidence=min_conf,
    min_face_presence_confidence=min_conf,
    min_tracking_confidence=min_conf
)
connections = mp.tasks.vision.FaceLandmarksConnections
counts = []
saved = []
background = []

if '--depth' in sys.argv:
    with av.open(str(root / 'depth-composite-silent.mp4')) as bg:
        background = [f.to_image() for f in bg.decode(video=0)]

with mp.tasks.vision.FaceLandmarker.create_from_options(opts) as detector, av.open(str(source)) as inp, av.open(str(root / 'composite-silent.mp4'), 'w') as out:
    stream = inp.streams.video[0]
    if background and (len(background) != stream.frames or background[0].size != (stream.width, stream.height)):
        raise ValueError('Depth and original frame count or dimensions differ; rebuild the depth composite before overlay.')
    
    crf = os.getenv('FFMPEG_CRF', '18')
    target_fps = int(os.getenv('TARGET_FPS', '24'))
    vs = out.add_stream('libx264', rate=target_fps)
    vs.width = stream.width
    vs.height = stream.height
    vs.pix_fmt = 'yuv420p'
    vs.options = {'crf': crf}
    
    last_landmarks = None
    crop_x0_pct = float(os.getenv('FACE_CROP_X0', '0.20'))
    crop_y0_pct = float(os.getenv('FACE_CROP_Y0', '0.0'))
    crop_cw_pct = float(os.getenv('FACE_CROP_CW', '0.60'))
    crop_ch_pct = float(os.getenv('FACE_CROP_CH', '0.75'))
    for i, f in enumerate(inp.decode(video=0)):
        im = f.to_image()
        x0 = int(im.width * crop_x0_pct)
        y0 = int(im.height * crop_y0_pct)
        cw = int(im.width * crop_cw_pct)
        ch = int(im.height * crop_ch_pct)
        crop = im.crop((x0, y0, x0 + cw, y0 + ch))
        
        result = detector.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.array(crop)), round(i * 1000 / target_fps))
        draw_im = background[i].copy() if background else im
        d = ImageDraw.Draw(draw_im)
        face_lms = result.face_landmarks
        
        if face_lms:
            last_landmarks = face_lms
            counts.append(len(face_lms))
            saved.append({
                "frame": i,
                "time": i / target_fps,
                "faces": [[{"x": (x0 + l.x * cw) / im.width, "y": (y0 + l.y * ch) / im.height} for l in face] for face in face_lms]
            })
        else:
            counts.append(0)
            saved.append({"frame": i, "time": i / target_fps, "faces": []})
        
        active_faces = face_lms if face_lms else (last_landmarks if last_landmarks else [])
        for face in active_faces:
            pts = [(round(x0 + l.x * cw), round(y0 + l.y * ch)) for l in face]
            for c in connections.FACE_LANDMARKS_TESSELATION:
                d.line([pts[c.start], pts[c.end]], fill=(50, 170, 205), width=1)
            for name, col in [('FACE_LANDMARKS_LIPS', (255, 135, 100)), ('FACE_LANDMARKS_LEFT_EYE', (130, 255, 150)), ('FACE_LANDMARKS_RIGHT_EYE', (130, 255, 150))]:
                for c in getattr(connections, name):
                    d.line([pts[c.start], pts[c.end]], fill=col, width=2)
        
        vf = av.VideoFrame.from_image(draw_im)
        vf.pts = i
        vf.time_base = Fraction(1, target_fps)
        for pkt in vs.encode(vf):
            out.mux(pkt)
        if i == 30:
            draw_im.save(root / 'preview.jpg')
            
    for pkt in vs.encode():
        out.mux(pkt)

print({'frames': len(counts), 'tracked': sum(x > 0 for x in counts), 'missing': [i for i, x in enumerate(counts) if not x]})

(root / 'face-landmarks.json').write_text(json.dumps({'fps': target_fps, 'frames': saved}))
(root / 'face-tracking.json').write_text(json.dumps({'frames': len(counts), 'tracked': sum(bool(x) for x in counts), 'missing_frames': [i for i, x in enumerate(counts) if not x]}))
if sum(bool(x) for x in counts) == 0:
    raise RuntimeError('No faces tracked in video: ensure a human subject is visible.')
