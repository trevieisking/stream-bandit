(function(){
'use strict';
const STORE_ID='stream_bandit';
const STYLE_KEY='web_builder_shared_style_v7_8_8';
const BUCKET='stream-bandit-images';
let sb=null,user=null,settings={};
const $=id=>document.getElementById(id);
function status(t,bad){const s=$('status');if(s){s.textContent=t;s.className=bad?'status bad':'status';}}
function clean(v,n){return String(v||'').trim().slice(0,n);}
async function client(){
  if(sb)return sb;
  const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());
  const url=(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1];
  const key=(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1];
  sb=supabase.createClient(url,key);
  return sb;
}
async function requireAdmin(){
  const c=await client();
  const sess=await c.auth.getSession();
  user=sess.data&&sess.data.session?sess.data.session.user:null;
  if(!user)throw new Error('Signed out. Log in first.');
  const r=await c.from('sb_profiles').select('id,role,display_name,username').eq('id',user.id).maybeSingle();
  if(r.error)throw r.error;
  if(!r.data)throw new Error('No sb_profiles row found.');
  if(r.data.role!=='admin'&&r.data.role!=='owner')throw new Error('Admin role required for global settings.');
  return r.data;
}
function styleObj(){return{
  accent:($('accent')&&$('accent').value)||'#22d3a6',
  accent2:($('accent2')&&$('accent2').value)||'#7c3cff',
  bg:($('bg')&&$('bg').value)||'#050711',
  card:($('card')&&$('card').value)||'#17122d',
  titleColor:($('titleColor')&&$('titleColor').value)||'#ffffff',
  textColor:($('textColor')&&$('textColor').value)||'#b9c0d8',
  buttonText:($('buttonText')&&$('buttonText').value)||'#ffffff',
  font:($('font')&&$('font').value)||'Inter,system-ui,Arial',
  largeText:!!($('largeText')&&$('largeText').checked),
  highContrast:!!($('highContrast')&&$('highContrast').checked),
  source:'settings-global-save-v7-1-0',
  version:'V7.1.0'
};}
function identityObj(){return{
  appName:clean($('appName')&&$('appName').value,80)||'Stream Bandit',
  tagline:clean($('tagline')&&$('tagline').value,140),
  loginText:clean($('loginText')&&$('loginText').value,140),
  logoUrl:clean($('logoUrl')&&$('logoUrl').value,1000),
  source:'settings-global-save-v7-1-0',
  version:'V7.1.0'
};}
function applyStyle(s){s=s||{};const root=document.documentElement;root.style.setProperty('--accent',s.accent||'#22d3a6');root.style.setProperty('--good',s.accent||'#22d3a6');root.style.setProperty('--accent2',s.accent2||'#7c3cff');root.style.setProperty('--purple',s.accent2||'#7c3cff');root.style.setProperty('--bg',s.bg||'#050711');root.style.setProperty('--card',s.card||'#17122d');root.style.setProperty('--p',s.card||'#101529');root.style.setProperty('--p2',s.card||'#17122d');root.style.setProperty('--title',s.titleColor||'#ffffff');root.style.setProperty('--muted',s.textColor||'#b9c0d8');root.style.setProperty('--btnText',s.buttonText||'#ffffff');root.style.setProperty('--fontScale',s.largeText?'1.12':'1');root.style.setProperty('--line',s.highContrast?'#ffffff66':'#ffffff22');document.body.style.fontFamily=s.font||'Inter,system-ui,Arial';}
function setFields(s,i){s=s||{};i=i||{};if($('accent'))$('accent').value=s.accent||'#22d3a6';if($('accent2'))$('accent2').value=s.accent2||'#7c3cff';if($('bg'))$('bg').value=s.bg||'#050711';if($('card'))$('card').value=s.card||'#17122d';if($('titleColor'))$('titleColor').value=s.titleColor||'#ffffff';if($('textColor'))$('textColor').value=s.textColor||'#b9c0d8';if($('buttonText'))$('buttonText').value=s.buttonText||'#ffffff';if($('font'))$('font').value=s.font||'Inter,system-ui,Arial';if($('largeText'))$('largeText').checked=!!s.largeText;if($('highContrast'))$('highContrast').checked=!!s.highContrast;if($('appName'))$('appName').value=i.appName||'Stream Bandit';if($('tagline'))$('tagline').value=i.tagline||'';if($('loginText'))$('loginText').value=i.loginText||'';if($('logoUrl'))$('logoUrl').value=i.logoUrl||'';preview();}
function preview(){const st=styleObj(),id=identityObj();applyStyle(st);if($('brandPreview'))$('brandPreview').textContent=id.appName;if($('taglinePreview'))$('taglinePreview').textContent=id.tagline||'Global tagline preview';if($('loginPreview'))$('loginPreview').textContent=id.loginText||'Login text preview';if($('logoPreview'))$('logoPreview').innerHTML=id.logoUrl?'<img src="'+id.logoUrl.replace(/"/g,'')+'" alt="logo">':'🎬';if($('jsonOut'))$('jsonOut').textContent=JSON.stringify({identity:id,style:st},null,2);}
async function loadSettings(){
  try{
    const c=await client();
    const r=await c.from('sb_app_settings').select('settings').eq('id',STORE_ID).maybeSingle();
    if(r.error)throw r.error;
    settings=(r.data&&r.data.settings)||{};
    const st=settings[STYLE_KEY]||settings.web_builder_style||settings.builderStyle||{};
    const id=settings.global_identity||settings.stream_bandit_identity||{};
    setFields(st,id);
    status('Global settings loaded from sb_app_settings.');
  }catch(e){status('Load failed: '+(e.message||e),true);if($('jsonOut'))$('jsonOut').textContent=String(e.message||e);}
}
async function saveSettings(){
  try{
    await requireAdmin();
    const c=await client();
    const old=await c.from('sb_app_settings').select('settings').eq('id',STORE_ID).maybeSingle();
    if(old.error)throw old.error;
    settings=(old.data&&old.data.settings)||{};
    const st=styleObj(),id=identityObj();
    settings[STYLE_KEY]=st;
    settings.web_builder_style=st;
    settings.global_identity=id;
    settings.stream_bandit_identity=id;
    settings.updated_by=user.id;
    settings.updated_from='settings-global-save-v7-1-0';
    const r=await c.from('sb_app_settings').upsert({id:STORE_ID,settings,updated_at:new Date().toISOString()},{onConflict:'id'}).select('settings,updated_at').single();
    if(r.error)throw r.error;
    settings=r.data.settings||{};
    preview();
    status('Global identity and shared style saved to sb_app_settings.');
    if(window.StreamBanditSharedStyle)window.StreamBanditSharedStyle.load();
  }catch(e){status('Save failed: '+(e.message||e),true);if($('jsonOut'))$('jsonOut').textContent=String(e.message||e);}
}
async function uploadLogo(){
  try{
    await requireAdmin();
    const input=$('logoFile');
    const file=input&&input.files&&input.files[0];
    if(!file){status('Choose a logo image first.',true);return;}
    if(!/^image\//.test(file.type)){status('Logo must be an image.',true);return;}
    const c=await client();
    const ext=(file.name.split('.').pop()||'png').replace(/[^a-z0-9]/gi,'').toLowerCase();
    const path='global/logo-'+Date.now()+'.'+ext;
    status('Uploading logo image...');
    const up=await c.storage.from(BUCKET).upload(path,file,{cacheControl:'3600',upsert:true,contentType:file.type||'image/png'});
    if(up.error)throw up.error;
    const url=c.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    if($('logoUrl'))$('logoUrl').value=url;
    preview();
    status('Logo uploaded. Click Save global settings to make it permanent.');
  }catch(e){status('Logo upload failed: '+(e.message||e),true);if($('jsonOut'))$('jsonOut').textContent=String(e.message||e);}
}
function bind(){
  document.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const sec=$(btn.dataset.tab);if(sec)sec.classList.add('active');});
  document.querySelectorAll('input,select,textarea').forEach(el=>{if(el.type!=='file')el.addEventListener('input',preview);});
  if($('loadSettings'))$('loadSettings').onclick=loadSettings;
  if($('saveSettings'))$('saveSettings').onclick=saveSettings;
  if($('uploadLogo'))$('uploadLogo').onclick=uploadLogo;
  if($('previewSettings'))$('previewSettings').onclick=preview;
}
window.StreamBanditSettingsGlobal={loadSettings,saveSettings,uploadLogo,preview};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();setTimeout(loadSettings,800);});else{bind();setTimeout(loadSettings,800);}
})();