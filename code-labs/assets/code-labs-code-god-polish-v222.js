/* Code Labs Code God protected-page polish V227. */
(function(){
'use strict';
if(!document.body||document.body.getAttribute('data-page')!=='code-god')return;
var VERSION='V227-protected-page';
var LINKS=[
['🏠','Home','Start and current repair'],['⚙️','Setup','Project and repository'],['🗂️','Project Picker','Choose saved project'],['📥','File Lab','Load complete source'],['🗃️','Saved Files','Select one saved file'],['🛟','Rescue Room','Problem and preserve rules'],['📦','Packet Builder','Complete repair context'],['🤖','Buddy Canvas','Source and fixed file'],['🧭','Workflow Hub','Choose the safe route'],['🧩','Patch Desk','Review full replacement'],['🧪','Patch Lab','Exact-edit fallback'],['🎯','Preview + Test','Check before GitHub'],['💾','Checkpoints','Rollback and receipts'],['🧾','Repo Desk','Choose repository action'],['⚖️','Code God','Read-only pre-PR review'],['🚀','GitHub Writer','Branch and PR handoff'],['🔎','GitHub Tracker','PR, preview and checks'],['❔','Help + Tools','Guides and specialist tools']
];
function q(s,r){return(r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function decorate(){var nav=q('#cgNav');if(!nav)return false;var anchors=Array.prototype.slice.call(nav.querySelectorAll('a'));if(anchors.length!==LINKS.length)return false;anchors.forEach(function(anchor,index){var item=LINKS[index],icon=q('span',anchor),label=q('div',anchor);anchor.setAttribute('data-step',String(index+1));if(icon)icon.textContent=item[0];if(label)label.innerHTML=String(index+1)+'. '+esc(item[1])+'<small>'+esc(item[2])+'</small>'});nav.setAttribute('data-cl-nav-owner',VERSION);return true}
function boot(){[0,80,220,600,1200].forEach(function(delay){window.setTimeout(decorate,delay)});window.CodeLabsCodeGodPolishV222={version:VERSION,decorate:decorate}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
