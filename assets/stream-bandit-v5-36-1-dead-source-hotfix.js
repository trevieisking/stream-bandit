/* Stream Bandit V5.36.1 — Dead Source Hotfix
   Small live-only companion for V5.35.10/V5.36.0 buffer guard.
   Does not patch HLS. Does not change source URLs. Does not write to Supabase.
   If the video has HAVE_NOTHING, no buffered ranges and repeated no-data stalls, it reloads once to rebuild the blob/HLS pipeline. */
(function(){
'use strict';
var VERSION='V5.36.1 Dead Source Hotfix';
var noDataSince=0;
var lastNotice=0;
function log(msg){try{console.log('[Stream Bandit Dead Source Hotfix]',msg);var old=JSON.parse(localStorage.getItem('sb536_dead_source_log')||'[]');old.unshift(new Date().toLocaleTimeString()+' — '+msg);localStorage.setItem('sb536_dead_source_log',JSON.stringify(old.slice(0,20)));}catch(e){}}
function visibleVideo(){var vids=Array.prototype.slice.call(document.querySelectorAll('video'));return vids.filter(function(v){return v&&v.offsetParent!==null;})[0]||vids[0]||null;}
function hasBuffer(v){try{return v.buffered&&v.buffered.length>0;}catch(e){return false;}}
function samePageReloadAllowed(){var now=Date.now();var last=Number(localStorage.getItem('sb536_dead_source_reload_at')||0);if(now-last<120000)return false;localStorage.setItem('sb536_dead_source_reload_at',String(now));return true;}
function tick(){var v=visibleVideo();if(!v||v.ended){noDataSince=0;return;}var noData=!hasBuffer(v)&&v.readyState===0&&v.networkState===2&&!v.paused;if(noData){if(!noDataSince)noDataSince=Date.now();var age=Date.now()-noDataSince;if(Date.now()-lastNotice>10000){lastNotice=Date.now();log('No-data stream state for '+Math.round(age/1000)+'s at '+Math.round(v.currentTime||0)+'s.');}
if(age>32000){try{localStorage.setItem('sb536_dead_source_resume_time',String(Math.max(0,Math.round(v.currentTime||0)-6)));}catch(e){}if(samePageReloadAllowed()){log('Dead source confirmed. Reloading page once to rebuild stream.');setTimeout(function(){location.reload();},800);}else{log('Dead source reload rate-limited. Use browser refresh if playback does not recover.');noDataSince=Date.now();}}
}else{noDataSince=0;}}
log(VERSION+' loaded. No HLS patch.');setInterval(tick,1000);document.addEventListener('visibilitychange',function(){setTimeout(tick,300);});document.addEventListener('click',function(){setTimeout(tick,800);},true);
})();