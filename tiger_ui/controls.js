const root=element.querySelector('.tg-controls'), $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
const words={
 en:{processingLabel:'TIGER at work',elapsed:'Elapsed',keepOpen:'Keep this page open.',queuedHelp:'Your file is ready. Waiting for an available GPU.',prepareHelp:'Reading the sound and preparing it for the model.',separatingHelp:'TIGER is isolating the sound sources in your file.',exportHelp:'Creating the waveforms and your download files.',edit:'Settings',closeEdit:'Hide settings',settingsTitle:'Separation settings',settingsHelp:'Change the file or tracks, then create a new separation.',replaceTitle:'Choose another file',cancelReplace:'Cancel',closeChoices:'Close choices',moreExamples:'Try another example',waveLoading:'Drawing the waveform…',waveUnavailable:'Waveform unavailable. Playback and separation remain available.',newFile:'New file',fileTitle:'Start with your file',fileHelp:'Choose what you want to import.',chooseAudio:'Import audio',chooseVideo:'Import video',audioInputHint:'A recording, song or podcast.',videoInputHint:'Separate its sound. Keep the picture.',audioFormats:'MP3 · WAV · FLAC · AAC · OGG · and more',videoFormats:'MP4 · MKV · AVI · MOV · WebM · and more',audioFile:'Audio file',videoFile:'Video file',optionsTitle:'The tracks to create',optionsHelp:'Choose the tracks you want to hear.',runTitle:'Start separation',separation:'Separation',stems:'Dialogue, music & effects',stemsHelp:'3 separate tracks.',speakers:'Two overlapping voices',speakersHelp:'2 tracks, one for each person.',audio:'Audio tracks only',video:'Audio tracks + videos',outputTitle:'Download formats',drop:'Choose a file',browse:'or drop your file here',limits:'Any length · any size',replace:'Change',remove:'Remove file',examples:'Or try an example',exampleStems:'Sound scene',exampleSpeakers:'Two voices',exampleVideo:'Video',run:'Create the tracks',runStems:'Create 3 tracks',runSpeakers:'Create 2 voice tracks',running:'Separating…',queued:'Waiting for a GPU',uploading:'Uploading your file…',loadingExample:'Opening the example…',choose:'Choose an audio or video file',original:'Original',originalLabel:'Original file · before separation',play:'Play original',pause:'Pause original',seek:'Playback position',prepare:'Prepare',separating:'Separate',export:'Export',prepareLong:'Preparing your file',separatingLong:'Separating the tracks',exportLong:'Preparing the downloads',processingHelp:'Keep this page open. Your tracks will appear here.',audioSummary:'{count} separate audio files, ready to play and download.',videoSummary:'{count} videos with isolated sound, plus their audio tracks.',shorterFile:'Choose a shorter excerpt',quotaTitle:'Not enough GPU quota',quotaCopy:'There is not enough GPU time available for this calculation. A shorter excerpt may need less time; otherwise, wait for your quota to reset.',quotaNumbers:'Requested: {requested} s of GPU time · Available: {remaining} s.',retryAfter:'Quota resets in about {time}.',quotaBlocked:'Waiting for quota',retry:'Try again',failureTitle:'Separation could not finish',gpu_unavailable:'No GPU is available right now. Please try again in a moment.',gpu_runs_limit:'Hugging Face has limited the number of calculations for this session. Please wait before trying again. A shorter file will not lift this limit.',gpu_pending:'Another calculation is using your available GPU quota. Wait for it to finish before retrying.',gpu_timeout:'The calculation exceeded its GPU time. Try a shorter excerpt.',reference:'Reference',upload_failed:'The upload did not finish. Please try again.',load_failed:'The example could not be loaded. Please try again.',file_too_large:'Choose a file smaller than 200 MB.',empty_file:'Choose a non-empty audio or video file.',file_too_long:'Choose an excerpt of 5 minutes or less.',multiple:'Choose one file at a time.',failed:'The calculation stopped unexpectedly. Your file is still here. You can try again.',invalid_file:'This file could not be read. Try another audio or video file.',no_audio:'This file has no audio track.',video_required:'Choose a video or select Audio only.',decode_failed:'The audio could not be decoded. Try another file.',previewError:'Preview unavailable. You can still separate this file.'},
 fr:{processingLabel:'TIGER au travail',elapsed:'Temps écoulé',keepOpen:'Gardez cette page ouverte.',queuedHelp:'Votre fichier est prêt. En attente d’un GPU disponible.',prepareHelp:'Lecture du son et préparation pour le modèle.',separatingHelp:'TIGER isole les différentes sources sonores de votre fichier.',exportHelp:'Création des ondes et des fichiers à télécharger.',edit:'Réglages',closeEdit:'Masquer',settingsTitle:'Réglages de séparation',settingsHelp:'Modifiez le fichier ou les pistes, puis lancez une nouvelle séparation.',replaceTitle:'Choisissez un autre fichier',cancelReplace:'Annuler',closeChoices:'Fermer les choix',moreExamples:'Essayer un autre exemple',waveLoading:'Création de l’onde sonore…',waveUnavailable:'Onde indisponible. La lecture et la séparation restent accessibles.',newFile:'Nouveau fichier',fileTitle:'Commencez par votre fichier',fileHelp:'Choisissez ce que vous souhaitez importer.',chooseAudio:'Importer un audio',chooseVideo:'Importer une vidéo',audioInputHint:'Un enregistrement, un morceau ou un podcast.',videoInputHint:'Le son sera séparé. Les images seront conservées.',audioFormats:'MP3 · WAV · FLAC · AAC · OGG · etc.',videoFormats:'MP4 · MKV · AVI · MOV · WebM · etc.',audioFile:'Fichier audio',videoFile:'Fichier vidéo',optionsTitle:'Les pistes à créer',optionsHelp:'Choisissez les pistes que vous voulez écouter.',runTitle:'Lancer la séparation',separation:'Séparation',stems:'Dialogues, musique et effets',stemsHelp:'3 pistes séparées.',speakers:'Deux voix superposées',speakersHelp:'2 pistes, une par personne.',audio:'Pistes audio uniquement',video:'Pistes audio et vidéos',outputTitle:'Résultats à télécharger',drop:'Choisir un fichier',browse:'ou glissez votre fichier ici',limits:'Durée et taille illimitées',replace:'Changer',remove:'Retirer le fichier',examples:'Ou essayer un exemple',exampleStems:'Scène sonore',exampleSpeakers:'Deux voix',exampleVideo:'Vidéo',run:'Créer les pistes',runStems:'Créer les 3 pistes',runSpeakers:'Créer les 2 pistes de voix',running:'Séparation en cours…',queued:'En attente d’un GPU',uploading:'Envoi de votre fichier…',loadingExample:'Ouverture de l’exemple…',choose:'Choisir un fichier audio ou vidéo',original:'Original',originalLabel:'Fichier original · avant séparation',play:'Écouter l’original',pause:'Mettre l’original en pause',seek:'Position de lecture',prepare:'Préparer',separating:'Séparer',export:'Exporter',prepareLong:'Préparation de votre fichier',separatingLong:'Séparation des pistes',exportLong:'Préparation des téléchargements',processingHelp:'Gardez cette page ouverte. Vos pistes apparaîtront ici.',audioSummary:'{count} fichiers audio séparés, à écouter et à télécharger.',videoSummary:'{count} vidéos avec le son isolé, accompagnées de leurs pistes audio.',shorterFile:'Choisir un extrait plus court',quotaTitle:'Quota GPU insuffisant',quotaCopy:'Le temps GPU disponible ne suffit pas pour ce calcul. Un extrait plus court peut demander moins de temps ; sinon, attendez le renouvellement du quota.',quotaNumbers:'Calcul demandé : {requested} s de GPU · Disponibles : {remaining} s.',retryAfter:'Le quota sera renouvelé dans environ {time}.',quotaBlocked:'En attente de quota',retry:'Réessayer',failureTitle:'La séparation n’a pas abouti',gpu_unavailable:'Aucun GPU n’est disponible pour le moment. Réessayez dans un instant.',gpu_runs_limit:'Hugging Face limite le nombre de calculs pour cette session. Veuillez patienter avant de réessayer. Un fichier plus court ne lève pas cette limite.',gpu_pending:'Un autre calcul utilise votre quota GPU disponible. Attendez sa fin avant de réessayer.',gpu_timeout:'Le calcul a dépassé son temps GPU. Essayez un extrait plus court.',reference:'Référence',upload_failed:'L’envoi n’a pas abouti. Veuillez réessayer.',load_failed:'L’exemple est indisponible. Veuillez réessayer.',file_too_large:'Choisissez un fichier de moins de 200 Mo.',empty_file:'Choisissez un fichier audio ou vidéo non vide.',file_too_long:'Choisissez un extrait de 5 minutes maximum.',multiple:'Choisissez un seul fichier à la fois.',failed:'Le calcul s’est arrêté de façon inattendue. Votre fichier est conservé. Vous pouvez réessayer.',invalid_file:'Ce fichier est illisible. Essayez un autre fichier audio ou vidéo.',no_audio:'Ce fichier ne contient aucune piste audio.',video_required:'Choisissez une vidéo ou le format Audio uniquement.',decode_failed:'Le son est illisible. Essayez un autre fichier.',previewError:'Aperçu indisponible. Vous pouvez quand même séparer ce fichier.'}
};
let lang=document.documentElement.lang==='fr'?'fr':'en',task='stems',medium='audio',source=null;
let pending='',phase='',error='',token='',dragDepth=0,blob='',preview=$('.tg-input-audio');
let runStarted=0;
let pendingTimer=0,editorOpen=true,failure=null,previewEpoch=0,choosingSource=false;
let sourceToken='',wavePeaks=[],waveState='empty',waveTimer=0,exampleTask=null;
const disclosures=new Map();
const t=k=>words[lang][k]||k;
const uid=()=>crypto.randomUUID();
const fmt=s=>{s=Math.floor(Number.isFinite(s)?s:0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const busy=()=>Boolean(pending);
function notifyPlayer(status){document.dispatchEvent(new CustomEvent('tiger:source',{detail:{status,task,media:medium,filename:source?.name||'',job:uid()}}));}
function setError(key){error=key;if(key&&!choosingSource)editorOpen=true;render();}
function clearTimer(){clearTimeout(pendingTimer);pendingTimer=0;}
function armAcknowledgement(){clearTimer();pendingTimer=setTimeout(()=>{if(pending!=='example')return;pending='';exampleTask=null;setError('load_failed');},60000);}
function render(){
 root.lang=lang;root.setAttribute('aria-label',t('separation'));root.dataset.task=task;root.dataset.media=medium;root.dataset.busy=String(busy());root.dataset.result=phase;root.dataset.hasSource=String(Boolean(source));root.dataset.editorOpen=String(editorOpen);root.dataset.choosingSource=String(choosingSource);
 $$('[data-c]').forEach(n=>n.textContent=t(n.dataset.c));
 $$('[data-task]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.task===task)));
 $$('[data-media]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.media===medium)));

 $('.tg-compact-source').hidden=phase!=='complete';
 $('.tg-compact-file strong').textContent=source?.name||'';
 $('.tg-compact-mode').textContent=t(task);
 $('.tg-edit [data-c=edit]').textContent=t('edit');$('.tg-edit').setAttribute('aria-label',t(editorOpen?'closeEdit':'edit'));
 $('.tg-settings-heading').hidden=phase!=='complete';
 $('.tg-replace-heading').hidden=!source;
 $('.tg-replace').setAttribute('aria-expanded',String(choosingSource));$('.tg-replace').setAttribute('aria-label',t(choosingSource?'closeChoices':'replace'));$('.tg-edit').setAttribute('aria-expanded',String(editorOpen));
 $('.tg-task-switch').setAttribute('aria-label',t('separation'));$('.tg-media-switch').setAttribute('aria-label',t('outputTitle'));
 $('.tg-import-options').hidden=false;$('.tg-file-card').hidden=!source;
 $('.tg-drop').setAttribute('aria-label',t('chooseAudio'));$('.tg-import-video').setAttribute('aria-label',t('chooseVideo'));$('.tg-remove').setAttribute('aria-label',t('remove'));
 $('.tg-chosen-name').textContent=source?.name||'';
 $('.tg-chosen-meta').textContent=source?[t(source.isVideo?'videoFile':'audioFile'),source.bytes?`${(source.bytes/1048576).toLocaleString(lang,{maximumFractionDigits:1})} ${lang==='fr'?'Mo':'MB'}`:'',Number.isFinite(preview.duration)?fmt(preview.duration):''].filter(Boolean).join(' · '):'';
 $('.tg-upload-state').hidden=!['upload','example'].includes(pending);
 $('.tg-upload-state span:last-child').textContent=t(pending==='example'?'loadingExample':'uploading');
 $('.tg-upload-error').hidden=!error;$('.tg-upload-error').textContent=error?t(error):'';
 $$('button').forEach(b=>b.disabled=busy());$('.tg-preview-seek').disabled=busy();
 const blocked=failure?.error==='gpu_quota'&&failure.retryAt&&Date.now()<failure.retryAt;
 $('.tg-run').disabled=busy()||!source||choosingSource||blocked;
 $('.tg-run').classList.toggle('is-working',pending==='run');
 $('.tg-run [data-c=run]').textContent=pending==='run'?t(phase==='queued'?'queued':'running'):blocked?t('quotaBlocked'):failure?t('retry'):t(task==='stems'?'runStems':'runSpeakers');
 $('.tg-step-options').hidden=!source;$('.tg-step-run').hidden=!source;$('.tg-examples').hidden=pending==='run';
 $('.tg-examples [data-c=examples]').textContent=t(source?'moreExamples':'examples');
 $$('[data-example]').forEach(b=>{if(source?.origin==='example'&&source.key===b.dataset.example)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
 $('.tg-video-output').hidden=!source?.isVideo;
 $('.tg-output-summary').textContent=t(medium==='video'?'videoSummary':'audioSummary').replace('{count}',task==='stems'?'3':'2');
 $('.tg-run-status').hidden=pending!=='run';
 $('.tg-run-status strong').textContent=t(phase==='queued'?'queued':phase+'Long');
 $('.tg-processing-help').textContent=t(phase+'Help');
 const phases=['prepare','separating','export'],current=phases.indexOf(phase);
 $$('[data-phase]').forEach(n=>{const active=n.dataset.phase===phase;n.classList.toggle('active',active);n.classList.toggle('done',phases.indexOf(n.dataset.phase)<current);if(active)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');});
 refreshElapsed();
 renderFailure();
 $('.tg-input-preview').hidden=!source;
 refreshPreview();
 disclose($('.tg-source-picker'),!source||choosingSource,!$('.tg-editor-shell').hidden);
 disclose($('.tg-editor-shell'),phase!=='complete'||editorOpen);
}
function disclose(host,open,animate=true){
 const previous=disclosures.get(host);
 if(previous?.open===open)return;
 const from=host.hidden?0:host.getBoundingClientRect().height;
 const opacity=host.hidden?0:Number(getComputedStyle(host).opacity);
 previous?.animation?.cancel();host.hidden=false;host.inert=!open;
 host.setAttribute('aria-hidden',String(!open));
 const state={open,animation:null};disclosures.set(host,state);
 if(!previous||!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){host.hidden=!open;host.style.overflow='';return;}
 const to=open?host.scrollHeight:0;
 host.style.overflow='clip';
 const animation=host.animate([{height:from+'px',opacity},{height:to+'px',opacity:open?1:0}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});
 state.animation=animation;
 animation.onfinish=()=>{if(disclosures.get(host)!==state)return;host.hidden=!open;host.style.overflow='';state.animation=null;};
}
function refreshElapsed(){if(pending==='run')$('.tg-elapsed output').textContent=fmt((performance.now()-runStarted)/1000);}
function renderFailure(){
 const host=$('.tg-run-error');host.hidden=!failure;
 if(!failure)return;
 const quota=failure.error==='gpu_quota';
 host.querySelector('strong').textContent=t(quota?'quotaTitle':'failureTitle');
 $('.tg-error-copy').textContent=t(quota?'quotaCopy':failure.error);
 $('.tg-shorter-file').hidden=!quota;
 $('.tg-quota-numbers').textContent=Number.isFinite(failure.requested_seconds)&&Number.isFinite(failure.remaining_seconds)?t('quotaNumbers').replace('{requested}',Math.ceil(failure.requested_seconds)).replace('{remaining}',Math.floor(failure.remaining_seconds)):'';
 const minutes=failure.retryAt?Math.max(0,Math.ceil((failure.retryAt-Date.now())/60000)):0;
 const time=minutes>=60?`${Math.floor(minutes/60)} h ${minutes%60} min`:`${minutes} min`;
 $('.tg-retry-after').textContent=minutes?t('retryAfter').replace('{time}',time):'';
 $('.tg-error-reference').textContent=failure.reference?`${t('reference')} : ${failure.reference}`:'';
}
function showFailure(value){
 pending='';phase='error';editorOpen=true;failure={...value,retryAt:value.retry_after_seconds?Date.now()+value.retry_after_seconds*1000:null};render();
 requestAnimationFrame(()=>$('.tg-run-error').focus({preventScroll:false}));
}
function refreshPreview(){
 const button=$('.tg-preview-play'),label=t(preview.paused?'play':'pause'),symbol=preview.paused?'▶':'Ⅱ';
 if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);
 if(button.textContent!==symbol)button.textContent=symbol;
 $('.tg-preview-seek').setAttribute('aria-label',t('seek'));
 $('.tg-preview-seek').value=preview.duration?preview.currentTime/preview.duration*100:0;
 $('.tg-input-transport output').textContent=fmt(preview.currentTime);
 $('.tg-preview-duration').textContent=Number.isFinite(preview.duration)?fmt(preview.duration):'';
 const ratio=Number.isFinite(preview.duration)&&preview.duration>0?preview.currentTime/preview.duration:0;
 $$('.tg-preview-bar').forEach(bar=>bar.classList.toggle('is-played',Number(bar.dataset.at)<ratio));
 const cursor=$('.tg-preview-cursor');if(cursor)cursor.setAttribute('x',String(Math.max(0,Math.min(638,ratio*640))));
 $('.tg-preview-seek').setAttribute('aria-valuetext',`${fmt(preview.currentTime)} / ${fmt(preview.duration)}`);
 $('.tg-preview-seek').disabled=busy()||!Number.isFinite(preview.duration)||preview.duration<=0;
 $('.tg-wave-note').hidden=!['loading','unavailable'].includes(waveState);
 $('.tg-wave-note').textContent=t(waveState==='loading'?'waveLoading':'waveUnavailable');
}
function pausePreview(){++previewEpoch;preview.pause();refreshPreview();}
function releasePreview(){
 ++previewEpoch;sourceToken='';clearTimeout(waveTimer);wavePeaks=[];waveState='empty';drawPreviewWave();
 for(const p of [$('.tg-input-audio'),$('video')]){p.pause();p.removeAttribute('src');p.load();}
 if(blob){URL.revokeObjectURL(blob);blob='';}
}
function loadPreview(url,isVideo){
 releasePreview();preview=isVideo?$('video'):$('.tg-input-audio');$('video').hidden=!isVideo;
 const parsed=new URL(url,location.href);if(!['http:','https:','blob:'].includes(parsed.protocol))return;
 preview.src=parsed.href;preview.load();
}
function drawPreviewWave(){
 const host=$('.tg-preview-wave'),svg=host.querySelector('svg');host.dataset.waveState=waveState;
 const count=Math.max(32,Math.min(160,Math.floor((host.clientWidth||480)/6)));
 if(!wavePeaks.length){svg.innerHTML='<path d="M0 32H640" class="tg-wave-baseline"/><rect class="tg-preview-cursor" x="0" y="10" width="2" height="44" rx="1"/>';refreshPreview();return;}
 const points=Array.from({length:count},(_,i)=>{const part=wavePeaks.slice(Math.floor(i*wavePeaks.length/count),Math.max(Math.floor((i+1)*wavePeaks.length/count),Math.floor(i*wavePeaks.length/count)+1));return Math.sqrt(part.reduce((sum,x)=>sum+x*x,0)/part.length);});
 const max=Math.max(...points,0.000001),step=640/count;
 svg.innerHTML=points.map((p,i)=>{const h=Math.max(3,Math.pow(p/max,.75)*54);return `<rect class="tg-preview-bar" data-at="${i/count}" x="${(i*step).toFixed(2)}" y="${((64-h)/2).toFixed(2)}" width="${(step*.58).toFixed(2)}" height="${h.toFixed(2)}" rx="1.5"/>`;}).join('')+'<rect class="tg-preview-cursor" x="0" y="5" width="2" height="54" rx="1"/>';
 refreshPreview();
}
function requestWaveform(){
 const current=sourceToken=uid();waveState='loading';drawPreviewWave();
 waveTimer=setTimeout(()=>{if(sourceToken===current&&waveState==='loading'){waveState='unavailable';drawPreviewWave();}},600000);
 trigger('waveform',{source,sourceToken:current});
}
function setSource(next,url,isVideo){source={...next,isVideo};medium=isVideo?'video':'audio';failure=null;error='';pending='';phase='';editorOpen=true;choosingSource=false;loadPreview(url,isVideo);notifyPlayer('ready');render();requestWaveform();}
async function uploadFile(files){
 if(busy()||!files?.length)return;
 if(files.length!==1){setError('multiple');return;}
 const file=files[0];
 if(!file.size){setError('empty_file');return;}
 if(!/^(audio|video)\//.test(file.type)&&! /\.(wav|mp3|flac|m4a|aac|ogg|oga|opus|wma|aiff|aif|aifc|alac|ape|wv|mka|ac3|eac3|dts|amr|au|caf|mp2|mpc|tta|w64|spx|mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpg|mpeg|ts|mts|m2ts|3gp|3g2|vob|ogv|asf|divx|f4v|mxf|rm|rmvb)$/i.test(file.name)){setError('invalid_file');return;}
 pending='upload';editorOpen=true;error='';pausePreview();render();const current=token=uid();
 try{
  const result=await upload(file);if(token!==current)return;
  const isVideo=file.type.startsWith('video/')||/\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpg|mpeg|ts|mts|m2ts|3gp|3g2|vob|ogv|asf|divx|f4v|mxf|rm|rmvb)$/i.test(file.name);
  setSource({origin:'upload',path:result.path,name:file.name,bytes:file.size},result.url,isVideo);
 }catch(e){if(token===current){pending='';setError('upload_failed');}}
 finally{$('.tg-file-input').value='';}
}
$('.tg-edit').addEventListener('click',()=>{editorOpen=!editorOpen;if(!editorOpen)pausePreview();render();});
const accepts={audio:'audio/*,.wav,.mp3,.flac,.m4a,.aac,.ogg,.oga,.opus,.wma,.aiff,.aif,.aifc,.alac,.ape,.wv,.mka,.ac3,.eac3,.dts,.amr,.au,.caf,.mp2,.mpc,.tta,.w64,.spx',video:'video/*,.mp4,.m4v,.mov,.webm,.mkv,.avi,.wmv,.flv,.mpg,.mpeg,.ts,.mts,.m2ts,.3gp,.3g2,.vob,.ogv,.asf,.divx,.f4v,.mxf,.rm,.rmvb'};
function chooseFile(kind){$('.tg-file-input').accept=accepts[kind]||Object.values(accepts).join(',');$('.tg-file-input').click();}
function openSourceChoices(){
 if(busy())return;editorOpen=true;choosingSource=true;pausePreview();render();
}
function closeSourceChoices(){
 if(busy())return;choosingSource=false;render();$('.tg-replace').focus({preventScroll:true});
}
$('.tg-new').addEventListener('click',openSourceChoices);
$('.tg-cancel-replace').addEventListener('click',closeSourceChoices);
$('.tg-source-picker').addEventListener('keydown',event=>{if(event.key==='Escape'&&choosingSource){event.preventDefault();closeSourceChoices();}});
$$('[data-import]').forEach(button=>button.addEventListener('click',()=>chooseFile(button.dataset.import)));
$('.tg-file-input').addEventListener('change',e=>uploadFile(e.target.files));
$('.tg-replace').addEventListener('click',()=>choosingSource?closeSourceChoices():openSourceChoices());
$('.tg-shorter-file').addEventListener('click',openSourceChoices);
$('.tg-remove').addEventListener('click',()=>{if(busy())return;source=null;choosingSource=false;failure=null;error='';phase='';releasePreview();notifyPlayer('empty');render();});
$$('[data-task]').forEach(b=>b.addEventListener('click',()=>{if(task===b.dataset.task)return;task=b.dataset.task;failure=null;error='';phase='';pausePreview();notifyPlayer(source?'ready':'empty');render();}));
$$('[data-media]').forEach(b=>b.addEventListener('click',()=>{if(medium===b.dataset.media)return;medium=b.dataset.media;failure=null;error='';phase='';pausePreview();notifyPlayer(source?'ready':'empty');render();}));
$$('[data-example]').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.example;
 exampleTask=key==='speakers'?'speakers':key==='stems'?'stems':task;
 const nextMedium=key==='video'?'video':'audio';
 pending='example';failure=null;error='';token=uid();pausePreview();render();armAcknowledgement();trigger('example',{task:exampleTask,media:nextMedium,token});
}));
$('.tg-run').addEventListener('click',()=>{
 if(busy()||!source||choosingSource)return;
 runStarted=performance.now();pending='run';phase='queued';failure=null;error='';token=uid();pausePreview();render();notifyPlayer('queued');
 requestAnimationFrame(()=>{const feedback=$('.tg-run-status'),r=feedback.getBoundingClientRect();if(r.bottom>innerHeight||r.top<0)feedback.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 trigger('separate',{task,media:medium,lang,source,token});
});
$('.tg-preview-play').addEventListener('click',async()=>{
 if(!preview.paused){pausePreview();return;}
 const player=preview,intent=++previewEpoch;
 document.dispatchEvent(new CustomEvent('tiger:previewplay'));
 try{
  if(player.error){const time=player.currentTime||0;player.load();player.currentTime=time;}
  await player.play();
  if(intent===previewEpoch&&player===preview&&error==='previewError')setError('');
 }catch(e){
  if(intent===previewEpoch&&player===preview){
   // WebKit can reject play() while leaving paused=false. Restore a truthful
   // stopped state so the next press retries instead of merely pausing.
   player.pause();refreshPreview();
   if(e.name!=='AbortError')setError('previewError');
  }
 }
});
$('.tg-preview-seek').addEventListener('input',e=>{if(Number.isFinite(preview.duration))preview.currentTime=Number(e.target.value)/100*preview.duration;refreshPreview();});
for(const p of [$('.tg-input-audio'),$('video')]){
 // Browser/OS media controls can resume a native preview without clicking our
 // button. Enforce ownership on the actual media events as well as the gesture.
 const claimPreview=()=>{
  if(p.paused)return; // Ignore a queued event superseded by the result player.
  if(p!==preview||!source||!editorOpen||busy()||!root.isConnected){
   p.pause();refreshPreview();return;
  }
  document.dispatchEvent(new CustomEvent('tiger:previewplay'));refreshPreview();
 };
 for(const event of ['play','playing'])p.addEventListener(event,claimPreview);
 for(const event of ['pause','timeupdate','ended'])p.addEventListener(event,refreshPreview);
 p.addEventListener('loadedmetadata',render);
 p.addEventListener('error',()=>{
  if(p===preview&&p.error){
   pausePreview();
   if(source&&editorOpen&&!busy())setError('previewError');
  }
 });
}
root.addEventListener('dragenter',e=>{e.preventDefault();if(!busy()){dragDepth++;root.classList.add('is-dragging');}});
root.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect=busy()?'none':'copy';});
root.addEventListener('dragleave',e=>{e.preventDefault();if(--dragDepth<=0){dragDepth=0;root.classList.remove('is-dragging');}});
root.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;root.classList.remove('is-dragging');uploadFile(e.dataTransfer.files);});
function receive(){
 const value=props.value||{};
 if(value.kind==='waveform'){
  if(!source||value.sourceToken!==sourceToken)return;
  clearTimeout(waveTimer);wavePeaks=Array.isArray(value.peaks)?value.peaks.filter(x=>Number.isFinite(x)&&x>=0):[];
  waveState=wavePeaks.length?'ready':'unavailable';drawPreviewWave();return;
 }
 if(value.token&&value.token!==token)return;
 if(value.kind==='example'){
  clearTimer();const file=value.file;if(exampleTask)task=exampleTask;exampleTask=null;
  setSource({origin:'example',key:value.key,name:file.orig_name,bytes:value.bytes},file.url,value.key==='video');
 }else if(value.kind==='status'){
  clearTimer();if(value.status==='error'){showFailure(value);return;}if(value.status==='complete')editorOpen=false;phase=value.status;pending=value.status==='complete'?'':'run';render();
 }else if(value.kind==='failure'){
  clearTimer();if(value.error==='load_failed'){pending='';exampleTask=null;setError(value.error);return;}showFailure(value);
  document.dispatchEvent(new CustomEvent('tiger:source',{detail:{status:'error',task,media:medium,filename:source?.name||'',error:value.error||'failed',job:uid()}}));
 }
}
const onLanguage=e=>{lang=e.detail;render();};
document.addEventListener('tiger:language',onLanguage);
const onPlayback=()=>pausePreview();document.addEventListener('tiger:playback',onPlayback);
root.addEventListener('pointerdown',()=>root.dataset.inputMode='pointer');
root.addEventListener('keydown',()=>root.dataset.inputMode='keyboard');
const waveResize=new ResizeObserver(drawPreviewWave);waveResize.observe($('.tg-preview-wave'));
watch('value',receive);
const elapsedClock=setInterval(refreshElapsed,1000);
const retryClock=setInterval(()=>{if(failure?.retryAt)render();},30000);
const cleanup=new MutationObserver(()=>{if(!root.isConnected){clearTimer();disclosures.forEach(s=>s.animation?.cancel());waveResize.disconnect();clearInterval(retryClock);clearInterval(elapsedClock);releasePreview();document.removeEventListener('tiger:language',onLanguage);document.removeEventListener('tiger:playback',onPlayback);cleanup.disconnect();}});cleanup.observe(document.body,{childList:true,subtree:true});
render();receive();
