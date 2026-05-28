/* Stream Bandit V7.12.114 Web Builder Studio overlay-preserving repair
   Loads the passed V7.12.106 builder engine, then applies only two runtime source fixes:
   1) Save + Publish preserves existing settings_json/navigation and verifies persisted block count.
   2) Preview/Form/Inbox links stay in the same app window.
   Protected shell is not edited. */
(function(){
'use strict';
const PATCH_VERSION='V7.12.114 Web Builder Studio overlay publish repair';
function setStatus(msg,bad){
  try{let el=document.getElementById('status');if(el){el.textContent=msg;el.className=bad?'note':'status';}}catch(e){}
}
function patchSource(src){
  src=String(src||'');
  src=src.replace("const VERSION='V7.12.106 Web Builder Studio';","const VERSION='"+PATCH_VERSION+"';");
  src=src.replaceAll('target="_blank"','');
  src=src.replaceAll("<span class=\"pill\">V7.12.106</span>","<span class=\"pill\">V7.12.114</span>");
  src=src.replaceAll("document.documentElement.dataset.webBuilderStudio='v7-12-106';","document.documentElement.dataset.webBuilderStudio='v7-12-114';");
  const startNeedle="async function save(){try{await client();let s=slug($('wbSlug').value);let row=";
  const start=src.indexOf(startNeedle);
  const end=src.indexOf('function wire(){',start);
  if(start<0||end<0){
    setStatus('V7.12.114 repair failed: old save function not found. Old builder not changed.',true);
    return src;
  }
  const repairedSave=`async function save(){try{await client();let s=slug($('wbSlug').value);$('wbSlug').value=s;let existingRes=await sb.from('sb_site_pages').select('*').eq('slug',s).maybeSingle();if(existingRes.error)throw existingRes.error;let existing=existingRes.data||{};let existingSettings=existing.settings_json&&typeof existing.settings_json==='object'?existing.settings_json:{};let settings=Object.assign({},existingSettings);settings.builder='web-builder-live-studio-v7-12-114.js';settings.preview=prevUrl();settings.advancedForm=formUrl();settings.formInbox=inboxUrl();settings.protectedShell='stream-bandit-shell-v6-24.js';settings.lastBuilderPublishAt=new Date().toISOString();settings.publishRepair='V7.12.114';let outStatus=$('wbStatusSelect').value||'published';if(outStatus!=='hidden')outStatus='published';let row={slug:s,title:$('wbTitle').value||s,page_type:existing.page_type||'custom',status:outStatus,layout_json:blocks.map(safe),settings_json:settings,updated_at:new Date().toISOString()};if(user)row.owner_id=user.id;let r=await sb.from('sb_site_pages').upsert(row,{onConflict:'slug'}).select('*').maybeSingle();if(r.error)throw r.error;let verify=await sb.from('sb_site_pages').select('slug,status,layout_json,settings_json,updated_at').eq('slug',s).maybeSingle();if(verify.error)throw verify.error;let count=Array.isArray(verify.data&&verify.data.layout_json)?verify.data.layout_json.length:0;let navOk=!!(verify.data&&verify.data.settings_json&&verify.data.settings_json.navigation);status('Saved + published. Verified '+count+' blocks persisted. Pages Manager navigation '+(navOk?'preserved.':'not present on this row.'));debug();}catch(e){status('Save failed: '+(e.message||e),true);}}\n`;
  return src.slice(0,start)+repairedSave+src.slice(end);
}
async function boot(){
  try{
    setStatus('Loading V7.12.114 overlay-preserving repair engine...');
    const res=await fetch('web-builder-live-studio-v7-12-106.js?v=7-12-114-source',{cache:'no-store'});
    if(!res.ok)throw new Error('Could not load V7.12.106 source: '+res.status);
    const original=await res.text();
    const patched=patchSource(original)+"\n//# sourceURL=web-builder-live-studio-v7-12-114-runtime.js";
    const script=document.createElement('script');
    script.text=patched;
    document.head.appendChild(script);
  }catch(e){
    console.error(e);
    setStatus('V7.12.114 builder repair failed to load: '+(e.message||e),true);
    const d=document.getElementById('debug');
    if(d)d.textContent=String(e&&e.stack||e);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
