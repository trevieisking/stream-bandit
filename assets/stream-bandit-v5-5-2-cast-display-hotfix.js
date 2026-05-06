/* Stream Bandit V5.5.2 — Supabase Cast Display Hotfix
   Follow-up to V5.5.1. Reads cast_text/director directly from Supabase and displays Cast & Crew on Supabase Details.
   Add-on script only: no schema, Mux, player or playback changes. */
(function(){
'use strict';

var SB552_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var SB552_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var SB552_LABEL='V5.5.2 Supabase Cast Display Hotfix';
var sb552Client=null;
var sb552LastCastKey='';
var sb552Busy=false;

function byId(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
function txt(el){return String(el&&el.textContent||'').trim()}
function val(id){var el=byId(id);return el?String(el.value||'').trim():''}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}catch(e){}}
function status(msg){var s=byId('sb47Status')||byId('sb491Status');if(s)s.textContent=msg;console.log('[Stream Bandit]',msg)}
function client(){if(sb552Client)return sb552Client;if(!window.supabase||!window.supabase.createClient)return null;sb552Client=window.supabase.createClient(SB552_URL,SB552_KEY);return sb552Client}
function remember(id){if(!id)return;sessionStorage.setItem('sb551SelectedMovieId',String(id));sessionStorage.setItem('sb552SelectedMovieId',String(id));}
function selectedId(){return sessionStorage.getItem('sb552SelectedMovieId')||sessionStorage.getItem('sb551SelectedMovieId')||''}
function splitCast(raw){return String(raw||'').split(/\r?\n|\s*;\s*/).map(function(x){return x.trim();}).filter(Boolean)}
function castHtml(raw,director){
  var rows=[];
  if(director)rows.push({name:'Director',role:director,type:'director'});
  splitCast(raw).forEach(function(line){
    var bits=line.split(/\s+—\s+|\s+-\s+/);
    rows.push({name:bits[0]||line,role:bits.slice(1).join(' — '),type:'cast'});
  });
  if(!rows.length)return '';
  return '<div class="sb552CastGrid">'+rows.map(function(r){return '<div class="sb552CastCard '+(r.type==='director'?'sb552Director':'')+'"><b>'+esc(r.name)+'</b>'+(r.role?'<span>'+esc(r.role)+'</span>':'')+'</div>';}).join('')+'</div>';
}
function injectCss(){
  if(byId('sb552Style'))return;
  var st=document.createElement('style');
  st.id='sb552Style';
  st.textContent='\n.sb552CastGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px}.sb552CastCard{background:linear-gradient(180deg,rgba(21,23,36,.92),rgba(13,14,21,.88));border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:13px;box-shadow:0 12px 30px rgba(0,0,0,.25)}.sb552CastCard b{display:block;font-size:15px}.sb552CastCard span{display:block;color:var(--muted,#a9afc3);font-size:13px;margin-top:4px}.sb552Director{border-color:rgba(61,220,151,.32);background:linear-gradient(180deg,rgba(18,59,43,.40),rgba(13,14,21,.88))}.sb552CastNote{color:#baf7df;margin:8px 0 0}.sb552CastWarn{color:#ffe0a3;margin:8px 0 0}\n';
  document.head.appendChild(st);
}
function currentDetailsTitle(){
  var h=document.querySelector('main h1, main h2, .main h1, .main h2');
  var all=Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3'));
  var title='';
  all.some(function(el){
    var t=txt(el);
    if(!t||/Supabase Details|Cast & Crew|Trailer|Supabase Info|Overview|Stream Bandit/i.test(t))return false;
    if(t.length>2){title=t;return true;}
    return false;
  });
  return title||txt(h);
}
async function fetchRow(){
  var c=client();if(!c)return null;
  var id=selectedId();
  if(id){
    var by=await c.from('sb_movies').select('*').eq('id',id).maybeSingle();
    if(!by.error&&by.data)return by.data;
  }
  var title=currentDetailsTitle();
  if(!title)return null;
  var q=await c.from('sb_movies').select('*').eq('title',title).limit(1);
  if(q.error||!q.data||!q.data[0])return null;
  remember(q.data[0].id);
  return q.data[0];
}
function findCastPanel(){
  var heads=Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,h4,b'));
  var castHead=heads.find(function(el){return /^Cast\s*&\s*Crew$/i.test(txt(el));});
  if(!castHead)return null;
  return castHead.closest('.panel,.card,section,div')||castHead.parentElement;
}
function isCastTabActive(){
  var active=Array.prototype.slice.call(document.querySelectorAll('button,.active,[aria-selected="true"]')).some(function(el){return /Cast\s*&\s*Crew/i.test(txt(el));});
  return active||!!findCastPanel();
}
async function patchCastPanel(force){
  if(sb552Busy)return;
  if(!isCastTabActive())return;
  var panel=findCastPanel();
  if(!panel)return;
  sb552Busy=true;
  try{
    injectCss();
    var row=await fetchRow();
    if(!row)return;
    var cast=row.cast_text||row.cast||row.castCrew||row.cast_and_crew||'';
    var director=row.director||'';
    var key=[row.id,row.updated_at,cast,director].join('|');
    if(!force&&key===sb552LastCastKey&&panel.querySelector('.sb552CastGrid'))return;
    sb552LastCastKey=key;
    var html=castHtml(cast,director);
    if(!html)return;
    var old=panel.querySelector('.empty,.sb552CastGrid,.sb552CastNote,.sb552CastWarn');
    while(old){var next=panel.querySelector('.empty,.sb552CastGrid,.sb552CastNote,.sb552CastWarn');if(!next)break;next.remove();old=panel.querySelector('.empty,.sb552CastGrid,.sb552CastNote,.sb552CastWarn');}
    panel.insertAdjacentHTML('beforeend',html+'<p class="sb552CastNote">Cast & Crew loaded from Supabase metadata.</p>');
  }catch(e){console.warn(SB552_LABEL,e);}
  finally{sb552Busy=false;}
}
async function robustSaveExtras(){
  var c=client();if(!c)return;
  var director=val('sb47Director')||val('sb491Director');
  var cast=val('sb47Cast')||val('sb491Cast');
  if(!director&&!cast)return;
  var id=selectedId();
  if(!id){status('V5.5.2: select/edit a Supabase movie row before saving Cast & Crew.');return;}
  var res=await c.from('sb_movies').update({director:director,cast_text:cast}).eq('id',id).select('id,title,director,cast_text').maybeSingle();
  if(res.error){status('V5.5.2 Cast save warning: '+res.error.message);return;}
  toast('V5.5.2 Cast & Crew saved');
  status('V5.5.2 Cast & Crew saved for '+((res.data&&res.data.title)||'movie'));
  setTimeout(function(){patchCastPanel(true);},700);
}

document.addEventListener('click',function(ev){
  var edit=ev.target&&ev.target.closest?ev.target.closest('.sb47Edit,[data-id]'):null;
  if(edit&&edit.dataset&&edit.dataset.id)remember(edit.dataset.id);
  if(ev.target&&ev.target.closest&&ev.target.closest('#sb47SaveMovie,#sb491Save'))setTimeout(robustSaveExtras,1700);
  if(/Cast\s*&\s*Crew/i.test(txt(ev.target)))setTimeout(function(){patchCastPanel(true);},700);
},true);

var mo=new MutationObserver(function(){setTimeout(function(){patchCastPanel(false);},250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
setInterval(function(){patchCastPanel(false);},1800);
document.addEventListener('DOMContentLoaded',function(){injectCss();setTimeout(function(){patchCastPanel(true);},1200);});
setTimeout(function(){injectCss();toast(SB552_LABEL+' loaded');},900);
})();
