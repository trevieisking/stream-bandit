/* Stream Bandit V5.21.3 — Backup Page Tidy Overlay TEST
   Test-only overlay for index-v5-21-3-backup-test.html.
   Leaves stream-bandit-app.js untouched.
   Only activates when the current visible page appears to be Backup.
   Preserves the original Backup controls in-place by moving DOM nodes after existing handlers bind.
   No Supabase writes, no movie saves, no Mux, no player, no database changes. */
(function(){
'use strict';

var VERSION='V5.21.3 Backup Tidy Overlay Test';
var appliedToken='';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('main.main')||document.querySelector('main')||null;}
function isBackupPage(){
  var m=main(); if(!m)return false;
  var h=(m.querySelector('.top h2,h2,h1')||{}).textContent||'';
  var body=text(m).toLowerCase();
  return /backup/i.test(h)||(/backup/.test(body)&&(/restore/.test(body)||/export/.test(body)||/json/.test(body))&&document.querySelector('.nav button.active[data-view="backup"],button.active[data-view="backup"]'));
}
function addStyle(){
  if(document.getElementById('sb5213BackupStyle'))return;
  var st=document.createElement('style');
  st.id='sb5213BackupStyle';
  st.textContent='\n.sb5213Hero{background:linear-gradient(135deg,rgba(34,211,166,.14),rgba(124,60,255,.16));border:1px solid rgba(34,211,166,.28);border-radius:26px;padding:18px;margin:0 0 16px;box-shadow:0 20px 58px rgba(0,0,0,.28)}.sb5213Hero h2{margin:0 0 6px}.sb5213Hero p{color:var(--muted,#a9afc3);line-height:1.55}.sb5213Grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:12px}.sb5213Mini{border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.035);padding:12px}.sb5213Mini b{display:block;margin-bottom:4px}.sb5213Mini span{color:var(--muted,#a9afc3);line-height:1.4}.sb5213Tabs{display:flex;gap:9px;flex-wrap:wrap;background:rgba(5,7,14,.84);border:1px solid rgba(182,140,255,.16);border-radius:22px;padding:9px;margin:16px 0}.sb5213Tab{border:0;border-radius:999px;padding:11px 14px;font-weight:1000;color:#fff;background:rgba(53,57,86,.96);box-shadow:0 10px 24px rgba(0,0,0,.22);cursor:pointer}.sb5213Tab.active{background:linear-gradient(135deg,var(--a,#ff2d55),var(--b,#7c3cff))}.sb5213Panel{display:none}.sb5213Panel.active{display:block}.sb5213PanelCard{background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.94));border:1px solid rgba(182,140,255,.22);border-radius:24px;padding:18px;margin:14px 0}.sb5213PanelCard h3{margin:0 0 8px}.sb5213Note{margin-top:12px;padding:12px;border-radius:16px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb5213Warn{background:rgba(255,209,102,.10);border-color:rgba(255,209,102,.25);color:#ffe8a3}.sb5213OriginalBox{border:1px dashed rgba(182,140,255,.30);border-radius:18px;padding:12px;margin-top:12px}.sb5213HiddenOriginal{display:none!important}\n';
  document.head.appendChild(st);
}
function classify(node){
  var s=text(node).toLowerCase();
  if(!s)return 'export';
  if(/restore|import|paste|choose file|file upload|backup json/.test(s)&&!/export/.test(s))return 'restore';
  if(/danger|warning|storage|size|reset|quota|important|safe/.test(s))return 'safety';
  return 'export';
}
function makePanel(id,title,desc){
  var sec=document.createElement('section');
  sec.className='sb5213Panel';
  sec.id='sb5213-'+id;
  sec.innerHTML='<div class="sb5213PanelCard"><h3>'+title+'</h3><p>'+desc+'</p><div class="sb5213OriginalBox" data-drop="'+id+'"></div></div>';
  return sec;
}
function show(root,name){
  root.querySelectorAll('.sb5213Tab').forEach(function(b){b.classList.toggle('active',b.dataset.sbtab===name)});
  root.querySelectorAll('.sb5213Panel').forEach(function(p){p.classList.toggle('active',p.id==='sb5213-'+name)});
}
function apply(){
  if(!isBackupPage())return;
  var m=main(); if(!m || m.querySelector('#sb5213BackupWrap'))return;
  addStyle();
  var token=Date.now()+'-'+Math.random().toString(36).slice(2);
  appliedToken=token;
  var kids=Array.prototype.slice.call(m.children);
  var original=[];
  kids.forEach(function(k){
    if(k.id==='sb5213BackupWrap')return;
    original.push(k);
  });
  var wrap=document.createElement('div');
  wrap.id='sb5213BackupWrap';
  wrap.innerHTML='<section class="sb5213Hero"><h2>💾 Backup Centre</h2><p>V5.21.3 tidy overlay test. Existing Backup controls are preserved and organised into clear tabs.</p><div class="sb5213Grid"><div class="sb5213Mini"><b>Export</b><span>Download or copy your current browser backup.</span></div><div class="sb5213Mini"><b>Restore</b><span>Paste or choose a backup file carefully.</span></div><div class="sb5213Mini"><b>Safety</b><span>Check warnings before using restore actions.</span></div></div></section><nav class="sb5213Tabs"><button class="sb5213Tab active" type="button" data-sbtab="export">💾 Export Backup</button><button class="sb5213Tab" type="button" data-sbtab="restore">📥 Restore Backup</button><button class="sb5213Tab" type="button" data-sbtab="safety">✅ Safety</button></nav>';
  var exportPanel=makePanel('export','Export Backup','Existing export/copy controls are shown here.');
  var restorePanel=makePanel('restore','Restore Backup','Existing restore/paste/file controls are shown here.');
  var safetyPanel=makePanel('safety','Backup Safety','Warnings, storage information and fallback notes are shown here.');
  wrap.appendChild(exportPanel);wrap.appendChild(restorePanel);wrap.appendChild(safetyPanel);
  m.innerHTML='';
  m.appendChild(wrap);
  var drops={export:wrap.querySelector('[data-drop="export"]'),restore:wrap.querySelector('[data-drop="restore"]'),safety:wrap.querySelector('[data-drop="safety"]')};
  original.forEach(function(node){
    var c=classify(node);
    drops[c].appendChild(node);
  });
  Object.keys(drops).forEach(function(k){
    if(!drops[k].children.length){
      var empty=document.createElement('div');
      empty.className='sb5213Note '+(k==='restore'?'sb5213Warn':'');
      empty.textContent=k==='restore'?'No restore controls were detected in this section. Check the original fallback if needed.':'No matching original controls were detected here.';
      drops[k].appendChild(empty);
    }
  });
  var safetyNote=document.createElement('div');
  safetyNote.className='sb5213Note sb5213Warn';
  safetyNote.textContent='Test overlay only. If anything looks wrong, return to the normal live index.html. Core app code is untouched.';
  drops.safety.appendChild(safetyNote);
  wrap.querySelectorAll('.sb5213Tab').forEach(function(b){b.onclick=function(){show(wrap,b.dataset.sbtab)}});
  show(wrap,'export');
}
function resetIfLeftBackup(){
  if(!isBackupPage()){
    appliedToken='';
  }
}
function run(){
  try{apply();resetIfLeftBackup();}catch(e){console.warn('[Stream Bandit '+VERSION+'] overlay skipped',e);}
}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,1000);});
var mo=new MutationObserver(function(){setTimeout(run,350);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
setInterval(run,1200);
})();
