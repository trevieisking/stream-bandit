/* Code Labs Code God protected-page polish V225. */
(function(){
'use strict';
if(!document.body||document.body.getAttribute('data-page')!=='code-god')return;
var VERSION='V225-protected-page';
var PROJECT_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var PUBLIC_CLIENT_VALUE='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var LINKS=[
['🏠','Home','Start and current repair'],['⚙️','Setup','Project and repository'],['🗂️','Project Picker','Choose saved project'],['📥','File Lab','Load complete source'],['🗃️','Saved Files','Select one saved file'],['🛟','Rescue Room','Problem and preserve rules'],['📦','Packet Builder','Complete repair context'],['🤖','Buddy Canvas','Source and fixed file'],['🧭','Workflow Hub','Choose the safe route'],['🧩','Patch Desk','Review full replacement'],['🧪','Patch Lab','Exact-edit fallback'],['🎯','Preview + Test','Check before GitHub'],['💾','Checkpoints','Rollback and receipts'],['🧾','Repo Desk','Choose repository action'],['⚖️','Code God','Read-only pre-PR review'],['🚀','GitHub Writer','Branch and PR handoff'],['🔎','GitHub Tracker','PR, preview and checks'],['❔','Help + Tools','Guides and specialist tools']
];
function q(s,r){return(r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function decorate(){var nav=q('#cgNav');if(!nav)return false;var anchors=Array.prototype.slice.call(nav.querySelectorAll('a'));if(anchors.length!==LINKS.length)return false;anchors.forEach(function(anchor,index){var item=LINKS[index],icon=q('span',anchor),label=q('div',anchor);anchor.setAttribute('data-step',String(index+1));if(icon)icon.textContent=item[0];if(label)label.innerHTML=String(index+1)+'. '+esc(item[1])+'<small>'+esc(item[2])+'</small>'});nav.setAttribute('data-cl-nav-owner',VERSION);return true}
function loadScript(src,attr){if(q('script['+attr+']'))return Promise.resolve();return new Promise(function(resolve,reject){var script=document.createElement('script');script.src=src;script.setAttribute(attr,'yes');script.onload=resolve;script.onerror=reject;document.head.appendChild(script)})}
function prepareClient(){if(window.CL_SB&&window.CL_SB.auth&&window.CL_SB.functions)return Promise.resolve(window.CL_SB);return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2','data-cl-code-god-session-lib').then(function(){if(!window.supabase||!window.supabase.createClient)throw new Error('Code Labs session library did not load.');var client=window.supabase.createClient(PROJECT_URL,PUBLIC_CLIENT_VALUE,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});window.CL_SB={auth:{getSession:function(){return client.auth.getSession()}},functions:{invoke:function(name,options){return client.functions.invoke(name,options)}}};return window.CL_SB})}
function loadGuide(){return prepareClient().then(function(){return loadScript('assets/code-labs-sol-guide-v220.js?v=cl-v225-ask-chatgpt-code-god','data-cl-code-god-chatgpt-guide')}).catch(function(){})}
function boot(){[0,80,220,600,1200].forEach(function(delay){window.setTimeout(decorate,delay)});loadGuide();window.CodeLabsCodeGodPolishV222={version:VERSION,decorate:decorate}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();