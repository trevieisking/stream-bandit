(function(){
'use strict';
function byId(id){return document.getElementById(id)}
function statusText(text){const s=byId('statusBox');if(s)s.textContent=text}
function makePanel(){
  if(byId('sbFaviconUploadPanel'))return;
  const panel=document.createElement('section');
  panel.id='sbFaviconUploadPanel';
  panel.className='box';
  panel.innerHTML='<h2>Favicon / App Icon upload preview</h2><p class="muted">This belongs to Settings Branding/App Icon, not Profile. Local preview only for now — no Supabase save and no repo/favicon replacement yet.</p><div class="grid"><label class="field"><b>Favicon image</b><input id="faviconFile" type="file" accept="image/*,.ico"><p id="faviconStatus" class="muted">No favicon chosen yet.</p></label><label class="field"><b>App icon image</b><input id="appIconFile" type="file" accept="image/*"><p id="appIconStatus" class="muted">No app icon chosen yet.</p></label><div class="card"><b>Preview</b><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><img id="faviconPreview" alt="favicon preview" style="width:48px;height:48px;border-radius:12px;object-fit:cover;background:#0006;border:1px solid #ffffff24;display:none"><img id="appIconPreview" alt="app icon preview" style="width:74px;height:74px;border-radius:18px;object-fit:cover;background:#0006;border:1px solid #ffffff24;display:none"></div><p class="muted">Final global apply will need an approved save shape and shell favicon injector.</p></div></div>';
  const summary=[...document.querySelectorAll('section.box')].find(sec=>/Local summary/i.test(sec.textContent||''));
  if(summary&&summary.parentNode)summary.parentNode.insertBefore(panel,summary);else document.querySelector('.wrap')?.appendChild(panel);
}
function bindPreview(inputId,imgId,statusId,label){
  const input=byId(inputId),img=byId(imgId),status=byId(statusId);
  if(!input||input.dataset.bound)return;
  input.dataset.bound='1';
  input.addEventListener('change',function(){
    const f=input.files&&input.files[0];
    if(!f){if(status)status.textContent='No '+label+' chosen yet.';if(img)img.style.display='none';return;}
    if(status)status.textContent=label+' chosen locally: '+f.name+' ('+Math.round(f.size/1024)+' KB).';
    if(img&&f.type&&f.type.indexOf('image/')===0){img.src=URL.createObjectURL(f);img.style.display='block'}
    statusText(label+' selected for local preview. No save happened yet.');
  });
}
function patchSummary(){
  const btn=byId('summarise');
  if(!btn||btn.dataset.faviconPatch)return;
  btn.dataset.faviconPatch='1';
  btn.addEventListener('click',function(){
    setTimeout(function(){
      const out=byId('summary');
      if(!out)return;
      try{
        const current=JSON.parse(out.textContent||'{}');
        current.brandingFiles={
          favicon:byId('faviconFile')&&byId('faviconFile').files[0]?byId('faviconFile').files[0].name:'',
          appIcon:byId('appIconFile')&&byId('appIconFile').files[0]?byId('appIconFile').files[0].name:''
        };
        current.version='V7.1.8 local settings map only';
        out.textContent=JSON.stringify(current,null,2);
      }catch(e){}
    },80);
  },true);
}
function refresh(){
  makePanel();
  bindPreview('faviconFile','faviconPreview','faviconStatus','Favicon');
  bindPreview('appIconFile','appIconPreview','appIconStatus','App icon');
  patchSummary();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else setTimeout(refresh,350);
setTimeout(refresh,1200);
})();