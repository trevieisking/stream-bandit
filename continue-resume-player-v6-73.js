/* Stream Bandit Continue Watching Player Helper
   Saves local browser progress and resumes from ?t=<seconds>.
   Live-polish fix: helper no longer overwrites the Player 1 page badge/title with old V6.73 wording.
   No Supabase writes, no movie/admin/storage/billing/live actions. */
(function(){
'use strict';
const VERSION='V7.12.83 Continue Resume Helper';
const STORE='stream-bandit-progress-v6-73';
let lastSavedAt=0;
function param(k){return new URLSearchParams(location.search).get(k)||''}
function movieId(){return param('id')||'latest'}
function sec(n){n=Number(n)||0;return Math.max(0,Math.floor(n))}
function readStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(e){return{}}}
function writeStore(obj){try{localStorage.setItem(STORE,JSON.stringify(obj))}catch(e){}}
function setStatus(msg){const el=document.getElementById('status');if(el)el.textContent=msg}
function progressFor(id){const s=readStore();return s[String(id)]||null}
function saveProgress(video){const id=movieId();if(!id||!video||!isFinite(video.currentTime))return;const now=Date.now();if(now-lastSavedAt<3000&&video.currentTime>0)return;lastSavedAt=now;const current=sec(video.currentTime);const duration=isFinite(video.duration)?sec(video.duration):0;if(current<5)return;const s=readStore();s[String(id)]={id:String(id),currentTime:current,current:current,time:current,seconds:current,duration:duration,durationSeconds:duration,updatedAt:new Date().toISOString(),source:'player-progress-helper'};writeStore(s);window.dispatchEvent(new CustomEvent('stream-bandit-progress-saved',{detail:s[String(id)]}));}
function seekWhenReady(video){const direct=Number(param('t')||param('time')||param('resume')||0);const saved=progressFor(movieId());const target=sec(direct||((saved&&saved.currentTime)||0));if(!target||!video)return;let done=false;function doSeek(){if(done)return;if(video.readyState<1)return;try{const dur=isFinite(video.duration)?video.duration:0;const safeMax=dur?Math.max(0,dur-3):target;video.currentTime=Math.min(target,safeMax);done=true;setStatus('Resumed near '+sec(video.currentTime)+'s.');}catch(e){}}
video.addEventListener('loadedmetadata',doSeek,{once:false});video.addEventListener('canplay',doSeek,{once:false});setTimeout(doSeek,1200);}
function enhance(){const video=document.querySelector('#frame video, video');if(!video)return false;seekWhenReady(video);['timeupdate','pause','ended'].forEach(ev=>video.addEventListener(ev,()=>saveProgress(video)));setInterval(()=>saveProgress(video),5000);
// Important: do not overwrite the page badge/title/hero copy. Player 1 owns its own visible version label.
window.StreamBanditProgressV673={version:VERSION,store:STORE,read:readStore,save:()=>saveProgress(video)};return true;}
function init(){let tries=0;const timer=setInterval(()=>{tries++;if(enhance()||tries>30)clearInterval(timer)},300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();