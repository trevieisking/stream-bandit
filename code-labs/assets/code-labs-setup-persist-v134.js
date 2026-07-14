/* Code Labs Setup Persist V202 - bounded, page-first and non-blocking. */
(function(){
'use strict';
var KEY='codeLabsV1State',VERSION='V202.1-bounded-setup-persist',IDS=['workspace','siteName','siteUrl','repo','mode','notes'],timer=0,attempts=0,bound=false;
function q(s){return document.querySelector(s)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}));return true}catch(e){return false}}
function val(id){var e=q('#'+id);return e?String(e.value||''):''}
function set(id,v){var e=q('#'+id);if(e&&String(e.value||'')!==String(v||''))e.value=String(v||'')}
function status(text,kind){var e=q('#clSetupPersistStatus');if(!e){var p=q('.panel');if(!p)return;e=document.createElement('span');e.id='clSetupPersistStatus';e.className='badge';var w=document.createElement('p');w.appendChild(e);p.insertBefore(w,p.firstChild)}e.className='badge '+(kind||'warn');e.textContent=text}
function collect(){return{workspace:val('workspace'),siteName:val('siteName'),siteUrl:val('siteUrl'),repo:val('repo'),mode:val('mode')||'manual',notes:val('notes')}}
function save(reason){var s=read(),v=collect();s.project=Object.assign({},s.project||{},v,{setupWorkspace:v.workspace,setupSiteName:v.siteName,setupSiteUrl:v.siteUrl,setupRepo:v.repo,savedAt:new Date().toISOString(),setupPersistVersion:VERSION});write(s);status(reason==='button'?'Setup saved':'Setup auto-saved','good');return s}
function schedule(){clearTimeout(timer);status('Saving setup…','warn');timer=setTimeout(function(){save('auto')},500)}
function restore(){var p=(read().project||{});set('workspace',p.setupWorkspace||p.workspace||'');set('siteName',p.setupSiteName||p.siteName||'');set('siteUrl',p.setupSiteUrl||p.siteUrl||'');set('repo',p.setupRepo||p.repo||'');set('mode',p.mode||'manual');set('notes',p.notes||'');status('Setup ready','good')}
function bind(){if(bound||!document.body||document.body.getAttribute('data-page')!=='setup')return;if(!IDS.every(function(id){return!!q('#'+id)})){attempts++;if(attempts<25)setTimeout(bind,120);else status('Setup controls could not load. Refresh this page once.','bad');return}bound=true;restore();IDS.forEach(function(id){var e=q('#'+id);e.addEventListener('input',schedule);e.addEventListener('change',schedule)});var b=q('#saveSetup');if(b)b.addEventListener('click',function(){clearTimeout(timer);setTimeout(function(){save('button')},20)});window.CodeLabsSetupPersistV202={version:VERSION,read:function(){return read().project||{}},save:function(){return save('manual')},restore:restore}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
