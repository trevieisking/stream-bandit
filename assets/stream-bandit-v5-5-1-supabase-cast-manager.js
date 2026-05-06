/* Stream Bandit V5.5.1 Clean — Supabase Cast & Crew Manager
   Clean add-on: adds Director + Cast & Crew editing to Supabase Movie Manager only.
   No Details-page watcher, no render loop, no player/Mux/database schema changes. */
(function(){
'use strict';

var SB551_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var SB551_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var SB551_LABEL='V5.5.1 Supabase Cast & Crew Manager';
var sb551Client=null;
var sb551Injected=false;
var sb551SaveBound=false;
var sb551SelectedId='';

function byId(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
function val(id){var el=byId(id);return el?String(el.value||'').trim():''}
function setVal(id,v){var el=byId(id);if(el)el.value=v||''}
function text(el){return String(el&&el.textContent||'').trim()}
function client(){if(sb551Client)return sb551Client;if(!window.supabase||!window.supabase.createClient)return null;sb551Client=window.supabase.createClient(SB551_URL,SB551_KEY);return sb551Client}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}catch(e){}}
function status(msg){var s=byId('sb47Status');if(s)s.textContent=msg;console.log('[Stream Bandit]',msg)}
function isManager(){return !!byId('sb47Title')&&!!byId('sb47SaveMovie')&&/Supabase Movie Manager/i.test(document.body.textContent||'')}
function remember(id,title){if(id){sb551SelectedId=String(id);sessionStorage.setItem('sb551CleanMovieId',sb551SelectedId);}if(title)sessionStorage.setItem('sb551CleanMovieTitle',String(title));}
function selectedId(){return sb551SelectedId||sessionStorage.getItem('sb551CleanMovieId')||''}
function selectedTitle(){return val('sb47Title')||sessionStorage.getItem('sb551CleanMovieTitle')||''}
function titleFromRow(btn){
  var row=btn&&btn.closest?btn.closest('div,article,section,.card,.adminItem'):null;
  if(!row)return '';
  var candidates=Array.prototype.slice.call(row.querySelectorAll('b,strong,h3,h4'));
  for(var i=0;i<candidates.length;i++){
    var t=text(candidates[i]);
    if(t&&!/published|Mux|stream link set|No poster/i.test(t))return t;
  }
  return '';
}
function injectCss(){
  if(byId('sb551CleanStyle'))return;
  var st=document.createElement('style');
  st.id='sb551CleanStyle';
  st.textContent='\n.sb551CleanPanel{background:linear-gradient(180deg,rgba(16,24,39,.94),rgba(13,14,21,.90));border:1px solid rgba(106,166,255,.28);border-radius:22px;padding:14px;margin:13px 0;box-shadow:0 14px 36px rgba(0,0,0,.32)}.sb551CleanPanel h4{margin:0 0 6px;font-size:16px}.sb551CleanTabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.sb551CleanTab{border-radius:999px;padding:7px 10px;background:#25283a;border:1px solid rgba(255,255,255,.10);font-weight:800;font-size:12px}.sb551CleanTab.active{background:linear-gradient(135deg,var(--a,#ff2d55),var(--b,#7c3cff))}.sb551CleanHelp{color:var(--muted,#a9afc3);font-size:12px;line-height:1.45}.sb551CleanPanel textarea{min-height:150px}.sb551CleanGrid{display:grid;grid-template-columns:1fr;gap:10px}.sb551CleanOk{color:#baf7df}.sb551CleanWarn{color:#ffe0a3}.sb551CleanMini{font-size:12px;margin-top:8px}\n';
  document.head.appendChild(st);
}
function panelHtml(){return '<div class="sb551CleanPanel" id="sb551CleanPanel">'+
  '<h4>Cast & Crew metadata</h4>'+ 
  '<p class="sb551CleanHelp">Supabase now uses the same metadata idea as the local admin form. This saves into the existing <b>director</b> and <b>cast_text</b> columns so the Supabase Details Cast & Crew tab can display it.</p>'+ 
  '<div class="sb551CleanTabs"><span class="sb551CleanTab active">Overview fields</span><span class="sb551CleanTab">Cast & Crew</span><span class="sb551CleanTab">Saves to Supabase</span></div>'+ 
  '<div class="sb551CleanGrid">'+
    '<div><label>Director</label><input id="sb551CleanDirector" placeholder="Director name"></div>'+ 
    '<div><label>Cast & Crew</label><textarea id="sb551CleanCast" placeholder="Example: Actor Name as Character Name&#10;Actor Two as Role Two"></textarea></div>'+ 
  '</div>'+ 
  '<p id="sb551CleanStatus" class="sb551CleanMini sb551CleanWarn">Ready. Click Update Supabase movie to save these fields.</p>'+ 
'</div>';}
async function loadExisting(){
  var c=client();if(!c)return;
  var id=selectedId();
  var title=selectedTitle();
  var q=null;
  if(id)q=await c.from('sb_movies').select('id,title,director,cast_text').eq('id',id).maybeSingle();
  if((!q||q.error||!q.data)&&title)q=await c.from('sb_movies').select('id,title,director,cast_text').eq('title',title).limit(1).maybeSingle();
  if(q&&q.data){remember(q.data.id,q.data.title);setVal('sb551CleanDirector',q.data.director||'');setVal('sb551CleanCast',q.data.cast_text||'');var st=byId('sb551CleanStatus');if(st){st.className='sb551CleanMini sb551CleanOk';st.textContent='Loaded existing Director / Cast & Crew metadata for '+q.data.title+'.';}}
}
function injectPanel(){
  if(!isManager())return;
  injectCss();
  if(!byId('sb551CleanPanel')){
    var anchor=byId('sb47Trailer')||byId('sb47Age')||byId('sb47Rating')||byId('sb47Title');
    if(anchor){
      var host=anchor.closest('div')||anchor.parentElement;
      host.insertAdjacentHTML('afterend',panelHtml());
    }
  }
  if(!sb551SaveBound){bindSave();sb551SaveBound=true;}
  if(!sb551Injected){sb551Injected=true;setTimeout(loadExisting,500);}
}
async function saveCast(){
  var c=client();if(!c)return;
  var director=val('sb551CleanDirector');
  var cast=val('sb551CleanCast');
  if(!director&&!cast)return;
  var id=selectedId();
  var title=selectedTitle();
  var target=null;
  if(id){var q=await c.from('sb_movies').select('id,title').eq('id',id).maybeSingle();if(!q.error&&q.data)target=q.data;}
  if(!target&&title){var r=await c.from('sb_movies').select('id,title').eq('title',title).limit(1).maybeSingle();if(!r.error&&r.data)target=r.data;}
  if(!target){status('Cast & Crew save needs the selected Supabase movie row. Click Edit on the row first.');return;}
  var res=await c.from('sb_movies').update({director:director,cast_text:cast}).eq('id',target.id).select('id,title,director,cast_text').maybeSingle();
  var st=byId('sb551CleanStatus');
  if(res.error){if(st){st.className='sb551CleanMini sb551CleanWarn';st.textContent='Cast & Crew save failed: '+res.error.message;}status('Cast & Crew save failed: '+res.error.message);return;}
  remember(res.data.id,res.data.title);
  if(st){st.className='sb551CleanMini sb551CleanOk';st.textContent='Saved Cast & Crew metadata for '+res.data.title+'. Open Supabase Details → Cast & Crew to view it.';}
  status('V5.5.1 Cast & Crew saved for '+res.data.title+'.');
  toast('Cast & Crew saved for '+res.data.title);
}
function bindSave(){
  document.addEventListener('click',function(ev){
    var edit=ev.target&&ev.target.closest?ev.target.closest('.sb47Edit,[data-id]'):null;
    if(edit&&edit.dataset&&edit.dataset.id){remember(edit.dataset.id,titleFromRow(edit));setTimeout(loadExisting,500);}
    if(ev.target&&ev.target.closest&&ev.target.closest('#sb47SaveMovie'))setTimeout(saveCast,1200);
  },true);
}
function resetWhenLeaving(){if(!isManager()){sb551Injected=false;sb551SaveBound=false;}}
var mo=new MutationObserver(function(){if(isManager())injectPanel();else resetWhenLeaving();});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(injectPanel,800);});
setTimeout(function(){injectPanel();if(isManager())toast(SB551_LABEL+' loaded');},1000);
})();
