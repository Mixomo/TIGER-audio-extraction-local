const root = element;
const words = {
 en:{brand:'audio separation',zero:'Runs locally on your GPU',researchKicker:'From audio research to your headphones',title:'Separate the sounds.',titleSecond:'Hear every layer.',description:'Isolate dialogue, music and effects — or untangle two voices. Start with an audio or video file.',illustration:'One mix. Three tracks.',dialogue:'Dialogue',music:'Music',effects:'Effects',themeLight:'Switch to light theme',themeDark:'Switch to dark theme',language:'Language'},
 fr:{brand:'séparation audio',zero:'En local sur votre GPU',researchKicker:'La recherche audio, à portée d’oreille',title:'Séparez les sons.',titleSecond:'Explorez les pistes.',description:'Isolez les dialogues, la musique et les effets — ou démêlez deux voix. À partir d’un fichier audio ou vidéo.',illustration:'Un mix. Trois pistes.',dialogue:'Dialogues',music:'Musique',effects:'Effets',themeLight:'Passer au thème clair',themeDark:'Passer au thème sombre',language:'Langue'}
};
let lang=navigator.language?.toLowerCase().startsWith('fr')?'fr':'en';
try{const saved=localStorage.getItem('tiger-language');if(['en','fr'].includes(saved))lang=saved;}catch(e){}
let theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
try{const saved=localStorage.getItem('tiger-theme');if(['light','dark'].includes(saved))theme=saved;}catch(e){}
function syncCanvas(){const color=getComputedStyle(element).getPropertyValue('--tg-bg');document.body.style.backgroundColor=color;document.documentElement.style.backgroundColor=color;document.querySelector('gradio-app')?.style.setProperty('background-color',color);}
function themeLabel(){root.querySelector('.tg-theme').setAttribute('aria-label',words[lang][theme==='dark'?'themeLight':'themeDark']);}
function applyTheme(){
 // Gradio scopes selectors inside media queries. Set the explicit root theme
 // so the system preference also reaches our global colour tokens.
 document.documentElement.dataset.tigerTheme=theme;
 document.body.classList.toggle('dark',theme==='dark');themeLabel();requestAnimationFrame(syncCanvas);
}
function translate(next){
 lang = next === 'fr' ? 'fr' : 'en';
 root.lang=lang;
 root.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=words[lang][n.dataset.i18n]);
 root.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
 themeLabel();
 root.querySelector('.tg-langs').setAttribute('aria-label',words[lang].language);
 document.documentElement.lang=lang;
 document.dispatchEvent(new CustomEvent('tiger:language',{detail:lang}));
}
root.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{translate(b.dataset.lang);try{localStorage.setItem('tiger-language',lang);}catch(e){}}));
root.querySelector('.tg-theme').addEventListener('click',()=>{
 theme=theme==='dark'?'light':'dark';applyTheme();
 try{localStorage.setItem('tiger-theme',theme);}catch(e){}
});
applyTheme();
translate(lang);

requestAnimationFrame(syncCanvas);
