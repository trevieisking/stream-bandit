/* Stream Bandit Continue Watching Player Helper
   V7.12.158 reliable attach fix.
   Shared by Player 1 and Player 2.
   Saves local browser progress and resumes from ?t=<seconds>, ?time=<seconds>, or ?resume=<seconds>.
   No Supabase progress writes, no movie/admin/storage/billing/live actions. */
(function(){
'use strict';
const VERSION='V7.12.158 Continue Resume Helper Reliable Attach';
const STORE='stream-bandit-progress-v6-73';
const attached=new WeakSet();
const lastSavedByVideo=new WeakMap();
function param(k){return new URLSearchParams(location.search).get(k)||'';}
function movieId(){return param('id')||'latest';}
function sec(n){n=Number(n)||0;return Math.max(0,Math.floor(n));}
function readStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){return{};}}
function writeStore(obj){try{localStorage.setItem(STORE,JSON.stringify(obj));}catch(e){}}
function setStatus(msg){const el=document.getElementById('status');if(el)el.textContent=msg;}
function progressFor(id){const s=readStore();return s[String(id)]||null;}
function currentVideo(){return document.querySelector('#frame video, video');}
function saveProgress(video,force){const id=movieId();if(!id||!video||!isFinite(video.currentTime))return null;const now=Date.now();const last=lastSavedByVideo.get(video)||0;if(!force&&now-last<2500&&video.currentTime>0)return null;lastSavedByVideo.set(video,now);const current=sec(video.currentTime);const duration=isFinite(video.duration)?sec(video.duration):0;if(current<5)return null;const row={id:String(id),movie_id:String(id),movieId:String(id),currentTime:current,current:current,time:current,seconds:current,position:current,resume:current,duration:duration,durationSeconds:duration,total:duration,totalSeconds:duration,updatedAt:new Date().toISOString(),source:'player-progress-helper',helperVersion:VERSION};const s=readStore();s[String(id)]=row;s.latest=row;writeStore(s);try{window.dispatchEvent(new CustomEvent('stream-bandit-progress-saved',{detail:row}));}catch(e){}return row;}
function seekWhenReady(video){const direct=Number(param('t')||param('time')||param('resume')||0);const saved=progressFor(movieId());const target=sec(direct||((saved&&(saved.currentTime||saved.current||saved.time||saved.seconds||saved.resume))||0));if(!target||!video)return;let done=false;function doSeek(){if(done)return;if(video.readyState<1)return;try{const dur=isFinite(video.duration)?video.duration:0;const safeMax=dur?Math.max(0,dur-3):target;video.currentTime=Math.min(target,safeMax);done=true;setStatus('Resumed near '+sec(video.currentTime)+'s.');saveProgress(video,true);}catch(e){}}
video.addEventListener('loadedmetadata',doSeek,{once:false});video.addEventListener('canplay',doSeek,{once:false});setTimeout(doSeek,500);setTimeout(doSeek,1500);}
function attach(video){if(!video||attached.has(video))return false;attached.add(video);seekWhenReady(video);['timeupdate','pause','seeking','seeked','loadedmetadata','durationchange'].forEach(ev=>video.addEventListener(ev,()=>saveProgress(video,ev!=='timeupdate')));setInterval(()=>saveProgress(video,false),4000);window.StreamBanditProgressV673.video=video;return true;}
function scan(){document.querySelectorAll('#frame video, video').forEach(v=>attach(v));}
window.StreamBanditProgressV673={version:VERSION,store:STORE,read:readStore,progressFor:progressFor,save:function(){return saveProgress(currentVideo(),true);},scan:scan,attach:attach,video:null};
function init(){scan();setInterval(scan,1000);try{const mo=new MutationObserver(scan);mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();