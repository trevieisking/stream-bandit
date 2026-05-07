/* Stream Bandit V5.21.11 — Quiet Player Overlay TEST
   Builds on V5.21.10 result.
   Key change: no bottom-right comfort popups, because they can wake the native play bar.
   Keeps custom Stream Bandit volume overlay as the main volume control.
   Treats native HTML5 volume slider as secondary/not required.
   Test page must NOT load old V5.11.9 Sound Booster.
   No Supabase writes, no movie saves, no Mux metadata writes, no database changes. */
(function(){
'use strict';

var IDLE_MS=2300;
var LOCK_MS=4200;
var BOTTOM_ZONE=180;
var VOL_KEY='streambandit_player_volume_v52111';
var lastMove=Date.now();
var lockUntil=0;
var pointerDown=false;
var sliderActive=false;
var lastY=0;
var volPanel=null;
var savedVolume=loadVol();
var lastApply=0;
var lastPlayerFocus=false;

function loadVol(){
  try{
    var n=Number(localStorage.getItem(VOL_KEY)||localStorage.getItem('streambandit_player_volume_v52110')||localStorage.getItem('streambandit_player_volume_v5219'));
    return Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
  }catch(e){return 1;}
}
function saveVol(){try{localStorage.setItem(VOL_KEY,String(savedVolume));}catch(e){}}
function videos(){return Array.prototype.slice.call(document.querySelectorAll('video'));}
function visibleVideos(){return videos().filter(function(v){return v&&v.offsetParent!==null;});}
function activeVideo(){return visibleVideos()[0]||videos()[0]||null;}
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isFullscreenApi(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement);}
function isLargeVideo(v){if(!v)return false;var r=v.getBoundingClientRect();var w=window.innerWidth||document.documentElement.clientWidth||0;var h=window.innerHeight||document.documentElement.clientHeight||0;return r.width>w*0.72&&r.height>h*0.42;}
function isWatchLike(){var t=text(main()).toLowerCase();return !!activeVideo()||/watch|now playing|up next|play \/ resume|hls\/mux|supabase watch/.test(t);}
function isPlayerFocus(){var v=activeVideo();if(!v)return false;return isFullscreenApi()||isLargeVideo(v)||document.body.className.toLowerCase().indexOf('fullscreen')>-1||text(document.body).toLowerCase().indexOf('exit fullscreen')>-1||text(document.body).toLowerCase().indexOf('exit player')>-1;}
function nearBottom(){var h=window.innerHeight||document.documentElement.clientHeight||0;return lastY>0&&lastY>h-BOTTOM_ZONE;}
function addStyle(){
  if(document.getElementById('sb52111Style'))return;
  var st=document.createElement('style');
  st.id='sb52111Style';
  st.textContent='\nhtml.sb52111ControlsHidden,html.sb52111ControlsHidden *{cursor:none!important}html.sb52111ControlsHidden video::-webkit-media-controls{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-enclosure{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-panel{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-play-button{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-timeline{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-current-time-display{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-time-remaining-display{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-mute-button{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-volume-slider{display:none!important}html.sb52111ControlsHidden video::-webkit-media-controls-fullscreen-button{display:none!important}.sb52111VolumePanel{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999999;display:none;align-items:center;gap:10px;min-width:min(540px,calc(100vw - 34px));padding:12px 14px;border-radius:999px;background:rgba(8,12,24,.92);border:1px solid rgba(182,140,255,.30);box-shadow:0 18px 55px rgba(0,0,0,.45);color:#fff;font-weight:950;backdrop-filter:blur(10px)}.sb52111VolumePanel.show{display:flex}.sb52111VolumePanel button{border:0;border-radius:999px;background:linear-gradient(135deg,#ff2d85,#7c3cff);color:#fff;font-weight:1000;padding:9px 12px;cursor:pointer}.sb52111VolumePanel input[type=range]{flex:1;min-width:150px;accent-color:#ff2d85}.sb52111VolumePanel span{min-width:48px;text-align:right;color:#baf7df}@media(max-width:640px){.sb52111VolumePanel{bottom:18px;border-radius:22px}.sb52111VolumePanel button{padding:8px 10px}}\n';
  document.head.appendChild(st);
}
function applyVolume(){var v=activeVideo();if(!v)return;try{lastApply=Date.now();v.volume=savedVolume;v.muted=savedVolume===0;}catch(e){}}
function setVolume(n){savedVolume=Math.max(0,Math.min(1,Number(n)||0));saveVol();applyVolume();syncVolumePanel();}
function volumeStep(delta){setVolume(savedVolume+delta);showVolumePanel(true);}
function makeVolumePanel(){
  addStyle();
  if(volPanel&&document.body.contains(volPanel))return volPanel;
  volPanel=document.createElement('div');
  volPanel.id='sb52111VolumePanel';
  volPanel.className='sb52111VolumePanel';
  volPanel.innerHTML='<button id="sb52111Mute" type="button">🔇</button><b>Volume</b><input id="sb52111VolRange" type="range" min="0" max="100" step="1"><span id="sb52111VolPct">100%</span>';
  document.body.appendChild(volPanel);
  var range=volPanel.querySelector('#sb52111VolRange');
  var mute=volPanel.querySelector('#sb52111Mute');
  function hold(e){if(e)e.stopPropagation();pointerDown=true;sliderActive=true;lockUntil=Date.now()+LOCK_MS;lastMove=Date.now();showControls(true);showVolumePanel(true);}
  function release(e){if(e)e.stopPropagation();pointerDown=false;setTimeout(function(){sliderActive=false;},550);lockUntil=Date.now()+LOCK_MS;applyVolume();}
  ['pointerdown','mousedown','touchstart'].forEach(function(ev){volPanel.addEventListener(ev,hold,true);});
  ['pointerup','mouseup','touchend','change'].forEach(function(ev){volPanel.addEventListener(ev,release,true);});
  range.addEventListener('input',function(e){hold(e);setVolume(Number(range.value)/100);});
  range.addEventListener('change',function(e){hold(e);setVolume(Number(range.value)/100);release(e);});
  mute.addEventListener('click',function(e){hold(e);setVolume(savedVolume===0?0.75:0);release(e);});
  syncVolumePanel();
  return volPanel;
}
function syncVolumePanel(){var p=makeVolumePanel();var pct=Math.round(savedVolume*100);var range=p.querySelector('#sb52111VolRange');var label=p.querySelector('#sb52111VolPct');var mute=p.querySelector('#sb52111Mute');if(range&&document.activeElement!==range)range.value=String(pct);if(label)label.textContent=pct+'%';if(mute)mute.textContent=pct===0?'🔈':'🔇';}
function showVolumePanel(force){if(!isWatchLike()||!isPlayerFocus())return;var p=makeVolumePanel();syncVolumePanel();p.classList.add('show');if(force)lockUntil=Date.now()+LOCK_MS;}
function hideVolumePanel(){if(volPanel&&!pointerDown&&!sliderActive&&Date.now()>lockUntil)volPanel.classList.remove('show');}
function showControls(keepOverlay){
  document.documentElement.classList.remove('sb52111ControlsHidden');
  visibleVideos().forEach(function(v){try{v.controls=true;v.setAttribute('controls','controls');}catch(e){}});
  if(keepOverlay||nearBottom())showVolumePanel();
}
function forceHideControls(){
  var v=activeVideo();
  if(!v||v.paused||v.ended)return;
  document.documentElement.classList.add('sb52111ControlsHidden');
  visibleVideos().forEach(function(x){try{x.controls=false;x.removeAttribute('controls');}catch(e){}});
  hideVolumePanel();
}
function userMove(y){if(typeof y==='number')lastY=y;lastMove=Date.now();showControls(nearBottom());}
function userInteract(y){if(typeof y==='number')lastY=y;lastMove=Date.now();lockUntil=Date.now()+LOCK_MS;showControls(true);}
function bindVideo(v){
  if(!v||v.dataset.sb52111Bound)return;
  v.dataset.sb52111Bound='1';
  applyVolume();
  v.addEventListener('volumechange',function(){
    if(Date.now()-lastApply<350)return;
    if(sliderActive){applyVolume();return;}
    try{var n=Number(v.volume);if(Number.isFinite(n)&&Date.now()<lockUntil&&Math.abs(n-savedVolume)<0.35){savedVolume=Math.max(0,Math.min(1,n));saveVol();syncVolumePanel();}else applyVolume();}catch(e){}
  });
}
function removeOldHints(){
  ['sb5215FsHint','sb5216Hint','sb5217Hint','sb5218Hint','sb5219Hint','sb52110Hint'].forEach(function(id){var x=document.getElementById(id);if(x)try{x.remove();}catch(e){}});
}
function loop(){
  addStyle();removeOldHints();videos().forEach(bindVideo);
  var v=activeVideo();
  if(!v||!isWatchLike()){showControls(false);if(volPanel)volPanel.classList.remove('show');lastPlayerFocus=false;return;}
  applyVolume();
  var focus=isPlayerFocus();
  if(!focus){showControls(false);if(volPanel)volPanel.classList.remove('show');lastPlayerFocus=false;return;}
  if(!lastPlayerFocus){lastMove=Date.now();lockUntil=Date.now()+1000;}
  lastPlayerFocus=true;
  if(v.paused||v.ended){showControls(false);return;}
  if(pointerDown||sliderActive||Date.now()<lockUntil){showControls(true);return;}
  if(Date.now()-lastMove>IDLE_MS){forceHideControls();return;}
  showControls(nearBottom());
}
['mousemove','pointermove'].forEach(function(ev){document.addEventListener(ev,function(e){userMove(e.clientY||0);},true);});
['touchstart','touchmove'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.touches&&e.touches[0];userInteract(t?t.clientY:0);},true);});
document.addEventListener('pointerdown',function(e){pointerDown=true;userInteract(e.clientY||0);},true);
document.addEventListener('mousedown',function(e){pointerDown=true;userInteract(e.clientY||0);},true);
document.addEventListener('pointerup',function(e){pointerDown=false;userInteract(e.clientY||0);},true);
document.addEventListener('mouseup',function(e){pointerDown=false;userInteract(e.clientY||0);},true);
document.addEventListener('click',function(e){userInteract(e.clientY||0);},true);
document.addEventListener('wheel',function(e){userInteract(e.clientY||0);},true);
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){document.addEventListener(ev,function(){lastMove=Date.now();lockUntil=Date.now()+1200;showControls(true);},true);});
document.addEventListener('play',function(e){if(e.target&&e.target.tagName==='VIDEO'){bindVideo(e.target);lastMove=Date.now();lockUntil=Date.now()+1000;applyVolume();showControls(true);}},true);
document.addEventListener('pause',function(){showControls(false);},true);
document.addEventListener('keydown',function(e){
  if(!isWatchLike())return;
  var tag=(e.target&&e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  userInteract(0);
  if(e.key==='ArrowUp'){e.preventDefault();volumeStep(0.05);}
  if(e.key==='ArrowDown'){e.preventDefault();volumeStep(-0.05);}
  if(e.key.toLowerCase()==='m'){setVolume(savedVolume===0?0.75:0);}
},true);
var mo=new MutationObserver(function(){setTimeout(loop,100);});
try{mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','controls']});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(loop,700);});
setInterval(loop,140);
})();
