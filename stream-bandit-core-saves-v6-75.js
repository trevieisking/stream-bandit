/* Stream Bandit V6.75 Shared Core Saves Helper TEST
   One shared safe helper for Watchlist / Favourites / Likes.
   Writes limited to sb_watchlist, sb_favourites, sb_likes.
   Deletes scoped to signed-in user_id + movie_id.
   No movie/admin/storage/billing/role/publish/live action. */
(function(){
'use strict';
const VERSION='V6.75 Shared Core Saves Helper TEST';
const TABLES={watchlist:'sb_watchlist',favourites:'sb_favourites',likes:'sb_likes'};
const LABELS={watchlist:'Watchlist',favourites:'Favourite',likes:'Like'};
let client=null,user=null,sets={watchlist:new Set(),favourites:new Set(),likes:new Set()};
function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
async function readShellConfig(){const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());return{url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1],key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]}}
function counts(){return{watchlist:sets.watchlist.size,favourites:sets.favourites.size,likes:sets.likes.size,liked:sets.likes.size}}
function isSaved(kind,movieId){kind=String(kind||'');return !!(sets[kind]&&sets[kind].has(String(movieId)))}
function emit(reason){const detail={version:VERSION,reason:reason||'refresh',user:user?{id:user.id,email:user.email}:null,counts:counts()};window.dispatchEvent(new CustomEvent('stream-bandit-core-saves-changed',{detail}));window.dispatchEvent(new CustomEvent('stream-bandit-core-saves-v6-75-changed',{detail}));if(window.StreamBanditMenuSavesCount&&window.StreamBanditMenuSavesCount.refresh)setTimeout(window.StreamBanditMenuSavesCount.refresh,250);return detail}
async function init(){if(!window.supabase)throw Error('Supabase SDK did not load');const cfg=await readShellConfig();client=supabase.createClient(cfg.url,cfg.key);const got=await client.auth.getUser();user=got&&got.data&&got.data.user?got.data.user:null;await refresh();return state()}
async function refresh(){if(!client)await initClientOnly();for(const kind of Object.keys(TABLES)){sets[kind]=new Set();if(!user)continue;const r=await client.from(TABLES[kind]).select('movie_id').eq('user_id',user.id).limit(1000);if(r.error)throw r.error;(r.data||[]).forEach(x=>sets[kind].add(String(x.movie_id)))}emit('refresh');return state()}
async function initClientOnly(){const cfg=await readShellConfig();client=supabase.createClient(cfg.url,cfg.key);const got=await client.auth.getUser();user=got&&got.data&&got.data.user?got.data.user:null}
async function add(kind,movieId){kind=String(kind||'');movieId=String(movieId||'');if(!TABLES[kind])throw Error('Unknown save kind: '+kind);if(!movieId)throw Error('Missing movie_id');if(!client)await initClientOnly();if(!user)throw Error('Please sign in first. No '+LABELS[kind]+' write happened.');const r=await client.from(TABLES[kind]).insert({user_id:user.id,movie_id:movieId});if(r.error&&!/duplicate|unique/i.test(r.error.message||''))throw r.error;sets[kind].add(movieId);emit('add:'+kind);return state(movieId)}
async function remove(kind,movieId){kind=String(kind||'');movieId=String(movieId||'');if(!TABLES[kind])throw Error('Unknown save kind: '+kind);if(!movieId)throw Error('Missing movie_id');if(!client)await initClientOnly();if(!user)throw Error('Please sign in first. No '+LABELS[kind]+' remove happened.');const r=await client.from(TABLES[kind]).delete().eq('user_id',user.id).eq('movie_id',movieId);if(r.error)throw r.error;sets[kind].delete(movieId);emit('remove:'+kind);return state(movieId)}
async function toggle(kind,movieId){return isSaved(kind,movieId)?remove(kind,movieId):add(kind,movieId)}
function button(kind,movieId,opts){opts=opts||{};const on=isSaved(kind,movieId);const icon=kind==='watchlist'?'🔖':kind==='favourites'?'⭐':'👍';const text=(on?'Remove ':'Add ')+LABELS[kind];return '<button class="'+esc(opts.className||'btn small sb-core-save-btn')+(on?' on':'')+'" data-sb-core-save="'+esc(kind)+'" data-movie-id="'+esc(movieId)+'">'+icon+' '+esc(text)+'</button>'}
function buttons(movieId,opts){return button('watchlist',movieId,opts)+button('favourites',movieId,opts)+button('likes',movieId,opts)}
function state(movieId){return{version:VERSION,signedIn:!!user,user:user?{id:user.id,email:user.email}:null,counts:counts(),movieId:movieId?String(movieId):null,saved:movieId?{watchlist:isSaved('watchlist',movieId),favourites:isSaved('favourites',movieId),likes:isSaved('likes',movieId)}:null}}
function wireClicks(root,onDone,onError){(root||document).addEventListener('click',async function(e){const b=e.target.closest('[data-sb-core-save]');if(!b)return;e.preventDefault();try{b.disabled=true;const res=await toggle(b.dataset.sbCoreSave,b.dataset.movieId);if(typeof onDone==='function')onDone(res,b);else location.reload()}catch(err){if(typeof onError==='function')onError(err,b);else alert(err.message||err)}finally{b.disabled=false}})}
window.StreamBanditCoreSavesV675={version:VERSION,init,refresh,add,remove,toggle,isSaved,counts,state,button,buttons,wireClicks,labels:LABELS,tables:TABLES};
})();
