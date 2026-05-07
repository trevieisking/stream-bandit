/* Stream Bandit V5.21.9 — Volume Overlay No-Fight TEST
   Keeps the loved fullscreen custom volume overlay from V5.21.8,
   but uses its own saved volume as the source of truth.
   Designed for a test page that does NOT load the old V5.11.9 booster.
   Goal: slider can go down and stay down instead of snapping to max.
   No Supabase writes, no movie saves, no Mux metadata writes, no database changes. */
(function(){
'use strict';

var IDLE_MS=2600;
var INTERACT_LOCK_MS=5600;
var BOTTOM_ZONE=180;
var VOL_KEY='streambandit_player_volume_v5219';
var lastMove=Date.now();
var lockUntil=0;
var pointerDown=false;
var sliderActive=false;
var lastY=0;
var volPanel=null;
var savedVolume=loadVol();
var lastApply=0;

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
  if(document.getElementById('sb5219Style'))return;
  var st=document.createElement('style');
  st.id='sb5219Style';
  st.textContent='\nhtml.sb5219ControlsHidden,html.sb5219ControlsHidden *{cursor:none!important}html.sb5219ControlsHidden video::-webkit-media-controls{display:none!important}html.sb5219ControlsHidden video::-webkit-media-controls-enclosure{display:none!important}html.sb5219ControlsHidden video::-webkit-media-controls-panel{display:none!important}.sb5219VolumePanel{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999999;display:none;align-items:center;gap:10px;min-width:min(540px,calc(100vw - 34px));padding:12px 14px;border-radius:999px;background:rgba(8,12,24,.92);border:1px solid rgba(182,140,255,.30);box-shadow:0 18px 55px rgba(0,0,0,.45);color:#fff;font-weight:950;backdrop-filter:blur(10px)}.sb5219VolumePanel.show{display:flex}.sb5219VolumePanel button{border:0;border-radius:999px;background:linear-gradient(135deg,#ff2d85,#7c3cff);color:#fff;font-weight:1000;padding:9px 12px;cursor:pointer}.sb5219VolumePanel input[type=range]{flex:1;min-width:150px;accent-color:#ff2d85}.sb5219VolumePanel span{min-width:48px;text-align:right;color:#baf7df}.sb5219Hint{position:fixed;right:16px;bottom:86px;z-index:999999;border:1px solid rgba(34,211,166,.35);background:rgba(10,15,28,.94);color:#baf7df;border-radius:16px;padding:10px 12px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.38);font-size:13px}@media(max-width:640px){.sb5219VolumePanel{bottom:18px;border-radius:22px}.sb5219VolumePanel button{padding:8px 10px}}\n';
  document.head.appendChild(st);
}
function hint(msg){
  addStyle();
  var old=document.getElementById('sb5219Hint');if(old)old.remove();
  var d=document.createElement('div');d.id='sb5219Hint';d.className='sb5219Hint';d.textContent=msg;document.body.appendChild(d);
  setTimeout(function(){if(d&&d.parentNode)d.remove();},1700);
}
function applyVolume(){
  var v=activeVideo();
  if(!v)return;
  try{
    lastApply=Date.now();
    v.volume=savedVolume;
    v.muted=savedVolume===0;
  }catch(e){}
}
function setVolume(n){
  savedVolume=Math.max(0,Math.min(1,Number(n)||0));
  saveVol();
  applyVolume();
  syncVolumePanel();
}
function volumeStep(delta){setVolume(savedVolume+delta);showVolumePanel(true);}
function makeVolumePanel(){
  addStyle();
  if(volPanel&&document.body.contains(volPanel))return volPanel;
  volPanel=document.createElement('div');
  volPanel.id='sb5219VolumePanel';
  volPanel.className='sb5219VolumePanel';
  volPanel.innerHTML='<button id="sb5219Mute" type="button">🔇</button><b>Volume</b><input id="sb5219VolRange" type="range" min="0" max="100" step="1"><span id="sb5219VolPct">100%</span>';
  document.body.appendChild(volPanel);
  var range=volPanel.querySelector('#sb5219VolRange');
  var mute=volPanel.querySelector('#sb5219Mute');
  function hold(e){
    if(e){e.stopPropagation();}
    pointerDown=true;
    sliderActive=true;
    lockUntil=Date.now()+INTERACT_LOCK_MS;
    lastMove=Date.now();
    showVolumePanel(true);
  }
  function release(e){
    if(e){e.stopPropagation();}
    pointerDown=false;
    setTimeout(function(){sliderActive=false;},500);
    lockUntil=Date.now()+INTERACT_LOCK_MS;
    applyVolume();
  }
  ['pointerdown','mousedown','touchstart'].forEach(function(ev){volPanel.addEventListener(ev,hold,true);});
  ['pointerup','mouseup','touchend','change'].forEach(function(ev){volPanel.addEventListener(ev,release,true);});
  range.addEventListener('input',function(e){hold(e);setVolume(Number(range.value)/100);});
  range.addEventListener('change',function(e){hold(e);setVolume(Number(range.value)/100);release(e);});
  mute.addEventListener('click',function(e){hold(e);setVolume(savedVolume===0?0.75:0);release(e);});
  syncVolumePanel();
  return volPanel;
}
function syncVolumePanel(){
  var p=makeVolumePanel();
  var pct=Math.round(savedVolume*100);
  var range=p.querySelector('#sb5219VolRange');
  var label=p.querySelector('#sb5219VolPct');
  var mute=p.querySelector('#sb5219Mute');
  if(range&&document.activeElement!==range)range.value=String(pct);
  if(label)label.textContent=pct+'%';
  if(mute)mute.textContent=pct===0?'🔈':'🔇';
}
function showVolumePanel(force){
  if(!isWatchLike()||!isPlayerFocus())return;
  var p=makeVolumePanel();
  syncVolumePanel();
  p.classList.add('show');
  if(force)lockUntil=Date.now()+INTERACT_LOCK_MS;
}
function hideVolumePanel(){
  if(volPanel&&Date.now()>lockUntil&&!nearBottom()&&!pointerDown&&!sliderActive)volPanel.classList.remove('show');
}
function showControls(){
  document.documentElement.classList.remove('sb5219ControlsHidden');
  visibleVideos().forEach(function(v){try{v.controls=true;v.setAttribute('controls','controls');}catch(e){}});
  showVolumePanel();
}
function hideControls(){
  if(!isWatchLike()||!isPlayerFocus())return;
  var v=activeVideo();
  if(!v||v.paused||v.ended)return;
  if(pointerDown||sliderActive||Date.now()<lockUntil||nearBottom())return;
  document.documentElement.classList.add('sb5219ControlsHidden');
  visibleVideos().forEach(function(x){try{x.controls=false;x.removeAttribute('controls');}catch(e){}});
  hideVolumePanel();
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
  if(!v||v.dataset.sb5219Bound)return;
  v.dataset.sb5219Bound='1';
  applyVolume();
  v.addEventListener('volumechange',function(){
    // Do NOT let external scripts/native controls push our overlay back to max.
    if(Date.now()-lastApply<350)return;
    if(sliderActive)return;
    // Only accept native volume when user is actively interacting near bottom and it is not a snap-to-max fight.
    try{
      var n=Number(v.volume);
      if(Number.isFinite(n)&&Date.now()<lockUntil&&nearBottom()&&Math.abs(n-savedVolume)<0.35){
        savedVolume=Math.max(0,Math.min(1,n));saveVol();syncVolumePanel();
      }else{
        applyVolume();
      }
    }catch(e){}
  });
}
function loop(){
  addStyle();
  videos().forEach(bindVideo);
  var v=activeVideo();
  if(!v||!isWatchLike()){showControls();if(volPanel)volPanel.classList.remove('show');return;}
  applyVolume();
  if(!isPlayerFocus()){showControls();if(volPanel)volPanel.classList.remove('show');return;}
  if(v.paused||v.ended){showControls();return;}
  if(pointerDown||sliderActive||Date.now()<lockUntil||nearBottom()){
    showControls();showVolumePanel();return;
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
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){document.addEventListener(ev,function(){lastMove=Date.now();lockUntil=Date.now()+2600;showControls();if(isPlayerFocus())hint('Volume-safe fullscreen on — custom slider controls volume.');},true);});
document.addEventListener('play',function(e){if(e.target&&e.target.tagName==='VIDEO'){bindVideo(e.target);lastMove=Date.now();lockUntil=Date.now()+1800;applyVolume();showControls();}},true);
document.addEventListener('pause',function(){showControls();},true);
document.addEventListener('keydown',function(e){
  if(!isWatchLike())return;
  var tag=(e.target&&e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  userInteract(0);
  if(e.key==='ArrowUp'){e.preventDefault();volumeStep(0.05);}
  if(e.key==='ArrowDown'){e.preventDefault();volumeStep(-0.05);}
  if(e.key.toLowerCase()==='m'){setVolume(savedVolume===0?0.75:0);}
},true);
var mo=new MutationObserver(function(){setTimeout(loop,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','controls']});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(loop,700);});
setInterval(loop,160);
})();
