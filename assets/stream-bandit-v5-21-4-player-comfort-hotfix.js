/* Stream Bandit V5.21.4 — Player Comfort Hotfix TEST
   Fixes two player comfort issues in a removable overlay patch:
   1) Preserves manual video volume so Sound Booster does not keep forcing the slider back up.
   2) Auto-hides HTML5 player controls while fullscreen video is playing, then shows them on mouse/touch/keyboard movement.
   No Supabase writes, no movie saves, no Mux metadata changes, no database changes. */
(function(){
'use strict';

var VERSION='V5.21.4 Player Comfort Hotfix Test';
var VOL_KEY='streambandit_player_manual_volume_v5214';
var userVol=loadVol();
var lastUserAction=0;
var hidden=false;
var lastFullscreenMove=Date.now();
var restoreTimer=null;

function loadVol(){
  try{
    var n=Number(localStorage.getItem(VOL_KEY));
    return Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
  }catch(e){return 1;}
}
function saveVol(){try{localStorage.setItem(VOL_KEY,String(userVol));}catch(e){}}
function videos(){return Array.prototype.slice.call(document.querySelectorAll('video'));}
function activeVideo(){
  var vs=videos().filter(function(v){return v&&v.offsetParent!==null;});
  return vs[0]||videos()[0]||null;
}
function isFullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement);}
function now(){return Date.now();}
function markUserAction(){lastUserAction=now();lastFullscreenMove=now();showControls();}
function setVideoVol(v,vol){
  if(!v)return;
  try{
    if(Math.abs(Number(v.volume)-vol)>0.02)v.volume=vol;
  }catch(e){}
}
function preserveManualVolume(){
  var v=activeVideo();
  if(!v)return;
  if(Number.isFinite(userVol))setVideoVol(v,userVol);
}
function bindVideo(v){
  if(!v||v.dataset.sb5214Bound)return;
  v.dataset.sb5214Bound='1';
  try{if(Number.isFinite(userVol))v.volume=userVol;}catch(e){}
  v.addEventListener('volumechange',function(){
    var n=Number(v.volume);
    if(!Number.isFinite(n))return;
    // If a real user interaction recently happened, trust the slider value.
    if(now()-lastUserAction<1600){
      userVol=Math.max(0,Math.min(1,n));
      saveVol();
    }
  });
  ['pointerdown','mousedown','touchstart','wheel','keydown'].forEach(function(ev){
    v.addEventListener(ev,markUserAction,{passive:true});
  });
}
function bindAll(){videos().forEach(bindVideo);}
function showControls(){
  videos().forEach(function(v){try{v.controls=true;}catch(e){}});
  hidden=false;
  document.documentElement.classList.remove('sb5214ControlsHidden');
}
function hideControls(){
  var v=activeVideo();
  if(!v||v.paused||v.ended)return;
  videos().forEach(function(x){try{x.controls=false;}catch(e){}});
  hidden=true;
  document.documentElement.classList.add('sb5214ControlsHidden');
}
function fullscreenLoop(){
  if(!isFullscreen()){
    showControls();
    return;
  }
  var v=activeVideo();
  if(!v)return;
  if(v.paused||v.ended){showControls();return;}
  if(now()-lastFullscreenMove>2600)hideControls();
}
function addStyle(){
  if(document.getElementById('sb5214PlayerComfortStyle'))return;
  var st=document.createElement('style');
  st.id='sb5214PlayerComfortStyle';
  st.textContent='\n.sb5214Notice{position:fixed;right:16px;bottom:16px;z-index:99999;border:1px solid rgba(34,211,166,.35);background:rgba(10,15,28,.94);color:#baf7df;border-radius:16px;padding:10px 12px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.38);font-size:13px}.sb5214ControlsHidden{cursor:none}\n';
  document.head.appendChild(st);
}
function notice(msg){
  addStyle();
  var old=document.getElementById('sb5214Notice');
  if(old)old.remove();
  var n=document.createElement('div');
  n.id='sb5214Notice';
  n.className='sb5214Notice';
  n.textContent=msg;
  document.body.appendChild(n);
  setTimeout(function(){if(n&&n.parentNode)n.remove();},1800);
}
function run(){
  bindAll();
  preserveManualVolume();
  fullscreenLoop();
}
['mousemove','pointermove','touchstart','keydown','wheel','click'].forEach(function(ev){
  document.addEventListener(ev,function(){
    lastUserAction=now();
    lastFullscreenMove=now();
    if(isFullscreen())showControls();
  },true);
});
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){
  document.addEventListener(ev,function(){
    lastFullscreenMove=now();
    showControls();
    if(isFullscreen())notice('Fullscreen comfort on — controls will auto-hide while playing.');
  });
});
document.addEventListener('play',function(e){
  if(e.target&&e.target.tagName==='VIDEO'){
    bindVideo(e.target);
    preserveManualVolume();
    lastFullscreenMove=now();
  }
},true);
document.addEventListener('volumechange',function(e){
  if(e.target&&e.target.tagName==='VIDEO'&&now()-lastUserAction<1600){
    var n=Number(e.target.volume);
    if(Number.isFinite(n)){userVol=Math.max(0,Math.min(1,n));saveVol();}
  }
},true);
var mo=new MutationObserver(function(){setTimeout(run,150);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,450);
setInterval(fullscreenLoop,350);
})();
