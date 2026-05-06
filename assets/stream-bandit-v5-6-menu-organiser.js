/* Stream Bandit V5.6 — Menu Organisation Pass 1
   Groups the existing sidebar buttons into cleaner sections.
   Visual/navigation tidy only: no Supabase, Mux, player, storage, database or route changes. */
(function(){
'use strict';

var LABEL='V5.6 Menu Organisation';
var lastSignature='';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function norm(s){return String(s||'').toLowerCase();}
function css(){
  if(document.getElementById('sb56MenuStyle'))return;
  var st=document.createElement('style');
  st.id='sb56MenuStyle';
  st.textContent='\n.side{scrollbar-width:thin}.sb56Badge{display:inline-block;margin:8px 0 10px;padding:8px 11px;border-radius:999px;background:linear-gradient(135deg,rgba(255,45,85,.18),rgba(124,60,255,.22));border:1px solid rgba(255,255,255,.12);font-size:12px;font-weight:900;line-height:1.25}.sb56GroupedNav{display:grid;gap:9px}.sb56Group{border:1px solid rgba(255,255,255,.08);border-radius:19px;background:linear-gradient(180deg,rgba(13,14,21,.72),rgba(7,8,14,.72));overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.18)}.sb56Group summary{cursor:pointer;list-style:none;padding:11px 12px;color:#f6f7ff;font-weight:950;letter-spacing:.04em;text-transform:uppercase;font-size:11px;display:flex;align-items:center;justify-content:space-between;gap:8px}.sb56Group summary::-webkit-details-marker{display:none}.sb56Group summary:after{content:"⌄";font-size:13px;color:var(--muted,#a9afc3);transition:transform .16s ease}.sb56Group:not([open]) summary:after{transform:rotate(-90deg)}.sb56GroupBody{padding:0 9px 9px;display:grid;gap:5px}.sb56GroupBody button{margin:0!important}.sb56GroupBody button.active{box-shadow:0 0 0 1px rgba(255,45,85,.26),0 10px 28px rgba(124,60,255,.18)}.sb56QuickNote{font-size:11px;color:var(--muted,#a9afc3);line-height:1.35;margin:8px 2px 0}.sb56Group[data-sb56-kind="main"]{border-color:rgba(61,220,151,.18)}.sb56Group[data-sb56-kind="admin"]{border-color:rgba(106,166,255,.22)}.sb56Group[data-sb56-kind="storage"]{border-color:rgba(255,191,60,.20)}.sb56Group[data-sb56-kind="supabase"]{border-color:rgba(61,220,151,.25)}.sb56Group[data-sb56-kind="mux"]{border-color:rgba(182,140,255,.25)}@media(max-width:850px){.sb56GroupedNav{grid-template-columns:1fr}.sb56Group summary{padding:10px}}\n';
  document.head.appendChild(st);
}
function groupFor(label){
  var s=norm(label);
  if(/home|continue watching|library|watchlist|favourite|favorite|accessibility/.test(s))return 'main';
  if(/genre|history|channel|playlist|collection/.test(s))return 'browse';
  if(/supabase|migration|readiness|manager/.test(s)&&!/mux/.test(s))return 'supabase';
  if(/mux|upload plan|playback id|hls/.test(s))return 'mux';
  if(/storage|backup|image|browser video/.test(s))return 'storage';
  if(/admin|settings|quality|health|test|tools|uploader/.test(s))return 'admin';
  return 'admin';
}
var titles={
  main:'Watch',
  browse:'Browse',
  supabase:'Supabase',
  mux:'Mux / Video Links',
  storage:'Storage & Backups',
  admin:'Admin Tools'
};
var order=['main','browse','supabase','mux','storage','admin'];
function makeGroup(key,buttons){
  var d=document.createElement('details');
  d.className='sb56Group';
  d.dataset.sb56Kind=key;
  d.open=(key==='main'||key==='browse'||buttons.some(function(b){return b.classList.contains('active');}));
  var sum=document.createElement('summary');
  sum.textContent=titles[key]+' ('+buttons.length+')';
  var body=document.createElement('div');
  body.className='sb56GroupBody';
  buttons.forEach(function(b){body.appendChild(b);});
  d.appendChild(sum);d.appendChild(body);
  return d;
}
function organise(){
  css();
  var side=document.querySelector('.side');
  var nav=side&&side.querySelector('.nav');
  if(!side||!nav||nav.dataset.sb56Working==='1')return;
  var buttons=Array.prototype.slice.call(nav.querySelectorAll('button[data-view],button'));
  if(!buttons.length)return;
  var signature=buttons.map(function(b){return text(b)+'|'+(b.classList.contains('active')?'1':'0');}).join('~');
  if(signature===lastSignature&&nav.classList.contains('sb56GroupedNav'))return;
  lastSignature=signature;
  nav.dataset.sb56Working='1';
  var buckets={main:[],browse:[],supabase:[],mux:[],storage:[],admin:[]};
  buttons.forEach(function(b){buckets[groupFor(text(b))].push(b);});
  nav.innerHTML='';
  nav.classList.add('sb56GroupedNav');
  order.forEach(function(k){if(buckets[k].length)nav.appendChild(makeGroup(k,buckets[k]));});
  var note=document.createElement('div');
  note.className='sb56QuickNote';
  note.textContent='Grouped menu only. Existing buttons and pages still work the same.';
  nav.appendChild(note);
  nav.dataset.sb56Working='0';
  var brand=side.querySelector('.brand');
  if(brand&&!side.querySelector('.sb56Badge')){
    var badge=document.createElement('div');
    badge.className='sb56Badge';
    badge.textContent='V5.6 Organised Menu';
    brand.insertAdjacentElement('afterend',badge);
  }
}
var mo=new MutationObserver(function(){setTimeout(organise,80);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(organise,500);});
setInterval(organise,1200);
setTimeout(function(){organise();try{var t=document.createElement('div');t.className='toast';t.textContent=LABEL+' loaded';document.body.appendChild(t);setTimeout(function(){t.remove()},2500)}catch(e){}},900);
})();
