const root = element.querySelector('.tg-workspace');
const $ = selector => root.querySelector(selector);
const $$ = selector => [...root.querySelectorAll(selector)];
const NS='http://www.w3.org/2000/svg';
const dictionary={
 en:{waveforms:'Waveforms',monitorTitle:'Video preview',monitorMix:'Sound from active tracks',monitorOriginal:'Original soundtrack',monitorSilent:'All tracks muted',queuedLong:'Waiting for an available slot',emptyTitle:'A little clarity for your audio.',emptyCopy:'Drop in a file or try an example. Your separated tracks will meet here.',result:'YOUR TRACKS',listen:'Sound, track by track.',compareHelp:'Tap a tab to mute a track. Tap a waveform to seek.',trackOn:'Sound on',trackOff:'Muted',trackCompare:'Original comparison',compareOriginal:'Compare original',backToMix:'Back to my tracks',mix:'tracks on',silent:'All tracks muted',activate:'Enable',mute:'Mute',curveOn:'Waveform shown',curveOff:'Waveform hidden',overlay:'Overlay',unfold:'Separate',original:'Original',listeningOriginal:'Listening to the original',showOriginal:'Show original',selected:'Selected track',scale:'Same timeline. Shared amplitude scale.',prepare:'Prepare',separating:'Separate',export:'Export',prepareLong:'Preparing your file',separatingLong:'Separating the tracks',exportLong:'Preparing your downloads',processingNote:'Your tracks appear when separation is complete.',voiceA:'Voice A',voiceB:'Voice B',dialogue:'Dialogue',music:'Music',effects:'Effects',voiceASub:'First separated track',voiceBSub:'Second separated track',dialogueSub:'The conversation',musicSub:'The music',effectsSub:'Details & atmosphere',solo:'Listen',wav:'WAV',video:'Video',download:'Download',visible:'Show envelope',play:'Play',pause:'Pause',seek:'Playback position',ready:'Ready to separate',complete:'tracks separated',mono:'Mono separation',format:'Audio at',waiting:'Ready for your file',loading:'Loading audio…',cancelLoading:'Cancel playback',audioReady:'files ready',audioTimeout:'The download stopped responding. Press Play to retry.',decodeError:'This audio could not be decoded. Press Play to retry.',fileUnavailable:'These audio files are no longer available. Run the separation again.',videoLoading:'Loading video…',mediaError:'Could not play this track. Try again or download it.',playBlocked:'Press Play to start listening.',preview:'Preview using recorded TIGER results — no new inference.',layout:'Waveform layout',timeline:'Aligned track envelopes',workspace:'Separation workspace',error:'Something interrupted the separation.',empty_file:'Choose a non-empty audio or video file.',file_too_large:'Choose a file smaller than 200 MB.',file_too_long:'Choose an excerpt of 5 minutes or less.',invalid_file:'This file could not be read. Try WAV, MP3 or MP4.',no_audio:'This file has no audio track.',video_required:'Choose a video, or switch to Audio.',decode_failed:'The audio could not be decoded. Try another file.',failed:'Separation could not finish. Your file is still here; please try again.'},
 fr:{waveforms:'Ondes sonores',monitorTitle:'Aperçu vidéo',monitorMix:'Son des pistes activées',monitorOriginal:'Son original',monitorSilent:'Toutes les pistes sont coupées',queuedLong:'En attente d’une place',emptyTitle:'Un peu de clarté dans votre audio.',emptyCopy:'Déposez un fichier ou essayez un exemple. Vos pistes séparées se retrouveront ici.',result:'VOS PISTES',listen:'Le son, piste par piste.',compareHelp:'Un onglet pour couper le son. Une onde pour déplacer la lecture.',trackOn:'Activée',trackOff:'Coupée',trackCompare:'Comparaison avec l’original',compareOriginal:'Comparer l’original',backToMix:'Revenir aux pistes',mix:'pistes actives',silent:'Toutes les pistes sont coupées',activate:'Activer',mute:'Couper',curveOn:'Courbe visible',curveOff:'Courbe masquée',overlay:'Superposer',unfold:'Séparer',original:'Original',listeningOriginal:'Écoute de l’original',showOriginal:'Voir l’original',selected:'Piste sélectionnée',scale:'Même timeline. Échelle d’amplitude commune.',prepare:'Préparer',separating:'Séparer',export:'Exporter',prepareLong:'Préparation de votre fichier',separatingLong:'Séparation des pistes',exportLong:'Préparation des téléchargements',processingNote:'Les pistes apparaîtront à la fin de la séparation.',voiceA:'Voix A',voiceB:'Voix B',dialogue:'Dialogues',music:'Musique',effects:'Effets',voiceASub:'Première piste séparée',voiceBSub:'Deuxième piste séparée',dialogueSub:'La conversation',musicSub:'La musique',effectsSub:'Détails et ambiance',solo:'Écouter',wav:'WAV',video:'Vidéo',download:'Télécharger',visible:'Afficher l’enveloppe',play:'Lire',pause:'Pause',seek:'Position de lecture',ready:'Prêt à séparer',complete:'pistes séparées',mono:'Séparation en mono',format:'Audio à',waiting:'Prêt pour votre fichier',loading:'Chargement de l’audio…',cancelLoading:'Annuler la lecture',audioReady:'fichiers prêts',audioTimeout:'Le téléchargement ne répond plus. Appuyez sur Lecture pour réessayer.',decodeError:'Le son n’a pas pu être décodé. Appuyez sur Lecture pour réessayer.',fileUnavailable:'Ces fichiers audio ne sont plus disponibles. Relancez la séparation.',videoLoading:'Chargement de la vidéo…',mediaError:'Impossible de lire cette piste. Réessayez ou téléchargez-la.',playBlocked:'Appuyez sur Lecture pour écouter.',preview:'Aperçu avec des résultats TIGER enregistrés — sans nouveau calcul.',layout:'Disposition des pistes',timeline:'Enveloppes des pistes alignées',workspace:'Espace de séparation',error:'La séparation a été interrompue.',empty_file:'Choisissez un fichier audio ou vidéo non vide.',file_too_large:'Choisissez un fichier de moins de 200 Mo.',file_too_long:'Choisissez un extrait de 5 minutes maximum.',invalid_file:'Ce fichier est illisible. Essayez WAV, MP3 ou MP4.',no_audio:'Ce fichier ne contient aucune piste audio.',video_required:'Choisissez une vidéo ou passez au mode Audio.',decode_failed:'Le son est illisible. Essayez un autre fichier.',failed:'La séparation a échoué. Votre fichier est conservé ; vous pouvez réessayer.'}
};
let lang=document.documentElement.lang==='fr'?'fr':'en', data={}, job=null;
let layout='overlay', comparing=false, enabled={}, cardsKey='', spread=0, layoutFrame=0;
let downloadedBytes=0, contextFailed=false;
let context=null, buffers=new Map(), loadPromise=null, controller=null, loadEpoch=0;
let nodes=[], running=false, desiredPlaying=false, offset=0, startedAt=0, playEpoch=0;
let clock=0, message='', disposed=false, videoVisible=false, videoPlayPending=false, lastVideoSync=0;
const video=$('video'),svg=$('.tg-wave');
// The video is only a visual follower; all result sound belongs to Web Audio.
// Native controls must never add its original soundtrack over the chosen mix.
video.volume=0;
const canSetVideoVolume=video.volume===0; // Some mobile browsers ignore volume writes.
function silenceVideo(){if(!video.muted)video.muted=true;if(canSetVideoVolume&&video.volume!==0)video.volume=0;}
silenceVideo();
video.addEventListener('volumechange',silenceVideo);
const colors={voiceA:'var(--tg-voice)',voiceB:'var(--tg-music)',dialogue:'var(--tg-voice)',music:'var(--tg-music)',effects:'var(--tg-effects)'};
const symbols={voiceA:'A',voiceB:'B',dialogue:'“',music:'♪',effects:'✧'};
const t=key=>dictionary[lang][key]||key;
// Stable text nodes preserve the target between touchstart and click in WebKit.
function setText(node,value){if(node.textContent!==value)node.textContent=value;}
function setAttr(node,key,value){if(node.getAttribute(key)!==value)node.setAttribute(key,value);}
const fmt=value=>{const s=Math.max(0,Math.floor(Number(value)||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const allTracks=()=>data.original?[data.original,...(data.tracks||[])]:[];
const position=()=>Math.min(data.duration||0,offset+(running?Math.max(0,context.currentTime-startedAt):0));
function safeURL(url){const parsed=new URL(url,location.href);if(!['http:','https:','blob:'].includes(parsed.protocol))throw new Error('Invalid media URL');return parsed.href;}
function renderMessage(){
 const progress=message==='loading'?` ${buffers.size}/${allTracks().length} ${t('audioReady')} · ${(downloadedBytes/1048576).toFixed(1)} ${lang==='fr'?'Mo':'MB'}`:'';
 setText($('.tg-media-message'),message?t(message)+progress:'');
}
function setMessage(key){message=key;renderMessage();}
function playbackError(code){const error=new Error(code);error.code=code;return error;}
function deadline(promise,ms,code){
 let timer;
 return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(playbackError(code)),ms);})]).finally(()=>clearTimeout(timer));
}
function gainFor(id){return id==='original'?(comparing?1:0):(!comparing&&enabled[id]!==false?1:0);}
function applyGains(){
 if(!context)return;
 for(const {id,gain} of nodes){
  // Cancel old automation before each short fade, including rapid repeated taps.
  const now=context.currentTime,value=gain.gain.value;
  gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(value,now);
  gain.gain.linearRampToValueAtTime(gainFor(id),now+.012);
 }
}
function refreshLabels(){
 root.lang=lang;setAttr(root,'aria-label',t('workspace'));root.dataset.view=layout;
 $$('[data-t]').forEach(n=>setText(n,t(n.dataset.t)));
 $$('.tg-layout button').forEach(b=>setAttr(b,'aria-pressed',String(b.dataset.layout===layout)));
 setAttr($('.tg-layout'),'aria-label',t('layout'));setAttr($('.tg-track-list'),'aria-label',t('result'));
 setAttr(svg,'aria-label',t('seek'));
 setAttr($('.tg-seek'),'aria-label',t('seek'));
 setText($('.tg-status'),data.status==='complete'?`${data.tracks.length} ${t('complete')}`:t('waiting'));
 setText($('.tg-progress strong'),t((data.status||'prepare')+'Long'));
 setText($('.tg-error'),data.error?t(data.error):'');
 $$('[data-step]').forEach(n=>n.classList.toggle('active',n.dataset.step===data.status));
 $$('.tg-track').forEach(card=>{
  const id=card.dataset.track,on=enabled[id]!==false;
  setText(card.querySelector('strong'),t(id));
  setText(card.querySelector('.tg-track-hint'),t(comparing?'trackCompare':on?'trackOn':'trackOff'));
  const toggle=card.querySelector('.tg-track-toggle');
  setAttr(toggle,'aria-label',`${t(on?'mute':'activate')} · ${t(id)}`);
  setAttr(toggle,'aria-pressed',String(on));
  card.classList.toggle('is-muted',!on);card.classList.toggle('is-comparing',comparing);
  setAttr(card.querySelector('.tg-track-wave'),'aria-label',`${t('seek')} · ${t(id)}`);
  card.querySelectorAll('a').forEach(a=>{
   setText(a,'↓ '+t(a.dataset.kind==='video'?'video':'wav'));
   setAttr(a,'aria-label',`${t('download')} ${t(id)} · ${a.textContent}`);
  });
 });
 setText($('.tg-original-label'),t(comparing?'backToMix':'compareOriginal'));
 setAttr($('.tg-original'),'aria-pressed',String(comparing));
 setText($('.tg-monitor-sound'),t(comparing?'monitorOriginal':data.tracks?.some(track=>enabled[track.id]!==false)?'monitorMix':'monitorSilent'));
 setText($('.tg-duration'),fmt(data.duration));
 setText($('.tg-format'),data.tracks?.length?`${t('mono')} · ${(data.tracks[0].sample_rate/1000).toLocaleString(lang)} kHz`:'');
 renderMessage();updatePlayback();draw();
}
function createCards(){
 const host=$('.tg-track-list');host.replaceChildren();
 for(const [index,track] of (data.tracks||[]).entries()){
  const card=document.createElement('div');card.className='tg-track';card.dataset.track=track.id;
  card.style.setProperty('--tg-series',colors[track.id]);card.style.setProperty('--tg-layer',index);
  card.innerHTML='<svg class="tg-folder-outline" aria-hidden="true" focusable="false"><path vector-effect="non-scaling-stroke"/></svg><button type="button" class="tg-track-toggle"><span class="tg-trackmark" aria-hidden="true"></span><span class="tg-trackcopy"><strong></strong><small class="tg-track-hint"></small></span><span class="tg-track-switch" aria-hidden="true"></span></button><div class="tg-downloads"></div><div class="tg-track-plot"><svg class="tg-track-wave" role="slider" tabindex="0" aria-valuemin="0"></svg></div>';
  card.querySelector('.tg-trackmark').textContent=symbols[track.id];
  card.querySelector('.tg-track-toggle').addEventListener('click',()=>{
   enabled[track.id]=enabled[track.id]===false;comparing=false;
   applyGains();refreshLabels();
  });
  for(const kind of ['audio','video'])if(track[kind]?.url){
   const a=document.createElement('a');a.dataset.kind=kind;a.href=safeURL(track[kind].url);
   a.download=track[kind].orig_name||`${track.id}.${kind==='video'?'mp4':'wav'}`;
   card.querySelector('.tg-downloads').append(a);
  }
  bindWaveSeek(card.querySelector('.tg-track-wave'));
  host.append(card);
 }
}
function ensureContext(){
 if(context&&(contextFailed||context.state==='closed')){
  const old=context;context=null;old.close().catch(()=>{});
  ++loadEpoch;controller?.abort();controller=null;loadPromise=null;
 }
 if(!context){
  context=new (window.AudioContext||window.webkitAudioContext)();contextFailed=false;
  const current=context;
  current.addEventListener('statechange',()=>{
   if(current===context&&running&&current.state!=='running')pausePlayback();
  });
 }
 return context;
}
async function downloadAudio(track,abort,epoch){
 // An idle deadline, not a total download deadline: a mobile connection can
 // legitimately need more than 30 seconds while still delivering bytes.
 const response=await deadline(fetch(safeURL(track.audio.url),{signal:abort.signal}),30000,'audioTimeout');
 if(!response.ok)throw playbackError([401,403,404,410].includes(response.status)?'fileUnavailable':'mediaError');
 const reader=response.body?.getReader();
 if(!reader)return deadline(response.arrayBuffer(),30000,'audioTimeout');
 const chunks=[];let length=0;
 try{
  while(true){
   const {done,value}=await deadline(reader.read(),30000,'audioTimeout');
   if(done)break;
   if(abort.signal.aborted)throw new DOMException('Cancelled','AbortError');
   chunks.push(value);length+=value.byteLength;
   if(epoch===loadEpoch){downloadedBytes+=value.byteLength;renderMessage();}
  }
 }catch(error){reader.cancel().catch(()=>{});throw error;}
 const bytes=new Uint8Array(length);let at=0;
 for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength;}
 return bytes.buffer;
}

