/* Code Labs Setup Persist V135
   Keeps Setup fields remembered as the user types and when Save is clicked.
   Preserves the independently configured Setup repository for local-file isolation.
   Browser/local state only. No GitHub write. No Supabase schema/RLS change.
*/
(function(){
'use strict';
var KEY='codeLabsV1State';
var VERSION='V135 setup repo persist';
var IDS=['workspace','siteName','siteUrl','repo','mode','notes'];
var timer=null;
function q(s){return document.querySelector(s)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}));return true}catch(e){return false}}
function now(){return new Date().toISOString()}
function val(id){var e=q('#'+id);return e?String(e.value||''):''}
function set(id,v){var e=q('#'+id);if(e&&String(e.value||'')!==String(v||''))e.value=String(v||'')}
function toast(m){var t=q('#toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},1800)}else{console.log(m)}}
function collect(){return{workspace:val('workspace'),siteName:val('siteName'),siteUrl:val('siteUrl'),repo:val('repo'),mode:val('mode')||'manual',notes:val('notes')}}
function restore(){var s=read(),p=s.project||{};IDS.forEach(function(id){if(Object.prototype.hasOwnProperty.call(p,id))set(id,p[id])});status('Setup remembered','good')}
function save(reason){var s=read(),p=collect();s.project=Object.assign({},s.project||{},p);s.project.setupRepo=p.repo;s.project.savedAt=now();s.project.setupPersistVersion=VERSION;s.log=Array.isArray(s.log)?s.log:[];s.log.unshift({id:'cl_setup_'+Date.now(),date:new Date().toLocaleString(),msg:'Setup saved: '+(reason||'auto')});s.log=s.log.slice(0,80);write(s);status(reason==='button'?'Setup saved':'Setup auto-saved','good');return s}
function status(m,kind){var e=q('#clSetupPersistStatus');if(!e){var panel=q('.panel')||q('main');if(panel){e=document.createElement('span');e.id='clSetupPersistStatus';e.className='badge warn';var wrap=document.createElement('p');wrap.appendChild(e);panel.insertBefore(wrap,panel.firstChild)}}if(e){e.className='badge '+(kind||'warn');e.textContent=m}}
function schedule(){clearTimeout(timer);status('Saving setup...','warn');timer=setTimeout(function(){save('auto')},450)}
function bind(){if(document.body&&document.body.getAttribute('data-page')!=='setup')return;var ready=IDS.every(function(id){return!!q('#'+id)});if(!ready){setTimeout(bind,220);return}restore();IDS.forEach(function(id){var e=q('#'+id);if(e&&!e.getAttribute('data-cl-setup-persist')){e.setAttribute('data-cl-setup-persist','yes');e.addEventListener('input',schedule);e.addEventListener('change',schedule)}});var btn=q('#saveSetup');if(btn&&!btn.getAttribute('data-cl-setup-save-bound')){btn.setAttribute('data-cl-setup-save-bound','yes');btn.addEventListener('click',function(){setTimeout(function(){save('button');toast('Setup saved and remembered.')},30)})}window.CodeLabsSetupPersistV134={version:VERSION,read:function(){return(read().project||{})},save:function(){return save('manual')},restore:restore}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
