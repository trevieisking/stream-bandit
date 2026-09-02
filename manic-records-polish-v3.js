/* Manic Records Polish V3.1
   Keeps like/comment updates in place so active media is not rebuilt.
   Adds owner playlists without owning track download, edit, or delete controls.
*/
(function(){
'use strict';

const VERSION='V3.1 Playlists + In-Place Social Controls';
const TRACKS='manic_tracks';
const LIKES='manic_track_likes';
const COMMENTS='manic_track_comments';
const PLAYLISTS='manic_playlists';
const PLAYLIST_TRACKS='manic_playlist_tracks';
let sb=null;
let user=null;
let profile=null;
const busy=new Set();

function $(id){return document.getElementById(id);}
function esc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,function(character){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]||character;
  });
}
function text(value,limit){
  const output=String(value==null?'':value).trim();
  return limit?output.slice(0,limit):output;
}
function config(){
  let value=window.StreamBanditSupabaseConfig||window.StreamBanditShellConfig||null;
  try{
    value=value||(window.StreamBanditShell&&window.StreamBanditShell.config&&window.StreamBanditShell.config());
  }catch(error){}
  if(value&&value.url&&value.key)return value;
  if(window.SUPABASE_URL&&window.SUPABASE_KEY)return {url:window.SUPABASE_URL,key:window.SUPABASE_KEY};
  throw new Error('Stream Bandit Supabase configuration is unavailable.');
}
function client(){
  if(sb)return sb;
  if(!window.supabase||!window.supabase.createClient)throw new Error('Supabase SDK is unavailable.');
  const value=config();
  sb=window.supabase.createClient(value.url,value.key);
  return sb;
}
function toast(message,bad){
  const node=document.createElement('div');
  node.textContent=String(message||'');
  node.className=bad?'danger':'status';
  node.style.cssText='position:fixed;right:18px;bottom:95px;z-index:2147483647;max-width:min(430px,calc(100vw - 36px));background:#12172a;box-shadow:0 16px 50px #000b';
  document.body.appendChild(node);
  setTimeout(function(){node.remove();},3500);
}
async function viewer(required){
  const result=await client().auth.getUser();
  user=result&&result.data&&result.data.user||null;
  if(!user){
    if(required)throw new Error('Sign in first.');
    return null;
  }
  if(!profile||profile.id!==user.id){
    const read=await client().from('sb_profiles').select('id,username,display_name').eq('id',user.id).maybeSingle();
    if(read.error)throw read.error;
    profile=read.data||{id:user.id,display_name:user.email||'You'};
  }
  return user;
}
function viewerName(){
  return profile&&(profile.display_name||profile.username)||'You';
}
function cardFor(id){
  const safe=window.CSS&&CSS.escape?CSS.escape(String(id)):String(id).replace(/["\\]/g,'\\$&');
  return document.querySelector('#feed article.card[data-sb-share-id="'+safe+'"]');
}
function actionRow(card){return card&&card.querySelector('.actions');}
function setLikeButton(button,liked,count){
  button.textContent=(liked?'♥':'♡')+' Like '+Number(count||0);
}

async function likeInPlace(button,id){
  const key='like:'+id;
  if(busy.has(key))return;
  busy.add(key);
  button.disabled=true;
  try{
    await viewer(true);
    const existing=await client().from(LIKES).select('track_id,user_id').eq('track_id',id).eq('user_id',user.id).maybeSingle();
    if(existing.error)throw existing.error;
    const liked=!!existing.data;
    const write=liked
      ?await client().from(LIKES).delete().eq('track_id',id).eq('user_id',user.id)
      :await client().from(LIKES).insert({track_id:id,user_id:user.id});
    if(write.error)throw write.error;
    const counted=await client().from(LIKES).select('track_id',{count:'exact',head:true}).eq('track_id',id);
    if(counted.error)throw counted.error;
    setLikeButton(button,!liked,counted.count||0);
  }catch(error){
    toast(error&&error.message||'Like update failed.',true);
  }finally{
    button.disabled=false;
    busy.delete(key);
  }
}

async function commentInPlace(button,id){
  const key='comment:'+id;
  if(busy.has(key))return;
  const input=$('commentText-'+id);
  const body=text(input&&input.value,1200);
  if(!body){toast('Write a comment first.',true);return;}
  busy.add(key);
  button.disabled=true;
  try{
    await viewer(true);
    const inserted=await client().from(COMMENTS).insert({track_id:id,author_id:user.id,body:body}).select('id,track_id,author_id,body,created_at').single();
    if(inserted.error)throw inserted.error;
    const card=cardFor(id);
    const box=$('comment-'+id);
    const node=document.createElement('div');
    node.className='comment';
    node.innerHTML='<div class="commentMeta">'+esc(viewerName())+'</div>'+esc(body);
    if(box)box.before(node);
    if(input)input.value='';
    const selector='[data-comment-open="'+(window.CSS&&CSS.escape?CSS.escape(String(id)):String(id))+'"]';
    const opener=card&&card.querySelector(selector);
    if(opener){
      const previous=(opener.textContent.match(/(\d+)\s*$/)||[])[1];
      opener.textContent='💬 Comment '+((Number(previous)||0)+1);
    }
    if(box)box.style.display='none';
  }catch(error){
    toast(error&&error.message||'Comment failed.',true);
  }finally{
    button.disabled=false;
    busy.delete(key);
  }
}

function playlistModal(){
  let modal=$('manicPlaylistModal');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.id='manicPlaylistModal';
  modal.className='modal';
  modal.innerHTML='<div class="modalCard"><div class="modalHead"><div><span class="badge">Playlists</span><h2>My Manic Playlists</h2><p class="muted">Build music playlists without moving or duplicating the original media.</p></div><button class="btn" id="manicPlaylistClose" type="button">Close</button></div><div class="actions"><button class="btn primary" id="manicPlaylistNew" type="button">+ New Playlist</button><button class="btn" id="manicPlaylistRefresh" type="button">Refresh</button></div><div id="manicPlaylistBody" style="margin-top:12px"><div class="empty">Loading playlists…</div></div></div>';
  document.body.appendChild(modal);
  $('manicPlaylistClose').addEventListener('click',function(){modal.classList.remove('open');});
  $('manicPlaylistRefresh').addEventListener('click',loadPlaylists);
  $('manicPlaylistNew').addEventListener('click',createPlaylist);
  modal.addEventListener('click',function(event){if(event.target===modal)modal.classList.remove('open');});
  return modal;
}
async function createPlaylist(){
  try{
    await viewer(true);
    const name=text(window.prompt('Playlist name'),80);
    if(!name)return;
    const result=await client().from(PLAYLISTS).insert({owner_id:user.id,name:name,is_public:false});
    if(result.error)throw result.error;
    toast('Playlist created.');
    loadPlaylists();
  }catch(error){toast(error&&error.message||'Playlist creation failed.',true);}
}
async function loadPlaylists(){
  const body=$('manicPlaylistBody');
  if(body)body.innerHTML='<div class="empty">Loading playlists…</div>';
  try{
    await viewer(true);
    const playlists=await client().from(PLAYLISTS).select('id,name,is_public,created_at').eq('owner_id',user.id).order('created_at',{ascending:false});
    if(playlists.error)throw playlists.error;
    const rows=playlists.data||[];
    if(!rows.length){
      if(body)body.innerHTML='<div class="empty">No playlists yet. Use + New Playlist.</div>';
      return;
    }
    const ids=rows.map(function(row){return row.id;});
    const items=await client().from(PLAYLIST_TRACKS).select('playlist_id,track_id,sort_order,added_at').in('playlist_id',ids).order('sort_order',{ascending:true}).order('added_at',{ascending:true});
    if(items.error)throw items.error;
    const trackIds=[...new Set((items.data||[]).map(function(row){return row.track_id;}))];
    const names={};
    if(trackIds.length){
      const tracks=await client().from(TRACKS).select('id,title,genre,media_kind').in('id',trackIds);
      if(!tracks.error)(tracks.data||[]).forEach(function(track){names[track.id]=track;});
    }
    if(body)body.innerHTML=rows.map(function(playlist){
      const selected=(items.data||[]).filter(function(item){return item.playlist_id===playlist.id;});
      const entries=selected.length?selected.map(function(item){
        const track=names[item.track_id]||{};
        return '<div class="comment"><b>'+esc(track.title||'Track')+'</b> <small>'+esc(track.genre||'music')+'</small> <button class="btn" type="button" data-playlist-remove="'+esc(playlist.id)+'" data-track="'+esc(item.track_id)+'" style="padding:6px 9px">Remove</button></div>';
      }).join(''):'<div class="empty" style="margin-top:8px">Empty playlist.</div>';
      return '<div class="card" style="margin-bottom:10px"><div class="actions" style="justify-content:space-between"><div><b>'+esc(playlist.name)+'</b> <span class="pill">'+selected.length+' track'+(selected.length===1?'':'s')+'</span></div><button class="btn" type="button" data-playlist-delete="'+esc(playlist.id)+'">Delete Playlist</button></div>'+entries+'</div>';
    }).join('');
  }catch(error){
    if(body)body.innerHTML='<div class="danger">'+esc(error&&error.message||'Playlists could not load.')+'</div>';
  }
}
async function deletePlaylist(id){
  try{
    if(!window.confirm('Delete this playlist? Tracks themselves will not be deleted.'))return;
    await viewer(true);
    const result=await client().from(PLAYLISTS).delete().eq('id',id).eq('owner_id',user.id);
    if(result.error)throw result.error;
    loadPlaylists();
  }catch(error){toast(error&&error.message||'Playlist deletion failed.',true);}
}
async function removeFromPlaylist(playlistId,trackId){
  try{
    await viewer(true);
    const result=await client().from(PLAYLIST_TRACKS).delete().eq('playlist_id',playlistId).eq('track_id',trackId);
    if(result.error)throw result.error;
    loadPlaylists();
  }catch(error){toast(error&&error.message||'Track removal failed.',true);}
}
async function addToPlaylist(trackId){
  try{
    await viewer(true);
    const playlists=await client().from(PLAYLISTS).select('id,name').eq('owner_id',user.id).order('created_at',{ascending:true});
    if(playlists.error)throw playlists.error;
    let rows=playlists.data||[];
    if(!rows.length){
      const name=text(window.prompt('No playlists yet. Name your first playlist:'),80);
      if(!name)return;
      const created=await client().from(PLAYLISTS).insert({owner_id:user.id,name:name,is_public:false}).select('id,name').single();
      if(created.error)throw created.error;
      rows=[created.data];
    }
    let selected=null;
    if(rows.length===1){
      selected=rows[0];
    }else{
      const menu=rows.map(function(row,index){return (index+1)+'. '+row.name;}).join('\n');
      const choice=Number(window.prompt('Add to which playlist?\n\n'+menu,'1'));
      selected=rows[choice-1]||null;
    }
    if(!selected)return;
    const result=await client().from(PLAYLIST_TRACKS).upsert({playlist_id:selected.id,track_id:trackId},{onConflict:'playlist_id,track_id'});
    if(result.error)throw result.error;
    toast('Added to '+selected.name+'.');
  }catch(error){toast(error&&error.message||'Playlist update failed.',true);}
}

function decorate(){
  const cards=[...document.querySelectorAll('#feed article.card[data-sb-share-id]')];
  cards.forEach(function(card){
    if(card.dataset.manicPlaylistDecorated==='1')return;
    const id=card.getAttribute('data-sb-share-id');
    const row=actionRow(card);
    if(!id||!row)return;
    const button=document.createElement('button');
    button.type='button';
    button.className='btn';
    button.dataset.manicPlaylist=id;
    button.textContent='♫ Playlist';
    row.appendChild(button);
    card.dataset.manicPlaylistDecorated='1';
  });
}
function addTopButton(){
  if($('manicPlaylistsTop'))return;
  const mine=$('mineTab');
  if(!mine)return;
  const button=document.createElement('button');
  button.type='button';
  button.id='manicPlaylistsTop';
  button.className='btn';
  button.textContent='♫ Playlists';
  mine.insertAdjacentElement('afterend',button);
  button.addEventListener('click',async function(){
    try{
      await viewer(true);
      playlistModal().classList.add('open');
      loadPlaylists();
    }catch(error){toast(error&&error.message||'Sign in first.',true);}
  });
}
function bind(){
  document.addEventListener('click',function(event){
    const target=event.target&&event.target.closest?event.target:null;
    if(!target)return;
    const like=target.closest('[data-like]');
    if(like){event.preventDefault();event.stopImmediatePropagation();likeInPlace(like,like.dataset.like);return;}
    const send=target.closest('[data-comment-send]');
    if(send){event.preventDefault();event.stopImmediatePropagation();commentInPlace(send,send.dataset.commentSend);return;}
    const add=target.closest('[data-manic-playlist]');
    if(add){event.preventDefault();addToPlaylist(add.dataset.manicPlaylist);return;}
    const removePlaylist=target.closest('[data-playlist-delete]');
    if(removePlaylist){event.preventDefault();deletePlaylist(removePlaylist.dataset.playlistDelete);return;}
    const removeTrack=target.closest('[data-playlist-remove]');
    if(removeTrack){event.preventDefault();removeFromPlaylist(removeTrack.dataset.playlistRemove,removeTrack.dataset.track);}
  },true);
}
function boot(){
  bind();
  addTopButton();
  decorate();
  const feed=$('feed');
  if(feed)new MutationObserver(function(){decorate();}).observe(feed,{childList:true,subtree:false});
  window.addEventListener('manic-track-changed',function(){setTimeout(decorate,0);});
}

window.ManicRecordsPolish={version:VERSION,decorate:decorate,loadPlaylists:loadPlaylists};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
