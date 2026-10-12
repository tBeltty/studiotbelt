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
    'status.review_approved': '✓ Silueta aprobada. Selecciona la foto de tu nuevo personaje.',
    'status.dispatching': 'Subiendo referencias y enviando generación a fal.ai…',
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
    's1.smart_pill': '⚡ <b>Configuración Óptima</b>: Malla Facial (MediaPipe) + Aislamiento Vocal (Demucs)',
    's1.hint': '<b>Paso 1 de 2</b>: Sube tu clip y prepáralo con un solo clic.',
    's1.button': '⚡ 1 Clic: Preparar Video →',
    's1.btn_preparing': '⚡ Preparando Video...',
    'prog.title': 'Preparando video con IA...',
    'prog.subtitle': 'Tu Mac está normalizando el video, rastreando la malla facial y aislando el audio.',
    'prog.uploading': 'Subiendo archivo de video...',
    'prog.done_title': '¡Video preparado con éxito!',
    'prog.done_sub': 'Malla facial y pistas vocales listas. Revisa el resultado abajo.',
    'prog.error_title': 'Error en la preparación',
    'prog.ms1': 'Subida y Normalización',
    'prog.ms2': 'Malla Facial (MediaPipe)',
    'prog.ms3': 'Aislamiento Vocal (Demucs)',
    'prog.ms4': 'Listo para Revisión',
    'prog.retry': 'Reintentar preparación',
    'prog.ready_banner': '✓ ¡Preparación completada! Revisa el resultado abajo.',
    'settings.title': 'Ajustes del Motor Generativo',
    'settings.subtitle': 'Elige el servicio de IA para la síntesis de personajes. La preparación siempre se ejecuta localmente en tu Mac.',
    'settings.onboarding_title': 'Configura tu motor generativo',
    'settings.onboarding_banner': 'Conecta tu proveedor preferido (fal.ai, Enhancor, Replicate o ComfyUI) para habilitar la generación.',
    'settings.onboarding_btn': 'Configurar Motor ⚙️',
    'settings.active_engine': 'Motor Activo',
    'settings.key_placeholder': 'Pega tu clave o token de API',
    'settings.save_btn': 'Guardar y Conectar',
    'settings.connected': '✓ Conectado',
    'settings.not_configured': '● Sin configurar',
    'settings.get_key': 'Obtener clave →',
    'settings.saved_success': '✓ Ajustes guardados correctamente',
    'settings.close': 'Cerrar',

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
    's2.btn_approve': '✓ Aprobar y Continuar al Personaje →',
    's2.btn_approved': '✓ Aprobado · Listo para generar',
    's2.btn_reject': 'Reportar anomalía',
    's2.tech_summary': 'Detalles técnicos de validación',
    's2.checkbox_label': 'Máscara y separación vocal verificadas conforme a las directrices de calidad.',
    's2.stems_summary': '🎵 Descargar pistas de audio aisladas (Opcional)',
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
    's3.engine_pill': 'Motor: <b>fal.ai</b>',
    's3.quality_pill': 'Calidad: <b>Alta Fidelidad</b>',
    's3.char1_title': 'Foto del Nuevo Personaje · Requerido',
    's3.char1_sub': 'Sube imagen del rostro o cuerpo nuevo (PNG, JPG, WebP)',
    's3.char2_title': 'Segundo Personaje · Opcional',
    's3.char2_sub': 'Solo si hay 2 personas en escena',
    's3.saved_ref': 'Referencia guardada · clic para reemplazar',
    's3.prompt_summary': '✏️ Personalizar Prompt de IA (Opcional · Recomendado ya incluido)',
    's3.prompt_label': 'Instrucciones de síntesis',
    's3.prompt_default': 'Reemplaza completamente al sujeto seleccionado con la referencia del personaje en cada fotograma, incluyendo cabello, manos, ropa y calzado. Preserva el fondo original, encuadre de cámara, iluminación, movimiento y tiempos. Coincide exactamente con el habla integrada sin diálogo extra.',
    's3.hint': '<b>Paso 2 de 2</b>: Transfiere la identidad de tu personaje con la física y voz del video.',
    's3.button': '✨ 2 Clic: Generar Personaje →',

    's4.badge': '04',
    's4.title': 'Borrador Final y Exportación 1080p',
    's4.desc': 'Los borradores generados reincorporan automáticamente el audio original impecable de la toma fuente (voces, música y ambiente).',
    's4.empty_title': 'Ningún borrador generado aún',
    's4.empty_sub': 'Completa el Paso 03 para renderizar tu primer borrador con fal.ai.',
    's4.badge_draft': 'BORRADOR · AUDIO ORIGINAL',
    's4.badge_hd': '1080P · AUDIO ORIGINAL',
    's4.download_draft': 'Descargar borrador ↓',
    's4.download_hd': 'Descargar 1080p ↓',
    's4.satisfied_title': '¿Satisfecho con el borrador de movimiento?',
    's4.satisfied_hint': 'Escala a alta definición 1080p completa con restauración de audio.',
    's4.upgrade_btn': 'Aprobar y Generar 1080p →',
    's4.metadata_summary': 'Prompt enviado y metadatos de la API',
    's4.raw_download': 'Descargar resultado crudo de fal.ai ↓',
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
    'status.copied': 'COPIED!',
    'status.uploading': 'Uploading and preparing your video…',
    'status.review_required': 'Preparation complete · Input review required',
    'status.review_approved': '✓ Input approved. Select your new character photo.',
    'status.dispatching': 'Uploading references and dispatching draft to fal.ai…',
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
    's1.smart_pill': '⚡ <b>Optimal Setup</b>: Face Mesh (MediaPipe) + Vocal Isolation (Demucs)',
    's1.hint': '<b>Step 1 of 2</b>: Upload your clip and prepare it in 1 click.',
    's1.button': '⚡ 1-Click: Prepare Video →',
    's1.btn_preparing': '⚡ Preparing Video...',
    'prog.title': 'Preparing video with AI...',
    'prog.subtitle': 'Your Mac is normalizing video, tracking face mesh, and isolating audio tracks.',
    'prog.uploading': 'Uploading video file...',
    'prog.done_title': 'Video prepared successfully!',
    'prog.done_sub': 'Face mesh and vocal stems are ready. Review the result below.',
    'prog.error_title': 'Preparation error',
    'prog.ms1': 'Upload & Normalize',
    'prog.ms2': 'Face Mesh (MediaPipe)',
    'prog.ms3': 'Vocal Isolation (Demucs)',
    'prog.ms4': 'Ready for Review',
    'prog.retry': 'Retry preparation',
    'prog.ready_banner': '✓ Preparation complete! Review your result below.',
    'settings.title': 'Video Generation Engine Settings',
    'settings.subtitle': 'Choose the cloud AI engine for character synthesis. Video preparation always runs locally on your Mac.',
    'settings.onboarding_title': 'Configure your generation engine',
    'settings.onboarding_banner': 'Connect your preferred provider (fal.ai, Enhancor, Replicate, or ComfyUI) to enable character synthesis.',
    'settings.onboarding_btn': 'Configure Engine ⚙️',
    'settings.active_engine': 'Active Engine',
    'settings.key_placeholder': 'Paste your API key or token',
    'settings.save_btn': 'Save & Connect',
    'settings.connected': '✓ Connected',
    'settings.not_configured': '● Not configured',
    'settings.get_key': 'Get key →',
    'settings.saved_success': '✓ Settings saved successfully',
    'settings.close': 'Close',

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
    's2.btn_approve': '✓ Approve & Continue to Character →',
    's2.btn_approved': '✓ Approved · Ready to generate',
    's2.btn_reject': 'Report anomaly',
    's2.tech_summary': 'Technical validation details',
    's2.checkbox_label': 'Mask and vocal separation verified in compliance with quality guidelines.',
    's2.stems_summary': '🎵 Download isolated audio stems (Optional)',
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
    's3.engine_pill': 'Engine: <b>fal.ai</b>',
    's3.quality_pill': 'Quality: <b>High Fidelity</b>',
    's3.char1_title': 'New Character Photo · Required',
    's3.char1_sub': 'Upload new face or body reference (PNG, JPG, WebP)',
    's3.char2_title': 'Second Character · Optional',
    's3.char2_sub': 'Only if there are 2 subjects in the scene',
    's3.saved_ref': 'Saved reference · click to replace',
    's3.prompt_summary': '✏️ Customize AI Prompt (Optional · Recommended prompt included)',
    's3.prompt_label': 'Synthesis instructions',
    's3.prompt_default': 'Replace the complete selected subject with the supplied character reference in every frame, including hair, hands, clothing and footwear. Preserve the original background, camera framing, lighting, motion and timing. Match the embedded speech exactly without extra dialogue.',
    's3.hint': '<b>Step 2 of 2</b>: Transfer your character\'s identity with the motion physics and audio of the video.',
    's3.button': '✨ 2 Click: Generate Character →',

    's4.badge': '04',
    's4.title': 'Final Draft & 1080p Export',
    's4.desc': 'Generated drafts automatically re-embed the full pristine source audio (voices, music, background ambience).',
    's4.empty_title': 'No draft generated yet',
    's4.empty_sub': 'Complete Step 03 to render your initial draft with fal.ai.',
    's4.badge_draft': 'DRAFT · ORIGINAL AUDIO',
    's4.badge_hd': '1080P · ORIGINAL AUDIO',
    's4.download_draft': 'Download preview ↓',
    's4.download_hd': 'Download 1080p ↓',
    's4.satisfied_title': 'Satisfied with the motion draft?',
    's4.satisfied_hint': 'Upscale to full high-definition 1080p with audio restoration.',
    's4.upgrade_btn': 'Approve & Generate 1080p →',
    's4.metadata_summary': 'Submitted prompt & API generation metadata',
    's4.raw_download': 'Download raw fal.ai result ↓',
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

function initI18n() {
  let savedLang = null;
  try {
    savedLang = localStorage.getItem('tbelt_studio_lang');
  } catch (e) {}

  if (!savedLang) {
    const navLang = (navigator.language || '').toLowerCase();
    savedLang = navLang.startsWith('es') ? 'es' : 'en';
  }

  setLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
}
