/* Manic Records Track Controls V1
   Creator-controlled free audio download plus owner-only metadata edit and deletion.
   Mounts on Manic Records cards and Manic DJ library rows without replacing either page's renderer.
*/
(function(){
'use strict';

const VERSION='V1.0.1 Manic Track Download Edit Delete';
const TABLE='manic_tracks';
const PUBLIC_AUDIO_BUCKET='manic-records-public-audio';
const CARD_SELECTOR='[data-sb-social-share][data-sb-share-type="manic_track"][data-sb-share-id],[data-sb-manic-track-card][data-track-id]';
const GENRES=['grime','hip hop','rap','instrumental','drill','trap','boom bap','uk garage','r&b','house','techno','dnb','jungle','dubstep','afrobeat','reggaeton','lo-fi','synthwave','other'];
const KEY_OPTIONS=['','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','Cm','C#m','Dm','D#m','Em','Fm','F#m','Gm','G#m','Am','A#m','Bm'];
let sb=null;
let currentUser=null;
let authKnown=false;
let authBound=false;
let editorTrackId=null;
let mountTimer=null;
let observer=null;
let publishReplay=false;
let publishWatchToken=0;
let pendingDownloadPublish=null;
let composerStatusObserver=null;
let publishTimeout=null;
const trackCache=new Map();

function $(id){return document.getElementById(id);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m;});}
function text(v,n){v=String(v==null?'':v).trim();return n?v.slice(0,n):v;}
function config(){
  const c=window.StreamBanditSupabaseConfig||window.StreamBanditShellConfig||null;
  if(c&&c.url&&c.key)return c;
  if(window.SUPABASE_URL&&window.SUPABASE_KEY)return {url:window.SUPABASE_URL,key:window.SUPABASE_KEY};
  throw new Error('Stream Bandit Supabase configuration is unavailable.');
}
function client(){
  if(sb)return sb;
  if(!window.supabase||!window.supabase.createClient)throw new Error('Supabase SDK is unavailable.');
  const c=config();
  sb=window.supabase.createClient(c.url,c.key);
  bindAuth();
  return sb;
}
function bindAuth(){
  if(authBound||!sb)return;
  authBound=true;
  try{
    sb.auth.onAuthStateChange(function(_event,session){
      currentUser=session&&session.user||null;
      authKnown=true;
      document.querySelectorAll(CARD_SELECTOR).forEach(function(card){delete card.dataset.manicControlsMounted;});
      scheduleMount();
    });
  }catch(e){}
}
async function auth(force){
  if(authKnown&&!force)return currentUser;
  const result=await client().auth.getUser();
  currentUser=result&&result.data&&result.data.user||null;
  authKnown=true;
  return currentUser;
}
function isRecords(){return !!(document.body&&document.body.dataset.sbManicRecordsPage);}
function isDj(){return !!(document.body&&document.body.dataset.sbManicDjPage);}
function toast(message,bad){
  const node=document.createElement('div');
  node.className='manicTrackToast'+(bad?' bad':'');
  node.textContent=String(message||'');
  document.body.appendChild(node);
  setTimeout(function(){node.remove();},3600);
}
function css(){
  if($('manicTrackControlsStyle'))return;
  const style=document.createElement('style');
  style.id='manicTrackControlsStyle';
  style.textContent='.manicTrackControls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:9px 0}.manicTrackBtn{border:0;border-radius:999px;padding:9px 12px;background:#475071;color:#fff;font:950 13px Inter,system-ui,Arial,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}.manicTrackBtn.download{background:linear-gradient(135deg,#22d3a6,#41e8ff);color:#061017}.manicTrackBtn.edit{background:linear-gradient(135deg,#7c3cff,#41e8ff);color:#fff}.manicTrackBtn.delete{background:linear-gradient(135deg,#ff4d6d,#7c3cff);color:#fff}.manicTrackBtn:disabled{opacity:.55;cursor:wait}.manicTrackCount{display:inline-flex;align-items:center;border:1px solid #ffffff28;border-radius:999px;background:#ffffff0d;color:#d8dcef;padding:7px 9px;font:850 12px Inter,system-ui,Arial,sans-serif}.manicTrackModal{position:fixed;inset:0;z-index:2147483000;background:#000c;display:none;align-items:flex-start;justify-content:center;padding:24px;overflow:auto}.manicTrackModal.open{display:flex}.manicTrackModalCard{width:min(820px,100%);border:1px solid #ffffff2d;border-radius:24px;background:linear-gradient(135deg,#101529,#250812);box-shadow:0 30px 100px #000;padding:17px;color:#fff}.manicTrackModalHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-bottom:1px solid #ffffff1f;padding-bottom:12px;margin-bottom:12px}.manicTrackModalHead h2{margin:4px 0}.manicTrackEditGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.manicTrackField{display:block;color:#c4c9dc;font:850 13px Inter,system-ui,Arial,sans-serif}.manicTrackField.wide{grid-column:1/-1}.manicTrackField input,.manicTrackField textarea,.manicTrackField select{width:100%;margin-top:6px;border:1px solid #ffffff28;border-radius:15px;background:#0007;color:#fff;padding:11px 12px;font:inherit}.manicTrackField textarea{min-height:130px;resize:vertical}.manicTrackEditActions{grid-column:1/-1;display:flex;gap:9px;flex-wrap:wrap}.manicTrackEditNote{grid-column:1/-1;border:1px solid #41e8ff55;border-radius:15px;background:#41e8ff16;color:#d7fbff;padding:10px 12px;font-weight:800}.manicTrackToast{position:fixed;right:18px;bottom:95px;z-index:2147483647;max-width:min(430px,calc(100vw - 36px));border:1px solid #22d3a666;border-radius:16px;background:#12172a;color:#dfffee;box-shadow:0 16px 50px #000b;padding:13px 16px;font:900 14px Inter,system-ui,Arial,sans-serif}.manicTrackToast.bad{border-color:#ff4d6d88;color:#ffd8de}@media(max-width:720px){.manicTrackEditGrid{grid-template-columns:1fr}.manicTrackField.wide,.manicTrackEditActions,.manicTrackEditNote{grid-column:auto}.manicTrackBtn{flex:1 1 auto}}';
  document.head.appendChild(style);
}
function ensureDjNavigation(){
  document.querySelectorAll('.tabs').forEach(function(tabs){
    if(tabs.querySelector('a[href="manic-dj.html"]'))return;
    const studio=tabs.querySelector('a[href="manic-studio.html"]');
    if(!studio)return;
    const link=document.createElement('a');
    link.href='manic-dj.html';
    link.className=studio.className.replace(/\bactive\b/g,'').trim()||'pagePill';
    link.textContent='Manic DJ';
    studio.insertAdjacentElement('afterend',link);
  });
}
function cardId(card){return card.getAttribute('data-track-id')||card.getAttribute('data-sb-share-id')||'';}
function controlHost(card){
  let host=card.querySelector('.manic-track-actions');
  if(host){host.classList.add('manicTrackControls');return host;}
  host=card.querySelector(':scope > .manicTrackControls');
  if(host)return host;
  host=document.createElement('div');
  host.className='manicTrackControls';
  const share=card.querySelector(':scope > .sbSocialShareBar');
  if(share)card.insertBefore(host,share);else card.appendChild(host);
  return host;
}
function button(label,action,id,kind){
  return '<button type="button" class="manicTrackBtn '+esc(kind||'')+'" data-manic-track-action="'+esc(action)+'" data-track-id="'+esc(id)+'">'+esc(label)+'</button>';
}
function renderControls(card,track,user){
  const host=controlHost(card);
  const owner=!!(user&&track.created_by&&user.id===track.created_by);
  const publicDownload=track.media_kind==='audio'&&track.visibility==='public'&&track.status==='published'&&track.allow_download===true;
  const canDownload=track.media_kind==='audio'&&(owner||publicDownload);
  const bits=[];
  if(canDownload){
    bits.push(button(owner&&!track.allow_download?'⬇ Download Your File':'⬇ Free Download','download',track.id,'download'));
    if(track.allow_download===true)bits.push('<span class="manicTrackCount" data-download-count-for="'+esc(track.id)+'">'+Number(track.download_count||0).toLocaleString()+' downloads</span>');
  }
  if(owner){
    bits.push(button('✎ Edit','edit',track.id,'edit'));
    bits.push(button('Delete','delete',track.id,'delete'));
  }
  host.innerHTML=bits.join('');
  host.hidden=!bits.length;
  card.dataset.manicControlsMounted=VERSION+':'+(user&&user.id||'guest')+':'+String(track.updated_at||'')+':'+String(track.download_count||0)+':'+String(track.allow_download===true);
}
async function rows(ids){
  const wanted=[...new Set(ids.filter(Boolean))];
  if(!wanted.length)return [];
  const result=await client().from(TABLE).select('*').in('id',wanted);
  if(result.error)throw result.error;
  (result.data||[]).forEach(function(row){trackCache.set(row.id,row);});
  return result.data||[];
}
async function one(id){
  const result=await client().from(TABLE).select('*').eq('id',id).maybeSingle();
  if(result.error)throw result.error;
  if(!result.data)throw new Error('This track is no longer available.');
  trackCache.set(result.data.id,result.data);
  return result.data;
}
async function mount(){
  css();
  ensureDjNavigation();
  if(isRecords())ensureComposerDownload();
  const user=await auth(false).catch(function(){return null;});
  const cards=[...document.querySelectorAll(CARD_SELECTOR)];
  const pending=cards.filter(function(card){
    const id=cardId(card);
    const row=trackCache.get(id);
    const stamp=row?VERSION+':'+(user&&user.id||'guest')+':'+String(row.updated_at||'')+':'+String(row.download_count||0)+':'+String(row.allow_download===true):'';
    return !id||card.dataset.manicControlsMounted!==stamp;
  });
  if(!pending.length)return;
  let fetched=[];
  try{fetched=await rows(pending.map(cardId));}catch(error){return;}
  const byId=new Map(fetched.map(function(row){return [row.id,row];}));
  pending.forEach(function(card){
    const track=byId.get(cardId(card))||trackCache.get(cardId(card));
    if(track)renderControls(card,track,user);
  });
}
function scheduleMount(){
  clearTimeout(mountTimer);
  mountTimer=setTimeout(function(){mount().catch(function(){});},70);
}
function setBusy(btn,busy,label){
  if(!btn)return;
  if(busy){btn.dataset.oldLabel=btn.textContent;btn.disabled=true;btn.textContent=label||'Working…';}
  else{btn.disabled=false;btn.textContent=btn.dataset.oldLabel||btn.textContent;delete btn.dataset.oldLabel;}
}
function safeFilename(track){
  const source=String(track.audio_storage_path||track.audio_url||'');
  const match=source.split('?')[0].match(/\.([a-z0-9]{2,5})$/i);
  const extension=match?match[1].toLowerCase():'mp3';
  const stem=(String(track.artist||'Manic Records')+' - '+String(track.title||'track')).replace(/[\\/:*?"<>|\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,150)||'manic-records-track';
  return stem+'.'+extension;
}
function clickDownloadUrl(url,filename){
  const link=document.createElement('a');
  link.href=url;
  link.download=filename;
  link.rel='noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
function saveBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  clickDownloadUrl(url,filename);
  setTimeout(function(){URL.revokeObjectURL(url);},10000);
}
async function startAudioDownload(track){
  const filename=safeFilename(track);
  if(track.audio_bucket&&track.audio_storage_path){
    const storage=client().storage.from(track.audio_bucket);
    if(track.audio_bucket===PUBLIC_AUDIO_BUCKET){
      const publicResult=storage.getPublicUrl(track.audio_storage_path,{download:true});
      const publicUrl=publicResult&&publicResult.data&&publicResult.data.publicUrl;
      if(!publicUrl)throw new Error('The public audio download URL could not be created.');
      clickDownloadUrl(publicUrl,filename);
      return;
    }
    const signed=await storage.createSignedUrl(track.audio_storage_path,120,{download:true});
    if(signed.error)throw signed.error;
    const signedUrl=signed&&signed.data&&signed.data.signedUrl;
    if(!signedUrl)throw new Error('The private audio download URL could not be created.');
    clickDownloadUrl(signedUrl,filename);
    return;
  }
  if(track.audio_url){
    const response=await fetch(track.audio_url,{credentials:'omit'});
    if(!response.ok)throw new Error('Audio download returned '+response.status+'.');
    saveBlob(await response.blob(),filename);
    return;
  }
  throw new Error('This track has no downloadable audio source.');
}
function refreshTrack(id,row){
  if(row)trackCache.set(id,row);else trackCache.delete(id);
  document.querySelectorAll(CARD_SELECTOR).forEach(function(card){if(cardId(card)===id)delete card.dataset.manicControlsMounted;});
  scheduleMount();
}
function notify(type,id,row){
  refreshTrack(id,row||null);
  window.dispatchEvent(new CustomEvent('manic-track-changed',{detail:{type:type,id:id,track:row||null,version:VERSION}}));
  if(isRecords()){
    const reload=$('reload');
    if(reload)setTimeout(function(){reload.click();},40);
  }
}
async function downloadTrack(id,btn){
  setBusy(btn,true,'Preparing…');
  try{
    const user=await auth(true).catch(function(){return null;});
    const track=await one(id);
    const owner=!!(user&&track.created_by&&user.id===track.created_by);
    const allowed=track.media_kind==='audio'&&(owner||(track.visibility==='public'&&track.status==='published'&&track.allow_download===true));
    if(!allowed)throw new Error('The creator has not enabled a public download for this track.');
    await startAudioDownload(track);
    if(!owner&&track.allow_download===true){
      const counted=await client().rpc('manic_increment_track_download',{p_track_id:track.id});
      if(!counted.error){
        track.download_count=Number(counted.data||track.download_count||0);
        refreshTrack(track.id,track);
      }
    }
    toast('Download started.');
  }catch(error){
    toast(error&&error.message||'Download failed.',true);
  }finally{setBusy(btn,false);}
}
function ensureEditor(){
  if($('manicTrackEditModal'))return;
  const modal=document.createElement('div');
  modal.id='manicTrackEditModal';
  modal.className='manicTrackModal';
  modal.innerHTML='<div class="manicTrackModalCard" role="dialog" aria-modal="true" aria-labelledby="manicTrackEditTitle"><div class="manicTrackModalHead"><div><span class="manicTrackCount">Owner controls</span><h2 id="manicTrackEditTitle">Edit track</h2><p>Update the description and music details without changing the stored media or visibility.</p></div><button type="button" class="manicTrackBtn" data-manic-editor-close>Close</button></div><form id="manicTrackEditForm" class="manicTrackEditGrid"><label class="manicTrackField">Title<input id="manicEditTitle" maxlength="140" required></label><label class="manicTrackField">Artist<input id="manicEditArtist" maxlength="140" required></label><label class="manicTrackField wide">Description<textarea id="manicEditDescription" maxlength="3000"></textarea></label><label class="manicTrackField">Genre<select id="manicEditGenre"></select></label><label class="manicTrackField">Content rating<select id="manicEditRating"><option value="child_friendly">Child friendly</option><option value="explicit">Explicit / not child friendly</option></select></label><label class="manicTrackField">BPM<input id="manicEditBpm" type="number" min="40" max="240" step="1"></label><label class="manicTrackField">Musical key<select id="manicEditKey"></select></label><label class="manicTrackField wide">Free audio download<select id="manicEditDownload"><option value="false">No — streaming only</option><option value="true">Yes — allow free download</option></select></label><div class="manicTrackEditNote">Visibility, source type, file paths and media type stay locked so editing cannot break public/private storage rules.</div><div class="manicTrackEditActions"><button type="submit" class="manicTrackBtn edit">Save Changes</button><button type="button" class="manicTrackBtn" data-manic-editor-close>Cancel</button></div></form></div>';
  document.body.appendChild(modal);
  $('manicEditGenre').innerHTML=GENRES.map(function(value){return '<option value="'+esc(value)+'">'+esc(value.replace(/\b\w/g,function(c){return c.toUpperCase();}))+'</option>';}).join('');
  $('manicEditKey').innerHTML=KEY_OPTIONS.map(function(value){return '<option value="'+esc(value)+'">'+esc(value||'Not set')+'</option>';}).join('');
  modal.addEventListener('click',function(event){
    if(event.target===modal||event.target.closest('[data-manic-editor-close]'))closeEditor();
  });
  $('manicTrackEditForm').addEventListener('submit',saveEditor);
}
function optionValue(select,value){
  const wanted=String(value||'');
  if(wanted&&![...select.options].some(function(option){return option.value===wanted;})){
    const option=document.createElement('option');option.value=wanted;option.textContent=wanted;select.appendChild(option);
  }
  select.value=wanted;
}
async function openEditor(id){
  try{
    const user=await auth(true);
    if(!user)throw new Error('Sign in to edit your track.');
    const track=await one(id);
    if(track.created_by!==user.id)throw new Error('Only the track creator can edit this item.');
    ensureEditor();
    editorTrackId=track.id;
    $('manicEditTitle').value=track.title||'';
    $('manicEditArtist').value=track.artist||'';
    $('manicEditDescription').value=track.description||'';
    optionValue($('manicEditGenre'),track.genre||'other');
    $('manicEditRating').value=track.content_rating==='explicit'?'explicit':'child_friendly';
    $('manicEditBpm').value=track.bpm==null?'':track.bpm;
    optionValue($('manicEditKey'),track.musical_key||'');
    const download=$('manicEditDownload');
    download.disabled=track.media_kind!=='audio'||track.visibility!=='public';
    download.value=track.media_kind==='audio'&&track.visibility==='public'&&track.allow_download===true?'true':'false';
    $('manicTrackEditModal').classList.add('open');
    $('manicEditTitle').focus();
  }catch(error){toast(error&&error.message||'Unable to open editor.',true);}
}
function closeEditor(){
  const modal=$('manicTrackEditModal');
  if(modal)modal.classList.remove('open');
  editorTrackId=null;
}
async function saveEditor(event){
  event.preventDefault();
  const submit=event.submitter||event.target.querySelector('[type="submit"]');
  setBusy(submit,true,'Saving…');
  try{
    const user=await auth(true);
    if(!user||!editorTrackId)throw new Error('Your edit session is no longer available.');
    const current=await one(editorTrackId);
    if(current.created_by!==user.id)throw new Error('Only the track creator can edit this item.');
    const bpmRaw=$('manicEditBpm').value.trim();
    const bpm=bpmRaw===''?null:Number(bpmRaw);
    if(bpm!==null&&(!Number.isInteger(bpm)||bpm<40||bpm>240))throw new Error('BPM must be a whole number from 40 to 240.');
    const payload={
      title:text($('manicEditTitle').value,140),
      artist:text($('manicEditArtist').value,140)||'Manic Records',
      description:text($('manicEditDescription').value,3000)||null,
      genre:text($('manicEditGenre').value,80)||'other',
      content_rating:$('manicEditRating').value==='explicit'?'explicit':'child_friendly',
      bpm:bpm,
      musical_key:text($('manicEditKey').value,24)||null,
      allow_download:current.media_kind==='audio'&&current.visibility==='public'&&$('manicEditDownload').value==='true',
      updated_at:new Date().toISOString()
    };
    if(!payload.title)throw new Error('Track title is required.');
    const result=await client().from(TABLE).update(payload).eq('id',current.id).eq('created_by',user.id).select('*').single();
    if(result.error)throw result.error;
    closeEditor();
    toast('Track updated.');
    notify('updated',result.data.id,result.data);
  }catch(error){toast(error&&error.message||'Track update failed.',true);}
  finally{setBusy(submit,false);}
}
async function deleteTrack(id,btn){
  try{
    const user=await auth(true);
    if(!user)throw new Error('Sign in to delete your track.');
    const track=await one(id);
    if(track.created_by!==user.id)throw new Error('Only the track creator can delete this item.');
    const detail=track.media_kind==='audio'?'The track, comments, likes, uploaded audio and uploaded cover will be removed.':'The track, comments and likes will be removed. The underlying Mux video asset is not deleted by this browser action.';
    if(!window.confirm('Delete “'+track.title+'”?\n\n'+detail+'\n\nThis cannot be undone.'))return;
    setBusy(btn,true,'Deleting…');
    const removed=await client().from(TABLE).delete().eq('id',track.id).eq('created_by',user.id).select('id');
    if(removed.error)throw removed.error;
    if(!removed.data||!removed.data.length)throw new Error('The track was not deleted.');
    const cleanup=[];
    if(track.audio_bucket&&track.audio_storage_path)cleanup.push(client().storage.from(track.audio_bucket).remove([track.audio_storage_path]));
    if(track.cover_bucket&&track.cover_storage_path)cleanup.push(client().storage.from(track.cover_bucket).remove([track.cover_storage_path]));
    if(cleanup.length)await Promise.allSettled(cleanup);
    toast('Track deleted.');
    notify('deleted',track.id,null);
  }catch(error){toast(error&&error.message||'Track deletion failed.',true);}
  finally{setBusy(btn,false);}
}
async function ownRecentIds(userId){
  const result=await client().from(TABLE).select('id').eq('created_by',userId).order('created_at',{ascending:false}).limit(40);
  if(result.error)throw result.error;
  return new Set((result.data||[]).map(function(row){return row.id;}));
}
function clearPendingDownload(token){
  if(token&&pendingDownloadPublish&&pendingDownloadPublish.token!==token)return;
  pendingDownloadPublish=null;
  if(publishTimeout){clearTimeout(publishTimeout);publishTimeout=null;}
}
async function finalizeNewDownloadTrack(pending,attempt){
  if(!pendingDownloadPublish||pendingDownloadPublish.token!==pending.token)return;
  const result=await client().from(TABLE).select('*').eq('created_by',pending.userId).eq('media_kind','audio').gte('created_at',pending.started).order('created_at',{ascending:false}).limit(12);
  if(result.error){
    if(attempt<3){setTimeout(function(){finalizeNewDownloadTrack(pending,attempt+1);},500);return;}
    clearPendingDownload(pending.token);
    toast('Track uploaded, but its free-download setting could not be checked.',true);
    return;
  }
  const found=(result.data||[]).find(function(row){return !pending.before.has(row.id)&&(!pending.title||row.title===pending.title);})||(result.data||[]).find(function(row){return !pending.before.has(row.id);});
  if(!found){
    if(attempt<3){setTimeout(function(){finalizeNewDownloadTrack(pending,attempt+1);},500);return;}
    clearPendingDownload(pending.token);
    toast('Track uploaded, but the new track could not be matched, so free download stayed off.',true);
    return;
  }
  const updated=await client().from(TABLE).update({allow_download:true,updated_at:new Date().toISOString()}).eq('id',found.id).eq('created_by',pending.userId).select('*').single();
  clearPendingDownload(pending.token);
  if(updated.error)toast('Track uploaded, but the free-download setting could not be saved.',true);
  else{toast('Track published with free download enabled.');notify('updated',updated.data.id,updated.data);}
}
function watchComposerStatus(){
  const status=$('composerStatus');
  if(!status||composerStatusObserver)return;
  const inspectComposerStatus=function(){
    const pending=pendingDownloadPublish;
    if(!pending||pending.finalizing)return;
    const message=text(status.textContent,500);
    if(status.classList.contains('good')&&/Published to Manic Records/i.test(message)){
      pending.finalizing=true;
      finalizeNewDownloadTrack(pending,0);
    }else if(status.classList.contains('danger')){
      clearPendingDownload(pending.token);
    }
  };
  composerStatusObserver=new MutationObserver(inspectComposerStatus);
  composerStatusObserver.observe(status,{attributes:true,childList:true,characterData:true,subtree:true});
}
function syncComposerDownload(){
  const media=$('mediaKind');
  const select=$('allowDownload');
  if(!media||!select)return;
  const visibility=$('visibility');
  const eligible=media.value==='audio'&&(!visibility||visibility.value==='public');
  select.disabled=!eligible;
  if(!eligible)select.value='false';
}
function ensureComposerDownload(){
  const form=document.querySelector('#composerModal .formGrid');
  const publish=$('publish');
  if(!form||!publish)return;
  watchComposerStatus();
  if(!$('allowDownload')){
    const label=document.createElement('label');
    label.id='allowDownloadField';
    label.className='field wide';
    label.innerHTML='Free download<select id="allowDownload"><option value="false">No — streaming only</option><option value="true">Yes — let listeners download this audio free</option></select>';
    const progress=form.querySelector('.progress');
    if(progress)form.insertBefore(label,progress);else form.appendChild(label);
    const media=$('mediaKind');
    if(media)media.addEventListener('change',syncComposerDownload);
    const visibility=$('visibility');
    if(visibility)visibility.addEventListener('change',syncComposerDownload);
    const open=$('openComposer');
    if(open)open.addEventListener('click',function(){clearPendingDownload();setTimeout(function(){const select=$('allowDownload');if(select)select.value='false';syncComposerDownload();},0);});
    syncComposerDownload();
  }
  if(publish.dataset.manicDownloadHook==='true')return;
  publish.dataset.manicDownloadHook='true';
  publish.addEventListener('click',async function(event){
    if(publishReplay){publishReplay=false;return;}
    const select=$('allowDownload');
    const wants=!!(select&&select.value==='true'&&$('mediaKind')&&$('mediaKind').value==='audio'&&$('visibility')&&$('visibility').value==='public');
    const title=text($('title')&&$('title').value,140);
    const file=$('audioFile')&&$('audioFile').files&&$('audioFile').files[0];
    if(!wants||!title||!file)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try{
      const user=await auth(true);
      if(!user)throw new Error('Sign in before publishing music.');
      const before=await ownRecentIds(user.id);
      const started=new Date(Date.now()-2000).toISOString();
      const token=++publishWatchToken;
      pendingDownloadPublish={userId:user.id,before:before,started:started,title:title,token:token,finalizing:false};
      if(publishTimeout)clearTimeout(publishTimeout);
      publishTimeout=setTimeout(function(){
        if(pendingDownloadPublish&&pendingDownloadPublish.token===token){
          clearPendingDownload(token);
          toast('Upload did not finish within 30 minutes, so free download stayed off.',true);
        }
      },1800000);
      publishReplay=true;
      publish.click();
    }catch(error){
      publishReplay=false;
      clearPendingDownload();
      toast(error&&error.message||'Unable to prepare the download setting.',true);
    }
  },true);
}
function bindClicks(){
  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest&&event.target.closest('[data-manic-track-action]');
    if(!btn)return;
    event.preventDefault();
    const id=btn.getAttribute('data-track-id');
    const action=btn.getAttribute('data-manic-track-action');
    if(action==='download')downloadTrack(id,btn);
    if(action==='edit')openEditor(id);
    if(action==='delete')deleteTrack(id,btn);
  });
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closeEditor();});
}
function boot(){
  css();
  ensureEditor();
  ensureDjNavigation();
  bindClicks();
  if(isRecords())ensureComposerDownload();
  const target=$('feed')||$('djLibrary')||document.body;
  observer=new MutationObserver(scheduleMount);
  observer.observe(target,{childList:true,subtree:true});
  mount().catch(function(error){toast(error&&error.message||'Track controls could not start.',true);});
}

window.ManicTrackControls={version:VERSION,mount:mount,refresh:scheduleMount,downloadTrack:downloadTrack,openEditor:openEditor,deleteTrack:deleteTrack};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
