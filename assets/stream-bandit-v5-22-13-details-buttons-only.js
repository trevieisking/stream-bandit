/* Stream Bandit V5.22.13 — Supabase Details Buttons Only TEST
   User-approved direction: keep the restored Supabase Details layout.
   Only make Play / Resume and Back to Library bigger/neater.
   No info-box movement, no card rebuilds, no Supabase writes, no movie saves. */
(function(){
'use strict';
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetails(){var t=text(main()).toLowerCase();return t.indexOf('supabase details')>-1&&t.indexOf('overview')>-1&&t.indexOf('play / resume')>-1&&t.indexOf('back to library')>-1;}
function addStyle(){
  if(document.getElementById('sb52213Style'))return;
  var s=document.createElement('style');
  s.id='sb52213Style';
  s.textContent='\nbody.sb52213DetailsButtonsOnly .sb52213ActionWrap{display:grid!important;grid-template-columns:minmax(260px,1.4fr) minmax(200px,.8fr)!important;gap:12px!important;align-items:stretch!important;margin-top:14px!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;width:100%!important}body.sb52213DetailsButtonsOnly .sb52213ActionWrap button,body.sb52213DetailsButtonsOnly .sb52213ActionWrap a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}body.sb52213DetailsButtonsOnly .sb52213Play{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}body.sb52213DetailsButtonsOnly .sb52213Back{background:rgba(53,57,86,.96)!important}@media(max-width:760px){body.sb52213DetailsButtonsOnly .sb52213ActionWrap{grid-template-columns:1fr!important}}\n';
  document.head.appendChild(s);
}
function findButton(re){return Array.from(main().querySelectorAll('button,a')).find(function(b){return re.test(text(b));});}
function apply(){
  if(!isDetails()){document.body.classList.remove('sb52213DetailsButtonsOnly');return;}
  addStyle();
  document.body.classList.add('sb52213DetailsButtonsOnly');
  var play=findButton(/play\s*\/\s*resume/i);
  var back=findButton(/back\s+to\s+library/i);
  if(!play||!back)return;
  if(play.closest('.sb52213ActionWrap')&&back.closest('.sb52213ActionWrap'))return;
  var parent=play.parentElement||back.parentElement;
  var wrap=document.createElement('div');
  wrap.className='sb52213ActionWrap';
  play.classList.add('sb52213Play');
  back.classList.add('sb52213Back');
  parent.insertBefore(wrap,play);
  wrap.appendChild(play);
  wrap.appendChild(back);
}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
