/* Stream Bandit V5.21.6 — Fullscreen Native Controls Hider TEST
   Narrow player fix only.
   Purpose: hide the native HTML5 play bar when fullscreen/large-player mode is idle.
   Does not replace Sound Booster. Does not change movie rows, Supabase, Mux, database or saves. */
(function(){
'use strict';

var IDLE_MS=2200;
var lastMove=Date.now();
var hidden=false;
var tick=0;

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
function addStyle(){
  if(document.getElementById('sb5216Style'))return;
  var st=document.createElement('style');
  st.id='sb5216Style';
  st.textContent='\nhtml.sb5216ControlsHidden,html.sb5216ControlsHidden *{cursor:none!important}html.sb5216ControlsHidden video::-webkit-media-controls{display:none!important}html.sb5216ControlsHidden video::-webkit-media-controls-enclosure{display:none!important}html.sb5216ControlsHidden video::-webkit-media-controls-panel{display:none!important}.sb5216Hint{position:fixed;right:16px;bottom:16px;z-index:999999;border:1px solid rgba(34,211,166,.35);background:rgba(10,15,28,.94);color:#baf7df;border-radius:16px;padding:10px 12px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.38);font-size:13px}.sb5216VolBox{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:999998;background:rgba(8,12,24,.88);border:1px solid rgba(182,140,255,.25);border-radius:999px;padding:8px 12px;color:#fff;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.35);display:none}.sb5216VolBox.show{display:block}\n';
  document.head.appendChild(st);
}
function hint(msg){
  addStyle();
  var old=document.getElementById('sb5216Hint');if(old)old.remove();
  var d=document.createElement('div');d.id='sb5216Hint';d.className='sb5216Hint';d.textContent=msg;document.body.appendChild(d);
  setTimeout(function(){if(d&&d.parentNode)d.remove();},1700);
}
function volBox(msg){
  addStyle();
  var d=document.getElementById('sb5216VolBox');
  if(!d){d=document.createElement('div');d.id='sb5216VolBox';d.className='sb5216VolBox';document.body.appendChild(d);}
  d.textContent=msg;d.classList.add('show');
  clearTimeout(d._t);d._t=setTimeout(function(){d.classList.remove('show');},1200);
}
function showControls(){
  hidden=false;
  document.documentElement.classList.remove('sb5216ControlsHidden');
  visibleVideos().forEach(function(v){try{v.controls=true;v.setAttribute('controls','controls');}catch(e){}});
}
function hideControls(){
  if(!isWatchLike()||!isPlayerFocus())return;
  var v=activeVideo();
  if(!v||v.paused||v.ended)return;
  hidden=true;
  document.documentElement.classList.add('sb5216ControlsHidden');
  visibleVideos().forEach(function(x){try{x.controls=false;x.removeAttribute('controls');}catch(e){}});
}
function markMove(){lastMove=Date.now();showControls();}
function loop(){
  tick++;
  var v=activeVideo();
  if(!v||!isWatchLike()){showControls();return;}
  if(!isPlayerFocus()){showControls();return;}
  if(v.paused||v.ended){showControls();return;}
  if(Date.now()-lastMove>IDLE_MS){hideControls();}
  else showControls();
}
function volumeStep(delta){
  var v=activeVideo();if(!v)return;
  try{
    var n=Math.max(0,Math.min(1,(Number(v.volume)||0)+delta));
    v.volume=n;
    v.muted=n===0?true:false;
    volBox('Volume '+Math.round(n*100)+'%');
  }catch(e){}
}
['mousemove','pointermove','touchstart','touchmove','wheel','click'].forEach(function(ev){document.addEventListener(ev,markMove,true);});
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){document.addEventListener(ev,function(){lastMove=Date.now();showControls();if(isPlayerFocus())hint('Player comfort on — play bar hides after idle.');},true);});
document.addEventListener('play',function(e){if(e.target&&e.target.tagName==='VIDEO'){lastMove=Date.now();showControls();}},true);
document.addEventListener('pause',function(){showControls();},true);
document.addEventListener('keydown',function(e){
  if(!isWatchLike())return;
  var tag=(e.target&&e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  lastMove=Date.now();showControls();
  if(e.key==='ArrowUp'){e.preventDefault();volumeStep(0.05);}
  if(e.key==='ArrowDown'){e.preventDefault();volumeStep(-0.05);}
},true);
var mo=new MutationObserver(function(){setTimeout(loop,100);});
try{mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','controls']});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(loop,700);});
setInterval(loop,180);
})();
