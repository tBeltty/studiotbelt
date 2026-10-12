const $ = s => document.querySelector(s);
    let jobId = new URLSearchParams(location.search).get('job');
    let saved = {};
    let maskApproved = false;
    let maskFingerprint = "";
    let selectedPreview = "";
    let busy = false;
    let pollTimer;

    const base = () => '/runs/' + jobId + '/';

    function resetJob() {
      jobId = null;
      saved = {};
      maskApproved = false;
      if (window.location.search) {
        history.replaceState(null, '', window.location.pathname);
      }
      const pill = $('#job-info-pill');
      if (pill) pill.style.display = 'none';
      const dismissBtn = $('#dismiss-error-btn');
      if (dismissBtn) dismissBtn.style.display = 'none';
      $('#status').classList.remove('error', 'running');
      $('#status-text').textContent = t('status.initial');
      const dash = $('#processing-dashboard');
      if (dash) dash.hidden = true;
      $('#input-ready').hidden = true;
      $('#input-empty').hidden = false;
      $('#final-ready').hidden = true;
      $('#final-empty').hidden = false;
      const form = $('#form');
      if (form) form.reset();
      const fn = document.querySelector('[data-filename]');
      if (fn) fn.textContent = t('s1.upload_sub');
      $('#go').disabled = false;
      stopProcTimer();
    }

    function status(tText, error = false) {
      const localized = window.localizeStatus ? window.localizeStatus(tText) : t(tText, tText);
      $('#status-text').textContent = localized;
      $('#status').classList.toggle('error', error);
      $('#status').classList.toggle('running', busy);
      const dismissBtn = $('#dismiss-error-btn');
      if (dismissBtn) dismissBtn.style.display = error ? 'inline-block' : 'none';
    }

    const dismissBtn = $('#dismiss-error-btn');
    if (dismissBtn) {
      dismissBtn.onclick = () => resetJob();
    }

    // Mode selector card click logic
    const modeCards = document.querySelectorAll('.mode-option-card');
    function selectMode(card) {
      if (!card) return;
      modeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateModeMilestones(radio ? radio.value : 'depth');
    }
    modeCards.forEach(card => {
      card.addEventListener('click', () => selectMode(card));
    });

    function updateModeMilestones(mode) {
      const ms2 = document.querySelector('#ms-2 .ms-label');
      const ms3 = document.querySelector('#ms-3 .ms-label');
      if (mode === 'depth') {
        if (ms2) ms2.textContent = t('prog.ms2');
        if (ms3) ms3.textContent = t('prog.ms3');
      } else {
        if (ms2) ms2.textContent = t('prog.ms2_mesh');
        if (ms3) ms3.textContent = t('prog.ms3_audio');
      }
    }

    // Initialize i18n
    if (typeof initI18n === 'function') {
      initI18n();
    }
    window.addEventListener('languagechange', () => {
      const activeCard = document.querySelector('.mode-option-card.selected input[type="radio"]');
      updateModeMilestones(activeCard ? activeCard.value : 'depth');
      if (jobId) refresh();
    });

    // Display Job ID in badge if active
    if (jobId) {
      const badge = $('#job-info-pill');
      badge.textContent = 'JOB: ' + jobId.slice(0, 8);
      badge.style.display = 'inline-block';
      badge.onclick = () => {
        navigator.clipboard?.writeText(jobId);
        badge.textContent = t('status.copied');
        setTimeout(() => { badge.textContent = 'JOB: ' + jobId.slice(0, 8); }, 1500);
      };
    }

    let jobFiles = new Set();
    function exists(file) {
      return jobFiles.has(file);
    }

    async function json(url, options) {
      const r = await fetch(url, options);
      const j = await r.json();
      if (!r.ok) throw Error(typeof j.detail === 'string' ? j.detail : 'The request could not be completed.');
      return j;
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // File input change handlers (updates thumbnails & labels)
    for (const input of document.querySelectorAll('input[type=file]')) {
      input.onchange = () => {
        const f = input.files[0];
        if (!f) return;
        const uploadZone = input.closest('.upload-zone');
        if (uploadZone) uploadZone.querySelector('[data-filename]').textContent = f.name;
        const img = uploadZone ? uploadZone.querySelector('img') : null;
        const placeholder = uploadZone ? uploadZone.querySelector('.upload-icon') : null;

        if (input.id === 'video-file-input') {
          if ($('#status').classList.contains('error')) {
            resetJob();
          }
          const strip = $('#video-preview-strip');
          if (strip) {
            $('#preview-filename').textContent = f.name;
            $('#preview-filesize').textContent = formatBytes(f.size);
            strip.hidden = false;
          }
          $('#go').textContent = `Prepare Video (${formatBytes(f.size)}) →`;
        }

        if (input.name === 'sirio') {
          const activeName = (currentSettings && currentSettings.active_provider && currentSettings.providers[currentSettings.active_provider]) ? currentSettings.providers[currentSettings.active_provider].name : 'AI Engine';
          $('#mode-label').textContent = f.type.startsWith('video/') ? `${activeName} · Video-to-Video` : `${activeName} · Image Reference`;
        }

        if (img && !f.type.startsWith('video/')) {
          img.src = URL.createObjectURL(f);
          img.hidden = false;
          if (placeholder) placeholder.hidden = true;
        }
      };
    }

    // Drag & drop support with visual feedback for upload zones
    document.querySelectorAll('.upload-zone').forEach(zone => {
      const input = zone.querySelector('input[type=file]');
      if (!input) return;

      ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, e => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'dragend', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, e => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.remove('is-dragover');
        });
      });

      zone.addEventListener('drop', e => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length) {
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    // Clear selected video button
    const clearVideoBtn = $('#clear-video-btn');
    if (clearVideoBtn) {
      clearVideoBtn.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        resetJob();
        const vidInput = $('#video-file-input');
        if (vidInput) vidInput.value = '';
        const strip = $('#video-preview-strip');
        if (strip) strip.hidden = true;
        $('#go').textContent = t('s1.button');
        const uploadZone = vidInput ? vidInput.closest('.upload-zone') : null;
        if (uploadZone) {
          const fn = uploadZone.querySelector('[data-filename]');
          if (fn) fn.textContent = t('s1.upload_sub');
        }
      };
    }

    // Elapsed timer logic
    let procTimerInterval = null;
    let procStartTime = null;

    function startProcTimer() {
      stopProcTimer();
      procStartTime = Date.now();
      const timerEl = $('#progress-timer');
      if (timerEl) timerEl.textContent = '00:00';
      procTimerInterval = setInterval(() => {
        const diffSec = Math.floor((Date.now() - procStartTime) / 1000);
        const m = String(Math.floor(diffSec / 60)).padStart(2, '0');
        const s = String(diffSec % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }, 1000);
    }

    function stopProcTimer() {
      if (procTimerInterval) {
        clearInterval(procTimerInterval);
        procTimerInterval = null;
      }
    }

    function updateMilestones(activeNum, isDone = false) {
      for (let i = 1; i <= 4; i++) {
        const el = $('#ms-' + i);
        if (!el) continue;
        const ind = el.querySelector('.ms-indicator');
        el.classList.remove('active', 'done');
        if (isDone || i < activeNum) {
          el.classList.add('done');
          if (ind) ind.textContent = '✓';
        } else if (i === activeNum) {
          el.classList.add('active');
          if (ind) ind.textContent = String(i);
        } else {
          if (ind) ind.textContent = String(i);
        }
      }
    }

    function updateProgress(percent, msg, milestoneNum, isError = false) {
      const p = Math.max(2, Math.min(100, Math.round(percent)));
      const fillEl = $('#progress-fill');
      const pctEl = $('#progress-percentage');
      const msgEl = $('#progress-status-msg');
      const pulseDot = $('#progress-pulse-dot');
      const headline = $('#progress-headline');

      if (fillEl) fillEl.style.width = p + '%';
      if (pctEl) pctEl.textContent = p + '%';
      const track1 = fillEl ? fillEl.closest('.progress-track') : null;
      if (track1) track1.setAttribute('aria-valuenow', p);
      if (msg && msgEl) msgEl.textContent = (window.localizeStatus ? window.localizeStatus(msg) : msg);

      if (isError) {
        if (pulseDot) pulseDot.style.background = 'var(--danger-text)';
        if (fillEl) fillEl.style.background = 'var(--danger-text)';
        if (headline) headline.textContent = t('prog.error_title') || 'Preparation error';
        return;
      }

      updateMilestones(milestoneNum, p >= 100);
    }

    // Step 03 Character Generation Timer & Milestones
    let genTimerInterval = null;
    let genStartTime = null;

    function startGenTimer() {
      stopGenTimer();
      genStartTime = Date.now();
      const timerEl = $('#gen-timer');
      if (timerEl) timerEl.textContent = '00:00';
      genTimerInterval = setInterval(() => {
        const diffSec = Math.floor((Date.now() - genStartTime) / 1000);
        const m = String(Math.floor(diffSec / 60)).padStart(2, '0');
        const s = String(diffSec % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }, 1000);
    }

    function stopGenTimer() {
      if (genTimerInterval) {
        clearInterval(genTimerInterval);
        genTimerInterval = null;
      }
    }

    function updateGenMilestones(activeNum, isDone = false) {
      for (let i = 1; i <= 4; i++) {
        const el = $('#gen-ms-' + i);
        if (!el) continue;
        const ind = el.querySelector('.ms-indicator');
        el.classList.remove('active', 'done');
        if (isDone || i < activeNum) {
          el.classList.add('done');
          if (ind) ind.textContent = '✓';
        } else if (i === activeNum) {
          el.classList.add('active');
          if (ind) ind.textContent = String(i);
        } else {
          if (ind) ind.textContent = String(i);
        }
      }
    }

    function updateGenProgress(percent, msg, milestoneNum, isError = false) {
      const p = Math.max(2, Math.min(100, Math.round(percent)));
      const fillEl = $('#gen-progress-fill');
      const pctEl = $('#gen-percentage');
      const msgEl = $('#gen-status-msg');
      const pulseDot = $('#gen-pulse-dot');
      const headline = $('#gen-headline');

      if (fillEl) fillEl.style.width = p + '%';
      if (pctEl) pctEl.textContent = p + '%';
      const track2 = fillEl ? fillEl.closest('.progress-track') : null;
      if (track2) track2.setAttribute('aria-valuenow', p);
      if (msg && msgEl) msgEl.textContent = (window.localizeStatus ? window.localizeStatus(msg) : msg);

      if (isError) {
        if (pulseDot) pulseDot.style.background = 'var(--danger-text)';
        if (fillEl) fillEl.style.background = 'var(--danger-text)';
        if (headline) headline.textContent = t('s3.error_title') || 'Generation error';
        return;
      }

      updateGenMilestones(milestoneNum, p >= 100);
    }

    // Refresh state from server
    async function refresh(knownJob = null) {
      if (!jobId) return;

      if (knownJob && Array.isArray(knownJob.files)) {
        jobFiles = new Set(knownJob.files);
      } else {
        try {
          const j = await json('/jobs/' + jobId);
          if (Array.isArray(j.files)) jobFiles = new Set(j.files);
        } catch (_) {}
      }

      const items = [
        [t('s2.tab_prepared'), 'seedance-input.mp4', t('s2.cap_prepared')],
        [t('s2.tab_original'), 'original.mp4', t('s2.cap_original')],
        [t('s2.tab_depth'), 'depth.mp4', t('s2.cap_depth')],
        [t('s2.tab_mask'), 'mask.mp4', t('s2.cap_mask')]
      ];

      const present = items.map(x => exists(x[1]));
      $('#tabs').replaceChildren();

      items.forEach((x, i) => {
        if (!present[i]) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tab-btn';
        b.textContent = x[0];
        b.dataset.file = x[1];
        b.onclick = () => {
          selectedPreview = x[1];
          document.querySelectorAll('#tabs button').forEach(tBtn => tBtn.classList.remove('active'));
          b.classList.add('active');
          $('#input-video').src = base() + x[1];
          $('#input-caption').textContent = x[2];
          $('#input-download').href = base() + x[1];
        };
        $('#tabs').append(b);
      });

      if (present.some(Boolean)) {
        $('#input-empty').hidden = true;
        $('#input-ready').hidden = false;
        ([...document.querySelectorAll('#tabs button')].find(b => b.dataset.file === selectedPreview) || $('#tabs button')).click();
      }

      const review = await json('/jobs/' + jobId + '/mask-review');
      maskApproved = review.approved;
      maskFingerprint = review.fingerprint || '';
      
      const reviewBadge = $('#mask-review-status');
      reviewBadge.textContent = review.note || (maskApproved ? t('s2.approved_review') : t('s2.approval_required'));
      reviewBadge.style.color = maskApproved ? 'var(--success-text)' : 'var(--warning-text)';
      reviewBadge.style.borderColor = maskApproved ? 'var(--success-border)' : 'var(--warning-border)';
      
      $('#review-check').checked = maskApproved;
      $('#approve-mask').disabled = maskApproved || !present[0];
      $('#approve-mask').textContent = maskApproved ? t('s2.btn_approved') : t('s2.btn_approve');
      $('#draft-button').disabled = !present[0] || busy || !maskApproved;

      // Audio stems
      $('#audio-links').replaceChildren();
      for (const [file, titleKey] of [['vocals.wav', 's2.stem_vocals'], ['vocals-plus3.wav', 's2.stem_vocals_p3'], ['music.wav', 's2.stem_music']]) {
        if (exists(file)) {
          const a = document.createElement('a');
          a.href = base() + file;
          a.download = file;
          a.className = 'stem-pill';
          a.textContent = t(titleKey) + ' ↓';
          $('#audio-links').append(a);
        }
      }

      // Check saved references
      for (const name of ['sirio', 'tein']) {
        if (saved[name]) continue;
        for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'webm']) {
          const file = name + '-reference.' + ext;
          if (exists(file)) {
            saved[name] = file;
            const img = $('#' + name + '-img');
            const ph = $('#' + name + '-placeholder');
            if (!['mp4', 'mov', 'webm'].includes(ext)) {
              img.src = base() + file;
              img.hidden = false;
              if (ph) ph.hidden = true;
            }
            img.closest('.upload-zone').querySelector('[data-filename]').textContent = t('s3.saved_ref');
            break;
          }
        }
      }

      // Sent generation info
      if (exists('generation.json')) {
        const g = await json(base() + 'generation.json');
        const provName = g.provider ? (g.provider === 'fal.ai' ? 'fal.ai' : g.provider.charAt(0).toUpperCase() + g.provider.slice(1)) : 'AI';
        $('#mode-label').textContent = `${provName} · ${g.mode || 'Motion Synthesis'}`;
        $('#sent-details').hidden = false;
        $('#generation-id').textContent = `${provName} Request ID: ` + g.request_id;
        $('#sent-prompt').textContent = g.prompt;
        if (!$('#seedance textarea').dataset.loaded) {
          $('#seedance textarea').value = g.prompt;
          $('#seedance textarea').dataset.loaded = 'true';
        }
        $('#raw-link').href = base() + 'seedance-result.mp4';
      }

      // Final video check
      const hd = exists('hd/final-preview.mp4');
      const draft = exists('final-preview.mp4');
      if (draft || hd) {
        const url = base() + (hd ? 'hd/' : '') + 'final-preview.mp4';
        $('#final-empty').hidden = true;
        $('#final-ready').hidden = false;
        if ($('#final-video').getAttribute('src') !== url) $('#final-video').src = url;
        $('#final-download').href = url;
        $('#quality-label').textContent = hd ? t('s4.badge_hd') : t('s4.badge_draft');
        $('#final-download').textContent = hd ? t('s4.download_hd') : t('s4.download_draft');
        $('#upgrade').disabled = busy || hd;
      }
    }

    // Polling watch loop
    let isSeedanceActive = false;

    async function watch() {
      clearTimeout(pollTimer);
      try {
        const j = await json('/jobs/' + jobId);
        if (Array.isArray(j.files)) jobFiles = new Set(j.files);
        busy = j.state === 'running';
        status(j.status, j.state === 'error');
        if (j.state === 'error') {
          if (window.location.search) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
        $('#go').disabled = busy;
        $('#draft-button').disabled = busy || $('#input-ready').hidden || !maskApproved;

        const dash = $('#processing-dashboard');
        const genDash = $('#generation-dashboard');
        const s = (j.status || '').toLowerCase();
        const isStep3 = isSeedanceActive || s.includes('seedance') || s.includes('fal.ai') || s.includes('rendering') || s.includes('retrieving') || s.includes('untouched') || s.includes('recast');

        if (busy) {
          $('#upgrade').disabled = true;

          if (isStep3) {
            isSeedanceActive = true;
            if (genDash) genDash.hidden = false;
            if (!genTimerInterval) startGenTimer();

            let gp = 35;
            let gms = 2;
            if (s.includes('restoring') || s.includes('untouched') || s.includes('audio')) {
              gms = 3;
              gp = 92;
            } else if (s.includes('retrieving') || s.includes('descargando')) {
              gms = 2;
              gp = 85;
            } else if (s.includes('in_progress') || s.includes('rendering') || s.includes('generando')) {
              gms = 2;
              gp = 60;
            } else if (s.includes('in_queue') || s.includes('queued') || s.includes('seedance rendering')) {
              gms = 2;
              gp = 35;
            } else if (s.includes('dispatching') || s.includes('uploading') || s.includes('enviando')) {
              gms = 1;
              gp = 20;
            }
            updateGenProgress(gp, j.status, gms);
          } else {
            if (dash) dash.hidden = false;
            if (!procTimerInterval) startProcTimer();

            // Parse status to estimate milestone and progress
            let p = 35;
            let ms = 1;
            if (s.includes('4/4') || s.includes('[4/4]') || s.includes('listo') || s.includes('complet')) {
              ms = 4;
              p = 95;
            } else if (s.includes('3/4') || s.includes('[3/4]') || s.includes('sam') || s.includes('segment') || s.includes('compositing') || s.includes('composición')) {
              ms = 3;
              p = 80;
            } else if (s.includes('2/4') || s.includes('[2/4]') || s.includes('depth') || s.includes('profundidad') || s.includes('malla') || s.includes('mesh') || s.includes('mediapipe')) {
              ms = 2;
              p = 60;
            } else if (s.includes('1/4') || s.includes('[1/4]') || s.includes('normaliz')) {
              ms = 1;
              p = 40;
            }
            updateProgress(p, j.status, ms);
          }
          pollTimer = setTimeout(watch, 1000);
        } else {
          stopProcTimer();
          stopGenTimer();
          if (j.state === 'done') {
            if (isStep3 && genDash && !genDash.hidden) {
              updateGenProgress(100, t('s3.done_sub'), 4);
              const pulseDot = $('#gen-pulse-dot');
              if (pulseDot) pulseDot.style.background = 'var(--success-text)';
              const headline = $('#gen-headline');
              if (headline) headline.textContent = t('s3.done_title');
              const dBtn = $('#draft-button');
              if (dBtn) {
                dBtn.disabled = false;
                dBtn.textContent = t('s3.button');
              }
              isSeedanceActive = false;
              await refresh(j);
              const finalEl = document.getElementById('final');
              if (finalEl) finalEl.scrollIntoView({ behavior: 'smooth' });
            } else if (dash && !dash.hidden) {
              updateProgress(100, t('prog.done_sub'), 4);
              const pulseDot = $('#progress-pulse-dot');
              if (pulseDot) pulseDot.style.background = 'var(--success-text)';
              const headline = $('#progress-headline');
              if (headline) headline.textContent = t('prog.done_title');
              await refresh(j);
              const reviewEl = document.getElementById('review');
              if (reviewEl) reviewEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              await refresh(j);
            }
          } else if (j.state === 'error') {
            if (isStep3 && genDash && !genDash.hidden) {
              updateGenProgress(100, j.status || 'Generation error', 2, true);
              const dBtn = $('#draft-button');
              if (dBtn) {
                dBtn.disabled = false;
                dBtn.textContent = t('s3.button');
              }
              isSeedanceActive = false;
            } else if (dash) {
              dash.hidden = false;
              updateProgress(100, j.status || 'Preparation error', 1, true);
            }
          } else {
            await refresh(j);
          }
        }
      } catch (e) {
        stopProcTimer();
        stopGenTimer();
        status(e.message, true);
      }
    }

    // Step 01 Form Submit (XHR with live upload progress, no page reload)
    $('#form').onsubmit = e => {
      e.preventDefault();
      const vidInput = $('#video-file-input');
      const file = vidInput ? vidInput.files[0] : null;
      if (!file) return;

      const goBtn = $('#go');
      goBtn.disabled = true;

      const dash = $('#processing-dashboard');
      if (dash) dash.hidden = false;

      const pulseDot = $('#progress-pulse-dot');
      if (pulseDot) pulseDot.style.background = 'var(--brand-amber)';
      const fillEl = $('#progress-fill');
      if (fillEl) fillEl.style.background = 'linear-gradient(90deg, var(--brand-amber), #ffb84d)';
      const headline = $('#progress-headline');
      if (headline) headline.textContent = t('prog.title');

      startProcTimer();
      updateProgress(5, `${t('prog.uploading')} (0 / ${formatBytes(file.size)})`, 1);
      dash.scrollIntoView({ behavior: 'smooth' });

      const fd = new FormData(e.target);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/jobs');

      xhr.upload.onprogress = ev => {
        if (ev.lengthComputable) {
          const ratio = ev.loaded / ev.total;
          const pct = 5 + Math.round(ratio * 25); // 5% -> 30%
          const loadedStr = formatBytes(ev.loaded);
          const totalStr = formatBytes(ev.total);
          updateProgress(pct, `${t('prog.uploading')} (${loadedStr} / ${totalStr})`, 1);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const j = JSON.parse(xhr.responseText);
            jobId = j.id;
            window.history.pushState(null, '', '/?job=' + jobId);

            const badge = $('#job-info-pill');
            if (badge) {
              badge.textContent = 'JOB: ' + jobId.slice(0, 8);
              badge.style.display = 'inline-block';
              badge.onclick = () => {
                navigator.clipboard?.writeText(jobId);
                badge.textContent = t('status.copied');
                setTimeout(() => { badge.textContent = 'JOB: ' + jobId.slice(0, 8); }, 1500);
              };
            }

            updateProgress(35, t('prog.subtitle'), 1);
            watch();
          } catch (err) {
            stopProcTimer();
            updateProgress(100, err.message, 1, true);
            goBtn.disabled = false;
          }
        } else {
          stopProcTimer();
          let errText = 'Server error (' + xhr.status + ')';
          try {
            const errJson = JSON.parse(xhr.responseText);
            if (errJson.detail) errText = errJson.detail;
          } catch (_) {}
          updateProgress(100, errText, 1, true);
          goBtn.disabled = false;
        }
      };

      xhr.onerror = () => {
        stopProcTimer();
        updateProgress(100, 'Network error connecting to server.', 1, true);
        goBtn.disabled = false;
      };

      xhr.send(fd);
    };

    // Step 03 Character Recast Draft Submit
    $('#seedance').onsubmit = async e => {
      e.preventDefault();
      if (!jobId) return;
      if (!maskApproved) {
        status(t('status.err_approve_mask'), true);
        return;
      }
      const button = $('#draft-button');
      const origText = button.textContent;
      button.disabled = true;
      const activeName = (currentSettings && currentSettings.active_provider && currentSettings.providers[currentSettings.active_provider]) ? currentSettings.providers[currentSettings.active_provider].name : 'AI';
      button.textContent = (currentLang === 'en' ? `Generating Character (${activeName})...` : `Generando Personaje (${activeName})...`);
      try {
        const data = new FormData(e.target);
        for (const name of ['sirio', 'tein']) {
          if (!e.target.elements[name].files.length) {
            if (!saved[name]) {
              if (name === 'tein') {
                data.delete(name);
                continue;
              }
              throw Error(t('status.err_sirio_required'));
            }
            data.set(name, new File([await (await fetch(base() + saved[name])).blob()], saved[name]));
          }
        }
        status(t('status.dispatching'));
        await json('/jobs/' + jobId + '/seedance', { method: 'POST', body: data });
        await watch();
      } catch (e) {
        status(e.message, true);
        button.disabled = false;
        button.textContent = origText;
      }
    };

    // Manual Finish Form
    $('#finish').onsubmit = async e => {
      e.preventDefault();
      if (!jobId) {
        status(t('status.err_no_video'), true);
        return;
      }
      const b = e.target.querySelector('button');
      b.disabled = true;
      try {
        status(t('status.restoring_audio'));
        await json('/jobs/' + jobId + '/finish', { method: 'POST', body: new FormData(e.target) });
        await refresh();
        status(t('status.preview_ready'));
      } catch (e) {
        status(e.message, true);
      } finally {
        b.disabled = false;
      }
    };

    // 1080p Upgrade Submit
    $('#upgrade').onclick = async () => {
      $('#upgrade').disabled = true;
      try {
        const j = await json('/jobs/' + jobId + '/hd', { method: 'POST' });
        $('#upgrade-status').textContent = t('status.generating_hd');
        pollHD();
      } catch (e) {
        $('#upgrade-status').textContent = e.message;
        $('#upgrade').disabled = false;
      }
    };

    async function pollHD() {
      try {
        const j = await json('/jobs/' + jobId + '/hd');
        $('#upgrade-status').textContent = j.status;
        if (j.state === 'running') {
          setTimeout(pollHD, 4000);
        } else {
          await refresh();
          if (j.state === 'error') $('#upgrade').disabled = false;
        }
      } catch (e) {
        $('#upgrade-status').textContent = e.message;
      }
    }

    // Checkbox toggles approve button
    $('#review-check').onchange = () => {
      $('#approve-mask').disabled = !$('#review-check').checked;
    };

    // Save review verdict
    async function saveReview(approved) {
      try {
        const data = new FormData();
        data.set('approved', approved);
        data.set('fingerprint', maskFingerprint);
        data.set('note', approved ? 'Input approved for character generation.' : 'Mask flagged. Generation blocked.');
        await json('/jobs/' + jobId + '/mask-review', { method: 'POST', body: data });
        await refresh();
        if (approved) {
          status(t('status.review_approved'));
          const target = document.getElementById('draft');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (e) {
        status(e.message, true);
      }
    }

    $('#approve-mask').onclick = () => saveReview(true);
    $('#reject-mask').onclick = () => saveReview(false);

    // Initial load trigger
    if (jobId) {
      refresh().then(watch).catch(e => status(e.message, true));
      fetch('/jobs/' + jobId + '/hd')
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (j && j.state === 'running') {
            $('#upgrade').disabled = true;
            pollHD();
          }
        });
    }

    // ==========================================
    // SETTINGS & PROVIDER MANAGEMENT
    // ==========================================
    let currentSettings = null;
    let selectedProviderId = null;

    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        currentSettings = await res.json();
        
        if (currentSettings.active_provider && currentSettings.providers[currentSettings.active_provider]) {
          selectedProviderId = currentSettings.active_provider;
        } else {
          const configured = Object.values(currentSettings.providers).find(p => p.configured);
          selectedProviderId = configured ? configured.id : Object.keys(currentSettings.providers)[0];
        }

        const activeSpec = currentSettings.active_provider ? currentSettings.providers[currentSettings.active_provider] : null;
        const activeName = activeSpec ? activeSpec.name : (currentSettings.has_any_provider ? (selectedProviderId ? currentSettings.providers[selectedProviderId].name : 'AI Engine') : (currentLang === 'es' ? 'Sin conectar' : 'Not Connected'));
        const navBadge = $('#active-engine-badge');
        if (navBadge) navBadge.textContent = activeName;
        const step3Name = $('#step3-engine-name');
        if (step3Name) step3Name.textContent = activeName;

        const obBanner = $('#onboarding-banner');
        if (obBanner) {
          obBanner.hidden = !!currentSettings.has_any_provider;
        }

        renderProviderGrid();
      } catch (err) {
        console.warn('Error loading settings:', err);
      }
    }

    function renderProviderGrid() {
      if (!currentSettings || !currentSettings.providers) return;
      const grid = $('#provider-grid');
      if (!grid) return;
      grid.innerHTML = '';

      Object.values(currentSettings.providers).forEach(p => {
        const card = document.createElement('div');
        card.className = 'provider-card' + (p.id === selectedProviderId ? ' selected' : '');
        card.onclick = () => selectProvider(p.id);

        const top = document.createElement('div');
        top.className = 'provider-card-top';

        const name = document.createElement('span');
        name.className = 'provider-card-name';
        name.textContent = p.name;

        const badge = document.createElement('span');
        badge.style.fontSize = '11px';
        badge.style.fontWeight = '600';
        badge.style.color = p.configured ? 'var(--success-text)' : 'var(--text-faint)';
        badge.textContent = p.configured ? t('settings.connected') : t('settings.not_configured');

        top.appendChild(name);
        top.appendChild(badge);

        const desc = document.createElement('div');
        desc.className = 'provider-card-desc';
        desc.textContent = p.description;

        card.appendChild(top);
        card.appendChild(desc);
        grid.appendChild(card);
      });

      updateProviderConfigBox();
    }

    function selectProvider(pid) {
      selectedProviderId = pid;
      renderProviderGrid();
    }

    function updateProviderConfigBox() {
      if (!currentSettings) return;
      const p = currentSettings.providers[selectedProviderId];
      if (!p) return;

      const label = $('#provider-key-label');
      const input = $('#provider-key-input');
      const docsLink = $('#provider-docs-link');
      const feedback = $('#settings-feedback');
      if (feedback) feedback.textContent = '';

      if (label) {
        label.textContent = p.id === 'comfy' ? 'ComfyUI Server URL' : `${p.name} API Key / Token (${p.env_var})`;
      }
      if (input) {
        input.value = '';
        input.placeholder = p.id === 'comfy' ? 'http://127.0.0.1:8188' : (p.configured ? '•••••••••••••••• (' + t('settings.connected') + ')' : t('settings.key_placeholder'));
      }
      if (docsLink) {
        docsLink.href = p.help_url || '#';
      }
    }

    async function saveCurrentSettings() {
      const input = $('#provider-key-input');
      const feedback = $('#settings-feedback');
      const saveBtn = $('#save-settings-btn');
      const keyVal = input ? input.value.trim() : '';

      if (saveBtn) saveBtn.disabled = true;
      if (feedback) feedback.textContent = '...';

      try {
        const payload = { provider: selectedProviderId };
        if (keyVal) payload.key = keyVal;

        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Error saving settings');

        currentSettings = data;
        selectedProviderId = currentSettings.active_provider;

        const activeSpec = currentSettings.providers[selectedProviderId];
        const activeName = activeSpec ? activeSpec.name : selectedProviderId;
        const navBadge = $('#active-engine-badge');
        if (navBadge) navBadge.textContent = activeName;
        const step3Name = $('#step3-engine-name');
        if (step3Name) step3Name.textContent = activeName;

        const obBanner = $('#onboarding-banner');
        if (obBanner) obBanner.hidden = !!currentSettings.has_any_provider;

        renderProviderGrid();
        if (feedback) {
          feedback.style.color = 'var(--success-text)';
          feedback.textContent = t('settings.saved_success');
        }
        setTimeout(() => {
          if (feedback) feedback.textContent = '';
        }, 3000);
      } catch (err) {
        if (feedback) {
          feedback.style.color = 'var(--danger-text)';
          feedback.textContent = err.message;
        }
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    }

    function openSettingsModal() {
      const m = $('#settings-modal');
      if (m) {
        m.classList.add('open');
        renderProviderGrid();
        const input = $('#provider-key-input');
        if (input) setTimeout(() => input.focus(), 100);
      }
    }

    function closeSettingsModal() {
      const m = $('#settings-modal');
      if (m) m.classList.remove('open');
    }

    const openSetBtn = $('#open-settings-btn');
    if (openSetBtn) openSetBtn.onclick = openSettingsModal;

    const obOpenBtn = $('#onboarding-open-btn');
    if (obOpenBtn) obOpenBtn.onclick = openSettingsModal;

    const closeSetBtn = $('#close-settings-btn');
    if (closeSetBtn) closeSetBtn.onclick = closeSettingsModal;

    const step3ChangeBtn = $('#step3-change-engine');
    if (step3ChangeBtn) step3ChangeBtn.onclick = openSettingsModal;

    const setModal = $('#settings-modal');
    if (setModal) {
      setModal.onclick = (e) => {
        if (e.target === setModal) closeSettingsModal();
      };
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSettingsModal();
    });

    const saveSetBtn = $('#save-settings-btn');
    if (saveSetBtn) saveSetBtn.onclick = saveCurrentSettings;

    const keyInput = $('#provider-key-input');
    if (keyInput) {
      keyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveCurrentSettings();
        }
      });
    }

    // Load settings on startup
    loadSettings();
