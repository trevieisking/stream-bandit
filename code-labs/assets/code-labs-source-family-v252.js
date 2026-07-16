/* Code Labs Source Family V256 - bounded File Lab, Saved Files, Rescue Room and Packet Builder presentation only. */
(function(){
'use strict';
var PAGE=(document.body&&document.body.getAttribute('data-page'))||'';
var ROUTES=[
  ['file-lab','file-lab.html','4','File Lab'],
  ['saved-files','saved-files.html','5','Saved Files'],
  ['rescue-room','rescue-room.html','6','Rescue Room'],
  ['packet-builder','packet-builder.html','7','Packet Builder']
];
if(!ROUTES.some(function(x){return x[0]===PAGE}))return;
function q(s,r){return(r||document).querySelector(s)}
function add(n,c){if(n)n.classList.add(c)}
function closestPanel(n){return n&&n.closest?n.closest('section,.panel,.layout'):null}
function progress(main){
  var hero=q(':scope>.hero',main)||q('.hero',main);if(!hero)return;
  var nav=q('#clSourceFamilyV252',hero);
  if(!nav){nav=document.createElement('nav');nav.id='clSourceFamilyV252';nav.className='clSourceFamilyNavV252';nav.setAttribute('aria-label','Source and context pages');nav.setAttribute('data-cl-product-ignore','yes');nav.setAttribute('data-cl-page-runtime-ignore','yes');hero.appendChild(nav)}
  var html=ROUTES.map(function(x){var active=x[0]===PAGE;return '<a href="'+x[1]+'"'+(active?' class="active" aria-current="page"':'')+'><span>'+x[2]+'</span><b>'+x[3]+'</b></a>'}).join('');
  if(nav.innerHTML!==html)nav.innerHTML=html;
}
function fileLab(main){
  document.body.classList.add('clSourceFileLabV252');
  var details=closestPanel(q('#filename',main)),editor=closestPanel(q('#currentCode',main));
  add(details,'clSourceDetailsV252');add(editor,'clSourceEditorV252');
  add(details&&q('.actions',details),'clSourcePrimaryActionsV252');
}
function savedFiles(main){
  document.body.classList.add('clSourceSavedV252');
  add(q('#clSavedFilesV170',main),'clSourceSavedHeroV252');
  var list=closestPanel(q('#clSavedFilesList',main)),editor=closestPanel(q('#clSavedFileCode',main));
  add(list,'clSourceSavedListV252');add(editor,'clSourceSavedEditorV252');
  add(q('#clRemoveSelectedSavedFiles',main),'clSourceDangerActionV252');
}
function rescue(main){
  document.body.classList.add('clSourceRescueV252');
  var problem=closestPanel(q('#problem',main)),summary=closestPanel(q('#packetPreview',main));
  add(problem,'clSourceProblemV252');add(summary,'clSourcePreviewV252');
  add(problem&&q('.actions',problem),'clSourcePrimaryActionsV252');
}
function packet(main){
  document.body.classList.add('clSourcePacketV252');
  var panel=closestPanel(q('#packetType',main));
  add(panel,'clSourcePacketPanelV252');
  add(q('#packetOut',main),'clSourcePacketOutputV252');
  add(panel&&q('.actions',panel),'clSourcePacketActionsV252');
}
function style(){
  if(q('#clSourceFamilyV252Style'))return;
  var s=document.createElement('style');s.id='clSourceFamilyV252Style';s.textContent=[
    'body.clSourceFamilyV252 .clSourceFamilyNavV252{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:2px;padding-top:12px;border-top:1px solid var(--line)}',
    'body.clSourceFamilyV252 .clSourceFamilyNavV252 a{display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;min-height:42px;padding:7px 9px;border:1px solid var(--line);border-radius:13px;background:var(--panel);color:var(--muted);text-decoration:none;font-size:12px}',
    'body.clSourceFamilyV252 .clSourceFamilyNavV252 a span{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:var(--panel2);color:var(--ink);font-weight:1000}',
    'body.clSourceFamilyV252 .clSourceFamilyNavV252 a b{color:var(--ink);line-height:1.2}',
    'body.clSourceFamilyV252 .clSourceFamilyNavV252 a.active{border-color:color-mix(in srgb,var(--brand) 55%,var(--line));background:color-mix(in srgb,var(--panel) 88%,var(--brand) 12%)}',
    'body.clSourceFamilyV252 .clSourceFamilyNavV252 a.active span{background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff}',
    'body.clSourceFileLabV252 .layout{grid-template-columns:minmax(270px,.7fr) minmax(440px,1.3fr);align-items:start}',
    'body.clSourceFileLabV252 .clSourceDetailsV252 .notice{margin-top:10px}',
    'body.clSourceFileLabV252 .clSourcePrimaryActionsV252{display:grid;grid-template-columns:1fr;align-items:stretch}',
    'body.clSourceFileLabV252 .clSourcePrimaryActionsV252 .btn{width:100%;white-space:normal}',
    'body.clSourceFileLabV252 .clSourceEditorV252 #currentCode{min-height:520px}',
    'body.clSourceSavedV252 .clSourceSavedHeroV252 .actions{display:grid;grid-template-columns:1.2fr 1fr 1fr}',
    'body.clSourceSavedV252 .clSourceSavedHeroV252 .btn{width:100%}',
    'body.clSourceSavedV252 .clSourceSavedListV252>.actions{display:grid;grid-template-columns:auto repeat(3,minmax(150px,1fr));align-items:center}',
    'body.clSourceSavedV252 .clSourceSavedListV252>.actions .btn{width:100%;white-space:normal}',
    'body.clSourceSavedV252 .clSourceDangerActionV252{border:1px solid color-mix(in srgb,var(--bad) 55%,transparent)}',
    'body.clSourceSavedV252 .clSavedFileRow{background:var(--panel2)!important;border-color:var(--line)!important}',
    'body.clSourceSavedV252 .clSavedFileRow.isSelected{background:color-mix(in srgb,var(--panel) 82%,var(--brand) 18%)!important;border-color:var(--brand)!important}',
    'body.clSourceSavedV252 .clSavedFileMain b,body.clSourceSavedV252 .clSavedFileProject b{color:var(--ink)!important}',
    'body.clSourceSavedV252 .clSavedFileMain small,body.clSourceSavedV252 .clSavedFileProject small,body.clSourceSavedV252 .clSavedFileMeta small{color:var(--muted)!important}',
    'body.clSourceSavedV252 .clSourceSavedEditorV252 #clSavedFileCode{min-height:440px}',
    'body.clSourceRescueV252 .layout{grid-template-columns:minmax(380px,1.08fr) minmax(340px,.92fr);align-items:start}',
    'body.clSourceRescueV252 .clSourceProblemV252 #problem{min-height:210px}',
    'body.clSourceRescueV252 .clSourceProblemV252 #dontTouch,body.clSourceRescueV252 .clSourceProblemV252 #errors{min-height:150px}',
    'body.clSourceRescueV252 .clSourcePrimaryActionsV252{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}',
    'body.clSourceRescueV252 .clSourcePrimaryActionsV252 .btn{width:100%;white-space:normal}',
    'body.clSourceRescueV252 .clSourcePreviewV252 #packetPreview{min-height:390px}',
    'body.clSourcePacketV252 .clSourcePacketPanelV252{width:min(100%,1200px);margin-left:auto;margin-right:auto}',
    'body.clSourcePacketV252 .clSourcePacketActionsV252{display:grid;grid-template-columns:1.25fr 1fr 1fr}',
    'body.clSourcePacketV252 .clSourcePacketActionsV252 .btn{width:100%;white-space:normal}',
    'body.clSourcePacketV252 .clSourcePacketOutputV252{min-height:540px}',
    '@media(max-width:1080px){body.clSourceFamilyV252 .clSourceFamilyNavV252{grid-template-columns:repeat(2,minmax(0,1fr))}body.clSourceFileLabV252 .layout,body.clSourceRescueV252 .layout{grid-template-columns:1fr}body.clSourceSavedV252 .clSourceSavedListV252>.actions{grid-template-columns:repeat(2,minmax(0,1fr))}body.clSourceSavedV252 .clSourceSavedListV252>.actions .badge{grid-column:1/-1;justify-self:start}}',
    '@media(max-width:680px){body.clSourceFamilyV252 .clSourceFamilyNavV252,body.clSourceSavedV252 .clSourceSavedHeroV252 .actions,body.clSourceSavedV252 .clSourceSavedListV252>.actions,body.clSourceRescueV252 .clSourcePrimaryActionsV252,body.clSourcePacketV252 .clSourcePacketActionsV252{grid-template-columns:1fr}body.clSourceFamilyV252 .clSourceFamilyNavV252 a{min-height:40px}body.clSourceSavedV252 .clSourceSavedListV252>.actions .badge{grid-column:auto}body.clSourceFileLabV252 .clSourceEditorV252 #currentCode,body.clSourcePacketV252 .clSourcePacketOutputV252{min-height:380px}}'
  ].join('');document.head.appendChild(s);
}
function apply(){
  var main=q('.main')||q('main');if(!main)return false;
  document.body.classList.add('clSourceFamilyV252');style();progress(main);
  if(PAGE==='file-lab')fileLab(main);
  if(PAGE==='saved-files')savedFiles(main);
  if(PAGE==='rescue-room')rescue(main);
  if(PAGE==='packet-builder')packet(main);
  document.body.setAttribute('data-cl-source-family','v256-bounded');return true;
}
function boot(){apply();[80,350,1000,2600].forEach(function(ms){setTimeout(apply,ms)})}
window.CodeLabsSourceFamilyV252={version:'V256-bounded',apply:apply,page:PAGE};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
