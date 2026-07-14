/* Code Labs Footer and V104 Relay V201
   Full protected route. No Code Labs login or separate connection page.
*/
(function(){
'use strict';
var VERSION='V201.1-no-login-v104-relay';
var ROUTES=[
['index','index.html','Home'],['setup','setup.html','Setup'],['project-picker','project-picker.html','Project Picker'],
['file-lab','file-lab.html','File Lab'],['saved-files','saved-files.html','Saved Files'],['rescue-room','rescue-room.html','Rescue Room'],
['packet-builder','packet-builder.html','Packet Builder'],['buddy-canvas','buddy-canvas.html','Buddy Canvas'],['v20','v20.html','Workflow Hub'],
['patch-desk','patch-desk.html','Patch Desk'],['patch-lab','patch-lab.html','Patch Lab'],['preview-test','preview-test.html','Preview + Test'],
['checkpoints','checkpoints.html','Checkpoints'],['repo-desk','repo-desk.html','Repo Desk'],['publish-prep','publish-prep.html','GitHub Writer'],
['github-tracker','github-tracker.html','GitHub Tracker'],['help','help.html','Help + Tools']
];
var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co/functions/v1/code-labs-browser-control';
var PUB='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var SESSION='codeLabsV104BrowserSession',SECRET='codeLabsV104BrowserSecret';
var busy=false,timer=0;
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function stored(k){try{return sessionStorage.getItem(k)||''}catch(e){return''}}
function remember(d){try{sessionStorage.setItem(SESSION,d.session_id||'');sessionStorage.setItem(SECRET,d.browser_secret||stored(SECRET))}catch(e){}}
function clear(){try{sessionStorage.removeItem(SESSION);sessionStorage.removeItem(SECRET)}catch(e){}}
function bridge(){return window.CodeLabsBuddyPageBridgeV140||window.CodeLabsBuddyPageBridge||null}
function snapshot(){var b=bridge();if(!b||!b.readPage)return null;try{return b.readPage()}catch(e){return null}}
function body(action,packet){packet=packet||snapshot()||{};return{action:action,session_id:stored(SESSION),browser_secret:stored(SECRET),page_name:packet.page||page(),page_url:location.href,page_fingerprint:packet.page_fingerprint||'',page_snapshot:packet}}
async function invoke(payload){var r=await fetch(URL,{method:'POST',headers:{apikey:PUB,'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await r.json().catch(function(){return{}});if(!r.ok||data.ok===false)throw new Error(data.error||'V104 browser relay failed');return data}
function changing(c){var t=String(c&&(c.type||c.command)||'').toLowerCase();return t==='write'||t==='write_fields'||t==='write_section'||t==='action'||t==='run_action'||t==='undo'}
function apply(row){var b=bridge(),command=row&&row.command||{};if(!b||!b.applyCommand||!b.readPage)return Promise.resolve({ok:false,error:'Page bridge is not ready'});var current=snapshot()||{};if(changing(command)){var expected=String(command.expected_page_fingerprint||''),actual=String(current.page_fingerprint||'');if(!expected)return Promise.resolve({ok:false,error:'Current page fingerprint required'});if(!actual||expected!==actual)return Promise.resolve({ok:false,error:'Page changed; read it again'})}try{return Promise.resolve(b.applyCommand(command))}catch(e){return Promise.resolve({ok:false,error:String(e.message||e)})}}
async function tick(){if(busy||document.hidden)return;var packet=snapshot();if(!packet)return;busy=true;try{if(!stored(SESSION)||!stored(SECRET)){remember(await invoke(body('create_pairing',packet)));return}await invoke(body('heartbeat',packet));var data=await invoke(body('poll',null));if(data.command){var receipt=await apply(data.command),out=body('receipt',snapshot()||packet);out.command_id=data.command.id;out.receipt=receipt;await invoke(out)}}catch(e){if(/expired|closed|invalid|missing|not found/i.test(String(e.message||e)))clear()}finally{busy=false}}
function start(){clearInterval(timer);tick();timer=setInterval(tick,1800);document.addEventListener('visibilitychange',tick);window.addEventListener('pageshow',tick);window.CodeLabsV104PageRelay={version:VERSION,run:tick,clear:clear}}
function routeIndex(){var id=page();for(var i=0;i<ROUTES.length;i++)if(ROUTES[i][0]===id)return i;return-1}
function addFooter(){var main=q('.main')||q('main');if(!main||q('#clFooterBuddyShellV201'))return;var i=routeIndex();if(i<0)return;var prev=i>0?ROUTES[i-1]:null,next=i<ROUTES.length-1?ROUTES[i+1]:null,f=document.createElement('section');f.id='clFooterBuddyShellV201';f.className='panel';f.innerHTML='<h2>Safe next step</h2><p>The same V104 connector can read this page, write fields, press buttons, read receipts and undo. No Code Labs sign-in page is required.</p><div class="actions">'+(prev?'<a class="btn ghost" href="'+prev[1]+'">Previous: '+prev[2]+'</a>':'')+(next?'<a class="btn primary" href="'+next[1]+'">Next: '+next[2]+'</a>':'')+'<a class="btn ghost" href="help.html">Help + Tools</a></div><p class="fine">'+VERSION+' · one V104 connector · branch and PR only for GitHub writes.</p>';main.appendChild(f)}
function loadBridge(){if(bridge())return;var s=document.createElement('script');s.src='assets/code-labs-buddy-page-bridge-v139.js?v=cl-v201';s.setAttribute('data-cl-buddy-page-bridge-v201','yes');document.head.appendChild(s)}
function run(){loadBridge();addFooter();setTimeout(start,700);return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();setTimeout(run,500);setTimeout(run,1500);
window.CodeLabsFooterBuddyShellV201={version:VERSION,routes:ROUTES,run:run};window.CodeLabsFooterBuddyShellV200=window.CodeLabsFooterBuddyShellV201;
})();
