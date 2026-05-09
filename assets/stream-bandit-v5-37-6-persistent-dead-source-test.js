/* Stream Bandit V5.37.6 TEST — Persistent Dead Source Recovery
   Small test companion. No HLS patch. No source URL changes. No Supabase writes.
   Handles persistent no-data state when the older dead-source helper is reload-rate-limited.
   Max 2 extra reloads per 10 minutes, minimum 45 seconds apart. */
(function(){
'use strict';
var VERSION='V5.37.6 Persistent Dead Source Recovery TEST';
var seenAt=0,lastLog=0;
function log(msg){try{console.log('[Stream Bandit Persistent Dead Source TEST]',msg);var arr=JSON.parse(localStorage.getItem('sb536_dead_source_log')||'[]');arr.unshift(new Date().toLocaleTimeString()+' — '+msg);localStorage.setItem('sb536_dead_source_log',JSON.stringify(arr.slice(0,30)));}catch(e){}}
function video(){var all=Array.prototype.slice.call(document.querySelectorAll('video'));return all.filter(function(v){return v&&v.offsetParent!==null;})[0]||all[0]||null;}
function hasBuffer(v){try{return v.buffered&&v.buffered.length>0;}catch(e){return false;}}
function isNoData(v){return !!(v&&!v.ended&&v.readyState===0&&v.networkState===2&&!hasBuffer(v));}
function reloadAllowed(){var now=Date.now();var last=Number(localStorage.getItem('sb5376_persistent_dead_reload_at')||0);var raw=localStorage.getItem('sb5376_persistent_dead_reload_times')||'[]';var times=[];try{times=JSON.parse(raw).filter(function(t){return now-Number(t)<600000;});}catch(e){times=[];}if(now-last<45000)return false;if(times.length>=2)return false;times.push(now);localStorage.setItem('sb5376_persistent_dead_reload_at',String(now));localStorage.setItem('sb5376_persistent_dead_reload_times',JSON.stringify(times));return true;}
function tick(){var v=video();if(!isNoData(v)){seenAt=0;return;}if(!seenAt)seenAt=Date.now();var age=Date.now()-seenAt;if(Date.now()-lastLog>10000){lastLog=Date.now();log('Persistent no-data state for '+Math.round(age/1000)+'s at '+Math.round(v.currentTime||0)+'s, paused='+v.paused+'.');}
if(age>52000){try{localStorage.setItem('sb5376_persistent_dead_resume_time',String(Math.max(0,Math.round(v.currentTime||0)-6)));}catch(e){}if(reloadAllowed()){log('Persistent dead source confirmed. Extra controlled reload to rebuild stream.');setTimeout(function(){location.reload();},800);}else{log('Persistent dead source extra reload blocked by safety limit.');seenAt=Date.now();}}}
log(VERSION+' loaded. Watches persistent HAVE_NOTHING no-buffer state only.');setInterval(tick,1000);document.addEventListener('click',function(){setTimeout(tick,500);},true);document.addEventListener('visibilitychange',function(){setTimeout(tick,500);});
})();