/* Stream Bandit V5.21.7 — Fullscreen Controls Volume-Safe TEST
   Narrow player fix only.
   Fixes V5.21.6 being too aggressive with native controls.
   Goal: fullscreen play bar hides after idle, but player volume slider remains usable.
   Does not change Sound Booster, movie rows, Supabase, Mux, database or saves. */
(function(){
'use strict';

var IDLE_MS=2600;
var INTERACT_LOCK_MS=5200;
var BOTTOM_ZONE=150;
var lastMove=Date.now();
var lockUntil=0;
var pointerDown=false;
var lastY=0;

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
  if(document.getElementById('sb5217Style'))return;
  var st=document.createElement('style');
  st.id='sb5217Style';
  st.textContent='\nhtml.sb5217ControlsHidden,html.sb5217ControlsHidden *{cursor:none!important}html.sb5217ControlsHidden video::-webkit-media-controls{display:none!important}html.sb5217ControlsHidden video::-webkit-media-controls-enclosure{display:none!important}html.sb5217ControlsHidden video::-webkit-media-controls-panel{display:none!important}.sb5217Hint{position:fixed;right:16px;bottom:16px;z-index:999999;border:1px solid rgba(34,211,166,.35);background:rgba(10,15,28,.94);color:#baf7df;border-radius:16px;padding:10px 12px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.38);font-size:13px}.sb5217VolBox{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:999998;background:rgba(8,12,24,.88);border:1px solid rgba(182,140,255,.25);border-radius:999px;padding:8px 12px;color:#fff;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.35);display:none}.sb5217VolBox.show{display:block}\n';
  document.head.appendChild(st);
}
function hint(msg){
  addStyle();
  var old=document.getElementById('sb5217Hint');if(old)old.remove();
  var d=document.createElement('div');d.id='sb5217Hint';d.className='sb5217Hint';d.textContent=msg;document.body.appendChild(d);
  setTimeout(function(){if(d&&d.parentNode)d.remove();},1700);
}
function volBox(msg){
  addStyle();
  var d=document.getElementById('sb5217VolBox');
  if(!d){d=document.createElement('div');d.id='sb5217VolBox';d.className='sb5217VolBox';document.body.appendChild(d);}
  d.textContent=msg;d.classList.add('show');
  clearTimeout(d._t);d._t=setTimeout(function(){d.classList.remove('show');},1200);
}
function showControls(){
  document.documentElement.classList.remove('sb5217ControlsHidden');
  visibleVideos().forEach(function(v){try{v.controls=true;v.setAttribute('controls','controls');}catch(e){}});
}
function hideControls(){
  if(!isWatchLike()||!isPlayerFocus())return;
  var v=activeVideo();
  if(!v||v.paused||v.ended)return;
  if(pointerDown||Date.now()<lockUntil||nearBottom())return;
  document.documentElement.classList.add('sb5217ControlsHidden');
  visibleVideos().forEach(function(x){try{x.controls=false;x.removeAttribute('controls');}catch(e){}});
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
function loop(){
  addStyle();
  var v=activeVideo();
  if(!v||!isWatchLike()){showControls();return;}
  if(!isPlayerFocus()){showControls();return;}
  if(v.paused||v.ended){showControls();return;}
  if(pointerDown||Date.now()<lockUntil||nearBottom()){
    showControls();
    return;
  }
  if(Date.now()-lastMove>IDLE_MS)hideControls();
  else showControls();
}
function volumeStep(delta){
  var v=activeVideo();if(!v)return;
  try{
    var n=Math.max(0,Math.min(1,(Number(v.volume)||0)+delta));
    v.volume=n;
    v.muted=n===0;
    volBox('Volume '+Math.round(n*100)+'%');
    lockUntil=Date.now()+INTERACT_LOCK_MS;
    showControls();
  }catch(e){}
}
['mousemove','pointermove'].forEach(function(ev){document.addEventListener(ev,function(e){userMove(e.clientY||0);},true);});
['touchstart','touchmove'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.touches&&e.touches[0];userInteract(t?t.clientY:0);},true);});
document.addEventListener('pointerdown',function(e){pointerDown=true;userInteract(e.clientY||0);},true);
document.addEventListener('mousedown',function(e){pointerDown=true;userInteract(e.clientY||0);},true);
document.addEventListener('pointerup',function(e){pointerDown=false;userInteract(e.clientY||0);},true);
document.addEventListener('mouseup',function(e){pointerDown=false;userInteract(e.clientY||0);},true);
document.addEventListener('click',function(e){userInteract(e.clientY||0);},true);
document.addEventListener('wheel',function(e){userInteract(e.clientY||0);},true);
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){document.addEventListener(ev,function(){lastMove=Date.now();lockUntil=Date.now()+2400;showControls();if(isPlayerFocus())hint('Player comfort on — controls hide after idle, stay active near volume.');},true);});
document.addEventListener('play',function(e){if(e.target&&e.target.tagName==='VIDEO'){lastMove=Date.now();lockUntil=Date.now()+1600;showControls();}},true);
document.addEventListener('pause',function(){showControls();},true);
document.addEventListener('volumechange',function(){lockUntil=Date.now()+INTERACT_LOCK_MS;showControls();},true);
document.addEventListener('keydown',function(e){
  if(!isWatchLike())return;
  var tag=(e.target&&e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  userInteract(0);
  if(e.key==='ArrowUp'){e.preventDefault();volumeStep(0.05);}
  if(e.key==='ArrowDown'){e.preventDefault();volumeStep(-0.05);}
},true);
var mo=new MutationObserver(function(){setTimeout(loop,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','controls']});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(loop,700);});
setInterval(loop,180);
})();
