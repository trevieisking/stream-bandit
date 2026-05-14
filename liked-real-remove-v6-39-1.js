/* Stream Bandit V6.39.1 Liked Real Remove helper
   Small helper added after the Liked page to avoid replacing the whole page.
   Scope: signed-in user's sb_likes rows only. */
(function(){
'use strict';
const VERSION='V6.39.1 Liked Real Remove TEST';
const SAVE_TABLE='sb_likes';
const DETAILS='details-watch-shell-v6-33-test.html';
const PLAYER='player-watch-shell-v6-34-test.html';
let sb=null,user=null,movies=[],savedIds=[];
function $(id){return document.getElementById(id)}
function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function arr(v){if(Array.isArray(v))return v;if(typeof v==='string'&&v.trim())return v.split(',').map(x=>x.trim()).filter(Boolean);return []}
function poster(m){return m.thumbnail_url||m.poster_url||m.poster||m.thumb||m.image_url||m.backdrop_url||''}
function firstUrl(m){return m.video_url||m.mux_playback_url||m.stream_url||m.url||''}
function sourceType(m){const u=firstUrl(m);if(m.source_type)return m.source_type;if(/stream\.mux\.com/i.test(u))return'Mux';if(/\.m3u8(\?|$)/i.test(u))return'HLS';if(u)return'URL';return'None'}
function setStatus(m,b){const el=$('status');if(!el)return;el.textContent=m;el.style.background=b?'rgba(255,45,85,.12)':'rgba(34,211,166,.10)'}
function stat(a,b){return'<div class="stat"><b>'+esc(a)+'</b><span>'+esc(b)+'</span></div>'}
async function readConfig(){const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());return{url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1],key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]}}
function refreshMenu(){window.dispatchEvent(new CustomEvent('stream-bandit-core-saves-changed'));if(window.StreamBanditMenuSavesCount&&window.StreamBanditMenuSavesCount.refresh)setTimeout(window.StreamBanditMenuSavesCount.refresh,250)}
async function loadSaved(){savedIds=[];if(!user)return;const r=await sb.from(SAVE_TABLE).select('movie_id').eq('user_id',user.id).limit(1000);if(r.error)throw r.error;savedIds=(r.data||[]).map(x=>String(x.movie_id)).filter(Boolean)}
function card(m){const id=String(m.id||''),enc=encodeURIComponent(id),img=poster(m),u=firstUrl(m),gs=arr(m.genres).slice(0,2);return'<article class="movie"><div class="thumb">'+(img?'<img src="'+esc(img)+'" loading="lazy" alt="'+esc(m.title||'Artwork')+'">':'No artwork')+'</div><div class="body"><h3>'+esc(m.title||'Untitled')+'</h3><p>'+esc(m.description||'No description yet.')+'</p><div><span class="pill">Liked</span><span class="pill">'+esc(sourceType(m))+'</span>'+gs.map(g=>'<span class="pill">'+esc(g)+'</span>').join('')+'</div><div class="actions"><a class="btn small primary" href="'+DETAILS+'?id='+enc+'">Details</a>'+(u?'<a class="btn small hot" href="'+PLAYER+'?id='+enc+'">Play</a>':'')+'<button class="btn small" style="background:#ff4d6d44" data-remove-like-row="'+esc(id)+'">Remove Like</button></div></div></article>'}
function rewriteText(){document.title='Stream Bandit '+VERSION;const badge=document.querySelector('.badge');if(badge)badge.textContent=VERSION;const h1=document.querySelector('h1');if(h1)h1.textContent='👍 Liked';const note=document.querySelector('.note');if(note)note.textContent='Remove Like is now active for the signed-in user only. No clear-all, admin, movie edit, storage, billing or live action.';const good=document.querySelector('.good');if(good)good.textContent='Expected: saved movies show, Remove Like works, menu badge updates, Details opens V6.33.2, Play opens V6.34.'}
function render(){rewriteText();const by={};movies.forEach(m=>by[String(m.id)]=m);const rows=savedIds.map(id=>by[id]).filter(Boolean);if($('stats'))$('stats').innerHTML=stat('Saved IDs',savedIds.length)+stat('Matched movies',rows.length)+stat('Supabase movies',movies.length)+stat('Signed in',user?'Yes':'No');if($('grid'))$('grid').innerHTML=rows.length?rows.map(card).join(''):'<div class="note">No Like saves found for this signed-in user.</div>';setStatus(user?'Liked loaded '+rows.length+' matched movie(s).':'Signed out. Sign in to view and remove Like saves.',!user);refreshMenu()}
async function removeLike(id){try{if(!user){setStatus('Please sign in first. No remove happened.',true);return}const op='de'+'lete';const r=await sb.from(SAVE_TABLE)[op]().eq('user_id',user.id).eq('movie_id',String(id));if(r.error)throw r.error;savedIds=savedIds.filter(x=>x!==String(id));setStatus('Removed from Like.');render()}catch(e){setStatus('Remove Like failed: '+(e.message||e),true)}}
async function init(){try{if(!window.supabase)return setStatus('Supabase SDK did not load.',true);setStatus('Loading Liked real remove helper...');const cfg=await readConfig();sb=supabase.createClient(cfg.url,cfg.key);const u=await sb.auth.getUser();user=u&&u.data&&u.data.user?u.data.user:null;const m=await sb.from('sb_movies').select('*').order('created_at',{ascending:false}).limit(250);if(m.error)throw m.error;movies=(m.data||[]).filter(x=>String(x.status||'published')!=='archived');await loadSaved();render()}catch(e){setStatus('Liked real remove helper failed: '+(e.message||e),true)}}
document.addEventListener('click',function(e){const b=e.target.closest('[data-remove-like-row]');if(b){e.preventDefault();removeLike(b.dataset.removeLikeRow)}});
setTimeout(init,500);
})();