// Long results stream 10-second PCM slices with HTTP Range requests instead of
// downloading and decoding whole files: memory stays bounded and every stem is
// scheduled on the same audio clock, so tracks remain sample-aligned.
const STREAM_AFTER=600,SEG=10,AHEAD=3,LEAD=4;
let segments=new Map(),segReady=new Map(),pump=0,nextSeg=0,streamSources=[],streamAbort=null;
const streaming=()=>(data.duration||0)>STREAM_AFTER;
const streamSignal=()=>(streamAbort||(streamAbort=new AbortController())).signal;
async function rangeFetch(url,start,end,signal){
 const response=await deadline(fetch(url,{headers:{Range:`bytes=${start}-${end}`},signal}),30000,'audioTimeout');
 if(response.status!==206&&!(response.ok&&start===0))throw playbackError([401,403,404,410].includes(response.status)?'fileUnavailable':'mediaError');
 const want=end-start+1,bytes=new Uint8Array(want),reader=response.body.getReader();let at=0;
 try{
  while(at<want){
   const {done,value}=await deadline(reader.read(),30000,'audioTimeout');if(done)break;
   const part=value.subarray(0,Math.min(value.byteLength,want-at));bytes.set(part,at);at+=part.byteLength;
  }
 }finally{reader.cancel().catch(()=>{});}
 downloadedBytes+=at;return bytes.subarray(0,at);
}
async function wavHeader(track,signal){
 const url=safeURL(track.audio.url),bytes=await rangeFetch(url,0,65535,signal);
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),tag=at=>String.fromCharCode(...bytes.subarray(at,at+4));
 if(!['RIFF','RF64'].includes(tag(0))||tag(8)!=='WAVE')throw playbackError('decodeError');
 let at=12,format=null,dataStart=0,dataBytes=0,big=0;
 while(at+8<=bytes.length){
  const id=tag(at),size=view.getUint32(at+4,true);
  if(id==='ds64')big=view.getUint32(at+16,true)+view.getUint32(at+20,true)*2**32;
  if(id==='fmt '){let code=view.getUint16(at+8,true);if(code===0xFFFE)code=view.getUint16(at+32,true);
   format={code,channels:view.getUint16(at+10,true),rate:view.getUint32(at+12,true),bits:view.getUint16(at+22,true)};}
  if(id==='data'){dataStart=at+8;dataBytes=size===0xFFFFFFFF?big:size;break;}
  at+=8+size+(size%2);
 }
 if(!format||!dataStart||!dataBytes||![1,3].includes(format.code)||![16,24,32].includes(format.bits))throw playbackError('decodeError');
 const frameBytes=format.channels*format.bits/8;
 return {...format,url,dataStart,frameBytes,frames:Math.floor(dataBytes/frameBytes)};
}
function loadSegment(track,k){
 const key=track.id+':'+k;if(segments.has(key))return segments.get(key);
 const h=buffers.get(track.id),first=k*SEG*h.rate,count=Math.min(SEG*h.rate,h.frames-first),ctx=context;
 const promise=(async()=>{
  if(count<=0)return null;
  const bytes=await rangeFetch(h.url,h.dataStart+first*h.frameBytes,h.dataStart+(first+count)*h.frameBytes-1,streamSignal());
  const frames=Math.floor(bytes.length/h.frameBytes);if(!frames)return null;
  const buffer=ctx.createBuffer(h.channels,frames,h.rate),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),step=h.bits/8;
  for(let c=0;c<h.channels;c++){
   const out=buffer.getChannelData(c);
   for(let i=0,at=c*step;i<frames;i++,at+=h.frameBytes)
    out[i]=h.code===3?view.getFloat32(at,true):h.bits===16?view.getInt16(at,true)/32768:
     h.bits===24?((view.getInt8(at+2)<<16)|(view.getUint8(at+1)<<8)|view.getUint8(at))/8388608:view.getInt32(at,true)/2147483648;
  }
  return buffer;
 })();
 segments.set(key,promise);
 promise.then(buffer=>{if(segments.get(key)===promise)segReady.set(key,buffer);},()=>{if(segments.get(key)===promise)segments.delete(key);});
 return promise;
}
function ensureSegments(k,count){
 const jobs=[];
 for(let i=k;i<k+count&&i*SEG<(data.duration||0);i++)for(const track of allTracks())jobs.push(loadSegment(track,i));
 return Promise.all(jobs);
}
function loadStreams(){
 if(allTracks().every(track=>buffers.has(track.id)))return ensureSegments(Math.floor(offset/SEG),2);
 if(loadPromise)return loadPromise;
 const epoch=loadEpoch;downloadedBytes=0;
 const promise=Promise.all(allTracks().map(async track=>{
  const header=await wavHeader(track,streamSignal());
  if(epoch===loadEpoch&&!disposed){buffers.set(track.id,header);renderMessage();}
 })).then(()=>ensureSegments(Math.floor(offset/SEG),2)).finally(()=>{if(loadPromise===promise)loadPromise=null;});
 loadPromise=promise;return promise;
}
function scheduleStream(){
 stopNodes();
 for(const track of allTracks()){const gain=context.createGain();gain.gain.value=gainFor(track.id);gain.connect(context.destination);nodes.push({id:track.id,gain,source:null});}
 startedAt=context.currentTime+.05;nextSeg=Math.floor(offset/SEG);
 running=true;setMessage('');pumpStream();pump=setInterval(pumpStream,200);updatePlayback();
}
function pumpStream(){
 if(!running||!context)return;
 const now=context.currentTime,time=position(),duration=data.duration||0;
 if(time>=duration-.01){offset=duration;desiredPlaying=false;++playEpoch;stopNodes();video.pause();updatePlayback();return;}
 const current=Math.floor(time/SEG);
 for(const key of [...segments.keys()]){const k=Number(key.slice(key.lastIndexOf(':')+1));if(k<current-1||k>current+AHEAD+1){segments.delete(key);segReady.delete(key);}}
 ensureSegments(current,AHEAD+1).catch(()=>{});
 while(nextSeg*SEG<duration){
  const when=startedAt+(nextSeg*SEG-offset);
  if(when-now>LEAD)break;
  const keys=allTracks().map(track=>track.id+':'+nextSeg);
  if(!keys.every(key=>segReady.has(key))){if(when-now<.1)rebuffer();break;}
  for(const [index,key] of keys.entries()){
   const buffer=segReady.get(key),node=nodes[index];if(!buffer)continue;
   const source=context.createBufferSource();source.buffer=buffer;source.connect(node.gain);
   const skip=Math.max(0,offset-nextSeg*SEG);
   if(skip<buffer.duration){
    source.start(Math.max(when,startedAt),skip);streamSources.push(source);
    source.onended=()=>{streamSources=streamSources.filter(item=>item!==source);source.disconnect();};
   }
  }
  nextSeg++;
 }
}
function rebuffer(){
 // The network fell behind: hold the transport, then resume from the same time.
 offset=position();stopNodes();setMessage('loading');updatePlayback();
 const intent=playEpoch;
 ensureSegments(Math.floor(offset/SEG),2).then(()=>{
  if(intent===playEpoch&&desiredPlaying&&!disposed&&context?.state==='running')scheduleStream();
 },error=>{
  if(intent!==playEpoch)return;pausePlayback();setMessage(typeof error?.code==='string'?error.code:'mediaError');
 });
}
function loadBuffers(){
 if(streaming())return loadStreams();
 if(allTracks().every(track=>buffers.has(track.id)))return Promise.resolve();
 if(loadPromise)return loadPromise;
 const epoch=loadEpoch,tracks=allTracks().filter(track=>!buffers.has(track.id)),ctx=context;
 const abort=new AbortController();controller=abort;downloadedBytes=0;
 // Two workers limit concurrent buffers/decoders on mobile. Successful buffers
 // survive a retry; an obsolete load can never replace a newer job's buffers.
 let next=0;
 const worker=async()=>{
  while(next<tracks.length&&!abort.signal.aborted){
   const track=tracks[next++];
   const bytes=await downloadAudio(track,abort,epoch);
   if(abort.signal.aborted)throw new DOMException('Cancelled','AbortError');
   let buffer;
   try{buffer=await deadline(ctx.decodeAudioData(bytes),20000,'decodeError');}
   catch(error){throw playbackError('decodeError');}
   if(epoch===loadEpoch&&!disposed&&!abort.signal.aborted){buffers.set(track.id,buffer);renderMessage();}
  }
 };
 const promise=Promise.all([worker(),worker()]).catch(error=>{abort.abort();throw error;}).finally(()=>{
  if(loadPromise===promise){loadPromise=null;controller=null;}
 });
 loadPromise=promise;return promise;
}
function stopNodes(){
 running=false;clearInterval(pump);pump=0;
 for(const source of streamSources){source.onended=null;try{source.stop();}catch(e){}source.disconnect();}
 streamSources=[];
 for(const {source,gain} of nodes){if(source){source.onended=null;try{source.stop();}catch(e){}source.disconnect();}gain.disconnect();}
 nodes=[];
}
function pausePlayback(){
 offset=position();desiredPlaying=false;++playEpoch;
 stopNodes();video.pause();
 cancelAnimationFrame(clock);clock=0;
 if(message==='loading'||message==='videoLoading')setMessage('');
 updatePlayback();
}
function resetPlayback(){
 pausePlayback();++loadEpoch;controller?.abort();controller=null;loadPromise=null;buffers.clear();
 segments.clear();segReady.clear();streamAbort?.abort();streamAbort=null;
 offset=0;video.removeAttribute('src');video.load();setMessage('');
}
function scheduleSources(){
 if(!desiredPlaying||disposed)return;
 if(streaming())return scheduleStream();
 stopNodes();startedAt=context.currentTime+.025;
 // Every buffer has the identical start time and offset. Muting changes gains,
 // never source position; original comparison cannot double the separated mix.
 for(const track of allTracks()){
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buffers.get(track.id);gain.gain.value=gainFor(track.id);
  source.connect(gain);gain.connect(context.destination);
  if(track.id==='original')source.onended=()=>{
   if(!running||!nodes.some(n=>n.source===source))return;
   offset=data.duration||0;desiredPlaying=false;++playEpoch;stopNodes();video.pause();updatePlayback();
  };
  source.start(startedAt,Math.min(offset,source.buffer.duration));nodes.push({id:track.id,source,gain});
 }
 running=true;setMessage('');updatePlayback();
}
function prepareVideo(){
 if(data.media!=='video')return Promise.resolve();
 const url=safeURL(data.original.video.url);
 if(video.src!==url||video.error){video.src=url;video.load();}
 if(video.readyState>=1)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>finish(new Error('Video timeout')),20000);
  const ready=()=>finish(),failed=()=>finish(new Error('Video failed'));
  const finish=error=>{clearTimeout(timeout);video.removeEventListener('loadedmetadata',ready);video.removeEventListener('error',failed);error?reject(error):resolve();};
  video.addEventListener('loadedmetadata',ready,{once:true});video.addEventListener('error',failed,{once:true});
 });
}
async function playPlayback(){
 if(data.status!=='complete')return;
 if(position()>=(data.duration||Infinity)-.02)offset=0;
 desiredPlaying=true;setMessage('loading');const intent=++playEpoch;
 document.dispatchEvent(new CustomEvent('tiger:playback'));
 videoObserver.unobserve(video);videoObserver.observe(video);
 updatePlayback();
 try{
  // Resume in the user's gesture, before downloads/decoding. Safari requires it.
  const ctx=ensureContext();
  const resume=deadline(ctx.resume(),5000,'playBlocked').catch(error=>{
   if(context===ctx&&intent===playEpoch)contextFailed=true;
   throw error;
  });
  await Promise.all([resume,loadBuffers(),prepareVideo()]);
  if(intent!==playEpoch||!desiredPlaying||disposed)return;
  if(ctx.state!=='running'){contextFailed=true;throw new DOMException('Audio interrupted','NotAllowedError');}
  scheduleSources();
 }catch(error){
  if(intent!==playEpoch||disposed)return;
  pausePlayback();
  const code=error.name==='NotAllowedError'?'playBlocked':typeof error.code==='string'?error.code:'mediaError';
  setMessage(code);console.warn('[TIGER playback]',code);

 }
 updatePlayback();
}
function seekTo(time){
 const wasPlaying=desiredPlaying;
 offset=Math.max(0,Math.min(Number(time)||0,data.duration||0));stopNodes();
 if(!wasPlaying)video.pause();
 if(data.media==='video'&&video.readyState>=1)video.currentTime=offset;
 // Restart synchronously from decoded buffers, or let the pending load use the
 // latest offset. Seek does not create another download or stale play promise.
 if(wasPlaying&&buffers.size===allTracks().length&&context?.state==='running')scheduleSources();
 updatePlayback();
}
function updatePlayback(){
 if(disposed)return;
 const time=position(),loading=desiredPlaying&&!running;
 setAttr(root,'data-playback',loading?'loading':running?'playing':'paused');
 setAttr(root,'data-comparing',String(comparing));
 setText($('.tg-play'),loading?'':running?'Ⅱ':'▶');setAttr($('.tg-play'),'aria-label',t(loading?'cancelLoading':running?'pause':'play'));
 setAttr($('.tg-play'),'aria-busy',String(loading));$('.tg-play').disabled=data.status!=='complete';
 const on=(data.tracks||[]).filter(track=>enabled[track.id]!==false);
 setText($('.tg-current'),comparing?t('original'):on.length===0?t('silent'):on.length===1?t(on[0].id):`${on.length} ${t('mix')}`);
 setText($('.tg-time'),fmt(time));$('.tg-seek').value=data.duration?100*time/data.duration:0;
 for(const wave of [svg,...$$('.tg-track-wave')]){
  const cursor=wave.querySelector('.tg-cursor');if(cursor){const width=Number(wave.dataset.width)||900;cursor.setAttribute('transform',`translate(${8+(width-16)*time/(data.duration||1)},0)`);}
  setAttr(wave,'aria-valuemax',String(data.duration||0));setAttr(wave,'aria-valuenow',String(Math.floor(time)));setAttr(wave,'aria-valuetext',`${fmt(time)} / ${fmt(data.duration)}`);
 }
 if(running)syncVideo();
 if(running&&!clock)clock=requestAnimationFrame(()=>{clock=0;updatePlayback();});
}
$('.tg-play').addEventListener('click',()=>desiredPlaying?pausePlayback():playPlayback());
$('.tg-original').addEventListener('click',()=>{comparing=!comparing;applyGains();refreshLabels();});
$('.tg-seek').addEventListener('input',event=>seekTo(Number(event.target.value)/100*(data.duration||0)));
// The audio clock remains the master. WebKit may pause a muted offscreen
// video while the user touches a folder; that must not restart the audio mix.
function syncVideo(force=false){
 if(data.media!=='video'||!running||!videoVisible||video.readyState<1)return;
 const now=performance.now(),time=position();
 if(!video.seeking&&Math.abs(video.currentTime-time)>.15&&(force||now-lastVideoSync>250)){
  lastVideoSync=now;video.currentTime=time;
 }
 if(video.paused&&!videoPlayPending){
  videoPlayPending=true;const intent=playEpoch;
  video.play().catch(error=>{
   if(intent===playEpoch&&desiredPlaying&&videoVisible){
    pausePlayback();setMessage(error.name==='NotAllowedError'?'playBlocked':'mediaError');
   }
  }).finally(()=>{videoPlayPending=false;});
 }
}
video.addEventListener('waiting',()=>{if(desiredPlaying&&videoVisible&&!video.seeking)setMessage('videoLoading');});
// WebKit can enter the native play state before it emits playing (for example
// after a seek or an offscreen resume). Enforce the paused transport immediately.
video.addEventListener('play',()=>{silenceVideo();if(!desiredPlaying)video.pause();});
video.addEventListener('playing',()=>{
 silenceVideo();
 if(!desiredPlaying){video.pause();return;}
 syncVideo(true);if(message==='videoLoading')setMessage('');
});
video.addEventListener('seeked',()=>{if(video.readyState>=2&&message==='videoLoading')setMessage('');});
video.addEventListener('error',()=>{if(desiredPlaying&&data.media==='video'){pausePlayback();setMessage('mediaError');}});
const videoObserver=new IntersectionObserver(entries=>{
 videoVisible=entries[entries.length-1].isIntersecting;
 if(videoVisible)syncVideo(true);
 else{video.pause();if(message==='videoLoading')setMessage('');}
});videoObserver.observe(video);
function svgNode(tag,attrs,parent=svg){const node=document.createElementNS(NS,tag);for(const [key,val] of Object.entries(attrs))node.setAttribute(key,String(val));parent.append(node);return node;}
function ribbon(values,cy,scale,width){
 const points=values.map((v,i)=>[8+i/(values.length-1)*(width-16),cy-v*scale]);
 points.push(...values.map((v,i)=>[8+i/(values.length-1)*(width-16),cy+v*scale]).reverse());
 if(!points.length)return '';
 let d=`M${points[0][0]},${points[0][1]}`;
 for(let i=1;i<points.length;i++){const [x,y]=points[i],next=points[(i+1)%points.length];d+=`Q${x.toFixed(2)},${y.toFixed(2)} ${((x+next[0])/2).toFixed(2)},${((y+next[1])/2).toFixed(2)}`;}
 return d+'Z';
}
function waveCursor(wave,height){
 const cursor=svgNode('g',{class:'tg-cursor'},wave);
 svgNode('line',{x1:0,x2:0,y1:6,y2:height-6,stroke:'var(--tg-ink)','stroke-opacity':.5},cursor);
 svgNode('circle',{cx:0,cy:6,r:2.5,fill:'var(--tg-ink)'},cursor);
}
function drawAxis(wave,width,height){
 const ticks=width<480?3:5;
 for(let i=0;i<ticks;i++){
  const label=svgNode('text',{x:8+i/(ticks-1)*(width-16),y:height-8,'text-anchor':i===0?'start':i===ticks-1?'end':'middle',class:'tg-axis'},wave);
  label.textContent=fmt(i/(ticks-1)*(data.duration||0));
 }
}
function draw(){
 if(!data.original||$('.tg-results').hidden)return;
 // Gradio scopes custom CSS; measure the player itself for responsive cards.
 const deck=$('.tg-folder-deck');
 setAttr(deck,'data-video-dock',String(deck.getBoundingClientRect().width<700));
 const trackWidth=$('.tg-track-list').getBoundingClientRect().width;
 setAttr(deck,'data-wave-below',String(data.media==='video'&&trackWidth<350));
 setAttr(deck,'data-narrow',String(trackWidth<=440));
 drawFolderOutlines();
 const tracks=allTracks(),maximum=Math.max(.001,...tracks.flatMap(x=>x.peaks||[]));
 // One amplitude scale and time domain for every folder and the overlay.
 const miniatures=$$('.tg-track').map(card=>({wave:card.querySelector('.tg-track-wave'),track:data.tracks.find(t=>t.id===card.dataset.track)}));
 for(const {wave,track} of miniatures){
  const {width,height}=wave.getBoundingClientRect();if(width<=16||height<=0)continue;
  wave.setAttribute('viewBox',`0 0 ${width} ${height}`);wave.dataset.width=width;wave.replaceChildren();
  svgNode('line',{x1:8,x2:width-8,y1:height/2,y2:height/2,stroke:'var(--tg-ink)','stroke-opacity':.1},wave);
  svgNode('path',{d:ribbon(track.peaks,height/2,(height/2-Math.min(9,height*.15))/maximum,width),class:'tg-folder-envelope','data-folder-envelope':track.id},wave);
  waveCursor(wave,height);
 }
 // Both layouts share this full-width timeline below the media and track controls.
 const bounds=svg.getBoundingClientRect(),width=Math.max(32,bounds.width||Number(svg.dataset.width)||900),height=Math.max(180,bounds.height||232);
 const plotTop=22,plotBottom=height-36,plotHeight=plotBottom-plotTop;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.dataset.width=width;svg.replaceChildren();
 const visible=comparing?tracks:data.tracks,amount=spread,row=plotHeight/visible.length;
 visible.forEach((track,index)=>{
  const original=track.id==='original',muted=!original&&enabled[track.id]===false;
  const center=(plotTop+plotBottom)/2*(1-amount)+(plotTop+row*(index+.5))*amount;
  const scale=(plotHeight*.44*(1-amount)+row*.3*amount)/maximum;
  const group=svgNode('g',{'data-envelope':track.id,'data-muted':String(muted),'data-center':center.toFixed(2)});
  svgNode('path',{d:ribbon(track.peaks,center,scale,width),fill:original||muted?'var(--tg-mix)':colors[track.id],opacity:original?.75:muted?.32:comparing?.38:.65},group);
  if(amount>.01){const label=svgNode('text',{x:8,y:plotTop+row*index+10,class:'tg-axis',opacity:amount},group);label.textContent=t(track.id)+(muted?' · '+t('trackOff'):'');}
 });
 drawAxis(svg,width,height);waveCursor(svg,height-23);updatePlayback();
}
// A single closed silhouette avoids seams between the body and its tab,
// including WebKit zoom. Pixel-sized geometry keeps corners and strokes even.
function drawFolderOutlines(){
 $$('.tg-track').forEach((card,index)=>{
  const {width,height}=card.getBoundingClientRect();if(width<100||height<20)return;
  const outline=card.querySelector('.tg-folder-outline'),right=width-.5,bottom=height+11.5;
  const tab=Math.min(23+index*24,width-108),end=tab+72;
  card.style.setProperty('--tg-tab-left',`${tab}px`);
  const d=`M16.5 12.5 H${tab} Q${tab-5} .5 ${tab+7} .5 H${end-19} Q${end-9} .5 ${end-3} 7 L${end+2} 12.5 H${right-16} Q${right} 12.5 ${right} 28.5 V${bottom-16} Q${right} ${bottom} ${right-16} ${bottom} H16.5 Q.5 ${bottom} .5 ${bottom-16} V28.5 Q.5 12.5 16.5 12.5 Z`;
  setAttr(outline,'viewBox',`0 0 ${width} ${height+12}`);
  setAttr(outline.querySelector('path'),'d',d);
 });
}
function bindWaveSeek(wave){
 // iOS paints its own blue focus rectangle on interactive SVGs. Track input
 // modality explicitly, keeping our visible focus ring for keyboard navigation.
 wave.addEventListener('pointerdown',()=>{root.dataset.waveInput='pointer';});
 wave.addEventListener('click',event=>{
  const matrix=wave.getScreenCTM();if(!matrix)return;
  const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  const fraction=Math.max(0,Math.min(1,(point.x-8)/(wave.viewBox.baseVal.width-16)));
  seekTo(fraction*(data.duration||0));
 });
 wave.addEventListener('keydown',event=>{
  const next={ArrowLeft:position()-5,ArrowDown:position()-5,ArrowRight:position()+5,ArrowUp:position()+5,Home:0,End:data.duration||0}[event.key];
  if(next===undefined)return;event.preventDefault();seekTo(next);
 });
}
bindWaveSeek(svg);
function changeLayout(next){
 if(!['overlay','unfold'].includes(next))return;
 layout=next;cancelAnimationFrame(layoutFrame);
 const target=next==='unfold'?1:0,from=spread;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  spread=target;layoutFrame=0;refreshLabels();return;
 }
 refreshLabels();const start=performance.now();
 function animate(now){
  const time=Math.min(1,(now-start)/420),ease=time<.5?4*time*time*time:1-Math.pow(-2*time+2,3)/2;
  spread=from+(target-from)*ease;draw();
  layoutFrame=time<1?requestAnimationFrame(animate):0;
 }
 layoutFrame=requestAnimationFrame(animate);
}
$$('[data-layout]').forEach(button=>button.addEventListener('click',()=>changeLayout(button.dataset.layout)));
function receive(incoming=props.value||{}){
 const previousStatus=data.status;
 const key=incoming.status==='complete'?JSON.stringify([incoming.job,incoming.media,incoming.original?.audio?.url,incoming.tracks?.map(track=>[track.id,track.audio?.url])]):'';
 const changed=incoming.job!==job||(key&&key!==cardsKey);
 if(changed||incoming.status!=='complete')resetPlayback();
 data=incoming;job=data.job;root.dataset.status=data.status||'empty';
 const busy=['queued','prepare','separating','export'].includes(data.status),hasResults=data.status==='complete'&&data.tracks?.length;
 $('.tg-progress').hidden=!busy;$('.tg-results').hidden=!hasResults;$('.tg-error').hidden=data.status!=='error';
 $('.tg-video-pane').hidden=data.media!=='video';$('.tg-folder-deck').classList.toggle('has-video',data.media==='video');$('.tg-preview-note').hidden=!data.preview;
 if(changed){comparing=false;enabled={};}
 if(hasResults&&key!==cardsKey){createCards();cardsKey=key;if(data.media==='video'){video.src=safeURL(data.original.video.url);video.load();}}
 refreshLabels();
 if(hasResults&&previousStatus!=='complete')requestAnimationFrame(()=>{
  $('.tg-result-head h2').focus({preventScroll:true});
  if(root.getBoundingClientRect().top>innerHeight*.65)root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
}
const onKeyboard=()=>{root.dataset.waveInput='keyboard';};
document.addEventListener('keydown',onKeyboard,true);
const onLanguage=event=>{lang=event.detail;refreshLabels();};
const onSource=event=>receive({...event.detail,preview:data.preview});
const onVisibility=()=>{if(document.hidden)pausePlayback();};
document.addEventListener('tiger:language',onLanguage);document.addEventListener('tiger:source',onSource);
document.addEventListener('tiger:previewplay',pausePlayback);document.addEventListener('visibilitychange',onVisibility);
watch('value',()=>receive());
let resizeFrame=0;
const observer=new ResizeObserver(()=>{
 cancelAnimationFrame(resizeFrame);
 resizeFrame=requestAnimationFrame(()=>{
  draw();videoObserver.unobserve(video);videoObserver.observe(video);
 });
});observer.observe(svg);observer.observe($('.tg-track-list'));
const cleanup=new MutationObserver(()=>{
 if(root.isConnected)return;
 resetPlayback();disposed=true;cancelAnimationFrame(layoutFrame);cancelAnimationFrame(resizeFrame);context?.close().catch(()=>{});
 document.removeEventListener('keydown',onKeyboard,true);
 observer.disconnect();videoObserver.disconnect();cleanup.disconnect();
 document.removeEventListener('tiger:language',onLanguage);document.removeEventListener('tiger:source',onSource);
 document.removeEventListener('tiger:previewplay',pausePlayback);document.removeEventListener('visibilitychange',onVisibility);
});cleanup.observe(document.body,{childList:true,subtree:true});
receive();
