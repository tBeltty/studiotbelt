/**
 * tBelt Studio — i18n Localization Engine
 * Complete English & Spanish dictionaries with persistent locale selection.
 */

const I18N = {
  es: {
    'brand.badge': 'Video IA',
    'hero.eyebrow': '● Flujo de Generación de Video en la Nube',
    'hero.title': 'Tu escena. Nuevos personajes.',
    'hero.desc': 'Prepara el video original, aísla voces con pitch +3 semitonos, revisa las máscaras de profundidad y sintetiza reemplazos hiperrealistas.',

    'step.01.num': 'PASO 01',
    'step.01.name': 'Subir Video',
    'step.02.num': 'PASO 02',
    'step.02.name': 'Revisar Silueta',
    'step.03.num': 'PASO 03',
    'step.03.name': 'Crear Personaje',
    'step.04.num': 'PASO 04',
    'step.04.name': 'Exportar 1080p',

    'status.initial': 'Selecciona tu video original para iniciar el flujo.',
    'status.copied': '¡COPIADO!',
    'status.uploading': 'Subiendo y preparando tu video…',
    'status.review_required': 'Preparación completada · Se requiere revisión de silueta',
    'status.review_approved': 'Silueta aprobada. Selecciona la foto de tu nuevo personaje.',
    'status.dispatching': 'Subiendo referencias y enviando generación al proveedor…',
    'status.restoring_audio': 'Restaurando pistas de audio originales en el resultado…',
    'status.preview_ready': 'Vista previa lista con audio original.',
    'status.generating_hd': 'Generando versión 1080p en alta definición…',
    'status.err_no_video': 'Prepara tu video original primero.',
    'status.err_approve_mask': 'Por favor revisa y aprueba la silueta antes de generar el personaje.',
    'status.err_sirio_required': 'La imagen de referencia del Personaje 1 es requerida.',

    's1.badge': '01',
    's1.title': 'Video Original y Preparación',
    's1.companion_alt': 'Gato Director',
    's1.upload_title': 'Elegir video original',
    's1.upload_sub': 'MP4, MOV o WebM · hasta 30 segundos',
    's1.mode_cloud_title': 'Profundidad 3D + SAM 3',
    's1.mode_cloud_badge': 'Recomendado · Cloud',
    's1.mode_cloud_desc': 'Inferencia cloud ultra-rápida. Segmenta sujetos completos, ropa y cabello (~$0.005/req).',
    's1.mode_mesh_title': 'Malla Facial Rápida',
    's1.mode_mesh_badge': 'Experimental · Local',
    's1.mode_mesh_desc': 'Rastreo facial 2D con MediaPipe. Óptimo para cámara web o un solo sujeto centrado.',
    's1.smart_pill': '<b>Configuración Óptima</b>: Profundidad 3D + SAM 3 + Aislamiento Vocal',
    's1.hint': 'Sube tu clip y prepáralo.',
    's1.button': 'Preparar Video →',
    's1.btn_preparing': 'Preparando Video...',
    'prog.title': 'Preparando video...',
    'prog.subtitle': 'Generando mapas de profundidad 3D, segmentación SAM 3 y aislando pistas vocales.',
    'prog.uploading': 'Subiendo archivo de video...',
    'prog.done_title': 'Video preparado con éxito',
    'prog.done_sub': 'Video preparado con audio original impecable. Revisa el resultado abajo.',
    'prog.error_title': 'Error en la preparación',
    'prog.ms1': 'Subida y Formato',
    'prog.ms2': 'Profundidad 3D (Cloud AI)',
    'prog.ms2_mesh': 'Malla Facial (MediaPipe)',
    'prog.ms3': 'Segmentación SAM 3 (Cloud AI)',
    'prog.ms3_audio': 'Aislamiento Vocal (Demucs)',
    'prog.ms4': 'Audio +3 st y Revisión',
    'prog.status_ms1': '1/4 Normalizando video y formato (24 fps)...',
    'prog.status_ms2': '2/4 Video Depth Anything · generando profundidad 3D en la nube...',
    'prog.status_ms2_mesh': '2/4 Rastreo de malla facial con MediaPipe...',
    'prog.status_ms3': '3/4 SAM 3 · segmentando sujetos y ropa en la nube...',
    'prog.status_ms3_audio': '3/4 Aislamiento vocal y pistas de audio...',
    'prog.status_ms4': '4/4 Aislamiento vocal y ajuste de tono (+3 semitonos)...',
    'prog.status_ms4_pitch': '4/4 Ajustando tono vocal (+3 semitonos)...',
    'prog.status_done': 'Video preparado exitosamente · Listo para revisión',
    'status.rendering': 'Generando video…',
    'status.retrieving': 'Descargando resultado…',
    'prog.retry': 'Reintentar preparación',
    'prog.ready_banner': 'Preparación completada. Revisa el resultado abajo.',
    'settings.title': 'Ajustes del Motor Generativo',
    'settings.subtitle': 'Elige el servicio de IA para la síntesis de personajes. La preparación siempre se ejecuta localmente en tu Mac.',
    'settings.onboarding_title': 'Configura tu motor generativo',
    'settings.onboarding_banner': 'Conecta tu proveedor preferido (OpenRouter, fal.ai, Enhancor, Replicate o ComfyUI) para habilitar la generación.',
    'settings.onboarding_btn': 'Configurar Motor',
    'settings.active_engine': 'Motor Activo',
    'settings.key_placeholder': 'Pega tu clave o token de API',
    'settings.connect_api_key': 'Conectar API Key',
    'settings.save_btn': 'Guardar en Servidor',
    'settings.save_browser_btn': 'Guardar en este Navegador',
    'settings.connected': 'Conectado',
    'settings.not_configured': 'Sin configurar',
    'settings.get_key': 'Obtener clave →',
    'settings.saved_success': 'Ajustes guardados correctamente',
    'settings.close': 'Cerrar',
    's1.tab_upload': '📁 Subir Video',
    's1.tab_template': '🎬 Plantilla',
    'template.title': 'Eminem — Rap God Challenge',
    'template.desc': 'Video original de Eminem en la silla del laboratorio, recortado sin público ni artefactos. Incluye audio aislado (+3st) y máscaras de profundidad SAM 3 listas para probar.',
    'template.tag_duration': '15s Curado',
    'template.tag_res': '640×360 · 24fps',
    'template.tag_audio': 'Voz +3 semitonos',
    'template.tag_depth': 'Depth SAM 3',
    'template.card_cta': '⚡ Cargar en el panel',
    'template.download_btn': '⬇ Descargar MP4',
    'template.loading': 'Cargando plantilla...',
    'template.loaded_status': 'Plantilla Rap God cargada con éxito. Listo para generar en el Paso 3.',
    'template.click_hint': 'Haz clic para cargar esta plantilla en el panel',
    'settings.client_key_title': 'Modo Invitado / BYOK (Clave Temporal)',
    'settings.client_key_desc': 'Guarda tu clave de IA únicamente en este navegador con auto-destrucción por tiempo. Cero almacenamiento en el servidor.',
    'settings.ttl_label': 'Auto-eliminar clave en:',
    'settings.ttl_1h': '1 hora (Recomendado)',
    'settings.ttl_6h': '6 horas',
    'settings.ttl_24h': '24 horas',
    'settings.ttl_session': 'Al cerrar la pestaña (Sesión)',
    'settings.ttl_session_active': 'Activa en esta pestaña (se borra al cerrar)',
    'settings.ttl_expires_in': 'Activa en este navegador',
    'settings.clear_key_btn': '🗑️ Eliminar clave local',
    'settings.key_cleared': 'Clave temporal eliminada del navegador',

    's2.badge': '02',
    's2.title': 'Revisión del Video Preparado',
    's2.companion_alt': 'Gato Detective',
    's2.desc': 'Examina la silueta de segmentación y escucha las pistas vocales aisladas antes de generar el nuevo personaje.',
    's2.empty_title': 'Ningún video procesado aún',
    's2.empty_sub': 'Sube tu clip original en el Paso 01 para ver las capas de vista previa aquí.',
    's2.gate_title': 'Vista Previa de Preparación',
    's2.gate_sub': 'Revisa que la silueta y el audio procesado correspondan a tu escena.',
    's2.pending_review': 'Pendiente de revisión',
    's2.approved_review': 'Aprobado y Verificado',
    's2.approval_required': 'Revisión Requerida',
    's2.btn_approve': 'Aprobar y Continuar al Personaje →',
    's2.btn_approved': 'Aprobado · Listo para generar',
    's2.btn_reject': 'Reportar anomalía',
    's2.tech_summary': 'Detalles técnicos de validación',
    's2.checkbox_label': 'Máscara y separación vocal verificadas conforme a las directrices de calidad.',
    's2.stems_summary': 'Descargar pistas de audio aisladas (Opcional)',
    's2.tab_prepared': 'Entrada preparada',
    's2.tab_original': 'Original',
    's2.tab_depth': 'Profundidad',
    's2.tab_mask': 'Máscara',
    's2.cap_prepared': 'Video preparado + voz aislada pitch +3',
    's2.cap_original': 'Video original',
    's2.cap_depth': 'Mapa exacto de profundidad del modelo',
    's2.cap_mask': 'Máscara completa de segmentación del sujeto',
    's2.download_layer': 'Descargar capa ↓',
    's2.stem_vocals': 'Voz Aislada',
    's2.stem_vocals_p3': 'Voz +3 semitonos',
    's2.stem_music': 'Pista Instrumental',

    's3.badge': '03',
    's3.title': 'Nuevo Personaje y Generación',
    's3.companion_alt': 'Gato Artista',
    's3.engine_pill': 'Motor de Generación',
    's3.quality_pill': 'Calidad: <b>Alta Fidelidad</b>',
    's3.char1_title': 'Foto del Nuevo Personaje · Requerido',
    's3.char1_sub': 'Sube imagen del rostro o cuerpo nuevo (PNG, JPG, WebP)',
    's3.char2_title': 'Segundo Personaje · Opcional',
    's3.char2_sub': 'Solo si hay 2 personas en escena',
    's3.saved_ref': 'Referencia guardada · clic para reemplazar',
    's3.prompt_summary': 'Personalizar Prompt (Opcional · Recomendado ya incluido)',
    's3.prompt_label': 'Instrucciones de síntesis',
    's3.prompt_default': 'Reemplaza completamente al sujeto seleccionado con la referencia del personaje en cada fotograma, incluyendo cabello, manos, ropa y calzado. Preserva el fondo original, encuadre de cámara, iluminación, movimiento y tiempos. Coincide exactamente con el habla integrada sin diálogo extra.',
    's3.hint': 'Transfiere la identidad de tu personaje con la física y voz del video.',
    's3.button': 'Generar Personaje →',
    's3.rendering_title': 'Generando Personaje con IA...',
    's3.rendering_sub': 'Difusión de video en la nube. Reemplazo de identidad cinematográfico (~2-3 min).',
    's3.ms1': 'Envío y Referencias',
    's3.ms2': 'Difusión Video',
    's3.ms3': 'Restauración de Audio',
    's3.ms4': 'Borrador Final Listo',
    's3.done_title': '¡Borrador Generado con Éxito!',
    's3.done_sub': 'El video ha sido renderizado y el audio original fue restaurado.',
    's3.error_title': 'Error al generar personaje',

    's4.badge': '04',
    's4.title': 'Borrador Final y Exportación 1080p',
    's4.desc': 'Los borradores generados reincorporan automáticamente el audio original impecable de la toma fuente (voces, música y ambiente).',
    's4.empty_title': 'Ningún borrador generado aún',
    's4.empty_sub': 'Completa el Paso 03 para renderizar tu primer borrador.',
    's4.badge_draft': 'BORRADOR · AUDIO ORIGINAL',
    's4.badge_hd': '1080P · AUDIO ORIGINAL',
    's4.download_draft': 'Descargar borrador ↓',
    's4.download_hd': 'Descargar 1080p ↓',
    's4.satisfied_title': '¿Satisfecho con el borrador de movimiento?',
    's4.satisfied_hint': 'Escala a alta definición 1080p completa con restauración de audio.',
    's4.upgrade_btn': 'Aprobar y Generar 1080p →',
    's4.metadata_summary': 'Prompt enviado y metadatos de la API',
    's4.raw_download': 'Descargar resultado crudo del proveedor ↓',
    's4.manual_summary': 'Restauración manual de audio (Importar video crudo)',
    's4.manual_title': 'Elegir archivo de video generado',
    's4.manual_sub': 'Restaura el audio original de la fuente en el video',
    's4.manual_btn': 'Restaurar Audio Original',

    'footer.audio': 'tBelt Studio · Restauración de Audio Impecable',
    'footer.host': 'Servidor macOS Local · Inferencia en la Nube'
  },
  en: {
    'brand.badge': 'AI Video',
    'hero.eyebrow': '● Cloud Video Generation Workflow',
    'hero.title': 'Your scene. New characters.',
    'hero.desc': 'Prepare source footage, isolate vocals with +3 st pitch shift, review depth masks, and synthesize photorealistic character replacements.',

    'step.01.num': 'STEP 01',
    'step.01.name': 'Upload Video',
    'step.02.num': 'STEP 02',
    'step.02.name': 'Review Input',
    'step.03.num': 'STEP 03',
    'step.03.name': 'Character Draft',
    'step.04.num': 'STEP 04',
    'step.04.name': '1080p Export',

    'status.initial': 'Select your original video to start the workflow.',
    'status.copied': 'COPIED',
    'status.uploading': 'Uploading and preparing your video…',
    'status.review_required': 'Preparation complete · Input review required',
    'status.review_approved': 'Input approved. Select your new character photo.',
    'status.dispatching': 'Uploading references and dispatching draft to active provider…',
    'status.restoring_audio': 'Restoring original audio stems into generated result…',
    'status.preview_ready': 'Preview ready with original audio.',
    'status.generating_hd': 'Generating 1080p high-definition version…',
    'status.err_no_video': 'Prepare your original video first.',
    'status.err_approve_mask': 'Please review and approve the mask before submitting draft.',
    'status.err_sirio_required': 'Character 1 reference image is required.',

    's1.badge': '01',
    's1.title': 'Source Video & Extraction',
    's1.companion_alt': 'Cat Director',
    's1.upload_title': 'Choose original video',
    's1.upload_sub': 'MP4, MOV or WebM · up to 30 seconds',
    's1.mode_cloud_title': '3D Depth + SAM 3',
    's1.mode_cloud_badge': 'Recommended · Cloud',
    's1.mode_cloud_desc': 'Ultra-fast cloud inference. Segments full bodies, clothing and hair (~$0.005/req).',
    's1.mode_mesh_title': 'Fast Face Mesh',
    's1.mode_mesh_badge': 'Experimental · Local',
    's1.mode_mesh_desc': '2D facial tracking with MediaPipe. Best for webcam or single centered speaker.',
    's1.smart_pill': '<b>Optimal Setup</b>: 3D Depth + SAM 3 + Vocal Isolation',
    's1.hint': 'Upload your clip and prepare it.',
    's1.button': 'Prepare Video →',
    's1.btn_preparing': 'Preparing Video...',
    'prog.title': 'Preparing video...',
    'prog.subtitle': 'Generating 3D depth maps, SAM 3 segmentation, and isolated vocal stems.',
    'prog.uploading': 'Uploading video file...',
    'prog.done_title': 'Video prepared successfully',
    'prog.done_sub': 'Prepared video with pristine original audio. Review the result below.',
    'prog.error_title': 'Preparation error',
    'prog.ms1': 'Upload & Format',
    'prog.ms2': '3D Depth (Cloud AI)',
    'prog.ms2_mesh': 'Face Mesh (MediaPipe)',
    'prog.ms3': 'SAM 3 Segmentation (Cloud AI)',
    'prog.ms3_audio': 'Vocal Isolation (Demucs)',
    'prog.ms4': 'Vocals +3 st & Review',
    'prog.status_ms1': '1/4 Normalizing video and framerate (24 fps)...',
    'prog.status_ms2': '2/4 Video Depth Anything · generating 3D depth in cloud...',
    'prog.status_ms2_mesh': '2/4 Facial mesh tracking with MediaPipe...',
    'prog.status_ms3': '3/4 SAM 3 · segmenting subjects and clothing in cloud...',
    'prog.status_ms3_audio': '3/4 Vocal isolation and audio stems...',
    'prog.status_ms4': '4/4 Vocal isolation and pitch shifting (+3 semitones)...',
    'prog.status_ms4_pitch': '4/4 Pitch shifting vocals (+3 semitones)...',
    'prog.status_done': 'Video prepared successfully · Ready for review',
    'status.rendering': 'Generating video…',
    'status.retrieving': 'Downloading generation…',
    'prog.retry': 'Retry preparation',
    'prog.ready_banner': 'Preparation complete. Review your result below.',
    'settings.title': 'Video Generation Engine Settings',
    'settings.subtitle': 'Choose the cloud AI engine for character synthesis. Video preparation always runs locally on your Mac.',
    'settings.onboarding_title': 'Configure your generation engine',
    'settings.onboarding_banner': 'Connect your preferred provider (OpenRouter, fal.ai, Enhancor, Replicate, or ComfyUI) to enable character synthesis.',
    'settings.onboarding_btn': 'Configure Engine',
    'settings.active_engine': 'Active Engine',
    'settings.key_placeholder': 'Paste your API key or token',
    'settings.connect_api_key': 'Connect API Key',
    'settings.save_btn': 'Save on Server',
    'settings.save_browser_btn': 'Save in this Browser',
    'settings.connected': 'Connected',
    'settings.not_configured': 'Not configured',
    'settings.get_key': 'Get key →',
    'settings.saved_success': 'Settings saved successfully',
    'settings.close': 'Close',
    's1.tab_upload': '📁 Upload Video',
    's1.tab_template': '🎬 Template',
    'template.title': 'Eminem — Rap God Challenge',
    'template.desc': 'Original Eminem cyber-chair video cut (crowd-free). Includes isolated vocals (+3st pitch) and pre-computed SAM 3 depth masks ready to test.',
    'template.tag_duration': '15s Curated',
    'template.tag_res': '640×360 · 24fps',
    'template.tag_audio': 'Vocals +3st',
    'template.tag_depth': 'Depth SAM 3',
    'template.card_cta': '⚡ Load into panel',
    'template.download_btn': '⬇ Download MP4',
    'template.loading': 'Loading template...',
    'template.loaded_status': 'Rap God template loaded successfully. Ready for character draft in Step 3.',
    'template.click_hint': 'Click to load this template into the panel',
    'settings.client_key_title': 'Guest Mode / BYOK (Temporary API Key)',
    'settings.client_key_desc': 'Store your AI key only in this browser with auto-expiration TTL. Never written to server disk.',
    'settings.ttl_label': 'Auto-expire key after:',
    'settings.ttl_1h': '1 hour (Recommended)',
    'settings.ttl_6h': '6 hours',
    'settings.ttl_24h': '24 hours',
    'settings.ttl_session': 'When tab closes (Session)',
    'settings.ttl_session_active': 'Active in this tab (cleared on close)',
    'settings.ttl_expires_in': 'Active in this browser',
    'settings.clear_key_btn': '🗑️ Clear local key',
    'settings.key_cleared': 'Temporary key removed from browser',

    's2.badge': '02',
    's2.title': 'Review Prepared Input',
    's2.companion_alt': 'Cat Detective',
    's2.desc': 'Examine the segmentation mask and listen to the isolated vocal stems before dispatching generation.',
    's2.empty_title': 'No video processed yet',
    's2.empty_sub': 'Upload your original clip in Step 01 to view composite previews here.',
    's2.gate_title': 'Preparation Preview',
    's2.gate_sub': 'Verify that the subject silhouette and processed audio match your scene.',
    's2.pending_review': 'Pending review',
    's2.approved_review': 'Approved & Verified',
    's2.approval_required': 'Approval Required',
    's2.btn_approve': 'Approve & Continue to Character →',
    's2.btn_approved': 'Approved · Ready to generate',
    's2.btn_reject': 'Report anomaly',
    's2.tech_summary': 'Technical validation details',
    's2.checkbox_label': 'Mask and vocal separation verified in compliance with quality guidelines.',
    's2.stems_summary': 'Download isolated audio stems (Optional)',
    's2.tab_prepared': 'Prepared input',
    's2.tab_original': 'Original',
    's2.tab_depth': 'Depth',
    's2.tab_mask': 'Mask',
    's2.cap_prepared': 'Prepared video + isolated vocals pitched +3',
    's2.cap_original': 'Original video',
    's2.cap_depth': 'Exact depth composite from model',
    's2.cap_mask': 'Full subject segmentation mask',
    's2.download_layer': 'Download layer ↓',
    's2.stem_vocals': 'Isolated Vocals',
    's2.stem_vocals_p3': 'Vocals +3 st',
    's2.stem_music': 'Music Stem',

    's3.badge': '03',
    's3.title': 'Character Reference & Generation',
    's3.companion_alt': 'Cat Artist',
    's3.engine_pill': 'Generation Engine',
    's3.quality_pill': 'Quality: <b>High Fidelity</b>',
    's3.char1_title': 'New Character Photo · Required',
    's3.char1_sub': 'Upload new face or body reference (PNG, JPG, WebP)',
    's3.char2_title': 'Second Character · Optional',
    's3.char2_sub': 'Only if there are 2 subjects in the scene',
    's3.saved_ref': 'Saved reference · click to replace',
    's3.prompt_summary': 'Customize AI Prompt (Optional · Recommended prompt included)',
    's3.prompt_label': 'Synthesis instructions',
    's3.prompt_default': 'Replace the complete selected subject with the supplied character reference in every frame, including hair, hands, clothing and footwear. Preserve the original background, camera framing, lighting, motion and timing. Match the embedded speech exactly without extra dialogue.',
    's3.hint': 'Transfer your character identity with the motion physics and audio of the video.',
    's3.button': 'Generate Character →',
    's3.rendering_title': 'Generating Character with AI...',
    's3.rendering_sub': 'Cloud video diffusion. Cinematic identity replacement (~2-3 min).',
    's3.ms1': 'Dispatch & References',
    's3.ms2': 'Video Diffusion',
    's3.ms3': 'Audio Restoration',
    's3.ms4': 'Final Draft Ready',
    's3.done_title': 'Draft Generated Successfully!',
    's3.done_sub': 'Video rendered and full untouched original audio restored.',
    's3.error_title': 'Character generation failed',

    's4.badge': '04',
    's4.title': 'Final Draft & 1080p Export',
    's4.desc': 'Generated drafts automatically re-embed the full pristine source audio (voices, music, background ambience).',
    's4.empty_title': 'No draft generated yet',
    's4.empty_sub': 'Complete Step 03 to render your initial draft.',
    's4.badge_draft': 'DRAFT · ORIGINAL AUDIO',
    's4.badge_hd': '1080P · ORIGINAL AUDIO',
    's4.download_draft': 'Download preview ↓',
    's4.download_hd': 'Download 1080p ↓',
    's4.satisfied_title': 'Satisfied with the motion draft?',
    's4.satisfied_hint': 'Upscale to full high-definition 1080p with audio restoration.',
    's4.upgrade_btn': 'Approve & Generate 1080p →',
    's4.metadata_summary': 'Submitted prompt & API generation metadata',
    's4.raw_download': 'Download raw provider result ↓',
    's4.manual_summary': 'Manual audio restoration (Import raw video)',
    's4.manual_title': 'Choose generated video file',
    's4.manual_sub': 'Restores original source audio into video',
    's4.manual_btn': 'Restore Original Audio',

    'footer.audio': 'tBelt Studio · Pristine Audio Restoration',
    'footer.host': 'Local macOS Host · Cloud Inference'
  }
};

