/* Stream Bandit V6.73 Continue Watching List Helper
   Reads local progress saved by the Player helper and rewrites Resume links with &t=<seconds>.
   No Supabase writes, no movie/admin/storage/billing/live actions. */
(function(){
'use strict';
const VERSION='V6.73 Continue Watching Resume TEST';
const STORE='stream-bandit-progress-v6-73';
const PLAYER='player-watch-shell-v6-34-test.html';
function readStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(e){return{}}}
function sec(n){n=Number(n)||0;return Math.max(0,Math.floor(n))}
function fmt(n){n=sec(n);const m=Math.floor(n/60),s=n%60;return m+'m '+s+'s'}
function setStatus(msg){const el=document.getElementById('status');if(el)el.textContent=msg}
function updateText(){document.title='Stream Bandit '+VERSION;const badge=document.querySelector('.badge');if(badge)badge.textContent=VERSION;const hero=document.querySelector('.hero p');if(hero)hero.textContent='Continue Watching now uses saved local timestamps and sends Resume links to Player with ?t=seconds.';const note=document.querySelector('.note');if(note)note.textContent='Progress is saved locally by the Player helper. No Supabase progress write yet.';}
function idFromHref(href){try{return new URL(href,location.href).searchParams.get('id')||''}catch(e){return''}}
function rewriteLinks(){const progress=readStore();let changed=0;document.querySelectorAll('a[href*="'+PLAYER+'"]').forEach(a=>{const id=idFromHref(a.getAttribute('href')||'');const p=id?progress[String(id)]:null;if(!p||!p.currentTime)return;const url=new URL(a.getAttribute('href'),location.href);url.searchParams.set('t',String(sec(p.currentTime)));a.setAttribute('href',url.pathname.split('/').pop()+url.search);a.textContent='Resume at '+fmt(p.currentTime);a.title='Resume at '+fmt(p.currentTime)+' using '+VERSION;changed++;});setStatus(changed?'Continue Watching resume timestamps ready on '+changed+' link(s).':'No matching saved timestamps yet. Play a movie for 20–30 seconds, return here, then hard refresh.');return changed;}
function addProgressSummary(){const box=document.getElementById('stats');if(!box)return;const progress=readStore();const rows=Object.values(progress).filter(x=>x&&x.id&&x.currentTime);const html='<div class="stat"><b>V6.73 local progress</b><span>'+rows.length+'</span></div>'+'<div class="stat"><b>Latest timestamp</b><span>'+ (rows[0]?fmt(rows.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0].currentTime):'0s') +'</span></div>';box.insertAdjacentHTML('beforeend',html)}
function init(){updateText();setTimeout(()=>{rewriteLinks();addProgressSummary()},900);setInterval(rewriteLinks,4000);window.StreamBanditContinueResumeV673={version:VERSION,store:STORE,read:readStore,rewrite:rewriteLinks};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
