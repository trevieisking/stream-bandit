/* Stream Bandit V7.8.12 shell/logo fix for Theme Studio.
   Applies uploaded global logo/app name to the top-left shell and prevents account text leaks. */
(function(){
'use strict';
const STORE_ID='stream_bandit';
let sb=null;
function $(id){return document.getElementById(id)}
function addCss(){if($('sbShellLogoFixCss'))return;let s=document.createElement('style');s.id='sbShellLogoFixCss';s.textContent='.head{overflow:hidden}.head .brand{min-width:0;max-width:100%;overflow:hidden}.head .brand>span{display:block;min-width:0;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.head .muted{min-width:0;overflow:hidden}.head .muted b{display:block;white-space:normal;overflow:hidden}.sb-auth-chip,.sb-auth-panel,.sb-auth-card,[id^="sbAuth"]{max-width:100%;overflow:hidden;text-overflow:ellipsis}.logo,.logoPreview{flex:0 0 auto;overflow:hidden}.logo img,.logoPreview img{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}';document.head.appendChild(s)}
async function client(){if(sb)return sb;let t=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());let url=(t.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1];let key=(t.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1];sb=supabase.createClient(url,key);return sb}
function apply(name,logo){addCss();name=String(name||'Stream Bandit').trim()||'Stream Bandit';logo=String(logo||'').trim();document.querySelectorAll('.head .brand>span').forEach(el=>{if(!el.classList.contains('sb-auth-chip')&&!el.classList.contains('sb-auth-label')){el.textContent=name;el.title=name}});document.querySelectorAll('.head .brand .logo,.logoPreview').forEach(el=>{if(logo){el.innerHTML='<img src="'+logo.replace(/"/g,'')+'" alt="">'}})}
function applyFromInputs(){let n=$('sbAppName')&&$('sbAppName').value;let l=$('sbLogoUrl')&&$('sbLogoUrl').value;apply(n,l)}
async function load(){try{addCss();let c=await client();let r=await c.from('sb_app_settings').select('settings').eq('id',STORE_ID).maybeSingle();let st=(r.data&&r.data.settings)||{};apply(st.appName,st.logoUrl)}catch(e){addCss();applyFromInputs()}}
function hook(){addCss();['sbApplyIdentity','sbUploadLogo','sbSaveIdentity','sbLoadIdentity'].forEach(id=>{let b=$(id);if(b&&!b.dataset.sbLogoFix){b.dataset.sbLogoFix='1';b.addEventListener('click',()=>setTimeout(applyFromInputs,900))}});applyFromInputs()}
function start(){load();setInterval(hook,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
