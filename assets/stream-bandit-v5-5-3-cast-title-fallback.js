/* Stream Bandit V5.5.3 — Cast & Crew Title Fallback Fix
   Makes Supabase Cast & Crew save/display work even when the details row id is not remembered.
   Uses movie title fallback, keeps existing sb_movies columns, and does not touch Mux/playback. */
(function(){
'use strict';

var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var LABEL='V5.5.3 Cast & Crew Title Fallback';
var clientCache=null;
var busy=false;

function $(id){return document.getElementById(id)}
function text(el){return String(el&&el.textContent||'').trim()}
function value(id){var el=$(id);return el?String(el.value||'').trim():''}
function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
function client(){if(clientCache)return clientCache;if(!window.supabase||!window.supabase.createClient)return null;clientCache=window.supabase.createClient(URL,KEY);return clientCache}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}catch(e){}}
function status(msg){var s=$('sb47Status')||$('sb491Status');if(s)s.textContent=msg;console.log('[Stream Bandit]',msg)}
function setStore(k,v){if(v)sessionStorage.setItem(k,String(v));}
function getStore(k){return sessionStorage.getItem(k)||''}
function rememberMovie(o){
  if(!o)return;
  if(o.id){setStore('sb553MovieId',o.id);setStore('sb552SelectedMovieId',o.id);setStore('sb551SelectedMovieId',o.id);}
  if(o.title){setStore('sb553MovieTitle',o.title);setStore('sb552MovieTitle',o.title);}
}
function selectedId(){return getStore('sb553MovieId')||getStore('sb552SelectedMovieId')||getStore('sb551SelectedMovieId')}
function selectedTitle(){return getStore('sb553MovieTitle')||getStore('sb552MovieTitle')}
function cleanTitle(t){
  t=String(t||'').trim();
  if(!t)return '';
  if(/^(Supabase Details|Cast & Crew|Trailer|Supabase Info|Overview|Home|Library|Watchlist|Favourites|Genres|Watch History|Continue Watching)$/i.test(t))return '';
  if(/^V\d/i.test(t))return '';
  return t;
}
function captureTitleFromCard(el){
  if(!el||!el.closest)return '';
  var card=el.closest('.card,.reviewItem,.adminItem,.sbSupabaseCard,.sb47Row,article,section,div');
  if(!card)return '';
  var h=card.querySelector('h1,h2,h3,b,strong');
  return cleanTitle(text(h));
}
function captureVisibleDetailsTitle(){
  var candidates=Array.prototype.slice.call(document.querySelectorAll('main h1,main h2,main h3,.main h1,.main h2,.main h3,h1,h2,h3'));
  var found='';
  candidates.some(function(el){
    var t=cleanTitle(text(el));
    if(!t)return false;
    /* Prefer known movie-looking titles and skip section labels. */
    if(/Chapter|Years|Mercy|Scream|Shelter|M3GAN|Twits|Meg|Frankenstein|Trench/i.test(t)||t.length>8){found=t;return true;}
    return false;
  });
  if(found)rememberMovie({title:found});
  return found;
}
function selectedTitleNow(){return cleanTitle(value('sb47Title'))||cleanTitle(value('sb491Title'))||captureVisibleDetailsTitle()||selectedTitle()}
async function fetchRow(){
  var c=client();if(!c)return null;
  var id=selectedId();
  if(id){
    var r=await c.from('sb_movies').select('*').eq('id',id).maybeSingle();
    if(!r.error&&r.data){rememberMovie({id:r.data.id,title:r.data.title});return r.data;}
  }
  var title=selectedTitleNow();
  if(!title)return null;
  var q=await c.from('sb_movies').select('*').eq('title',title).limit(5);
  if(q.error||!q.data||!q.data.length)return null;
  q.data.sort(function(a,b){return String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''));});
  rememberMovie({id:q.data[0].id,title:q.data[0].title});
  return q.data[0];
}
async function saveCastByIdOrTitle(){
  var c=client();if(!c)return;
  var director=value('sb47Director')||value('sb491Director');
  var cast=value('sb47Cast')||value('sb491Cast');
  if(!director&&!cast)return;
  var id=selectedId();
  var title=selectedTitleNow();
  var row={director:director,cast_text:cast};
  var res=null;
  if(id){res=await c.from('sb_movies').update(row).eq('id',id).select('id,title,director,cast_text').maybeSingle();}
  if(!res||res.error||!res.data){
    if(!title){status('V5.5.3 Cast save needs a movie title. Open Edit on the row first.');return;}
    var found=await c.from('sb_movies').select('id,title').eq('title',title).limit(5);
    if(found.error||!found.data||!found.data.length){status('V5.5.3 could not find movie title in Supabase: '+title);return;}
    var target=found.data[0];
    rememberMovie({id:target.id,title:target.title});
    res=await c.from('sb_movies').update(row).eq('id',target.id).select('id,title,director,cast_text').maybeSingle();
  }
  if(res.error){status('V5.5.3 Cast save failed: '+res.error.message);return;}
  rememberMovie({id:res.data.id,title:res.data.title});
  status('V5.5.3 Cast & Crew saved for '+res.data.title+'.');
  toast('Cast & Crew saved');
  setTimeout(function(){patchCast(true);},900);
}
function splitCast(raw){return String(raw||'').split(/\r?\n|\s*;\s*/).map(function(x){return x.trim();}).filter(Boolean)}
function htmlFor(row){
  var director=row.director||'';
  var cast=row.cast_text||row.cast||'';
  var rows=[];
  if(director)rows.push({name:'Director',role:director,kind:'director'});
  splitCast(cast).forEach(function(line){
    var bits=line.split(/\s+—\s+|\s+-\s+/);
    rows.push({name:bits[0]||line,role:bits.slice(1).join(' — '),kind:'cast'});
  });
  if(!rows.length)return '';
  return '<div class="sb553CastGrid">'+rows.map(function(r){return '<div class="sb553CastCard '+(r.kind==='director'?'sb553Director':'')+'"><b>'+esc(r.name)+'</b>'+(r.role?'<span>'+esc(r.role)+'</span>':'')+'</div>';}).join('')+'</div><p class="sb553Note">Cast & Crew loaded from Supabase for '+esc(row.title||selectedTitleNow()||'this movie')+'.</p>';
}
function css(){
  if($('sb553Style'))return;
  var st=document.createElement('style');st.id='sb553Style';
  st.textContent='\n.sb553CastGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px}.sb553CastCard{background:linear-gradient(180deg,rgba(21,23,36,.92),rgba(13,14,21,.88));border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:13px;box-shadow:0 12px 30px rgba(0,0,0,.25)}.sb553CastCard b{display:block;font-size:15px}.sb553CastCard span{display:block;color:var(--muted,#a9afc3);font-size:13px;margin-top:4px}.sb553Director{border-color:rgba(61,220,151,.35);background:linear-gradient(180deg,rgba(18,59,43,.42),rgba(13,14,21,.88))}.sb553Note{color:#baf7df;margin-top:10px}.sb553Warn{color:#ffe0a3;margin-top:10px}.sb553Reload{margin-top:10px}\n';
  document.head.appendChild(st);
}
function castPanel(){
  var heads=Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,h4,b,strong'));
  var h=heads.find(function(el){return /^Cast\s*&\s*Crew$/i.test(text(el));});
  if(!h)return null;
  return h.closest('.panel,.card,section,div')||h.parentElement;
}
function castActive(){
  return !!castPanel()||Array.prototype.slice.call(document.querySelectorAll('button,.active,[aria-selected="true"]')).some(function(el){return /Cast\s*&\s*Crew/i.test(text(el));});
}
async function patchCast(force){
  if(busy||!castActive())return;
  var panel=castPanel();if(!panel)return;
  busy=true;
  try{
    css();
    var row=await fetchRow();
    var html=row?htmlFor(row):'';
    Array.prototype.slice.call(panel.querySelectorAll('.empty,.sb552CastGrid,.sb552CastNote,.sb553CastGrid,.sb553Note,.sb553Warn,.sb553Reload')).forEach(function(x){x.remove();});
    if(html){panel.insertAdjacentHTML('beforeend',html);}
    else{
      var title=selectedTitleNow();
      panel.insertAdjacentHTML('beforeend','<p class="sb553Warn">No Cast & Crew metadata found yet'+(title?' for '+esc(title):'')+'. Save it in Supabase Movie Manager, then press reload.</p><button type="button" class="secondary small sb553Reload">Reload Cast & Crew</button>');
    }
  }catch(e){console.warn(LABEL,e);}
  busy=false;
}

