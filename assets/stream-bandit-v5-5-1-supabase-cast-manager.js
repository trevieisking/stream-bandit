/* Stream Bandit V5.5.1B — Supabase Cast & Crew Manager
   Manager-only add-on. Adds a direct Save Cast & Crew button so saving does not depend on the main movie update flow.
   No Details-page watcher, no menu changes, no Mux/player/database schema changes. */
(function(){
'use strict';

var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var LABEL='V5.5.1B Supabase Cast & Crew Manager';
var supa=null;
var lastTitle='';
var lastLoadedTitle='';
var loading=false;
var saving=false;

function $(id){return document.getElementById(id)}
function val(id){var el=$(id);return el?String(el.value||'').trim():''}
function setVal(id,v){var el=$(id);if(el)el.value=v||''}
function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
function client(){if(supa)return supa;if(!window.supabase||!window.supabase.createClient)return null;supa=window.supabase.createClient(URL,KEY);return supa}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}catch(e){}}
function status(msg){var s=$('sb47Status');if(s)s.textContent=msg;console.log('[Stream Bandit]',msg)}
function isManager(){return !!$('sb47Title')&&!!$('sb47SaveMovie')&&/Supabase Movie Manager/i.test(document.body.textContent||'')}
function currentTitle(){return val('sb47Title')}
function setPanelStatus(msg,ok){var st=$('sb551CastStatus');if(st){st.className='sb551CastMini '+(ok?'sb551CastOk':'sb551CastWarn');st.textContent=msg;}}
function injectCss(){
  if($('sb551CastStyle'))return;
  var st=document.createElement('style');
  st.id='sb551CastStyle';
  st.textContent='\n.sb551CastPanel{background:linear-gradient(180deg,rgba(16,24,39,.94),rgba(13,14,21,.90));border:1px solid rgba(106,166,255,.28);border-radius:22px;padding:14px;margin:13px 0;box-shadow:0 14px 36px rgba(0,0,0,.32)}.sb551CastPanel h4{margin:0 0 6px;font-size:16px}.sb551CastHelp{color:var(--muted,#a9afc3);font-size:12px;line-height:1.45}.sb551CastTabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.sb551CastTab{border-radius:999px;padding:7px 10px;background:#25283a;border:1px solid rgba(255,255,255,.10);font-weight:800;font-size:12px}.sb551CastTab.active{background:linear-gradient(135deg,var(--a,#ff2d55),var(--b,#7c3cff))}.sb551CastPanel textarea{min-height:155px}.sb551CastActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.sb551CastMini{font-size:12px;margin-top:8px;line-height:1.45}.sb551CastOk{color:#baf7df}.sb551CastWarn{color:#ffe0a3}\n';
  document.head.appendChild(st);
}
function panelHtml(){return '<div class="sb551CastPanel" id="sb551CastPanel">'+
  '<h4>Cast & Crew metadata</h4>'+ 
  '<p class="sb551CastHelp">This edits the existing Supabase <b>director</b> and <b>cast_text</b> columns. Supabase Details already displays this data when it exists.</p>'+ 
  '<div class="sb551CastTabs"><span class="sb551CastTab active">Metadata</span><span class="sb551CastTab">Cast & Crew</span><span class="sb551CastTab">Supabase save</span></div>'+ 
  '<label>Director</label><input id="sb551CastDirector" placeholder="Director name">'+
  '<label>Cast & Crew</label><textarea id="sb551CastText" placeholder="Example: Actor Name as Character Name&#10;Actor Two as Role Two"></textarea>'+ 
  '<div class="sb551CastActions"><button type="button" id="sb551CastSave">Save Cast & Crew</button><button type="button" class="secondary" id="sb551CastReload">Reload Cast</button></div>'+ 
  '<p id="sb551CastStatus" class="sb551CastMini sb551CastWarn">Ready. Use Save Cast & Crew after selecting a Supabase movie row.</p>'+ 
'</div>';}
function injectPanel(){
  if(!isManager())return;
  injectCss();
  if(!$('sb551CastPanel')){
    var anchor=$('sb47Trailer')||$('sb47Age')||$('sb47Rating')||$('sb47Title');
    if(anchor){
      var host=anchor.closest('div')||anchor.parentElement;
      host.insertAdjacentHTML('afterend',panelHtml());
    }
  }
  bindPanelButtons();
  var t=currentTitle();
  if(t&&t!==lastTitle){lastTitle=t;setTimeout(loadCastForTitle,250);}
}
function bindPanelButtons(){
  var save=$('sb551CastSave');
  if(save&&!save.dataset.bound){save.dataset.bound='1';save.addEventListener('click',saveCastForTitle);}
  var reload=$('sb551CastReload');
  if(reload&&!reload.dataset.bound){reload.dataset.bound='1';reload.addEventListener('click',function(){lastLoadedTitle='';loadCastForTitle();});}
}
async function findMovieByTitle(title){
  var c=client();if(!c||!title)return null;
  var q=await c.from('sb_movies').select('id,title,director,cast_text,updated_at,created_at').eq('title',title).limit(5);
  if(q.error){throw q.error;}
  if(!q.data||!q.data.length)return null;
  q.data.sort(function(a,b){return String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''));});
  return q.data[0];
}
async function loadCastForTitle(){
  if(loading)return;
  var title=currentTitle();
  if(!title)return;
  if(title===lastLoadedTitle)return;
  loading=true;
  try{
    var row=await findMovieByTitle(title);
    if(!row){setPanelStatus('No Supabase row found yet for '+title+'.',false);return;}
    lastLoadedTitle=title;
    setVal('sb551CastDirector',row.director||'');
    setVal('sb551CastText',row.cast_text||'');
    setPanelStatus('Loaded Cast & Crew metadata for '+row.title+'.',true);
  }catch(e){setPanelStatus('Could not load Cast & Crew: '+((e&&e.message)||e),false);}
  finally{loading=false;}
}
async function saveCastForTitle(){
  if(saving)return;
  var title=currentTitle();
  if(!title){setPanelStatus('No movie selected. Click Edit on a Supabase row first.',false);return;}
  saving=true;
  try{
    var c=client();if(!c)throw new Error('Supabase SDK not loaded.');
    var row=await findMovieByTitle(title);
    if(!row)throw new Error('No Supabase row found for '+title+'.');
    var director=val('sb551CastDirector');
    var cast=val('sb551CastText');
    var res=await c.from('sb_movies').update({director:director,cast_text:cast}).eq('id',row.id).select('id,title,director,cast_text').maybeSingle();
    if(res.error)throw res.error;
    lastLoadedTitle='';
    setPanelStatus('Saved Cast & Crew for '+res.data.title+'. Open Supabase Details → Cast & Crew to view it.',true);
    status('V5.5.1B Cast & Crew saved for '+res.data.title+'.');
    toast('Cast & Crew saved for '+res.data.title);
  }catch(e){
    setPanelStatus('Cast & Crew save failed: '+((e&&e.message)||e),false);
    status('Cast & Crew save failed: '+((e&&e.message)||e));
  }finally{saving=false;}
}

document.addEventListener('click',function(ev){
  if(ev.target&&ev.target.closest&&ev.target.closest('.sb47Edit,[data-id]')){
    lastLoadedTitle='';
    setTimeout(function(){lastTitle='';injectPanel();loadCastForTitle();},450);
  }
},true);

document.addEventListener('input',function(ev){
  if(ev.target&&ev.target.id==='sb47Title'){
    lastLoadedTitle='';
    setTimeout(loadCastForTitle,300);
  }
},true);

setInterval(injectPanel,1000);
document.addEventListener('DOMContentLoaded',function(){setTimeout(injectPanel,800);});
setTimeout(function(){injectPanel();if(isManager())toast(LABEL+' loaded');},1000);
})();
