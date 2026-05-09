/* Stream Bandit V5.35 — Buffer Guard TEST
   Test-only HLS/player stability patch.
   Goal: reduce long buffering on Stream Bandit when the same Mux HLS link plays fine on Mux/Maestro.
   No player design change, no button change, no source URL change, no Supabase writes. */
(function(){
'use strict';
var VERSION='V5.35 Buffer Guard TEST';
var OriginalHls=window.Hls;
var hlsInstances=[];
var log=[];
var lastVideo=null;
var lastGoodTime=0;
var lastGoodStamp=Date.now();
var stalledSince=0;
function now(){return new Date().toLocaleTimeString();}
function add(msg){log.unshift(now()+' — '+msg);log=log.slice(0,8);paint();try{console.log('[Stream Bandit Buffer Guard]',msg);}catch(e){}}
function extend(to,from){Object.keys(from).forEach(function(k){try{to[k]=from[k];}catch(e){}});return to;}
function safeConfig(config){
  return extend({
    enableWorker:true,
    lowLatencyMode:false,
    backBufferLength:90,
    maxBufferLength:120,
    maxMaxBufferLength:300,
    startFragPrefetch:true,
    manifestLoadingTimeOut:20000,
    manifestLoadingMaxRetry:8,
    manifestLoadingRetryDelay:800,
    manifestLoadingMaxRetryTimeout:12000,
    levelLoadingTimeOut:20000,
    levelLoadingMaxRetry:8,
    levelLoadingRetryDelay:800,
    fragLoadingTimeOut:30000,
    fragLoadingMaxRetry:10,
    fragLoadingRetryDelay:800,
    fragLoadingMaxRetryTimeout:16000
  },config||{});
}
function patchHls(){
  if(!OriginalHls||OriginalHls.__sb535Patched)return false;
  function StreamBanditHls(config){
    var hls=new OriginalHls(safeConfig(config));
    hlsInstances.push(hls);
    add('HLS created with safer long-buffer settings.');
    try{
      if(OriginalHls.Events&&OriginalHls.Events.ERROR){
        hls.on(OriginalHls.Events.ERROR,function(ev,data){
          var type=data&&data.type||'unknown';
          var details=data&&data.details||'unknown';
          var fatal=!!(data&&data.fatal);
          add('HLS '+(fatal?'fatal ':'')+'error: '+type+' / '+details);
          if(fatal){
            try{
              if(type===OriginalHls.ErrorTypes.MEDIA_ERROR){hls.recoverMediaError();add('HLS media recovery attempted.');}
              else {hls.startLoad();add('HLS startLoad recovery attempted.');}
            }catch(e){add('HLS recovery failed: '+(e&&e.message?e.message:e));}
          }
        });
      }
    }catch(e){}
    return hls;
  }
  try{Object.keys(OriginalHls).forEach(function(k){StreamBanditHls[k]=OriginalHls[k];});}catch(e){}
  StreamBanditHls.prototype=OriginalHls.prototype;
  StreamBanditHls.__sb535Patched=true;
  window.Hls=StreamBanditHls;
  add('HLS constructor patched before player setup.');
  return true;
}
function visibleVideo(){var vids=Array.prototype.slice.call(document.querySelectorAll('video'));return vids.filter(function(v){return v&&v.offsetParent!==null;})[0]||vids[0]||null;}
function bufferAhead(v){
  try{for(var i=0;i<v.buffered.length;i++){if(v.currentTime>=v.buffered.start(i)&&v.currentTime<=v.buffered.end(i))return Math.max(0,v.buffered.end(i)-v.currentTime);}}catch(e){}
  return 0;
}
function ensureVideo(v){
  if(!v||v.dataset.sb535Bound)return;
  v.dataset.sb535Bound='1';
  v.preload='auto';
  try{v.setAttribute('preload','auto');v.setAttribute('playsinline','playsinline');}catch(e){}
  ['waiting','stalled','suspend','emptied'].forEach(function(ev){v.addEventListener(ev,function(){stalledSince=Date.now();add('Video '+ev+' at '+Math.round(v.currentTime)+'s, buffer ahead '+Math.round(bufferAhead(v))+'s.');paint();});});
  ['playing','canplay','canplaythrough','progress'].forEach(function(ev){v.addEventListener(ev,function(){if(ev==='playing'){stalledSince=0;add('Video playing. Buffer ahead '+Math.round(bufferAhead(v))+'s.');}paint();});});
  v.addEventListener('timeupdate',function(){if(!v.paused&&!v.ended&&v.currentTime>lastGoodTime+0.2){lastGoodTime=v.currentTime;lastGoodStamp=Date.now();}});
  v.addEventListener('error',function(){add('Video element error code '+(v.error&&v.error.code||'unknown'));});
  add('Video guard attached.');
}
function recoverIfNeeded(v){
  if(!v||v.paused||v.ended)return;
  var stuckFor=Date.now()-lastGoodStamp;
  var ahead=bufferAhead(v);
  if(stuckFor>25000&&ahead>5){
    add('Playback looked stuck but buffer exists. Nudging play().');
    try{v.play().catch(function(){});}catch(e){}
    lastGoodStamp=Date.now();
  }
  if(stalledSince&&Date.now()-stalledSince>35000){
    hlsInstances.forEach(function(h){try{h.startLoad();}catch(e){}});
    try{v.play().catch(function(){});}catch(e){}
    add('Long stall recovery attempted: startLoad + play.');
    stalledSince=Date.now();
  }
}
function panel(){
  var p=document.getElementById('sb535BufferPanel');
  if(p)return p;
  p=document.createElement('div');
  p.id='sb535BufferPanel';
  p.innerHTML='<b>🛡 Buffer Guard TEST</b><span id="sb535BufferState">Waiting for player</span><details><summary>Buffer log</summary><pre id="sb535BufferLog"></pre></details>';
  var st=document.createElement('style');st.id='sb535BufferStyle';
  st.textContent='#sb535BufferPanel{margin:10px 0;padding:11px 12px;border-radius:16px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.24);color:#dfffee;font-size:13px}#sb535BufferPanel b{display:inline-block;margin-right:10px}#sb535BufferState{color:#baf7df;font-weight:800}#sb535BufferPanel details{margin-top:7px}#sb535BufferPanel summary{cursor:pointer;font-weight:900}#sb535BufferPanel pre{white-space:pre-wrap;margin:8px 0 0;color:#cfd6ea;font-size:12px;line-height:1.35}';
  if(!document.getElementById('sb535BufferStyle'))document.head.appendChild(st);
  return p;
}
function placePanel(v){
  if(!v)return;
  var p=panel();
  var holder=v.closest('.card,.panel,.box,section,main,.main')||document.querySelector('.main')||document.body;
  if(p.parentNode!==holder){
    if(v.parentNode&&v.parentNode.parentNode===holder)v.parentNode.insertAdjacentElement('afterend',p);
    else holder.insertBefore(p,holder.children[1]||null);
  }
}
function paint(){
  var v=lastVideo||visibleVideo();
  var state=document.getElementById('sb535BufferState');
  var pre=document.getElementById('sb535BufferLog');
  if(state&&v){state.textContent='Current '+Math.round(v.currentTime||0)+'s / buffer ahead '+Math.round(bufferAhead(v))+'s / readyState '+v.readyState;}
  else if(state)state.textContent='Waiting for player';
  if(pre)pre.textContent=log.join('\n');
}
function tick(){
  var v=visibleVideo();
  if(v){lastVideo=v;ensureVideo(v);placePanel(v);recoverIfNeeded(v);}
  paint();
}
patchHls();
add(VERSION+' loaded.');
setInterval(tick,1000);
document.addEventListener('DOMContentLoaded',function(){setTimeout(tick,800);});
setTimeout(tick,1200);setTimeout(tick,3000);
})();