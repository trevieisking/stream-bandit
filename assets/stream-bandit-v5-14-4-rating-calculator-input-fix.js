/* Stream Bandit V5.14.4 — Test Rating Calculator Input Fix
   Test-page-only helper. Keeps V5.14.3 calculator inputs focusable/typeable.
   No Supabase writes, no movie saves, no Mux, no player, no database changes. */
(function(){
'use strict';

function calc(){return document.getElementById('sb5143Calc');}
function inputs(){var c=calc();return c?Array.prototype.slice.call(c.querySelectorAll('input,textarea,select')):[];}
function addStyle(){
  if(document.getElementById('sb5144InputFixStyle'))return;
  var st=document.createElement('style');
  st.id='sb5144InputFixStyle';
  st.textContent='\n#sb5143Calc{pointer-events:auto!important;position:relative!important;z-index:5000!important}#sb5143Calc input,#sb5143Calc textarea,#sb5143Calc select{pointer-events:auto!important;user-select:text!important;-webkit-user-select:text!important;touch-action:manipulation!important;position:relative!important;z-index:5010!important;background:#070914!important;color:#f6f7ff!important;caret-color:#ffffff!important}#sb5143Calc input:focus{outline:2px solid rgba(61,220,151,.65)!important;box-shadow:0 0 0 4px rgba(61,220,151,.12)!important}\n';
  document.head.appendChild(st);
}
function bind(){
  addStyle();
  inputs().forEach(function(el){
    el.readOnly=false;
    el.disabled=false;
    el.setAttribute('autocomplete','off');
    el.setAttribute('inputmode',el.getAttribute('inputmode')||'decimal');
    if(el.dataset.sb5144Bound)return;
    el.dataset.sb5144Bound='1';
    ['pointerdown','mousedown','mouseup','click','dblclick','touchstart','touchend','keydown','keypress','keyup','beforeinput','input'].forEach(function(type){
      el.addEventListener(type,function(ev){
        ev.stopPropagation();
      },true);
    });
    el.addEventListener('click',function(){
      var self=this;
      setTimeout(function(){try{self.focus();}catch(e){}},0);
    });
  });
}
document.addEventListener('focusin',function(e){
  if(e.target&&e.target.closest&&e.target.closest('#sb5143Calc'))e.stopPropagation();
},true);
document.addEventListener('click',function(e){
  if(e.target&&e.target.closest&&e.target.closest('#sb5143Calc input')){
    e.stopPropagation();
    try{e.target.focus();}catch(err){}
  }
},true);
var mo=new MutationObserver(function(){setTimeout(bind,80);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(bind,500);});
setInterval(bind,700);
setTimeout(bind,700);
})();
