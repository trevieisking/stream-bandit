/* Stream Bandit V7.12.116 Web Builder Studio overlay publish notice repair
   Keeps the passed V7.12.106 overlay Builder. Runtime-patches only:
   - same-window links
   - page selector from V7.12.115
   - long-session save refresh/re-read/verify
   - publish notice panel with exact status/error
*/
(function(){
'use strict';
const PATCH_VERSION='V7.12.116 Web Builder Studio publish notice repair';
function setStatus(msg,bad){try{let el=document.getElementById('status');if(el){el.textContent=msg;el.className=bad?'note':'status';}}catch(e){}}
function patchSource(src){
  src=String(src||'');
  src=src.replace("const VERSION='V7.12.106 Web Builder Studio';","const VERSION='"+PATCH_VERSION+"';");
  src=src.replaceAll('target="_blank"','');
  src=src.replaceAll('<span class="pill">V7.12.106</span>','<span class="pill">V7.12.116</span>');
  src=src.replaceAll("document.documentElement.dataset.webBuilderStudio='v7-12-106';","document.documentElement.dataset.webBuilderStudio='v7-12-116';");

  const noticeHelpers="function publishNotice(msg,bad){let box=$('wbPublishNotice');if(!box)return status(msg,bad);let line=document.createElement('div');line.textContent=new Date().toLocaleTimeString()+' — '+msg;line.style.margin='4px 0';line.style.color=bad?'#ffd8df':'#dfffee';box.prepend(line);status(msg,bad);}function setSaveBusy(on){let b=$('wbSave');if(!b)return;b.disabled=!!on;b.style.opacity=on?'.65':'1';b.textContent=on?'Saving...':'Save + Publish';}\n";
  src=src.replace("function updateLinks(){if(!$('wbOpenPreview'))return;$('wbOpenPreview').href=prevUrl();$('wbOpenForm').href=formUrl();$('wbOpenInbox').href=inboxUrl();}",noticeHelpers+"function updateLinks(){if(!$('wbOpenPreview'))return;$('wbOpenPreview').href=prevUrl();$('wbOpenForm').href=formUrl();$('wbOpenInbox').href=inboxUrl();let ps=$('wbPageSelect');if(ps){let cur=slug($('wbSlug').value);[...ps.options].forEach(o=>{if(o.value===cur)ps.value=cur;});}}\nasync function loadPageChoices(){try{await client();let sel=$('wbPageSelect');if(!sel)return;let r=await sb.from('sb_site_pages').select('slug,title,status,updated_at').order('updated_at',{ascending:false}).limit(150);if(r.error)throw r.error;let cur=slug($('wbSlug').value);sel.innerHTML='<option value=\"\">Choose a saved page / slug...</option>'+((r.data||[]).map(p=>'<option value=\"'+esc(p.slug)+'\" '+(p.slug===cur?'selected':'')+'>'+esc((p.title||p.slug)+' — '+p.slug+' ['+(p.status||'draft')+']')+'</option>').join(''));}catch(e){publishNotice('Page selector failed: '+(e.message||e),true);}}");

  src=src.replace("<div class=\"wbToolbar\"><button id=\"wbAddBlock\" class=\"wbBtn\">+ Add Block</button>","<div id=\"wbPublishNotice\" class=\"note\" style=\"width:100%;max-height:150px;overflow:auto\"><b>Publish notices</b><div>Waiting for Save + Publish...</div></div><div class=\"wbToolbar\"><select id=\"wbPageSelect\" class=\"wbSmall\" style=\"min-width:260px;background:#0006;color:white;border:1px solid #ffffff24;border-radius:999px;padding:10px 13px\"><option value=\"\">Choose a saved page / slug...</option></select><button id=\"wbAddBlock\" class=\"wbBtn\">+ Add Block</button>");

  const oldSave="async function save(){try{await client();let s=slug($('wbSlug').value);let row={slug:s,title:$('wbTitle').value||s,page_type:'custom',status:$('wbStatusSelect').value||'published',layout_json:blocks.map(safe),settings_json:{builder:'web-builder-live-studio-v7-12-106.js',preview:prevUrl(),advancedForm:formUrl(),formInbox:inboxUrl(),protectedShell:'stream-bandit-shell-v6-24.js'},updated_at:new Date().toISOString()};if(user)row.owner_id=user.id;let r=await sb.from('sb_site_pages').upsert(row,{onConflict:'slug'}).select('*').maybeSingle();if(r.error)throw r.error;status('Saved. Published Preview, Form and Inbox routes are ready.');debug();}catch(e){status('Save failed: '+(e.message||e),true);}}";
  const newSave="async function save(){setSaveBusy(true);try{publishNotice('Save clicked. Refreshing Supabase client/session...');sb=null;await client();let freshUser=null;try{let gu=await sb.auth.getUser();freshUser=gu.data&&gu.data.user||null;if(freshUser)user=freshUser;}catch(authErr){publishNotice('Auth refresh warning: '+(authErr.message||authErr),true);}let s=slug($('wbSlug').value);$('wbSlug').value=s;publishNotice('Re-reading existing page row for '+s+'...');let existingRes=await sb.from('sb_site_pages').select('*').eq('slug',s).maybeSingle();if(existingRes.error)throw existingRes.error;let existing=existingRes.data||{};let existingSettings=existing.settings_json&&typeof existing.settings_json==='object'?existing.settings_json:{};let settings=Object.assign({},existingSettings);settings.builder='web-builder-live-studio-v7-12-116.js';settings.preview=prevUrl();settings.advancedForm=formUrl();settings.formInbox=inboxUrl();settings.protectedShell='stream-bandit-shell-v6-24.js';settings.lastBuilderPublishAt=new Date().toISOString();settings.publishRepair='V7.12.116';let outStatus=$('wbStatusSelect').value||'published';if(outStatus!=='hidden')outStatus='published';let row={slug:s,title:$('wbTitle').value||s,page_type:existing.page_type||'custom',status:outStatus,layout_json:blocks.map(safe),settings_json:settings,updated_at:new Date().toISOString()};if(user)row.owner_id=user.id;publishNotice('Saving page row with '+row.layout_json.length+' blocks...');let r=await sb.from('sb_site_pages').upsert(row,{onConflict:'slug'}).select('*').maybeSingle();if(r.error)throw r.error;publishNotice('Supabase save returned OK. Verifying saved row...');let verify=await sb.from('sb_site_pages').select('slug,status,layout_json,settings_json,updated_at').eq('slug',s).maybeSingle();if(verify.error)throw verify.error;let count=Array.isArray(verify.data&&verify.data.layout_json)?verify.data.layout_json.length:0;if(count!==row.layout_json.length)throw new Error('Verify mismatch: tried to save '+row.layout_json.length+' blocks but read back '+count);let navOk=!!(verify.data&&verify.data.settings_json&&verify.data.settings_json.navigation);publishNotice('Saved + published. Verified '+count+' blocks persisted. Navigation '+(navOk?'preserved.':'not present on this row.'));debug();}catch(e){publishNotice('Save failed: '+(e.message||e),true);let d=$('debug');if(d)d.textContent=JSON.stringify({saveError:e.message||String(e),stack:e.stack||null},null,2);}finally{setSaveBusy(false);}}";
  if(!src.includes(oldSave)){
    setStatus('V7.12.116 repair warning: exact old save function not found; using fallback patch.',true);
    src=src.replace(/async function save\(\)\{try\{[\s\S]*?debug\(\);\}catch\(e\)\{status\('Save failed: '\+\(e\.message\|\|e\),true\);\}\}/,newSave);
  }else src=src.replace(oldSave,newSave);

  src=src.replace("function wire(){Object.keys(TYPES).forEach(k=>","function wire(){setTimeout(loadPageChoices,900);document.addEventListener('change',e=>{if(e.target&&e.target.id==='wbPageSelect'&&e.target.value){$('wbSlug').value=e.target.value;load();}});Object.keys(TYPES).forEach(k=>");
  src=src.replace("$('wbLoad').onclick=load;$('wbSave').onclick=save;","$('wbLoad').onclick=()=>{load();setTimeout(loadPageChoices,500);};$('wbSave').onclick=()=>{publishNotice('Save + Publish button clicked.');save();};");
  return src;
}
async function boot(){
  try{
    setStatus('Loading V7.12.116 overlay publish-notice repair engine...');
    const res=await fetch('web-builder-live-studio-v7-12-106.js?v=7-12-116-source',{cache:'no-store'});
    if(!res.ok)throw new Error('Could not load V7.12.106 source: '+res.status);
    const original=await res.text();
    const patched=patchSource(original)+"\n//# sourceURL=web-builder-live-studio-v7-12-116-runtime.js";
    const script=document.createElement('script');
    script.text=patched;
    document.head.appendChild(script);
  }catch(e){
    console.error(e);
    setStatus('V7.12.116 builder repair failed to load: '+(e.message||e),true);
    const d=document.getElementById('debug');
    if(d)d.textContent=String(e&&e.stack||e);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
