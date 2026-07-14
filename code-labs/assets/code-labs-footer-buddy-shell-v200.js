/* Code Labs Footer and V104 Relay V203
   One shared V104 browser session and one focused-page command owner.
*/
(function(){
'use strict';
if(location.hostname==='www.chatterfriendsstreambandit.co.uk'){location.replace('https://chatterfriendsstreambandit.co.uk'+location.pathname+location.search+location.hash);return}
var VERSION='V203.1-shared-focused-v104-relay';
var ROUTES=[
['index','index.html','Home'],['setup','setup.html','Setup'],['project-picker','project-picker.html','Project Picker'],
['file-lab','file-lab.html','File Lab'],['saved-files','saved-files.html','Saved Files'],['rescue-room','rescue-room.html','Rescue Room'],
['packet-builder','packet-builder.html','Packet Builder'],['buddy-canvas','buddy-canvas.html','Buddy Canvas'],['v20','v20.html','Workflow Hub'],
['patch-desk','patch-desk.html','Patch Desk'],['patch-lab','patch-lab.html','Patch Lab'],['preview-test','preview-test.html','Preview + Test'],
['checkpoints','checkpoints.html','Checkpoints'],['repo-desk','repo-desk.html','Repo Desk'],['publish-prep','publish-prep.html','GitHub Writer'],
['github-tracker','github-tracker.html','GitHub Tracker'],['help','help.html','Help + Tools']
];
var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co/functions/v1/code-labs-browser-control';
var SESSION='codeLabsV104BrowserSession',SECRET='codeLabsV104BrowserSecret',ACTIVE='codeLabsV104ActivePage';
var TAB='cl-'+Date.now()+'-'+Math.random().toString(36).slice(2),LEASE=7000;
var busy=false,timer=0,started=false,listeners=false,lastError='',retryAfter=0;
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function stored(k){try{return localStorage.getItem(k)||''}catch(e){return''}}
function put(k,v){try{localStorage.setItem(k,String(v||''));return true}catch(e){return false}}
function remove(k){try{localStorage.removeItem(k)}catch(e){}}
function remember(d){put(SESSION,d.session_id||'');put(SECRET,d.browser_secret||stored(SECRET));lastError=''}
function clear(){remove(SESSION);remove(SECRET)}
function active(){try{return JSON.parse(stored(ACTIVE)||'{}')||{}}catch(e){return{}}}
function claim(){if(document.hidden)return false;put(ACTIVE,JSON.stringify({tab:TAB,expires:Date.now()+LEASE,page:page(),url:location.href}));return true}
function leader(){var a=active();if(a.tab===TAB&&Number(a.expires||0)>Date.now())return true;if(!document.hidden&&(document.hasFocus?document.hasFocus():true))return claim();return false}
function bridge(){return window.CodeLabsBuddyPageBridgeV140||window.CodeLabsBuddyPageBridge||null}
function snapshot(){var b=bridge();if(!b||!b.readPage)return null;try{return b.readPage()}catch(e){return null}}
function body(action,packet){packet=packet||snapshot()||{};return{action:action,session_id:stored(SESSION),browser_secret:stored(SECRET),page_name:packet.page||page(),page_url:location.href,page_fingerprint:packet.page_fingerprint||'',page_snapshot:packet}}
async function invoke(payload){var r=await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),text=await r.text(),data={};try{data=JSON.parse(text||'{}')}catch(e){data={ok:false,error:text}}if(!r.ok||data.ok===false)throw new Error(data.error||'V104 browser relay failed');return data}
function changing(c){var t=String(c&&(c.type||c.command)||'').toLowerCase();return t==='write'||t==='write_fields'||t==='write_section'||t==='action'||t==='run_action'||t==='undo'}
function apply(row){var b=bridge(),command=row&&row.command||{};if(!b||!b.applyCommand||!b.readPage)return Promise.resolve({ok:false,error:'Page bridge is not ready'});var current=snapshot()||{};if(changing(command)){var expected=String(command.expected_page_fingerprint||''),actual=String(current.page_fingerprint||'');if(!expected)return Promise.resolve({ok:false,error:'Current page fingerprint required'});if(!actual||expected!==actual)return Promise.resolve({ok:false,error:'Page changed; read it again'})}try{return Promise.resolve(b.applyCommand(command))}catch(e){return Promise.resolve({ok:false,error:String(e.message||e)})}}
function invalidSession(message){return /(browser session details are missing|session is not valid|session expired|status.*closed)/i.test(String(message||''))}
async function tick(){if(busy||document.hidden||Date.now()<retryAfter||!leader())return;var packet=snapshot();if(!packet)return;busy=true;claim();try{if(!stored(SESSION)||!stored(SECRET)){remember(await invoke(body('create_pairing',packet)));return}await invoke(body('heartbeat',packet));var data=await invoke(body('poll',packet));if(data.command){var receipt=await apply(data.command),out=body('receipt',snapshot()||packet);out.command_id=data.command.id;out.receipt=receipt;await invoke(out)}lastError='';retryAfter=0}catch(e){lastError=String(e.message||e);if(invalidSession(lastError)){clear();retryAfter=Date.now()+1000}else retryAfter=Date.now()+5000}finally{busy=false}}
function onActive(){claim();tick()}
function start(){if(started)return;started=true;claim();tick();timer=setInterval(tick,2200);if(!listeners){listeners=true;document.addEventListener('visibilitychange',function(){if(!document.hidden)onActive()});window.addEventListener('pageshow',onActive);window.addEventListener('focus',onActive);document.addEventListener('pointerdown',claim,{passive:true});window.addEventListener('storage',function(e){if(e.key===SESSION||e.key===SECRET||e.key===ACTIVE)tick()})}window.CodeLabsV104PageRelay={version:VERSION,run:tick,claim:claim,clear:clear,status:function(){var a=active();return{started:started,session:!!stored(SESSION),page:page(),leader:a.tab===TAB,last_error:lastError}}}}
function routeIndex(){var id=page();for(var i=0;i<ROUTES.length;i++)if(ROUTES[i][0]===id)return i;return-1}
function addFooter(){var main=q('.main')||q('main');if(!main||q('#clFooterBuddyShellV201'))return;var i=routeIndex();if(i<0)return;var prev=i>0?ROUTES[i-1]:null,next=i<ROUTES.length-1?ROUTES[i+1]:null,f=document.createElement('section');f.id='clFooterBuddyShellV201';f.className='panel';f.innerHTML='<h2>Safe next step</h2><p>V104 can read this focused page, write approved fields, press approved buttons, return receipts and undo the latest page-field write.</p><div class="actions">'+(prev?'<a class="btn ghost" href="'+prev[1]+'">Previous: '+prev[2]+'</a>':'')+(next?'<a class="btn primary" href="'+next[1]+'">Next: '+next[2]+'</a>':'')+'<a class="btn ghost" href="help.html">Help + Tools</a></div><p class="fine">'+VERSION+' · one shared V104 connector · GitHub writes remain branch and pull request only.</p>';main.appendChild(f)}
function loadBridge(){if(bridge()||q('script[data-cl-buddy-page-bridge-v203]'))return;var s=document.createElement('script');s.src='assets/code-labs-buddy-page-bridge-v139.js?v=cl-v203-1';s.setAttribute('data-cl-buddy-page-bridge-v203','yes');s.onload=start;document.head.appendChild(s)}
function run(){addFooter();if(bridge())start();else loadBridge();return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.CodeLabsFooterBuddyShellV203={version:VERSION,routes:ROUTES,run:run};window.CodeLabsFooterBuddyShellV202=window.CodeLabsFooterBuddyShellV203;window.CodeLabsFooterBuddyShellV201=window.CodeLabsFooterBuddyShellV203;window.CodeLabsFooterBuddyShellV200=window.CodeLabsFooterBuddyShellV203;
})();
