/* Code Labs Hero Utilities V266 - keep auto-fill helpers directly under the hero. */
(function(){
'use strict';
var VERSION='V266-autofill-under-hero';
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function main(){return q('.main')||q('main')}
function hero(root){return q(':scope>.hero',root)||q('.hero',root)}
function clearManaged(panel){
  if(!panel)return;
  panel.classList.remove('clProductManagedV227','clProductTabHiddenV227');
  panel.removeAttribute('data-cl-product-group');
  panel.removeAttribute('data-cl-page-section-number');
  panel.removeAttribute('data-cl-section-number');
  panel.setAttribute('data-cl-product-ignore','yes');
  panel.setAttribute('data-cl-page-runtime-ignore','yes');
  var heading=q(':scope>h2',panel);
  if(heading){all(':scope>.clPanelNumber',heading).forEach(function(n){n.remove()});heading.classList.remove('clNumberedHeading')}
}
function panels(root){
  var out=[];
  ['.stickyApply','#rdAutoFillPanel','#cfp'].forEach(function(selector){var n=q(selector,root);if(n&&out.indexOf(n)<0)out.push(n)});
  return out;
}
function place(root){
  var h=hero(root),items=panels(root),cursor=h;
  if(!h||!items.length)return false;
  items.forEach(function(panel){
    clearManaged(panel);
    panel.classList.add('clHeroUtilityV266');
    panel.dataset.clHeroUtilityVersion=VERSION;
    if(cursor.nextElementSibling!==panel)cursor.insertAdjacentElement('afterend',panel);
    cursor=panel;
  });
  return true;
}
function setButton(button,available,readyText){
  if(!button)return;
  if(!button.dataset.clHeroUtilityReadyText)button.dataset.clHeroUtilityReadyText=readyText||button.textContent||'Auto-fill';
  button.disabled=!available;
  button.setAttribute('aria-disabled',available?'false':'true');
  button.title=available?'':'Load a current file in File Lab first.';
  button.textContent=available?button.dataset.clHeroUtilityReadyText:'Load a file in File Lab first';
}
function availability(root){
  var repoPanel=q('#rdAutoFillPanel',root),repoButton=q('#rdAutoFillBtn',root),repoTarget=q('#rdAutoFillTarget',root);
  if(repoPanel&&repoButton){
    var repoReady=Boolean(repoTarget&&!/no file lab file found yet/i.test(String(repoTarget.textContent||'')));
    repoPanel.classList.toggle('clHeroUtilityUnavailableV266',!repoReady);
    setButton(repoButton,repoReady,'Auto-fill Repo Desk from File Lab');
  }
  var current=q('#cfp',root),currentButton=q('#cfpBtn',root);
  if(current&&currentButton){
    var currentReady=!current.classList.contains('bad')&&!/no file loaded yet/i.test(String(current.textContent||''));
    current.classList.toggle('clHeroUtilityUnavailableV266',!currentReady);
    setButton(currentButton,currentReady,'Auto-fill this page from File Lab');
  }
}
function style(){
  if(q('#clHeroUtilitiesV266Style'))return;
  var s=document.createElement('style');
  s.id='clHeroUtilitiesV266Style';
  s.textContent='body.clHeroUtilitiesV266 .clHeroUtilityV266{position:relative!important;top:auto!important;z-index:auto!important;width:100%;margin:0 0 12px!important;padding:14px 16px!important;border:1px solid color-mix(in srgb,var(--line) 72%,var(--brand) 28%)!important;border-top:4px solid var(--brand)!important;border-radius:18px!important;background:color-mix(in srgb,var(--panel) 94%,var(--brand) 6%)!important;color:var(--ink)!important;box-shadow:0 8px 24px rgba(20,32,58,.08)!important}.clHeroUtilityV266 h2{margin:0 0 8px!important;font-size:clamp(17px,1.7vw,21px)!important}.clHeroUtilityV266 p{overflow-wrap:anywhere}.clHeroUtilityV266 .actions{margin-top:8px!important}.clHeroUtilityV266 .btn,.clHeroUtilityV266 button{white-space:normal}.clHeroUtilityV266.clHeroUtilityUnavailableV266{border-top-color:var(--warn)!important;background:color-mix(in srgb,var(--panel) 92%,var(--warn) 8%)!important}.clHeroUtilityV266 button:disabled{opacity:.68;cursor:not-allowed;filter:none!important}@media(max-width:650px){body.clHeroUtilitiesV266 .clHeroUtilityV266{padding:13px!important}.clHeroUtilityV266 .actions .btn,.clHeroUtilityV266 .actions button{width:100%}}';
  document.head.appendChild(s);
}
function apply(){
  var root=main();
  if(!root)return false;
  style();
  if(document.body)document.body.classList.add('clHeroUtilitiesV266');
  place(root);
  availability(root);
  return true;
}
function boot(){apply();[120,500,1200,2600,4200].forEach(function(ms){setTimeout(apply,ms)})}
window.CodeLabsHeroUtilitiesV266={version:VERSION,apply:apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();