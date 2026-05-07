/* Stream Bandit V5.21.8 — Fullscreen Volume Slider TEST
   Builds on the successful V5.21.7 fullscreen controls behaviour.
   Adds a Stream Bandit custom volume slider overlay for fullscreen/large player mode,
   so volume remains controllable even when native browser controls are awkward.
   No Supabase writes, no movie saves, no Mux metadata writes, no database changes. */
(function(){
'use strict';

var IDLE_MS=2600;
var INTERACT_LOCK_MS=5200;
var BOTTOM_ZONE=170;
var VOL_KEY='streambandit_player_volume_v5218';
var lastMove=Date.now();
var lockUntil=0;
var pointerDown=false;
var lastY=0;
var volPanel=null;
var savedVolume=loadVol();

function loadVol(){
  try{
    var n=Number(localStorage.getItem(VOL_KEY));
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
function isLargeVideo(v){
  if(!v)return false;
  var r=v.getBoundingClientRect();
  var w=window.innerWidth||document.documentElement.clientWidth||0;
  var h=window.innerHeight||document.documentElement.clientHeight||0;
  return r.width>w*0.72&&r.height>h*0.42;
}
function isWatchLike(){
  var t=text(main()).toLowerCase();
  return !!activeVideo()||/watch|now playing|up next|play \/ resume|hls\/mux|supabase watch/.test(t);
}
function isPlayerFocus(){
  var v=activeVideo();
  if(!v)return false;
  return isFullscreenApi()||isLargeVideo(v)||document.body.className.toLowerCase().indexOf('fullscreen')>-1||text(document.body).toLowerCase().indexOf('exit fullscreen')>-1;
}
function nearBottom(){
  var h=window.innerHeight||document.documentElement.clientHeight||0;
  return lastY>0&&lastY>h-BOTTOM_ZONE;
}
function addStyle(){
  if(document.getElementById('sb5218Style'))return;
  var st=document.createElement('style');
  st.id='sb5218Style';
  st.textContent='\nhtml.sb5218ControlsHidden,html.sb5218ControlsHidden *{cursor:none!important}html.sb5218ControlsHidden video::-webkit-media-controls{display:none!important}html.sb5218ControlsHidden video::-webkit-media-controls-enclosure{display:none!important}html.sb5218ControlsHidden video::-webkit-media-controls-panel{display:none!important}.sb5218VolumePanel{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999999;display:none;align-items:center;gap:10px;min-width:min(520px,calc(100vw - 34px));padding:12px 14px;border-radius:999px;background:rgba(8,12,24,.92);border:1px solid rgba(182,140,255,.30);box-shadow:0 18px 55px rgba(0,0,0,.45);color:#fff;font-weight:950;backdrop-filter:blur(10px)}.sb5218VolumePanel.show{display:flex}.sb5218VolumePanel button{border:0;border-radius:999px;background:linear-gradient(135deg,#ff2d85,#7c3cff);color:#fff;font-weight:1000;padding:9px 12px;cursor:pointer}.sb5218VolumePanel input[type=range]{flex:1;min-width:150px;accent-color:#ff2d85}.sb5218VolumePanel span{min-width:48px;text-align:right;color:#baf7df}.sb5218Hint{position:fixed;right:16px;bottom:86px;z-index:999999;border:1px solid rgba(34,211,166,.35);background:rgba(10,15,28,.94);color:#baf7df;border-radius:16px;padding:10px 12px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.38);font-size:13px}@media(max-width:640px){.sb5218VolumePanel{bottom:18px;border-radius:22px}.sb5218VolumePanel button{padding:8px 10px}}\n';
  document.head.appendChild(st);
}
function hint(msg){
  addStyle();
  var old=document.getElementById('sb5218Hint');if(old)old.remove();
  var d=document.createElement('div');d.id='sb5218Hint';d.className='sb5218Hint';d.textContent=msg;document.body.appendChild(d);
  setTimeout(function(){if(d&&d.parentNode)d.remove();},1700);
}
function showControls(){
  document.documentElement.classList.remove('sb5218ControlsHidden');
  visibleVideos().forEach(function(v){try{v.controls=true;v.setAttribute('controls','controls');}catch(e){}});
  showVolumePanel();
}
function hideControls(){
  if(!isWatchLike()||!isPlayerFocus())return;
  var v=activeVideo();
  if(!v||v.paused||v.ended)return;
  if(pointerDown||Date.now()<lockUntil||nearBottom())return;
  document.documentElement.classList.add('sb5218ControlsHidden');
  visibleVideos().forEach(function(x){try{x.controls=false;x.removeAttribute('controls');}catch(e){}});
  hideVolumePanel();
}
function setVolume(n){
  var v=activeVideo();
  savedVolume=Math.max(0,Math.min(1,Number(n)||0));
  saveVol();
  if(v){try{v.volume=savedVolume;v.muted=savedVolume===0;}catch(e){}}
  syncVolumePanel();
}
function volumeStep(delta){setVolume(savedVolume+delta);showVolumePanel(true);}
function makeVolumePanel(){
  addStyle();
  if(volPanel&&document.body.contains(volPanel))return volPanel;
  volPanel=document.createElement('div');
  volPanel.id='sb5218VolumePanel';
  volPanel.className='sb5218VolumePanel';
  volPanel.innerHTML='<button id="sb5218Mute" type="button">🔇</button><b>Volume</b><input id="sb5218VolRange" type="range" min="0" max="100" step="1"><span id="sb5218VolPct">100%</span>';
  document.body.appendChild(volPanel);
  var range=volPanel.querySelector('#sb5218VolRange');
  var mute=volPanel.querySelector('#sb5218Mute');
  function panelInteract(e){
    if(e){e.stopPropagation();}
    pointerDown=true;
    lockUntil=Date.now()+INTERACT_LOCK_MS;
    lastMove=Date.now();
    showVolumePanel(true);
  }
  ['pointerdown','mousedown','touchstart'].forEach(function(ev){volPanel.addEventListener(ev,panelInteract,true);});
  ['pointerup','mouseup','touchend','change'].forEach(function(ev){volPanel.addEventListener(ev,function(e){if(e)e.stopPropagation();pointerDown=false;lockUntil=Date.now()+INTERACT_LOCK_MS;},true);});
  range.addEventListener('input',function(e){panelInteract(e);setVolume(Number(range.value)/100);});
  range.addEventListener('change',function(e){panelInteract(e);setVolume(Number(range.value)/100);});
  mute.addEventListener('click',function(e){panelInteract(e);var v=activeVideo();if(v&&v.muted){setVolume(savedVolume||0.75);v.muted=false;}else{setVolume(0);}});
  syncVolumePanel();
  return volPanel;
}
function syncVolumePanel(){
  var p=makeVolumePanel();
  var v=activeVideo();
  if(v){
    try{
      var n=Number(v.volume);
      if(Number.isFinite(n)&&Math.abs(n-savedVolume)>0.02&&!v.muted){savedVolume=Math.max(0,Math.min(1,n));saveVol();}
    }catch(e){}
  }
  var pct=Math.round(savedVolume*100);
  var range=p.querySelector('#sb5218VolRange');
  var label=p.querySelector('#sb5218VolPct');
  var mute=p.querySelector('#sb5218Mute');
  if(range)range.value=String(pct);
  if(label)label.textContent=pct+'%';
  if(mute)mute.textContent=pct===0?'🔈':'🔇';
}
function showVolumePanel(force){
  if(!isWatchLike()||!isPlayerFocus())return;
  var p=makeVolumePanel();
  syncVolumePanel();
  p.classList.add('show');
  if(force){lockUntil=Date.now()+INTERACT_LOCK_MS;}
}
function hideVolumePanel(){
  if(volPanel&&Date.now()>lockUntil&&!nearBottom()&&!pointerDown)volPanel.classList.remove('show');
}
function userMove(y){
  if(typeof y==='number')lastY=y;
  lastMove=Date.now();
  showControls();
}
function userInteract(y){
  if(typeof y==='number')lastY=y;
  lastMove=Date.now();
  lockUntil=Date.now()+INTERACT_LOCK_MS;
  showControls();
}
function bindVideo(v){
  if(!v||v.dataset.sb5218Bound)return;
  v.dataset.sb5218Bound='1';
  try{v.volume=savedVolume;v.muted=savedVolume===0;}catch(e){}
  v.addEventListener('volumechange',function(){
    try{
      var n=Number(v.volume);
      if(Number.isFinite(n)&&!v.muted){savedVolume=Math.max(0,Math.min(1,n));saveVol();syncVolumePanel();}
      if(v.muted){syncVolumePanel();}
    }catch(e){}
  });
}
function loop(){
  addStyle();
  videos().forEach(bindVideo);
  var v=activeVideo();
  if(!v||!isWatchLike()){showControls();if(volPanel)volPanel.classList.remove('show');return;}
  if(!isPlayerFocus()){showControls();if(volPanel)volPanel.classList.remove('show');return;}
  if(v.paused||v.ended){showControls();return;}
  if(pointerDown||Date.now()<lockUntil||nearBottom()){
    showControls();
    showVolumePanel();
    return;
  }
  if(Date.now()-lastMove>IDLE_MS)hideControls();
  else showControls();
}
['mousemove','pointermove'].forEach(function(ev){document.addEventListener(ev,function(e){userMove(e.clientY||0);},true);});
['touchstart','touchmove'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.touches&&e.touches[0];userInteract(t?t.clientY:0);},true);});
document.addEventListener('pointerdown',function(e){pointerDown=true;userInteract(e.clientY||0);},true);
document.addEventListener('mousedown',function(e){pointerDown=true;userInteract(e.clientY||0);},true);
document.addEventListener('pointerup',function(e){pointerDown=false;userInteract(e.clientY||0);},true);
document.addEventListener('mouseup',function(e){pointerDown=false;userInteract(e.clientY||0);},true);
document.addEventListener('click',function(e){userInteract(e.clientY||0);},true);
document.addEventListener('wheel',function(e){userInteract(e.clientY||0);},true);
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){document.addEventListener(ev,function(){lastMove=Date.now();lockUntil=Date.now()+2600;showControls();if(isPlayerFocus())hint('Volume-safe fullscreen on — use Stream Bandit volume slider.');},true);});
document.addEventListener('play',function(e){if(e.target&&e.target.tagName==='VIDEO'){bindVideo(e.target);lastMove=Date.now();lockUntil=Date.now()+1800;showControls();}},true);
document.addEventListener('pause',function(){showControls();},true);
document.addEventListener('keydown',function(e){
  if(!isWatchLike())return;
  var tag=(e.target&&e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  userInteract(0);
  if(e.key==='ArrowUp'){e.preventDefault();volumeStep(0.05);}
  if(e.key==='ArrowDown'){e.preventDefault();volumeStep(-0.05);}
  if(e.key.toLowerCase()==='m'){var v=activeVideo();if(v){if(v.muted||savedVolume===0){setVolume(savedVolume||0.75);v.muted=false;}else setVolume(0);}}
},true);
var mo=new MutationObserver(function(){setTimeout(loop,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','controls']});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(loop,700);});
setInterval(loop,180);
})();
