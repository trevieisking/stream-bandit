/* Stream Bandit V5.22.3 — Supabase Details Action Bar Tidy TEST
   Fix target: Supabase Details overview card has awkward empty gaps and small action buttons.
   This test does NOT rebuild the details card.
   It only moves the existing real Play / Resume and Back to Library buttons into a clean bottom action bar,
   makes Play / Resume larger, and gently tightens the overview card spacing.
   No Supabase writes, no movie saves, no Mux changes, no player source changes, no database changes. */
(function(){
'use strict';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isSupabaseDetails(){
  var m=main();
  var t=text(m).toLowerCase();
  return t.indexOf('supabase details')>-1 && t.indexOf('overview')>-1 && t.indexOf('cast & crew')>-1 && t.indexOf('trailer')>-1;
}
function isOverviewActive(){
  var m=main();
  var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(text(b)) && /active/i.test(String(b.className||''));});
  if(active)return true;
  return text(m).toLowerCase().indexOf('play / resume')>-1;
}
function addStyle(){
  if(document.getElementById('sb5223Style'))return;
  var st=document.createElement('style');
  st.id='sb5223Style';
  st.textContent='\nbody.sb5223DetailsActionTidy .sb5223DetailsCard{position:relative!important;overflow:hidden!important;padding:18px 18px 96px!important;border-radius:26px!important}body.sb5223DetailsActionTidy .sb5223DetailsCard img{max-width:100%!important;border-radius:18px!important}body.sb5223DetailsActionTidy .sb5223ActionBar{position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important}body.sb5223DetailsActionTidy .sb5223ActionBar button,body.sb5223DetailsActionTidy .sb5223ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}body.sb5223DetailsActionTidy .sb5223ActionBar .sb5223PlayBtn{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}body.sb5223DetailsActionTidy .sb5223ActionBar .sb5223BackBtn{background:rgba(53,57,86,.96)!important}body.sb5223DetailsActionTidy .sb5223DetailsCard .sb5223GhostGap{min-height:0!important;height:auto!important}body.sb5223DetailsActionTidy .sb5223TidyTag{position:absolute;right:18px;bottom:86px;border-radius:999px;padding:7px 10px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-size:12px;font-weight:900;pointer-events:none}@media(max-width:760px){body.sb5223DetailsActionTidy .sb5223DetailsCard{padding-bottom:150px!important}body.sb5223DetailsActionTidy .sb5223ActionBar{grid-template-columns:1fr!important}body.sb5223DetailsActionTidy .sb5223TidyTag{display:none}}\n';
  document.head.appendChild(st);
}
function findButton(re){
  return Array.prototype.slice.call(main().querySelectorAll('button,a')).find(function(b){return re.test(text(b));})||null;
}
function findDetailsCard(playBtn,backBtn){
  var a=playBtn||backBtn;
  if(!a)return null;
  var card=a.closest('.card,.panel,section');
  if(card)return card;
  var p=a.parentElement;
  while(p&&p!==document.body&&p!==main()){
    if(text(p).toLowerCase().indexOf('source')>-1&&text(p).toLowerCase().indexOf('playable')>-1)return p;
    p=p.parentElement;
  }
  return a.closest('div')||null;
}
function tagEmptyGaps(card){
  Array.prototype.slice.call(card.querySelectorAll('div')).forEach(function(d){
    if(d.id==='sb5223ActionBar')return;
    var s=text(d);
    var r=d.getBoundingClientRect();
    if(!s && r.height>80)d.classList.add('sb5223GhostGap');
  });
}
function apply(){
  if(!isSupabaseDetails()||!isOverviewActive()){
    document.body.classList.remove('sb5223DetailsActionTidy');
    return;
  }
  addStyle();
  document.body.classList.add('sb5223DetailsActionTidy');
  var play=findButton(/play\s*\/\s*resume/i);
  var back=findButton(/back\s+to\s+library/i);
  if(!play&&!back)return;
  var card=findDetailsCard(play,back);
  if(!card)return;
  card.classList.add('sb5223DetailsCard');
  tagEmptyGaps(card);
  var bar=card.querySelector('#sb5223ActionBar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='sb5223ActionBar';
    bar.className='sb5223ActionBar';
    card.appendChild(bar);
  }
  if(play&&!bar.contains(play)){
    play.classList.add('sb5223PlayBtn');
    bar.insertBefore(play,bar.firstChild);
  }
  if(back&&!bar.contains(back)){
    back.classList.add('sb5223BackBtn');
    bar.appendChild(back);
  }
  if(!card.querySelector('.sb5223TidyTag')){
    var tag=document.createElement('div');
    tag.className='sb5223TidyTag';
    tag.textContent='V5.22.3 tidy test';
    card.appendChild(tag);
  }
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
