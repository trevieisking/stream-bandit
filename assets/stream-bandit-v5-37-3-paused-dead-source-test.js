/* Stream Bandit V5.37.3 TEST — Paused Dead Source Recovery
   Small test companion. No HLS patch. No source URL changes. No Supabase writes.
   Handles the report case: video is paused, HAVE_NOTHING, NETWORK_LOADING, no buffered ranges. */
(function(){
'use strict';
var VERSION='V5.37.3 Paused Dead Source Recovery TEST';
var seenAt=0;
var lastLog=0;
function log(msg){try{console.log('[Stream Bandit Paused Dead Source TEST]',msg);var arr=JSON.parse(localStorage.getItem('sb5373_paused_dead_source_log')||'[]');arr.unshift(new Date().toLocaleTimeString()+' — '+msg);localStorage.setItem('sb5373_paused_dead_source_log',JSON.stringify(arr.slice(0,30)));}catch(e){}}
function video(){var all=Array.prototype.slice.call(document.querySelectorAll('video'));return all.filter(function(v){return v&&v.offsetParent!==null;})[0]||all[0]||null;}
function hasBuffer(v){try{return v.buffered&&v.buffered.length>0;}catch(e){return false;}}
function isPausedDead(v){return !!(v&&!v.ended&&v.paused&&v.readyState===0&&v.networkState===2&&!hasBuffer(v));}
function reloadAllowed(){var now=Date.now();var key='sb5373_paused_dead_reload_at';var last=Number(localStorage.getItem(key)||0);if(now-last<120000)return false;localStorage.setItem(key,String(now));return true;}
function tick(){var v=video();if(!isPausedDead(v)){seenAt=0;return;}if(!seenAt)seenAt=Date.now();var age=Date.now()-seenAt;if(Date.now()-lastLog>8000){lastLog=Date.now();log('Paused dead source for '+Math.round(age/1000)+'s at '+Math.round(v.currentTime||0)+'s.');}
if(age>18000){try{localStorage.setItem('sb5373_paused_dead_resume_time',String(Math.max(0,Math.round(v.currentTime||0)-6)));}catch(e){}if(reloadAllowed()){log('Paused dead source confirmed. Reloading once to rebuild stream.');setTimeout(function(){location.reload();},700);}else{log('Paused dead source reload rate-limited. Manual refresh may be needed.');seenAt=Date.now();}}}
log(VERSION+' loaded. Watches paused HAVE_NOTHING no-buffer state only.');setInterval(tick,1000);document.addEventListener('click',function(){setTimeout(tick,500);},true);document.addEventListener('visibilitychange',function(){setTimeout(tick,500);});
})();