/* Stream Bandit V6.74 Watch History List Helper
   Reads local browser watch-history entries and renders real recent rows.
   No Supabase writes, no movie/admin/storage/billing/live actions. */
(function(){
'use strict';
const VERSION='V6.74 Watch History Real Tracking TEST';
const HISTORY_STORE='stream-bandit-history-v6-74';
const PROGRESS_STORE='stream-bandit-progress-v6-73';
const DETAILS='details-watch-shell-v6-33-test.html';
const PLAYER='player-watch-shell-v6-34-test.html';
let sb=null,movies=[];
function $(id){return document.getElementById(id)}
function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function arr(v){if(Array.isArray(v))return v;if(typeof v==='string'&&v.trim())return v.split(',').map(x=>x.trim()).filter(Boolean);return []}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){return{}}}
function sec(n){n=Number(n)||0;return Math.max(0,Math.floor(n))}
function fmt(n){n=sec(n);const m=Math.floor(n/60),s=n%60;return m+'m '+s+'s'}
function poster(m){return m.thumbnail_url||m.poster_url||m.poster||m.thumb||m.backdrop_url||m.image_url||''}
function firstUrl(m){return m.video_url||m.mux_playback_url||m.stream_url||m.url||''}
function sourceType(m){const u=firstUrl(m);if(m.source_type)return m.source_type;if(/stream\.mux\.com/i.test(u))return'Mux';if(/\.m3u8(\?|$)/i.test(u))return'HLS';if(u)return'URL';return'None'}
function setStatus(msg,bad){const el=$('status');if(el){el.textContent=msg;el.style.background=bad?'rgba(255,45,85,.12)':'rgba(34,211,166,.10)'}}
function stat(a,b){return'<div class="stat"><b>'+esc(a)+'</b><span>'+esc(b)+'</span></div>'}
async function readConfig(){const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());return{url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1],key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]}}
function updateText(){document.title='Stream Bandit '+VERSION;const badge=document.querySelector('.badge');if(badge)badge.textContent=VERSION;const hero=document.querySelector('.hero p');if(hero)hero.textContent='Watch History now reads real local playback history saved by the Player helper. No Supabase history write yet.';const good=document.querySelector('.good');if(good)good.textContent='Expected: after playing a movie, real history rows appear here with Details, Play and Resume links.';const note=document.querySelector('.note');if(note)note.textContent='History is local browser tracking only. No clear/delete/history write button is exposed on this page.';}
function historyRows(){const hist=read(HISTORY_STORE),prog=read(PROGRESS_STORE),rows=Object.values(hist).filter(x=>x&&x.id);rows.forEach(r=>{const p=prog[String(r.id)];if(p&&p.currentTime)r.currentTime=p.currentTime;if(p&&p.duration)r.duration=p.duration});return rows.sort((a,b)=>String(b.lastWatchedAt||'').localeCompare(String(a.lastWatchedAt||'')))}
function card(row,mode){const byId={};movies.forEach(m=>byId[String(m.id)]=m);const m=byId[String(row.id)]||null;if(!m)return'';const id=encodeURIComponent(m.id||''),img=poster(m),u=firstUrl(m),t=sec(row.currentTime),gs=arr(m.genres).slice(0,2),playHref=PLAYER+'?id='+id+(t?'&t='+t:'');return'<article class="movie"><div class="thumb">'+(img?'<img src="'+esc(img)+'" loading="lazy" alt="'+esc(m.title||'Artwork')+'">':'No artwork')+'</div><div class="body"><h3>'+esc(m.title||'Untitled')+'</h3><p>'+esc(m.description||'No description yet.')+'</p><div><span class="pill">'+esc(mode)+'</span><span class="pill">Last: '+esc(row.lastWatchedAt?new Date(row.lastWatchedAt).toLocaleString():'recent')+'</span>'+(t?'<span class="pill">Resume '+fmt(t)+'</span>':'')+'<span class="pill">'+esc(sourceType(m))+'</span>'+gs.map(g=>'<span class="pill">'+esc(g)+'</span>').join('')+'</div><div class="actions"><a class="btn small primary" href="'+DETAILS+'?id='+id+'">Details</a>'+(u?'<a class="btn small hot" href="'+PLAYER+'?id='+id+'">Play</a>':'')+(u&&t?'<a class="btn small hot" href="'+playHref+'">Resume '+fmt(t)+'</a>':'')+'</div></div></article>'}
function fallbackCards(){return movies.filter(firstUrl).slice(0,6).map(m=>({id:String(m.id),currentTime:0,lastWatchedAt:'',fallback:true}));}
function render(){updateText();const rows=historyRows(),shown=rows.length?rows:fallbackCards();const html=shown.map(r=>card(r,rows.length?'History':'Link Test')).join('')||'<div class="note">No Watch History rows found yet.</div>';if($('stats'))$('stats').innerHTML=stat('History entries',rows.length)+stat('Shown rows',shown.length)+stat('Supabase movies',movies.length)+stat('Store','local only');if($('historyGrid'))$('historyGrid').innerHTML=html;if($('progressGrid'))$('progressGrid').innerHTML=html;setStatus(rows.length?'Watch History loaded '+rows.length+' real local row(s).':'No local watch history yet. Play a movie for 20–30 seconds, then return here. Showing Link Test cards for route testing.');}
async function load(){try{setStatus('Loading V6.74 Watch History...');if(!window.supabase)throw Error('Supabase SDK did not load');const cfg=await readConfig();sb=supabase.createClient(cfg.url,cfg.key);const r=await sb.from('sb_movies').select('*').order('created_at',{ascending:false}).limit(250);if(r.error)throw r.error;movies=(r.data||[]).filter(m=>String(m.status||'published')!=='archived');render()}catch(e){setStatus('Watch History V6.74 failed: '+(e.message||e),true)}}
setTimeout(load,500);setInterval(render,6000);window.StreamBanditWatchHistoryV674={version:VERSION,history:()=>read(HISTORY_STORE),progress:()=>read(PROGRESS_STORE),render};
})();
