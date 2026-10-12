"""Optional local face-mesh preparation; no depth or segmentation calls."""
from pathlib import Path
import json,subprocess,sys,shutil
ROOT=Path(__file__).resolve().parent

def run(src,folder,status=print):
    from pipeline import normalize
    from audio_workflow import separate,prepare_seedance_video
    folder=Path(folder)
    python=ROOT/'.venv-face/bin/python'
    if not python.exists():
        python=Path(sys.executable)
    folder.mkdir(parents=True,exist_ok=True)
    status('1/4 Normalizando video y formato (24 fps)...')
    normalize(src,folder/'original.mp4')
    status('2/4 Rastreo de malla facial con MediaPipe...')
    subprocess.run([str(python),str(ROOT/'mesh_worker.py'),str(folder)],check=True)
    (folder/'workflow-mode.json').write_text(json.dumps({'mode':'face_mesh'}))
    status('3/4 Aislamiento vocal y pistas de audio...')
    separate(src,folder,status)
    status('4/4 Ajustando tono vocal (+3 semitonos)...')
    prepare_seedance_video(folder)
    status('✓ Video preparado exitosamente · Listo para revisión')


def run_depth(src,folder,prompt='person',provider='replicate',status=print):
    from pipeline import run as run_advanced
    from audio_workflow import prepare_seedance_video
    folder=Path(folder)
    python=ROOT/'.venv-face/bin/python'
    if not python.exists():
        python=Path(sys.executable)
    folder.mkdir(parents=True,exist_ok=True)
    run_advanced(src,folder,prompt,provider,status)
    shutil.copy2(folder/'composite-silent.mp4',folder/'depth-composite-silent.mp4')
    status('Adding face mesh from original video onto depth composite')
    subprocess.run([str(python),str(ROOT/'mesh_worker.py'),str(folder),'--depth'],check=True)
    (folder/'workflow-mode.json').write_text(json.dumps({'mode':'depth_mesh'}))
    prepare_seedance_video(folder)
    status('Depth + face mesh ready · full mask and facial tracking review required')
