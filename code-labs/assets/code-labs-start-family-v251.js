/* Code Labs Start Family V257 - canonical 19-route navigation check. */
(function(){
'use strict';
var PAGE=(document.body&&document.body.getAttribute('data-page'))||'';
if(['index','setup','project-picker'].indexOf(PAGE)<0)return;
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function add(n,c){if(n)n.classList.add(c)}
function restoreNav(){var nav=q('.nav');if(!nav||!window.CodeLabsShellLoaderV235||!window.CodeLabsShellLoaderV235.firstNav)return;var links=all('a[href]',nav);if(links.length!==19)window.CodeLabsShellLoaderV235.firstNav()}
function heading(n){var h=q('h2,h3',n);return String(h&&h.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function markByHeading(main,name,cls){all(':scope>section,:scope>.panel',main).forEach(function(n){if(heading(n)===name)add(n,cls)})}
function home(main){document.body.classList.add('clStartHomeV251');add(q('#clV36Home',main)||q('.hero',main),'clStartHeroV251');markByHeading(main,'current repair state','clStartSummaryV251');markByHeading(main,'what code labs is for','clStartPurposeV251');markByHeading(main,'how to work with code labs now','clStartStepsV251');markByHeading(main,'best next clicks','clStartActionsV251')}
function setup(main){document.body.classList.add('clStartSetupV251');var field=q('#workspace',main),panel=field&&field.closest('section,.panel');add(panel,'clStartSetupPanelV251');add(panel&&q('.notice',panel),'clStartInlineHelpV251');add(panel&&q('.actions',panel),'clStartPrimaryActionsV251')}
function picker(main){document.body.classList.add('clStartPickerV251');var cards=all('.card',main).filter(function(card){return q('h3',card)});if(cards.length<3)return;var grid=cards[0].parentElement;add(grid,'clStartPickerGridV251');cards.forEach(function(card,i){add(card,i===0?'clStartRecommendedV251':'clStartSecondaryV251')});var hero=q('.hero',main),desc=hero&&q('p',hero),steps=hero&&all('li',hero);if(desc&&/future connector layers/i.test(desc.textContent||''))desc.textContent='Choose how to begin. The browser lane starts here; GitHub and Supabase work stays in the reviewed Code Labs tool workflow.';if(steps[2]&&/what comes later/i.test(steps[2].textContent||''))steps[2].textContent='Use the guidance cards to understand the reviewed GitHub and saved-context lanes.';cards.forEach(function(card){var h=q('h3',card),p=q('p',card),a=q('.actions a',card),t=String(h&&h.textContent||'');if(t==='GitHub project'){h.textContent='GitHub handoff';if(p)p.textContent='Later, use Repo Desk, Code God and GitHub Writer to prepare a reviewed branch and pull request.';if(a)a.textContent='View guidance'}if(t==='Supabase saved project'){h.textContent='Saved backend context';if(p)p.textContent='V104 Tool-Only works with the selected owner-scoped Code Labs records without creating duplicate project rows.';if(a)a.textContent='View guidance'}})}
function style(){if(q('#clStartFamilyV251Style'))return;var s=document.createElement('style');s.id='clStartFamilyV251Style';s.textContent=[
'body.clStartFamilyV251 .clStartHeroV251 .actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));align-items:stretch}',
'body.clStartFamilyV251 .clStartHeroV251 .actions .btn{width:100%;white-space:normal}',
'body.clStartFamilyV251 .clStartSummaryV251 .grid3{grid-template-columns:repeat(3,minmax(0,1fr))}',
'body.clStartFamilyV251 .clStartSummaryV251 .stat{padding:12px}',
'body.clStartFamilyV251 .clStartSummaryV251 .stat span{display:block;font-size:18px;line-height:1.25;overflow-wrap:anywhere}',
'body.clStartHomeV251 .clStartPurposeV251 .grid3{gap:10px}',
'body.clStartHomeV251 .clStartPurposeV251 .item{height:100%}',
'body.clStartHomeV251 .clStartStepsV251 .grid{grid-template-columns:repeat(3,minmax(0,1fr))}',
'body.clStartHomeV251 .clStartStepsV251 .step{min-height:0}',
'body.clStartHomeV251 .clStartActionsV251 .actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}',
'body.clStartHomeV251 .clStartActionsV251 .btn{width:100%;white-space:normal}',
'body.clStartSetupV251 .clStartSetupPanelV251{width:min(100%,1100px);margin-left:auto;margin-right:auto}',
'body.clStartSetupV251 .clStartSetupPanelV251 .fieldRow{gap:10px}',
'body.clStartSetupV251 .clStartInlineHelpV251{margin-top:10px;margin-bottom:0}',
'body.clStartSetupV251 .clStartPrimaryActionsV251{margin-top:14px;padding-top:14px!important;border-top:1px solid var(--line)}',
'body.clStartSetupV251 .clStartPrimaryActionsV251 .btn{min-width:180px}',
'body.clStartPickerV251 .clStartPickerGridV251{grid-template-columns:minmax(280px,1.25fr) repeat(2,minmax(220px,.85fr));align-items:stretch}',
'body.clStartPickerV251 .clStartPickerGridV251 .card{height:100%;position:relative}',
'body.clStartPickerV251 .clStartRecommendedV251{padding-top:46px!important;border-color:color-mix(in srgb,var(--brand) 55%,var(--line))!important;background:linear-gradient(145deg,color-mix(in srgb,var(--panel) 88%,var(--brand) 12%),var(--panel))!important}',
'body.clStartPickerV251 .clStartRecommendedV251:before{content:"Recommended start";position:absolute;top:13px;left:14px;border-radius:999px;padding:5px 9px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;font-size:11px;font-weight:950}',
'body.clStartPickerV251 .clStartSecondaryV251{background:color-mix(in srgb,var(--panel) 94%,var(--panel2) 6%)}',
'body.clStartPickerV251 .clStartPickerGridV251 .actions{margin-top:auto;width:100%}',
'body.clStartPickerV251 .clStartPickerGridV251 .btn{width:100%}',
'@media(max-width:1100px){body.clStartPickerV251 .clStartPickerGridV251{grid-template-columns:1fr 1fr}body.clStartPickerV251 .clStartRecommendedV251{grid-column:1/-1}}',
'@media(max-width:760px){body.clStartFamilyV251 .clStartSummaryV251 .grid3,body.clStartHomeV251 .clStartStepsV251 .grid,body.clStartPickerV251 .clStartPickerGridV251{grid-template-columns:1fr}body.clStartPickerV251 .clStartRecommendedV251{grid-column:auto}body.clStartSetupV251 .clStartPrimaryActionsV251 .btn{width:100%;min-width:0}}'
].join('');document.head.appendChild(s)}
function apply(){var main=q('.main')||q('main');if(!main)return false;restoreNav();document.body.classList.add('clStartFamilyV251');style();if(PAGE==='index')home(main);if(PAGE==='setup')setup(main);if(PAGE==='project-picker')picker(main);document.body.setAttribute('data-cl-start-family','v257-canonical-nav');return true}
function boot(){apply();[80,350,1000,2600].forEach(function(ms){setTimeout(apply,ms)})}
window.CodeLabsStartFamilyV251={version:'V257-canonical-nav',apply:apply,page:PAGE};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();