function scan(){captureVisibleDetailsTitle();if(castActive())patchCast(false);}

document.addEventListener('click',function(ev){
  var el=ev.target;
  if(!el||!el.closest)return;
  var edit=el.closest('[data-id],.sb47Edit');
  if(edit&&edit.dataset&&edit.dataset.id)rememberMovie({id:edit.dataset.id,title:captureTitleFromCard(edit)});
  if(/Details|Play|Resume/i.test(text(el))){var t=captureTitleFromCard(el);if(t)rememberMovie({title:t});}
  if(el.closest('#sb47SaveMovie,#sb491Save'))setTimeout(saveCastByIdOrTitle,1600);
  if(/Cast\s*&\s*Crew/i.test(text(el))||el.closest('.sb553Reload'))setTimeout(function(){patchCast(true);},650);
},true);

['input','change'].forEach(function(evt){document.addEventListener(evt,function(ev){if(ev.target&&/sb47Title|sb491Title/.test(ev.target.id||'')){rememberMovie({title:ev.target.value});}},true);});

var mo=new MutationObserver(function(){setTimeout(scan,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
setInterval(scan,1600);
document.addEventListener('DOMContentLoaded',function(){css();setTimeout(scan,1000);});
setTimeout(function(){css();toast(LABEL+' loaded');scan();},1000);
})();
