(function(){
'use strict';
const VERSION='V7.12.95 My Channel Video Manager Helper';
if(!/my-channel-clean-machine-v7-12-47-test\.html$/i.test(location.pathname)&&!document.title.includes('Clean My Channel'))return;
let sb=null,cfg=null;
function $(id){return document.getElementById(id)}
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
async function readCfg(){const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());return{url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'',key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||''};}
async function client(){if(sb)return sb;cfg=cfg||await readCfg();if(!window.supabase||!cfg.url||!cfg.key)return null;sb=window.supabase.createClient(cfg.url,cfg.key);return sb;}
function installBox(){
 if($('sbMyChannelVideoManager'))return;
 const host=$('channels')||document.querySelector('.wrap')||document.body;
 const box=document.createElement('section');
 box.id='sbMyChannelVideoManager';
 box.className='box';
 box.innerHTML='<h2>Attach videos to My Channel</h2><p>Add or remove movies from your own channel without leaving this page.</p><div class="grid"><div class="card"><b>Selected channel</b><select id="sbMyChannelSelect" class="select"></select></div><div class="card"><b>Video</b><select id="sbMyMovieSelect" class="select"></select></div></div><div class="actions"><button id="sbMyAddVideo" class="btn primary" type="button">Add Video To My Channel</button><button id="sbMyRemoveVideo" class="btn warn" type="button">Remove Video From My Channel</button><button id="sbMyRefreshVideoManager" class="btn" type="button">Refresh Manager</button></div><div id="sbMyChannelManagerStatus" class="note">Loading manager...</div>';
 host.appendChild(box);
}
async function loadManager(){
 installBox();
 const st=$('sbMyChannelManagerStatus'),cs=$('sbMyChannelSelect'),ms=$('sbMyMovieSelect');
 st.textContent='Loading your channels and movies...';
 const c=await client();
 if(!c){st.textContent='Supabase client not ready yet.';return;}
 const u=await c.auth.getUser();
 const user=u&&u.data&&u.data.user;
 if(!user){st.textContent='Sign in to add videos to your channel.';return;}
 const isOwner=String(user.email||'').toLowerCase().includes('trevieisking');
 const cr=await c.from('sb_channels').select('id,name,channel_name,title,owner_id').order('created_at',{ascending:false}).limit(200);
 const mr=await c.from('sb_movies').select('id,title,channel_id,status').order('created_at',{ascending:false}).limit(500);
 if(cr.error)throw cr.error;if(mr.error)throw mr.error;
 const channels=(cr.data||[]).filter(x=>isOwner||String(x.owner_id||'')===String(user.id));
 const movies=(mr.data||[]).filter(x=>String(x.status||'published')!=='hidden'&&String(x.status||'published')!=='archived');
 cs.innerHTML=channels.length?channels.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name||x.channel_name||x.title||'Untitled Channel')+'</option>').join(''):'<option value="">No owned channels found</option>';
 ms.innerHTML=movies.length?movies.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title||'Untitled')+(x.channel_id?' — attached':'')+'</option>').join(''):'<option value="">No movies found</option>';
 st.textContent=channels.length?'Manager ready. Choose a channel and video.':'No owned channels found for this account.';
 document.documentElement.dataset.streamBanditMyChannelManager=VERSION;
}
async function patchVideo(toChannel){
 const st=$('sbMyChannelManagerStatus'),cs=$('sbMyChannelSelect'),ms=$('sbMyMovieSelect');
 const c=await client();
 if(!c)throw Error('Supabase client not ready.');
 if(!ms.value)throw Error('Choose a video first.');
 if(toChannel&&!cs.value)throw Error('Choose your channel first.');
 st.textContent=toChannel?'Adding video to your channel...':'Removing video from channel...';
 const r=await c.from('sb_movies').update({channel_id:toChannel?cs.value:null,updated_at:new Date().toISOString()}).eq('id',ms.value);
 if(r.error)throw r.error;
 st.textContent=toChannel?'Video added to My Channel and saved.':'Video removed from channel and saved.';
 await loadManager();
}
function wire(){
 installBox();
 $('sbMyRefreshVideoManager').onclick=()=>loadManager().catch(e=>$('sbMyChannelManagerStatus').textContent='Manager refresh failed: '+(e.message||e));
 $('sbMyAddVideo').onclick=()=>patchVideo(true).catch(e=>$('sbMyChannelManagerStatus').textContent='Add failed: '+(e.message||e));
 $('sbMyRemoveVideo').onclick=()=>patchVideo(false).catch(e=>$('sbMyChannelManagerStatus').textContent='Remove failed: '+(e.message||e));
 loadManager().catch(e=>$('sbMyChannelManagerStatus').textContent='Manager failed: '+(e.message||e));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
setTimeout(()=>loadManager().catch(()=>{}),1600);
})();