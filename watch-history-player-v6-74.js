/* Stream Bandit V6.74.1 Watch History Player Helper
   Records local browser watch-history entries while the Player is used.
   Fix: resolve the real loaded movie ID from the Player Details link when opened without ?id.
   No Supabase writes, no movie/admin/storage/billing/live actions. */
(function(){
'use strict';
const VERSION='V6.74.1 Watch History Player Helper';
const STORE='stream-bandit-history-v6-74';
const PROGRESS_STORE='stream-bandit-progress-v6-73';
let lastSavedAt=0;
function param(k){return new URLSearchParams(location.search).get(k)||''}
function hrefId(){try{const a=document.getElementById('detailsLink');if(!a||!a.href)return'';return new URL(a.href,location.href).searchParams.get('id')||''}catch(e){return''}}
function movieId(){const id=param('id')||hrefId();return id&&id!=='latest'?id:''}
function sec(n){n=Number(n)||0;return Math.max(0,Math.floor(n))}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){return{}}}
function write(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch(e){}}
function save(video){const id=movieId();if(!id||!video||!isFinite(video.currentTime))return;const now=Date.now();if(now-lastSavedAt<5000&&video.currentTime>0)return;lastSavedAt=now;const current=sec(video.currentTime);const duration=isFinite(video.duration)?sec(video.duration):0;if(current<5)return;const history=read(STORE);history[String(id)]={id:String(id),movie_id:String(id),currentTime:current,duration:duration,lastWatchedAt:new Date().toISOString(),source:'player-v6-74-1'};write(STORE,history);const progress=read(PROGRESS_STORE);progress[String(id)]={id:String(id),currentTime:current,current:current,time:current,seconds:current,duration:duration,durationSeconds:duration,updatedAt:new Date().toISOString(),source:'player-v6-74-1'};write(PROGRESS_STORE,progress);window.dispatchEvent(new CustomEvent('stream-bandit-history-saved',{detail:history[String(id)]}));}
function enhance(){const video=document.querySelector('#frame video, video');if(!video)return false;['timeupdate','pause','ended'].forEach(ev=>video.addEventListener(ev,()=>save(video)));setInterval(()=>save(video),7000);window.StreamBanditHistoryV674={version:VERSION,store:STORE,read:()=>read(STORE),save:()=>save(video),movieId};return true;}
function init(){let tries=0;const timer=setInterval(()=>{tries++;if(enhance()||tries>30)clearInterval(timer)},300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
