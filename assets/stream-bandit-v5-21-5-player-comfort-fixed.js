/* Stream Bandit V5.21.5 — Fixed Player Comfort TEST
   Replacement test for V5.11.9 Sound Booster.
   IMPORTANT: test page must NOT load the old V5.11.9 booster.
   Fix goals:
   1) Manual volume slider is respected.
   2) Optional accessibility boost uses gain without forcing video.volume to 1.
   3) Fullscreen native video controls hide after idle while playing and return on movement.
   No Supabase writes, no movie saves, no Mux metadata writes, no database changes. */
(function(){
'use strict';

var BOOST_KEY='streambandit_player_sound_boost_v5215';
var VOL_KEY='streambandit_player_manual_volume_v5215';
var DEFAULT={enabled:true,gain:2.5,volume:1};
var state=loadState();
var audioCtx=null;
var videoMap=new WeakMap();
var panel=null;
var lastInput=Date.now();
var lastVolSet=0;

function loadState(){
  var s=Object.assign({},DEFAULT);
  try{
    var old=JSON.parse(localStorage.getItem('streambandit_player_sound_boost_v5119')||'{}');
    if(old&&typeof old==='object'){
      if(old.enabled===false)s.enabled=false;
      if(Number(old.gain))s.gain=Number(old.gain);
    }
  }catch(e){}
  try{
    var raw=localStorage.getItem(BOOST_KEY);
    if(raw){var p=JSON.parse(raw);if(p&&typeof p==='object'){s.enabled=p.enabled!==false;s.gain=Number(p.gain)||s.gain;s.volume=Number.isFinite(Number(p.volume))?Number(p.volume):s.volume;}}
  }catch(e){}
  try{
    var v=Number(localStorage.getItem(VOL_KEY));
    if(Number.isFinite(v))s.volume=Math.max(0,Math.min(1,v));
  }catch(e){}
  s.gain=Math.max(1,Math.min(4,Number(s.gain)||2.5));
  s.volume=Math.max(0,Math.min(1,Number(s.volume)||1));
  return s;
}
function save(){try{localStorage.setItem(BOOST_KEY,JSON.stringify(state));localStorage.setItem(VOL_KEY,String(state.volume));}catch(e){}}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function isWatch(){var t=text(main()).toLowerCase();return !!document.querySelector('video')||/watch|play \/ resume|hls\/mux|supabase watch/.test(t);}
function videos(){return Array.prototype.slice.call(document.querySelectorAll('video'));}
function activeVideo(){return videos().filter(function(v){return v&&v.offsetParent!==null;})[0]||videos()[0]||null;}
function isFullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement);}
function isTypingTarget(el){var tag=(el&&el.tagName||'').toLowerCase();return tag==='input'||tag==='textarea'||tag==='select'||(el&&el.isContentEditable);}
function ensureCtx(){
  if(!audioCtx){var C=window.AudioContext||window.webkitAudioContext;if(!C)throw new Error('Web Audio not supported');audioCtx=new C();}
  if(audioCtx.state==='suspended')audioCtx.resume().catch(function(){});
  return audioCtx;
}
function attach(video){
  if(!video)return null;
  if(videoMap.has(video))return videoMap.get(video);
  var obj={ok:false,error:'',gainNode:null};
  try{
    var ctx=ensureCtx();
    var source=ctx.createMediaElementSource(video);
    var gain=ctx.createGain();
    source.connect(gain);gain.connect(ctx.destination);
    obj={ok:true,error:'',ctx:ctx,source:source,gainNode:gain};
    videoMap.set(video,obj);
  }catch(e){obj.error=e&&e.message?e.message:String(e);videoMap.set(video,obj);}
  return obj;
}
function applyGain(video){
  video=video||activeVideo();
  if(!video)return;
  var obj=attach(video);
  if(obj&&obj.gainNode){obj.gainNode.gain.value=state.enabled?state.gain:1;}
  renderPanelStatus();
}
function applyManualVolume(video){
  video=video||activeVideo();
  if(!video)return;
  try{
    if(Math.abs(Number(video.volume)-state.volume)>0.02){
      lastVolSet=Date.now();
      video.volume=state.volume;
    }
  }catch(e){}
}
function bindVideo(video){
  if(!video||video.dataset.sb5215Bound)return;
  video.dataset.sb5215Bound='1';
  video.addEventListener('volumechange',function(){
    var n=Number(video.volume);
    if(!Number.isFinite(n))return;
    // Ignore volume changes we made ourselves.
    if(Date.now()-lastVolSet<300)return;
    state.volume=Math.max(0,Math.min(1,n));
    save();
    syncPanel();
  });
  video.addEventListener('play',function(){unlock();});
}
function bindAll(){videos().forEach(bindVideo);}
function pct(){return Math.round(state.gain*100)+'%';}
function volPct(){return Math.round(state.volume*100)+'%';}
function makePanel(){
  if(panel&&document.body.contains(panel))return panel;
  panel=document.createElement('div');
  panel.id='sb5215PlayerPanel';
  panel.innerHTML='<div class="sb5215Head"><b>🔊 Player Sound Booster</b><span id="sb5215Badge"></span></div><p>Fixed test booster: keeps your normal player volume slider working while still adding accessibility gain.</p><div class="sb5215Controls"><label><input id="sb5215Enabled" type="checkbox"> Booster on</label><label>Boost <select id="sb5215Gain"><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="2.5">250%</option><option value="3">300%</option><option value="4">400%</option></select></label><label>Volume <input id="sb5215Volume" type="range" min="0" max="100" step="1"></label><button id="sb5215Apply" type="button">Apply</button></div><div id="sb5215Status" class="sb5215Status">Ready.</div>';
  if(!document.getElementById('sb5215Style')){
    var st=document.createElement('style');st.id='sb5215Style';
    st.textContent='\n#sb5215PlayerPanel{margin:12px 0;padding:14px;border-radius:20px;background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.12));border:1px solid rgba(61,220,151,.28);box-shadow:0 16px 38px rgba(0,0,0,.28);color:#f6f7ff}#sb5215PlayerPanel .sb5215Head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}#sb5215Badge{display:inline-flex;border-radius:999px;padding:6px 9px;background:rgba(61,220,151,.20);border:1px solid rgba(61,220,151,.32);font-weight:950;color:#baf7df}#sb5215PlayerPanel p{margin:0 0 10px;color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb5215Controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.sb5215Controls label{display:inline-flex;align-items:center;gap:7px;font-weight:850}.sb5215Controls select,.sb5215Controls button{border:1px solid rgba(255,255,255,.10);background:rgba(48,52,78,.92);color:#fff;border-radius:12px;padding:9px 10px;font-weight:900}.sb5215Controls input[type=range]{width:140px}.sb5215Controls button{background:linear-gradient(135deg,#ff2d85,#7c3cff);cursor:pointer}.sb5215Status{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(8,13,26,.58);border:1px solid rgba(255,255,255,.08);color:#baf7df;font-size:12px}.sb5215FsHint{position:fixed;right:16px;bottom:16px;z-index:99999;border:1px solid rgba(34,211,166,.35);background:rgba(10,15,28,.94);color:#baf7df;border-radius:16px;padding:10px 12px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.38);font-size:13px}.sb5215HideCursor{cursor:none!important}\n';
    document.head.appendChild(st);
  }
  panel.querySelector('#sb5215Enabled').onchange=function(){state.enabled=this.checked;save();applyGain(activeVideo());syncPanel();};
  panel.querySelector('#sb5215Gain').onchange=function(){state.gain=Math.max(1,Math.min(4,Number(this.value)||2.5));save();applyGain(activeVideo());syncPanel();};
  panel.querySelector('#sb5215Volume').oninput=function(){state.volume=Math.max(0,Math.min(1,Number(this.value)/100));save();applyManualVolume(activeVideo());syncPanel();};
  panel.querySelector('#sb5215Apply').onclick=function(){unlock();};
  syncPanel();
  return panel;
}
function syncPanel(){
  if(!panel)return;
  var en=panel.querySelector('#sb5215Enabled'),g=panel.querySelector('#sb5215Gain'),v=panel.querySelector('#sb5215Volume'),b=panel.querySelector('#sb5215Badge');
  if(en)en.checked=state.enabled;
  if(g)g.value=String(state.gain);
  if(v)v.value=String(Math.round(state.volume*100));
  if(b)b.textContent=(state.enabled?pct():'Off')+' / Vol '+volPct();
  renderPanelStatus();
}
function renderPanelStatus(){
  if(!panel)return;
  var status=panel.querySelector('#sb5215Status');if(!status)return;
  var v=activeVideo();
  if(!v){status.textContent='Waiting for player.';return;}
  var obj=videoMap.get(v);
  if(obj&&obj.ok)status.textContent='Active. Boost '+(state.enabled?pct():'Off')+'. Manual volume '+volPct()+'. Fullscreen controls auto-hide while playing.';
  else if(obj&&obj.error)status.textContent='Boost attach waiting. Press Play then Apply. Browser: '+obj.error;
  else status.textContent='Ready. Press Play or Apply.';
}
function placePanel(){
  if(!isWatch()){
    if(panel&&panel.parentNode)panel.parentNode.removeChild(panel);
    return;
  }
  var v=activeVideo();if(!v)return;
  bindVideo(v);
  var p=makePanel();
  var holder=v.closest('.card,.panel,.box,section,main,.main')||main();
  if(holder&&p.parentNode!==holder){
    if(v.parentNode&&v.parentNode.parentNode===holder)v.parentNode.insertAdjacentElement('afterend',p);else holder.insertBefore(p,holder.children[1]||null);
  }
  applyManualVolume(v);applyGain(v);syncPanel();
}
function unlock(){var v=activeVideo();if(!v)return;try{ensureCtx();}catch(e){}bindVideo(v);applyManualVolume(v);applyGain(v);}
function markMove(){lastInput=Date.now();showControls();}
function showControls(){videos().forEach(function(v){try{v.setAttribute('controls','controls');v.controls=true;}catch(e){}});document.documentElement.classList.remove('sb5215HideCursor');}
function hideControls(){
  if(!isFullscreen())return;
  var v=activeVideo();if(!v||v.paused||v.ended)return;
  try{v.removeAttribute('controls');v.controls=false;}catch(e){}
  document.documentElement.classList.add('sb5215HideCursor');
}
function fsLoop(){
  if(!isFullscreen()){showControls();return;}
  var v=activeVideo();if(!v)return;
  if(v.paused||v.ended){showControls();return;}
  if(Date.now()-lastInput>2200)hideControls();
}
function hint(msg){
  var old=document.getElementById('sb5215FsHint');if(old)old.remove();
  var d=document.createElement('div');d.id='sb5215FsHint';d.className='sb5215FsHint';d.textContent=msg;document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove();},1800);
}
['mousemove','pointermove','touchstart','keydown','wheel','click'].forEach(function(ev){document.addEventListener(ev,function(e){if(isTypingTarget(e.target))return;markMove();},true);});
['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(function(ev){document.addEventListener(ev,function(){lastInput=Date.now();showControls();if(isFullscreen())hint('Fullscreen comfort on — controls hide after idle.');});});
document.addEventListener('play',function(e){if(e.target&&e.target.tagName==='VIDEO')unlock();},true);
document.addEventListener('keydown',function(e){
  if(!isWatch()||isTypingTarget(e.target))return;
  if(e.key==='+'){state.gain=Math.min(4,state.gain+0.25);state.enabled=true;save();applyGain(activeVideo());syncPanel();}
  if(e.key==='-'){state.gain=Math.max(1,state.gain-0.25);if(state.gain<=1)state.enabled=false;save();applyGain(activeVideo());syncPanel();}
});
var mo=new MutationObserver(function(){setTimeout(function(){bindAll();placePanel();},160);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(placePanel,700);});
setInterval(function(){bindAll();placePanel();},1000);
setInterval(fsLoop,250);
})();
