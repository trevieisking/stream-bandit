/* Code Labs V287 visible-step route-union registry and scoped helper loader. */
(function(){
'use strict';
var VERSION='V287-live-proof-route-union-registry',CACHE='cl-v287-live-proof-route-union-registry';
var root=document.documentElement,revealTimer=0,loaded={};

function freezeRoute(route){route.families=Object.freeze((route.families||[]).slice());return Object.freeze(route)}
var ROUTES=Object.freeze([
 freezeRoute({id:'index',file:'index.html',icon:'🏠',label:'Home',description:'Start and current repair',kind:'entry',nav:true,step:1,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'setup',file:'setup.html',icon:'⚙️',label:'Master Plan + Setup',description:'Plan, project and repository',kind:'workflow',nav:true,step:2,families:['shared','standard'],buddyBridgeMode:'draft_fields'}),
 freezeRoute({id:'project-picker',file:'project-picker.html',icon:'🗂️',label:'Project Picker',description:'Choose saved project',kind:'workflow',nav:true,step:3,families:['shared','standard'],buddyBridgeMode:'draft_fields'}),
 freezeRoute({id:'file-lab',file:'file-lab.html',icon:'📥',label:'File Lab',description:'Load complete source',kind:'workflow',nav:true,step:4,families:['shared','standard','forwardSave','source'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'saved-files',file:'saved-files.html',icon:'🗃️',label:'Saved Files',description:'Select one saved file',kind:'workflow',nav:true,step:5,families:['shared','standard','forwardSave','source'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'rescue-room',file:'rescue-room.html',icon:'🛟',label:'Rescue Room',description:'Problem and preserve rules',kind:'workflow',nav:true,step:6,families:['shared','standard','forwardSave','source'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'packet-builder',file:'packet-builder.html',icon:'📦',label:'Packet Builder',description:'Complete repair context',kind:'workflow',nav:true,step:7,families:['shared','standard','forwardSave','source'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'buddy-canvas',file:'buddy-canvas.html',icon:'🤖',label:'Buddy Canvas',description:'Source and fixed file',kind:'workflow',nav:true,step:8,families:['shared','standard','forwardSave'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'v20',file:'v20.html',icon:'🧭',label:'Workflow Hub',description:'Choose the safe route',kind:'workflow',nav:true,step:9,families:['shared','standard','forwardSave'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'patch-desk',file:'patch-desk.html',icon:'🧩',label:'Patch Desk',description:'Review full replacement',kind:'workflow',nav:true,step:10,families:['shared','standard','forwardSave'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'patch-lab',file:'patch-lab.html',icon:'🧪',label:'Patch Lab',description:'Exact-edit fallback',kind:'workflow',nav:true,step:11,families:['shared','standard','forwardSave'],buddyBridgeMode:'assisted_page_fields'}),
 freezeRoute({id:'preview-test',file:'preview-test.html',icon:'🎯',label:'Preview + Test',description:'Check before GitHub',kind:'workflow',nav:true,step:12,families:['shared','standard','forwardSave'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'checkpoints',file:'checkpoints.html',icon:'💾',label:'Checkpoints',description:'Rollback and receipts',kind:'workflow',nav:true,step:13,families:['shared','standard','forwardSave'],buddyBridgeMode:'protected_action_only'}),
 freezeRoute({id:'repo-desk',file:'repo-desk.html',icon:'🧾',label:'Repo Desk',description:'Choose repository action',kind:'workflow',nav:true,step:14,families:['shared','standard','forwardSave'],buddyBridgeMode:'protected_action_only'}),
 freezeRoute({id:'cg-repair-lab',file:'cg-repair-lab.html',icon:'🧠',label:'CG Repair Lab',description:'Code Labs Pro analysis',kind:'workflow',nav:true,step:15,families:['shared','specialReview'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'code-god',file:'code-god.html',icon:'⚖️',label:'Code God',description:'Deterministic final review',kind:'workflow',nav:true,step:16,families:['shared','specialReview'],buddyBridgeMode:'protected_action_only'}),
 freezeRoute({id:'publish-prep',file:'publish-prep.html',icon:'🚀',label:'GitHub Writer',description:'Branch and PR handoff',kind:'workflow',nav:true,step:17,families:['shared','standard','forwardSave'],buddyBridgeMode:'protected_action_only'}),
 freezeRoute({id:'github-tracker',file:'github-tracker.html',icon:'🔎',label:'GitHub Tracker',description:'PR, preview and checks',kind:'workflow',nav:true,step:18,families:['shared','standard','forwardSave'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'checklist-builder',file:'checklist-builder.html',icon:'✅',label:'Master Plan Checklist',description:'Final exact-plan checklist',kind:'workflow',nav:true,step:19,families:['shared'],buddyBridgeMode:'draft_fields'}),
 freezeRoute({id:'help',file:'help.html',icon:'❔',label:'Help + Tools',description:'Guides and specialist tools',kind:'support',nav:true,step:null,families:['shared','standard'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'connection-guide',file:'connection-guide.html',label:'Connection Guide',kind:'support',nav:false,step:null,families:['shared','standard'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'read-only-proof',file:'read-only-proof.html',label:'Read-only Proof',kind:'support',nav:false,tool:true,step:null,families:['shared','standard'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'helper-route-map',file:'helper-route-map.html',label:'Route Scanner',kind:'support',nav:false,tool:true,step:null,families:['shared','standard'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'faq',file:'faq.html',label:'FAQ',kind:'support',nav:false,tool:true,step:null,families:['shared','standard'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'about',file:'about.html',label:'About Code Labs',kind:'support',nav:false,tool:true,step:null,families:['shared','standard'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'ai-handoff',file:'ai-handoff.html',label:'AI Handoff',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'fix-wizard',file:'fix-wizard.html',label:'Fix Wizard',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'draft_fields'}),
 freezeRoute({id:'start-guide',file:'start-guide.html',label:'Start Guide',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'context-packet',file:'context-packet.html',label:'Context Packet',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'connector-status',file:'connector-status.html',label:'Connector Status',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'chatgpt-connection',file:'chatgpt-connection.html',label:'ChatGPT Connection',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'repair-bridge-status',file:'repair-bridge-status.html',label:'Repair Bridge Status',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'owner-read-proof',file:'owner-read-proof.html',label:'Owner Read Proof',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'oauth-discovery',file:'oauth-discovery.html',label:'OAuth Discovery',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'oauth-flow-test',file:'oauth-flow-test.html',label:'OAuth Flow Test',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'app-reader-test',file:'app-reader-test.html',label:'App Reader Test',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'url-reader-test',file:'url-reader-test.html',label:'URL Reader Test',kind:'support',nav:false,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'buddy-canvas-receipt-v115',file:'buddy-canvas-receipt-v115.html',label:'Buddy Canvas Receipt',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'read_only_context'}),
 freezeRoute({id:'chatgpt-buddy-tools',file:'chatgpt-buddy-tools.html',label:'Buddy Tools',description:'Assistant utilities and bounded local helpers',kind:'support',nav:false,tool:true,step:null,families:['shared'],buddyBridgeMode:'read_only_context'})
]);

var BY_ID=Object.freeze(ROUTES.reduce(function(index,route){index[route.id]=route;return index},{}));
var NAV_ROUTES=Object.freeze(ROUTES.filter(function(route){return route.nav}));
var WORKFLOW_ROUTES=Object.freeze(ROUTES.filter(function(route){return route.kind==='workflow'}));
var SUPPORT_ROUTES=Object.freeze(ROUTES.filter(function(route){return route.kind==='support'}));
var TOOL_ROUTES=Object.freeze(ROUTES.filter(function(route){return route.tool===true}));
var NAV_GROUPS=Object.freeze({entry:Object.freeze(NAV_ROUTES.filter(function(route){return route.kind==='entry'})),workflow:WORKFLOW_ROUTES,support:Object.freeze(NAV_ROUTES.filter(function(route){return route.kind==='support'})),tools:TOOL_ROUTES});
var FIRST_ROUTES=Object.freeze(NAV_ROUTES.map(function(route){return Object.freeze([route.file,route.icon||'',route.label,route.description||''])}));

function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function route(id){return BY_ID[id]||null}
function workflowIndex(id){for(var i=0;i<WORKFLOW_ROUTES.length;i+=1)if(WORKFLOW_ROUTES[i].id===id)return i;return-1}
function next(id){var index=workflowIndex(id);return index>=0&&WORKFLOW_ROUTES[index+1]?WORKFLOW_ROUTES[index+1]:null}
function previous(id){var index=workflowIndex(id);return index>0?WORKFLOW_ROUTES[index-1]:null}
function hasFamily(id,family){var item=route(id);return!!(item&&item.families.indexOf(family)>=0)}
function familyIds(family){return ROUTES.filter(function(item){return item.families.indexOf(family)>=0}).map(function(item){return item.id})}
function q(selector,scope){return(scope||document).querySelector(selector)}
function esc(value){return String(value==null?'':value).replace(/[<>"'&]/g,function(character){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]})}
function pathOf(source){try{return new URL(source,document.baseURI).pathname}catch(error){return String(source||'').split('?')[0]}}
function scriptFor(source){var path=pathOf(source);return Array.prototype.slice.call(document.scripts).find(function(script){return pathOf(script.getAttribute('src')||'')===path})||null}
function load(source,attribute){var path=pathOf(source);if(loaded[path])return loaded[path];var existing=scriptFor(source);if(existing){loaded[path]=Promise.resolve(existing);return loaded[path]}loaded[path]=new Promise(function(resolve,reject){var script=document.createElement('script');script.async=false;script.src=source;if(attribute)script.setAttribute(attribute,'yes');script.addEventListener('load',function(){resolve(script)},{once:true});script.addEventListener('error',function(){delete loaded[path];reject(new Error('Code Labs helper failed to load: '+path))},{once:true});document.head.appendChild(script)});return loaded[path]}
function loadMany(items){return Promise.all(items.map(function(item){return load(item[0],item[1])}))}
function firstNav(){var nav=q('.nav');if(!nav)return false;var current=page();nav.innerHTML=NAV_ROUTES.map(function(item){var active=current===item.id,label=item.step===null?item.label:item.step+'. '+item.label;return'<a'+(active?' class="active"':'')+' href="'+esc(item.file)+'"'+(item.step===null?'':' data-step="'+item.step+'"')+'><span>'+esc(item.icon||'•')+'</span><div>'+esc(label)+'<small>'+esc(item.description||'')+'</small></div></a>'}).join('');nav.setAttribute('data-cl-nav-owner','cl-nav-v287');nav.setAttribute('data-cl-route-registry-owner','cl-nav-v287');nav.setAttribute('aria-label','Code Labs canonical workflow');return true}
function reserveTabs(){var main=q('.main')||q('main'),top=main&&q(':scope>.topbar',main),hero=main&&q(':scope>.hero',main);if(!main||!top||q('#clProductTabsV227',main))return false;var tabs=document.createElement('div');tabs.id='clProductTabsV227';tabs.setAttribute('data-cl-tabs-placeholder-v287','yes');tabs.setAttribute('aria-hidden','true');tabs.style.minHeight='92px';tabs.style.margin='0 0 14px';tabs.style.overflow='hidden';if(hero&&hero.parentNode===main)main.insertBefore(tabs,hero);else top.insertAdjacentElement('afterend',tabs);return true}
function earlyStyle(){if(q('#clShellLoaderV287Style'))return;var style=document.createElement('style');style.id='clShellLoaderV287Style';style.textContent='html[data-cl-shell-booting="v287"] .nav:not([data-cl-nav-owner="cl-nav-v287"]){visibility:hidden!important}html[data-cl-shell-booting="v287"] .main>:not(.topbar):not(.hero):not(#clProductTabsV227):not(script):not(style),html[data-cl-shell-booting="v287"] main>:not(.topbar):not(.hero):not(#clProductTabsV227):not(script):not(style){visibility:hidden!important}';document.head.appendChild(style)}
function reveal(){root.removeAttribute('data-cl-shell-booting');if(revealTimer){window.clearTimeout(revealTimer);revealTimer=0}}
function sharedShell(){return loadMany([['assets/code-labs-header-shell-v235.js?v='+CACHE,'data-cl-header-shell-v287'],['assets/code-labs-page-tabs-v235.js?v='+CACHE,'data-cl-page-tabs-v287'],['assets/code-labs-page-runtime-v235.js?v='+CACHE,'data-cl-page-runtime-v287'],['assets/code-labs-buddy-bridge-tab-v264.js?v='+CACHE,'data-cl-buddy-bridge-tab-v287'],['assets/code-labs-workbench-polish-v228.js?v='+CACHE,'data-cl-workbench-v287'],['assets/code-labs-start-family-v251.js?v='+CACHE,'data-cl-start-family-v287']])}
function standardCore(current){if(!hasFamily(current,'standard'))return Promise.resolve([]);var items=[['assets/code-labs-setup-route-v145.js?v='+CACHE,'data-cl-setup-route-v287'],['assets/code-labs-workflow-clarity-v130.js?v='+CACHE,'data-cl-workflow-clarity-v287'],['assets/code-labs-save-language-v132.js?v=cl-save-language-v132','data-cl-save-language-v287'],['assets/code-labs-workflow-guard-v138.js?v='+CACHE,'data-cl-workflow-guard-v287'],['assets/code-labs-page-completion-v139.js?v='+CACHE,'data-cl-page-completion-v287'],['assets/code-labs-buddy-page-bridge-v139.js?v=cl-v140-full-page-write','data-cl-buddy-page-bridge-v287'],['assets/code-labs-footer-buddy-shell-v200.js?v='+CACHE,'data-cl-footer-shell-v287'],['assets/code-labs-page-compat-v235.js?v=cl-v235','data-cl-page-compat-v287'],['assets/code-labs-product-shortcut-compat-v227.js?v=cl-v227-helpdesk-shortcuts','data-cl-product-shortcuts-v287']];if(hasFamily(current,'source'))items.push(['assets/code-labs-source-family-v252.js?v='+CACHE,'data-cl-source-family-v287']);return loadMany(items)}
function forwardSaveStack(current){if(!hasFamily(current,'forwardSave'))return Promise.resolve([]);var items=[['assets/code-labs-current-file-overwrite-v201.js?v=cl-v2024-submit-chain','data-cl-current-file-overwrite-v287'],['assets/code-labs-history-overwrite-compat-v201.js?v=cl-v2023-restored','data-cl-history-compat-v287']];if(current==='saved-files')items.push(['assets/code-labs-saved-files-repo-puller-v201.js?v=cl-v2023-restored','data-cl-repo-puller-v287']);return loadMany(items)}
function run(){var current=page(),currentRoute=route(current);firstNav();if(currentRoute&&currentRoute.kind==='entry'){reveal();return Promise.resolve({ok:true,version:VERSION,page:current,mode:'navigation-only'})}reserveTabs();return Promise.all([sharedShell(),standardCore(current),forwardSaveStack(current)]).then(function(){reveal();return{ok:true,version:VERSION,page:current}}).catch(function(error){console.error(error);reveal();return{ok:false,version:VERSION,page:current,error:String(error&&error.message||error)}})}

var registry=Object.freeze({version:VERSION,owner:'code-labs/assets/cl-nav.js',routes:ROUTES,byId:BY_ID,navRoutes:NAV_ROUTES,workflowRoutes:WORKFLOW_ROUTES,supportRoutes:SUPPORT_ROUTES,toolRoutes:TOOL_ROUTES,navGroups:NAV_GROUPS,firstRoutes:FIRST_ROUTES,route:route,next:next,previous:previous,workflowIndex:workflowIndex,hasFamily:hasFamily,familyIds:familyIds,page:page,renderNav:firstNav});
var currentRoute=route(page());
root.setAttribute('data-cl-shell-loader','v287');
root.setAttribute('data-cl-route-registry-owner','cl-nav-v287');
if(!(currentRoute&&currentRoute.kind==='entry')){
 root.setAttribute('data-cl-shell-booting','v287');
 earlyStyle();
}
window.CodeLabsWorkflowRegistry=registry;
window.CodeLabsNavGroups=NAV_GROUPS;
window.CodeLabsFirstRoutes=FIRST_ROUTES;
window.CodeLabsShellLoaderV235={version:VERSION,run:run,firstNav:firstNav,reserveTabs:reserveTabs,load:load,page:page,registry:registry,families:{standard:familyIds('standard'),forwardSave:familyIds('forwardSave'),source:familyIds('source'),specialReview:familyIds('specialReview'),buddyBridgeModes:Object.freeze(ROUTES.reduce(function(map,item){map[item.id]=item.buddyBridgeMode;return map},{}))}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){var current=route(page());firstNav();if(!(current&&current.kind==='entry'))reserveTabs()},{once:true});
run();
if(!(currentRoute&&currentRoute.kind==='entry'))revealTimer=window.setTimeout(reveal,5000);
})();
