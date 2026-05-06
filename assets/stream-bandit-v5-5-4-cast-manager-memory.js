/* Stream Bandit V5.5.4 — Cast Manager Memory Fix
   Fixes Cast & Crew lookup using sidebar/app title instead of the edited Supabase movie title.
   Add-on only: no Mux/player/schema changes. */
(function(){
'use strict';

var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var LABEL='V5.5.4 Cast Manager Memory Fix';
var cli=null;
var busy=false;

function $(id){return document.getElementById(id)}
function text(el){return String(el&&el.textContent||'').trim()}
function val(id){var el=$(id);return el?String(el.value||'').trim():''}
function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
function client(){if(cli)return cli;if(!window.supabase||!window.supabase.createClient)return null;cli=window.supabase.createClient(URL,KEY);return cli}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}catch(e){}}
function status(msg){var s=$('sb47Status')||$('sb491Status');if(s)s.textContent=msg;console.log('[Stream Bandit]',msg)}

function badTitle(t){
  t=String(t||'').trim();
  if(!t)return true;
  return /^(Stream Bandit|Chatterfriends Movies|Supabase Details|Supabase Movie Manager|Cast & Crew|Trailer|Supabase Info|Overview|Library|Home|Watchlist|Favourites|Genres|Watch History|Continue Watching|Accessibility)$/i.test(t)||/^V\d/i.test(t);
}
function remember(id,title){
  if(id){['sb554MovieId','sb553MovieId','sb552SelectedMovieId','sb551SelectedMovieId'].forEach(function(k){sessionStorage.setItem(k,String(id));});}
  if(title&&!badTitle(title)){['sb554MovieTitle','sb553MovieTitle','sb552MovieTitle'].forEach(function(k){sessionStorage.setItem(k,String(title));});}
}
function rememberedTitle(){
  var keys=['sb554MovieTitle','sb553MovieTitle','sb552MovieTitle'];
  for(var i=0;i<keys.length;i++){var t=sessionStorage.getItem(keys[i])||'';if(!badTitle(t))return t;}
  return '';
}
function rememberedId(){return sessionStorage.getItem('sb554MovieId')||sessionStorage.getItem('sb553MovieId')||sessionStorage.getItem('sb552SelectedMovieId')||sessionStorage.getItem('sb551SelectedMovieId')||'';}
function managerTitle(){return val('sb47Title')||val('sb491Title')||'';}
function managerCast(){return val('sb47Cast')||val('sb491Cast')||'';}
function managerDirector(){return val('sb47Director')||val('sb491Director')||'';}
function rememberFromManager(){
  var t=managerTitle();
  if(t&&!badTitle(t))remember('',t);
}
function titleFromCard(el){
  if(!el||!el.closest)return '';
  var card=el.closest('.card,.adminItem,.reviewItem,article,section,div');
  if(!card)return '';
  var candidates=Array.prototype.slice.call(card.querySelectorAll('h1,h2,h3,b,strong'));
  for(var i=0;i<candidates.length;i++){var t=text(candidates[i]);if(!badTitle(t))return t;}
  return '';
}
async function findRow(){
  var c=client();if(!c)return null;
  var id=rememberedId();
  if(id){
    var a=await c.from('sb_movies').select('*').eq('id',id).maybeSingle();
    if(!a.error&&a.data){remember(a.data.id,a.data.title);return a.data;}
  }
  var title=managerTitle()||rememberedTitle();
  if(!title||badTitle(title))return null;
  var b=await c.from('sb_movies').select('*').eq('title',title).limit(5);
  if(b.error||!b.data||!b.data.length)return null;
  b.data.sort(function(x,y){return String(y.updated_at||y.created_at||'').localeCompare(String(x.updated_at||x.created_at||''));});
  remember(b.data[0].id,b.data[0].title);
  return b.data[0];
}
async function saveFromManager(){
  rememberFromManager();
  var cast=managerCast();
  var director=managerDirector();
  if(!cast&&!director)return;
  var c=client();if(!c)return;
  var row=await findRow();
  if(!row){status('V5.5.4 Cast save could not find movie. Click Edit on the movie row first.');return;}
  var res=await c.from('sb_movies').update({cast_text:cast,director:director}).eq('id',row.id).select('id,title,cast_text,director').maybeSingle();
  if(res.error){status('V5.5.4 Cast save failed: '+res.error.message);return;}
  remember(res.data.id,res.data.title);
  status('V5.5.4 Cast & Crew saved for '+res.data.title+'.');
  toast('Cast & Crew saved for '+res.data.title);
}
function castLines(raw){return String(raw||'').split(/\r?\n|\s*;\s*/).map(function(x){return x.trim();}).filter(Boolean)}
function castHtml(row){
  var director=row.director||'';
  var cast=row.cast_text||row.cast||'';
  var rows=[];
  if(director)rows.push(['Director',director,'director']);
  castLines(cast).forEach(function(line){var bits=line.split(/\s+—\s+|\s+-\s+/);rows.push([bits[0]||line,bits.slice(1).join(' — '),'cast']);});
  if(!rows.length)return '';
  return '<div class="sb554CastGrid">'+rows.map(function(r){return '<div class="sb554CastCard '+(r[2]==='director'?'sb554Director':'')+'"><b>'+esc(r[0])+'</b>'+(r[1]?'<span>'+esc(r[1])+'</span>':'')+'</div>';}).join('')+'</div><p class="sb554Note">Cast & Crew loaded from Supabase for '+esc(row.title||rememberedTitle())+'.</p>';
}
function css(){
  if($('sb554Style'))return;
  var st=document.createElement('style');st.id='sb554Style';
  st.textContent='\n.sb554CastGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px}.sb554CastCard{background:linear-gradient(180deg,rgba(21,23,36,.92),rgba(13,14,21,.88));border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:13px;box-shadow:0 12px 30px rgba(0,0,0,.25)}.sb554CastCard b{display:block;font-size:15px}.sb554CastCard span{display:block;color:var(--muted,#a9afc3);font-size:13px;margin-top:4px}.sb554Director{border-color:rgba(61,220,151,.35);background:linear-gradient(180deg,rgba(18,59,43,.42),rgba(13,14,21,.88))}.sb554Note{color:#baf7df;margin-top:10px}.sb554Warn{color:#ffe0a3;margin-top:10px}.sb554Reload{margin-top:10px}\n';
  document.head.appendChild(st);
}
function castPanel(){
  var hs=Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,h4,b,strong'));
  var h=hs.find(function(x){return /^Cast\s*&\s*Crew$/i.test(text(x));});
  return h?(h.closest('.panel,.card,section,div')||h.parentElement):null;
}
async function renderCast(force){
  if(busy)return;
  var panel=castPanel();
  if(!panel)return;
  busy=true;
  try{
    css();
    var row=await findRow();
    Array.prototype.slice.call(panel.querySelectorAll('.empty,.sb552CastGrid,.sb552CastNote,.sb553CastGrid,.sb553Note,.sb553Warn,.sb553Reload,.sb554CastGrid,.sb554Note,.sb554Warn,.sb554Reload')).forEach(function(x){x.remove();});
    var html=row?castHtml(row):'';
    if(html){panel.insertAdjacentHTML('beforeend',html);}
    else{panel.insertAdjacentHTML('beforeend','<p class="sb554Warn">No Cast & Crew metadata found for the selected movie yet. Go back to Supabase Movie Manager, click Edit on the movie, save Cast & Crew, then return here.</p><button type="button" class="secondary small sb554Reload">Reload Cast & Crew</button>');}
  }catch(e){console.warn(LABEL,e);}
  busy=false;
}

function scan(){rememberFromManager();if(castPanel())renderCast(false);}

document.addEventListener('click',function(ev){
  var el=ev.target;
  if(!el||!el.closest)return;
  var edit=el.closest('.sb47Edit,[data-id]');
  if(edit&&edit.dataset&&edit.dataset.id){var t=titleFromCard(edit)||managerTitle();remember(edit.dataset.id,t);}
  var t=titleFromCard(el);if(t&&!badTitle(t))remember('',t);
  if(el.closest('#sb47SaveMovie,#sb491Save'))setTimeout(saveFromManager,1500);
  if(/Cast\s*&\s*Crew/i.test(text(el))||el.closest('.sb554Reload'))setTimeout(function(){renderCast(true);},650);
},true);

document.addEventListener('input',function(ev){if(ev.target&&/sb47Title|sb491Title/.test(ev.target.id||''))remember('',ev.target.value);},true);

var mo=new MutationObserver(function(){setTimeout(scan,300);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
setInterval(scan,1500);
document.addEventListener('DOMContentLoaded',function(){css();setTimeout(scan,1000);});
setTimeout(function(){css();toast(LABEL+' loaded');scan();},1000);
})();