let currentLang = 'es';

function t(key, fallback = '') {
  const dict = I18N[currentLang] || I18N.es;
  return dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : fallback || key);
}

function setLanguage(lang) {
  if (!I18N[lang]) lang = 'es';
  currentLang = lang;
  try {
    localStorage.setItem('tbelt_studio_lang', lang);
  } catch (e) {}

  document.documentElement.lang = lang;

  // Update static text with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = t(key);
    if (translation) {
      if (translation.includes('<') && translation.includes('>')) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  // Update attributes with data-i18n-attr (e.g. data-i18n-attr="placeholder:s1.upload_title,alt:s1.companion_alt")
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const specs = el.dataset.i18nAttr.split(',');
    specs.forEach(spec => {
      const [attr, key] = spec.split(':').map(s => s.trim());
      if (attr && key) {
        el.setAttribute(attr, t(key));
      }
    });
  });

  // Update switcher buttons active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Dispatch custom event for dynamic components
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

function localizeStatus(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s.includes('1/4') || s.includes('normaliz')) {
    return t('prog.status_ms1');
  }
  if (s.includes('2/4') || s.includes('depth') || s.includes('profundidad')) {
    return t('prog.status_ms2');
  }
  if (s.includes('malla') || s.includes('mesh') || s.includes('mediapipe')) {
    return t('prog.status_ms2_mesh');
  }
  if (s.includes('3/4') || s.includes('sam') || s.includes('segment')) {
    return t('prog.status_ms3');
  }
  if (s.includes('vocal') && (s.includes('aislamiento') || s.includes('separating'))) {
    return t('prog.status_ms3_audio');
  }
  if (s.includes('4/4') || s.includes('tono') || s.includes('pitch') || s.includes('semitono')) {
    return t('prog.status_ms4');
  }
  if (s.includes('compositing') || s.includes('composición')) {
    return currentLang === 'en' ? 'Compositing · depth subject over original background' : 'Composición · sujeto de profundidad sobre fondo original';
  }
  if (s.includes('complete') || s.includes('exitosamente') || s.includes('listo para revisión') || s.includes('input review required')) {
    return t('prog.status_done');
  }
  if (s.includes('fal.ai') || s.includes('seedance rendering') || s.includes('in_progress') || s.includes('replicate')) {
    return currentLang === 'en' ? 'Rendering diffusion video with AI provider...' : 'Renderizando video de difusión con proveedor de IA...';
  }
  if (s.includes('in_queue') || s.includes('queued')) {
    return currentLang === 'en' ? 'Queued at provider for processing...' : 'En cola de procesamiento con el proveedor...';
  }
  if (s.includes('restoring entire') || s.includes('restaurando') || s.includes('untouched original source audio')) {
    return currentLang === 'en' ? 'Restoring untouched original source audio...' : 'Restaurando audio original sin pérdidas...';
  }
  if (s.includes('final preview ready')) {
    return currentLang === 'en' ? 'Final preview ready with original source audio' : 'Vista previa final lista con audio original intacto';
  }
  if (s.includes('rendering') || s.includes('generando')) {
    return t('status.rendering');
  }
  if (s.includes('retrieving') || s.includes('descargando')) {
    return t('status.retrieving');
  }
  return status;
}

window.localizeStatus = localizeStatus;
window.t = t;
window.setLanguage = setLanguage;

function initI18n() {
  let savedLang = null;
  try {
    savedLang = localStorage.getItem('tbelt_studio_lang');
  } catch (e) {}

  if (!savedLang) {
    savedLang = 'en';
  }

  setLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
}
