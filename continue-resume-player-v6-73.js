/* Stream Bandit Continue Watching Player Helper
   V7.12.160 saved timestamp precedence fix.
   Shared by Player 1 and Player 2.
   Saves local browser progress per movie for Continue Watching.
   Player 1 self-resumes on refresh/direct open from the same per-movie progress key.
   If a stale URL timestamp exists, the newer/higher saved movie timestamp wins.
   Player 2 may read the same movie resume keys but does not replace Player 1's per-movie rows with playlist-only keys.
   No Supabase progress writes, no movie/admin/storage/billing/live actions. */
(function(){
'use strict';
const VERSION='V7.12.160 Saved Resume Wins';
const STORE='stream-bandit-progress-v6-73';
const attached=new WeakSet();
const lastSavedByVideo=new WeakMap();
const lastSeekByVideo=new WeakMap();
function param(k){return new URLSearchParams(location.search).get(k)||'';}
function sec(n){n=Number(n)||0;return Math.max(0,Math.floor(n));}
function readStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){return{};}}
function writeStore(obj){try{localStorage.setItem(STORE,JSON.stringify(obj));}catch(e){}}
function setStatus(msg){const el=document.getElementById('status');if(el&&msg)el.textContent=msg;}
function isPlayer2(){return /player-?two|player-?2|group-player|player2/i.test(location.pathname+location.search+document.title);}
function playerSlot(){return isPlayer2()?'player2':'player1';}
function movieId(){let id=param('id')||param('movie_id')||param('movieId')||'';if(id)return String(id);let s=readStore();let slot=s[playerSlot()+':latest'];if(slot&&slot.id)return String(slot.id);let latest=s.latest;if(latest&&latest.id)return String(latest.id);return 'latest';}
function progressFor(id){const s=readStore();id=String(id||'');return s[id]||s['movie:'+id]||null;}
function currentVideo(){return document.querySelector('#frame video, video');}
function safeDuration(video){return video&&isFinite(video.duration)?sec(video.duration):0;}
function saveProgress(video,force){const id=movieId();if(!id||id==='latest'||!video||!isFinite(video.currentTime))return null;const now=Date.now();const last=lastSavedByVideo.get(video)||0;if(!force&&now-last<2500&&video.currentTime>0)return null;lastSavedByVideo.set(video,now);const current=sec(video.currentTime);const duration=safeDuration(video);if(current<5)return null;const slot=playerSlot();const row={id:String(id),movie_id:String(id),movieId:String(id),currentTime:current,current:current,time:current,seconds:current,position:current,resume:current,duration:duration,durationSeconds:duration,total:duration,totalSeconds:duration,updatedAt:new Date().toISOString(),source:slot+'-progress-helper',playerSlot:slot,helperVersion:VERSION};const s=readStore();s[String(id)]=row;s['movie:'+String(id)]=row;s[slot+':latest']=row;s.latest=row;writeStore(s);try{window.dispatchEvent(new CustomEvent('stream-bandit-progress-saved',{detail:row}));}catch(e){}return row;}
function targetForCurrentMovie(){const direct=sec(param('t')||param('time')||param('resume')||0);const id=movieId();const saved=progressFor(id);const savedTime=saved?sec(saved.currentTime||saved.current||saved.time||saved.seconds||saved.resume||saved.position||0):0;if(savedTime&&direct)return Math.max(savedTime,direct);if(savedTime)return savedTime;if(direct)return direct;return 0;}
function seekWhenReady(video){if(!video)return;const target=targetForCurrentMovie();if(!target)return;function doSeek(){if(video.readyState<1)return;const last=lastSeekByVideo.get(video)||0;if(last&&Math.abs(last-target)<2)return;try{const dur=isFinite(video.duration)?video.duration:0;const safeMax=dur?Math.max(0,dur-3):target;const finalTarget=Math.min(target,safeMax);if(finalTarget>4&&Math.abs((video.currentTime||0)-finalTarget)>2){video.currentTime=finalTarget;lastSeekByVideo.set(video,finalTarget);setStatus('Resumed near '+sec(finalTarget)+'s.');setTimeout(()=>saveProgress(video,true),800);}}catch(e){}}
video.addEventListener('loadedmetadata',doSeek,{once:false});video.addEventListener('canplay',doSeek,{once:false});video.addEventListener('durationchange',doSeek,{once:false});setTimeout(doSeek,300);setTimeout(doSeek,900);setTimeout(doSeek,1800);setTimeout(doSeek,3200);}
function attach(video){if(!video||attached.has(video))return false;attached.add(video);seekWhenReady(video);['timeupdate','pause','seeking','seeked','loadedmetadata','durationchange','ended'].forEach(ev=>video.addEventListener(ev,()=>saveProgress(video,ev!=='timeupdate')));setInterval(()=>saveProgress(video,false),4000);window.StreamBanditProgressV673.video=video;return true;}
function scan(){document.querySelectorAll('#frame video, video').forEach(v=>attach(v));}
window.StreamBanditProgressV673={version:VERSION,store:STORE,read:readStore,progressFor:progressFor,currentMovieId:movieId,save:function(){return saveProgress(currentVideo(),true);},resume:function(){seekWhenReady(currentVideo());},scan:scan,attach:attach,video:null};
function init(){scan();setInterval(scan,1000);try{const mo=new MutationObserver(scan);mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();