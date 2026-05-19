(function(){
'use strict';
const BUCKET='stream-bandit-images';
let sb=null,user=null,profile=null;
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
function showImage(id,url,fallback){const el=$(id);if(!el)return;el.innerHTML=url?'<img src="'+String(url).replace(/"/g,'')+'" alt="">':fallback;}
function fill(p){
  profile=p||{};
  if($('displayName'))$('displayName').value=p.display_name||'';
  if($('username'))$('username').value=p.username||'';
  if($('channelName'))$('channelName').value=p.channel_name||'';
  if($('channelAbout'))$('channelAbout').value=p.channel_about||'';
  if($('avatarUrl'))$('avatarUrl').value=p.avatar_url||'';
  if($('bannerUrl'))$('bannerUrl').value=p.banner_url||'';
  renderPreview();
}
function renderPreview(){
  const name=($('displayName')&&$('displayName').value)||($('channelName')&&$('channelName').value)||'Profile name';
  if($('previewName'))$('previewName').textContent=name;
  if($('previewUser'))$('previewUser').textContent='@'+((($('username')&&$('username').value)||'username'));
  if($('previewBio'))$('previewBio').textContent=($('channelAbout')&&$('channelAbout').value)||'Bio preview';
  if($('previewRole'))$('previewRole').textContent='Role: '+(profile.role||'user');
  showImage('avatarPreview',($('avatarUrl')&&$('avatarUrl').value)||profile.avatar_url,'👤');
  showImage('bannerPreview',($('bannerUrl')&&$('bannerUrl').value)||profile.banner_url,'Banner preview');
}
async function loadProfile(){
  try{
    const c=await client();
    const sess=await c.auth.getSession();
    user=sess.data&&sess.data.session?sess.data.session.user:null;
    if(!user){status('Signed out. Log in first from Account/Home.',true);return;}
    const r=await c.from('sb_profiles').select('id,username,display_name,channel_name,channel_about,avatar_url,banner_url,role,can_submit,updated_at').eq('id',user.id).maybeSingle();
    if(r.error)throw r.error;
    if(!r.data){status('No existing sb_profiles row. This page will not insert.',true);return;}
    fill(r.data);
    if($('debug'))$('debug').textContent=JSON.stringify({user:user.email,profile:r.data},null,2);
    status('Profile loaded from sb_profiles.');
  }catch(e){status('Profile load failed: '+(e.message||e),true);if($('debug'))$('debug').textContent=String(e.message||e);}
}
async function savePatch(patch,ok){
  const c=await client();
  if(!user)await loadProfile();
  if(!user)throw new Error('Cannot save: signed out.');
  patch.updated_at=new Date().toISOString();
  const r=await c.from('sb_profiles').update(patch).eq('id',user.id).select('id,username,display_name,channel_name,channel_about,avatar_url,banner_url,role,can_submit,updated_at').maybeSingle();
  if(r.error)throw r.error;
  if(!r.data)throw new Error('No row updated. RLS may allow read but block update.');
  fill(r.data);
  if($('debug'))$('debug').textContent=JSON.stringify({updated:r.data},null,2);
  status(ok);
  if(window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh)window.StreamBanditShellAuth.refresh();
  if(window.StreamBanditAuthAvatar&&window.StreamBanditAuthAvatar.refresh)window.StreamBanditAuthAvatar.refresh();
}
async function saveText(){
  try{
    await savePatch({
      display_name:clean($('displayName')&&$('displayName').value,80),
      username:clean($('username')&&$('username').value,60),
      channel_name:clean($('channelName')&&$('channelName').value,90),
      channel_about:clean($('channelAbout')&&$('channelAbout').value,500)
    },'Profile text saved to existing sb_profiles row.');
  }catch(e){status('Profile text save failed: '+(e.message||e),true);if($('debug'))$('debug').textContent=String(e.message||e);}
}
async function uploadImage(kind){
  try{
    const c=await client();
    if(!user)await loadProfile();
    if(!user)return;
    const input=$(kind+'File');
    const file=input&&input.files&&input.files[0];
    if(!file){status('Choose a '+kind+' image first.',true);return;}
    if(!/^image\//.test(file.type)){status('File must be an image.',true);return;}
    const ext=(file.name.split('.').pop()||'png').replace(/[^a-z0-9]/gi,'').toLowerCase();
    const path='profiles/'+user.id+'/'+kind+'-'+Date.now()+'.'+ext;
    status('Uploading '+kind+' image...');
    const up=await c.storage.from(BUCKET).upload(path,file,{cacheControl:'3600',upsert:true,contentType:file.type||'image/png'});
    if(up.error)throw up.error;
    const url=c.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const patch={};patch[kind+'_url']=url;
    await savePatch(patch,kind+' uploaded and saved to '+kind+'_url.');
  }catch(e){status(kind+' upload/save failed: '+(e.message||e),true);if($('debug'))$('debug').textContent=String(e.message||e);}
}
function bind(){
  document.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const target=$(btn.dataset.tab);if(target)target.classList.add('active');});
  ['displayName','username','channelName','channelAbout','avatarUrl','bannerUrl'].forEach(id=>{const el=$(id);if(el)el.addEventListener('input',renderPreview);});
  if($('loadProfile'))$('loadProfile').onclick=loadProfile;
  if($('saveText'))$('saveText').onclick=saveText;
  if($('uploadAvatar'))$('uploadAvatar').onclick=()=>uploadImage('avatar');
  if($('uploadBanner'))$('uploadBanner').onclick=()=>uploadImage('banner');
  if($('reloadStyle'))$('reloadStyle').onclick=()=>window.StreamBanditSharedStyle&&window.StreamBanditSharedStyle.load();
  if($('syncHeader'))$('syncHeader').onclick=()=>{if(window.StreamBanditShellAuth)window.StreamBanditShellAuth.refresh();if(window.StreamBanditAuthAvatar)window.StreamBanditAuthAvatar.refresh();status('Header/profile shell refreshed.');};
}
window.StreamBanditProfileComplete={loadProfile,saveText,uploadAvatar:()=>uploadImage('avatar'),uploadBanner:()=>uploadImage('banner'),renderPreview};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();setTimeout(loadProfile,800);});else{bind();setTimeout(loadProfile,800);}
})();