/* Stream Bandit V5.5.1 — Supabase Manager Full Metadata Fields
   Adds Director + Cast & Crew fields to Supabase forms and saves to existing sb_movies.director / sb_movies.cast_text.
   Add-on script only: no schema, Mux, player, or database structure changes. */
(function(){
'use strict';

var SB551_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var SB551_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var SB551_LABEL='V5.5.1 Supabase Metadata Fields';
var sb551Client=null;
var sb551LastId=sessionStorage.getItem('sb551SelectedMovieId')||'';
var sb551Saving=false;

function sb551ById(id){return document.getElementById(id)}
function sb551Esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
function sb551Val(id){var el=sb551ById(id);return el?String(el.value||'').trim():''}
function sb551Set(id,v){var el=sb551ById(id);if(el&&!el.dataset.sb551Touched)el.value=v||''}
function sb551Toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}catch(e){}}
function sb551Status(msg){
  var a=sb551ById('sb47Status')||sb551ById('sb491Status');
  if(a)a.textContent=msg;
  console.log('[Stream Bandit]',msg);
}
function sb551ClientGet(){
  if(sb551Client)return sb551Client;
  if(!window.supabase||!window.supabase.createClient)return null;
  sb551Client=window.supabase.createClient(SB551_URL,SB551_KEY);
  return sb551Client;
}
function sb551Remember(id){
  if(!id)return;
  sb551LastId=String(id);
  sessionStorage.setItem('sb551SelectedMovieId',sb551LastId);
}
async function sb551FetchMovie(id){
  var c=sb551ClientGet();if(!c||!id)return null;
  var q=await c.from('sb_movies').select('id,title,director,cast_text').eq('id',id).single();
  if(q.error){console.warn('V5.5.1 fetch movie warning',q.error);return null;}
  return q.data||null;
}
async function sb551FindMovieByTitle(title){
  var c=sb551ClientGet();if(!c||!title)return null;
  var q=await c.from('sb_movies').select('id,title,director,cast_text,updated_at,created_at').eq('title',title).limit(5);
  if(q.error||!q.data||!q.data.length)return null;
  q.data.sort(function(a,b){return String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''));});
  return q.data[0];
}
function sb551ExtraFieldsHtml(prefix){
  var dirId=prefix+'Director', castId=prefix+'Cast';
  return '<div class="sb551MetaPanel" data-sb551-panel="'+prefix+'">'+
    '<h4>Cast & Crew metadata</h4>'+ 
    '<p class="note">Add the same kind of extra movie metadata as the local admin form. Cast saves to Supabase and appears on the Supabase Details Cast & Crew tab.</p>'+ 
    '<label>Director</label><input id="'+dirId+'" data-sb551-extra="director" placeholder="Director name">'+
    '<label>Cast & Crew</label><textarea id="'+castId+'" data-sb551-extra="cast" placeholder="Example: Actor Name — Character Name&#10;Actor Two — Role Two"></textarea>'+ 
    '<p class="note" id="'+prefix+'MetaStatus">Ready. These fields save into Supabase director / cast_text.</p>'+ 
  '</div>';
}
function sb551InjectCss(){
  if(document.getElementById('sb551Style'))return;
  var st=document.createElement('style');
  st.id='sb551Style';
  st.textContent='\n.sb551MetaPanel{background:linear-gradient(180deg,rgba(16,24,39,.94),rgba(13,14,21,.90));border:1px solid rgba(106,166,255,.28);border-radius:22px;padding:13px;margin:12px 0;box-shadow:0 14px 36px rgba(0,0,0,.32)}.sb551MetaPanel h4{margin:0 0 6px}.sb551MetaPanel textarea{min-height:130px}.sb551MiniOk{color:#baf7df}.sb551MiniBad{color:#ffcbd4}\n';
  document.head.appendChild(st);
}
async function sb551Populate(prefix,id){
  if(!id)return;
  var m=await sb551FetchMovie(id);
  if(!m)return;
  sb551Set(prefix+'Director',m.director||'');
  sb551Set(prefix+'Cast',m.cast_text||'');
  var s=sb551ById(prefix+'MetaStatus');
  if(s)s.innerHTML='<span class="sb551MiniOk">Loaded existing Cast & Crew metadata.</span>';
}
function sb551InjectManager(){
  var trailer=sb551ById('sb47Trailer');
  if(!trailer||document.querySelector('[data-sb551-panel="sb47"]'))return;
  var host=trailer.closest('div')||trailer.parentNode;
  host.insertAdjacentHTML('afterend',sb551ExtraFieldsHtml('sb47'));
  ['sb47Director','sb47Cast'].forEach(function(id){var el=sb551ById(id);if(el)el.addEventListener('input',function(){el.dataset.sb551Touched='1';});});
  sb551Populate('sb47',sb551LastId);
}
function sb551InjectQuickAdd(){
  var runtime=sb551ById('sb491Runtime');
  if(!runtime||document.querySelector('[data-sb551-panel="sb491"]'))return;
  var host=runtime.closest('div')||runtime.parentNode;
  host.insertAdjacentHTML('afterend',sb551ExtraFieldsHtml('sb491'));
  ['sb491Director','sb491Cast'].forEach(function(id){var el=sb551ById(id);if(el)el.addEventListener('input',function(){el.dataset.sb551Touched='1';});});
}
function sb551Inject(){
  sb551InjectCss();
  sb551InjectManager();
  sb551InjectQuickAdd();
}
async function sb551SaveExtras(prefix,knownId){
  if(sb551Saving)return;
  var director=sb551Val(prefix+'Director');
  var cast=sb551Val(prefix+'Cast');
  if(!director&&!cast)return;
  sb551Saving=true;
  try{
    var c=sb551ClientGet();if(!c)throw new Error('Supabase SDK not loaded.');
    var id=knownId||sb551LastId;
    if(!id){
      var title=prefix==='sb491'?sb551Val('sb491Title'):sb551Val('sb47Title');
      var found=await sb551FindMovieByTitle(title);
      if(found)id=found.id;
    }
    if(!id)throw new Error('Could not find the saved Supabase movie row yet. Press Save again after the row appears.');
    var row={director:director,cast_text:cast};
    var res=await c.from('sb_movies').update(row).eq('id',id).select('id,title').single();
    if(res.error)throw res.error;
    sb551Remember(id);
    var msg=SB551_LABEL+': Cast & Crew metadata saved for '+((res.data&&res.data.title)||'movie')+'.';
    var status=sb551ById(prefix+'MetaStatus');if(status)status.innerHTML='<span class="sb551MiniOk">'+sb551Esc(msg)+'</span>';
    sb551Status(msg);
    sb551Toast('Cast & Crew metadata saved');
  }catch(e){
    var msg='Cast & Crew metadata save failed: '+((e&&e.message)||e);
    var status=sb551ById(prefix+'MetaStatus');if(status)status.innerHTML='<span class="sb551MiniBad">'+sb551Esc(msg)+'</span>';
    sb551Status(msg);
  }finally{sb551Saving=false;}
}

/* Track which Supabase row the built-in manager selected. */
document.addEventListener('click',function(ev){
  var edit=ev.target&&ev.target.closest?ev.target.closest('.sb47Edit'):null;
  if(edit&&edit.dataset&&edit.dataset.id){
    sb551Remember(edit.dataset.id);
    setTimeout(function(){sb551Inject();sb551Populate('sb47',edit.dataset.id);},250);
  }
},true);

/* Post-save metadata patch: let the built-in save run first, then update director/cast_text. */
document.addEventListener('click',function(ev){
  var save=ev.target&&ev.target.closest?ev.target.closest('#sb47SaveMovie,#sb491Save'):null;
  if(!save)return;
  var prefix=save.id==='sb491Save'?'sb491':'sb47';
  setTimeout(function(){sb551SaveExtras(prefix,prefix==='sb47'?sb551LastId:'');},1400);
},false);

var mo=new MutationObserver(function(){sb551Inject();});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
setInterval(sb551Inject,1200);
document.addEventListener('DOMContentLoaded',sb551Inject);
setTimeout(function(){sb551Inject();sb551Toast(SB551_LABEL+' loaded');},800);
})();
