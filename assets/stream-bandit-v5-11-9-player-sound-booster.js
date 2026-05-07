/* Stream Bandit V5.11.9 — Player Sound Booster Restore
   Accessibility/player comfort patch only.
   Adds a safe Web Audio gain booster for HTML5 video players.
   No Supabase writes, Mux metadata writes, storage writes, movie saves, tabs, menu or database changes. */
(function(){
'use strict';

var KEY='streambandit_player_sound_boost_v5119';
var DEFAULT={enabled:true,gain:2.5};
var state=load();
var audioCtx=null;
var videoMap=new WeakMap();
var panel=null;
var lastVideo=null;

function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(!raw)return Object.assign({},DEFAULT);
    var parsed=JSON.parse(raw);
    return {enabled:parsed.enabled!==false,gain:Number(parsed.gain)||DEFAULT.gain};
  }catch(e){return Object.assign({},DEFAULT);}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function pageText(){return String((main()&&main().textContent)||'').toLowerCase();}
function isLikelyWatchPage(){
  var t=pageText();
  return !!document.querySelector('video') || t.indexOf('watch')>-1 || t.indexOf('play / resume')>-1 || t.indexOf('hls/mux stream loaded')>-1 || t.indexOf('supabase watch')>-1;
}
function videos(){return Array.prototype.slice.call(document.querySelectorAll('video'));}
function currentVideo(){
  var vs=videos().filter(function(v){return v&&v.offsetParent!==null;});
  return vs[0]||videos()[0]||null;
}
function ensureCtx(){
  if(!audioCtx){
    var C=window.AudioContext||window.webkitAudioContext;
    if(!C)throw new Error('Web Audio is not supported in this browser.');
    audioCtx=new C();
  }
  if(audioCtx.state==='suspended')audioCtx.resume().catch(function(){});
  return audioCtx;
}
function attach(video){
  if(!video)return null;
  if(videoMap.has(video))return videoMap.get(video);
  var ctx=ensureCtx();
  var obj={ctx:ctx,gainNode:null,ok:false,error:''};
  try{
    var source=ctx.createMediaElementSource(video);
    var gain=ctx.createGain();
    source.connect(gain);
    gain.connect(ctx.destination);
    obj.source=source;
    obj.gainNode=gain;
    obj.ok=true;
    videoMap.set(video,obj);
    applyTo(video);
  }catch(e){
    obj.error=e&&e.message?e.message:String(e);
    videoMap.set(video,obj);
  }
  return obj;
}
function applyTo(video){
  video=video||currentVideo();
  if(!video)return;
  try{video.volume=1;}catch(e){}
  var obj=attach(video);
  if(obj&&obj.gainNode){
    obj.gainNode.gain.value=state.enabled?Math.max(1,Math.min(4,Number(state.gain)||1)):1;
  }
  renderStatus();
}
function pct(){return Math.round((Number(state.gain)||1)*100)+'%';}
function makePanel(){
  if(panel&&document.body.contains(panel))return panel;
  panel=document.createElement('div');
  panel.id='sb5119SoundBoosterPanel';
  panel.innerHTML='<div class="sb5119Head"><b>🔊 Player Sound Booster</b><span id="sb5119Badge">'+pct()+'</span></div><p>Restored accessibility boost for quiet streams. Works on Stream Bandit HTML5/HLS video players.</p><div class="sb5119Controls"><label><input id="sb5119Enabled" type="checkbox"> Booster on</label><select id="sb5119Gain"><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="2.5">250%</option><option value="3">300%</option><option value="4">400%</option></select><button id="sb5119Apply" type="button">Apply boost</button></div><div id="sb5119Status" class="sb5119Status">Ready.</div>';
  var st=document.createElement('style');
  st.id='sb5119Style';
  st.textContent='\n#sb5119SoundBoosterPanel{margin:12px 0;padding:14px;border-radius:20px;background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.12));border:1px solid rgba(61,220,151,.28);box-shadow:0 16px 38px rgba(0,0,0,.28);color:#f6f7ff}#sb5119SoundBoosterPanel .sb5119Head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}#sb5119SoundBoosterPanel b{font-size:16px}#sb5119Badge{display:inline-flex;border-radius:999px;padding:6px 9px;background:rgba(61,220,151,.20);border:1px solid rgba(61,220,151,.32);font-weight:950;color:#baf7df}#sb5119SoundBoosterPanel p{margin:0 0 10px;color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb5119Controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.sb5119Controls label{display:inline-flex;align-items:center;gap:7px;font-weight:850}.sb5119Controls select,.sb5119Controls button{border:1px solid rgba(255,255,255,.10);background:rgba(48,52,78,.92);color:#fff;border-radius:12px;padding:9px 10px;font-weight:900}.sb5119Controls button{background:linear-gradient(135deg,#ff2d85,#7c3cff);cursor:pointer}.sb5119Status{margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(8,13,26,.58);border:1px solid rgba(255,255,255,.08);color:#baf7df;font-size:12px}\n';
  if(!document.getElementById('sb5119Style'))document.head.appendChild(st);
  panel.querySelector('#sb5119Enabled').checked=state.enabled;
  panel.querySelector('#sb5119Gain').value=String(state.gain);
  panel.querySelector('#sb5119Enabled').addEventListener('change',function(){state.enabled=this.checked;save();applyTo(currentVideo());});
  panel.querySelector('#sb5119Gain').addEventListener('change',function(){state.gain=Number(this.value)||2.5;save();applyTo(currentVideo());});
  panel.querySelector('#sb5119Apply').addEventListener('click',function(){unlockAndApply();});
  return panel;
}
function placePanel(){
  if(!isLikelyWatchPage()){
    if(panel&&panel.parentNode)panel.parentNode.removeChild(panel);
    return;
  }
  var video=currentVideo();
  if(!video)return;
  lastVideo=video;
  var p=makePanel();
  var holder=video.closest('.card,.panel,.box,section,main,.main')||main();
  if(holder&&p.parentNode!==holder){
    if(video.parentNode&&video.parentNode.parentNode===holder)video.parentNode.insertAdjacentElement('afterend',p);
    else holder.insertBefore(p,holder.children[1]||null);
  }
  applyTo(video);
}
function renderStatus(){
  if(!panel)return;
  var badge=panel.querySelector('#sb5119Badge');
  if(badge)badge.textContent=state.enabled?pct():'Off';
  var status=panel.querySelector('#sb5119Status');
  if(!status)return;
  var v=currentVideo();
  if(!v){status.textContent='Waiting for player.';return;}
  var obj=videoMap.get(v);
  if(obj&&obj.ok){status.textContent='Active on this player. Boost: '+(state.enabled?pct():'Off')+'. Keyboard: + / - changes boost.';}
  else if(obj&&obj.error){status.textContent='Could not attach boost yet. Press play, then Apply boost. Browser message: '+obj.error;}
  else status.textContent='Ready. Press play or Apply boost.';
}
function unlockAndApply(){
  var v=currentVideo();
  if(!v){renderStatus();return;}
  try{ensureCtx();}catch(e){}
  attach(v);
  applyTo(v);
}
document.addEventListener('play',function(e){
  if(e.target&&e.target.tagName==='VIDEO'){
    lastVideo=e.target;
    unlockAndApply();
  }
},true);
document.addEventListener('click',function(e){
  if(e.target&&e.target.closest&&e.target.closest('#sb5119SoundBoosterPanel'))return;
  if(currentVideo())setTimeout(unlockAndApply,120);
},true);
document.addEventListener('keydown',function(e){
  if(!isLikelyWatchPage())return;
  var tag=(e.target&&e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select')return;
  if(e.key==='+'){state.gain=Math.min(4,(Number(state.gain)||1)+0.25);state.enabled=true;save();if(panel){panel.querySelector('#sb5119Enabled').checked=true;panel.querySelector('#sb5119Gain').value=String([1,1.5,2,2.5,3,4].reduce(function(a,b){return Math.abs(b-state.gain)<Math.abs(a-state.gain)?b:a},1));}applyTo(currentVideo());}
  if(e.key==='-'){state.gain=Math.max(1,(Number(state.gain)||1)-0.25);if(state.gain<=1)state.enabled=false;save();applyTo(currentVideo());}
});
var mo=new MutationObserver(function(){setTimeout(placePanel,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(placePanel,700);});
setInterval(placePanel,1500);
setTimeout(placePanel,900);
})();
