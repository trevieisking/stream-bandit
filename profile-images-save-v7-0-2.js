(function(){
'use strict';
const BUCKET='stream-bandit-images';
let sb=null,user=null;
const $=id=>document.getElementById(id);
function setStatus(t,bad){const s=$('status'); if(s){s.textContent=t; s.className=bad?'status bad':'status';}}
async function client(){
  if(sb)return sb;
  const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());
  const url=(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1];
  const key=(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1];
  sb=supabase.createClient(url,key);
  return sb;
}
function show(data){
  const av=data&&data.avatar_url||'';
  const ba=data&&data.banner_url||'';
  if($('avatarUrl')) $('avatarUrl').value=av;
  if($('bannerUrl')) $('bannerUrl').value=ba;
  if($('avatarPreview')) $('avatarPreview').innerHTML=av?'<img src="'+av.replace(/"/g,'')+'" alt="avatar">':'👤';
  if($('bannerPreview')) $('bannerPreview').innerHTML=ba?'<img src="'+ba.replace(/"/g,'')+'" alt="banner">':'Banner';
}
async function loadImages(){
  try{
    const c=await client();
    const sess=await c.auth.getSession();
    user=sess.data&&sess.data.session?sess.data.session.user:null;
    if(!user){setStatus('Signed out. Log in first.',true);return;}
    const r=await c.from('sb_profiles').select('id,avatar_url,banner_url,display_name,username,role').eq('id',user.id).maybeSingle();
    if(r.error)throw r.error;
    if(!r.data){setStatus('No existing sb_profiles row. This test will not insert.',true);return;}
    show(r.data);
    if($('debug')) $('debug').textContent=JSON.stringify(r.data,null,2);
    setStatus('Profile image fields loaded.');
  }catch(e){setStatus('Load failed: '+(e.message||e),true); if($('debug')) $('debug').textContent=String(e.message||e);}
}
async function uploadImage(kind){
  try{
    const c=await client();
    if(!user) await loadImages();
    if(!user) return;
    const input=$(kind+'File');
    const file=input&&input.files&&input.files[0];
    if(!file){setStatus('Choose '+kind+' image first.',true);return;}
    if(!/^image\//.test(file.type)){setStatus('File must be an image.',true);return;}
    const ext=(file.name.split('.').pop()||'png').replace(/[^a-z0-9]/gi,'').toLowerCase();
    const path='profiles/'+user.id+'/'+kind+'-'+Date.now()+'.'+ext;
    setStatus('Uploading '+kind+' image...');
    const up=await c.storage.from(BUCKET).upload(path,file,{cacheControl:'3600',upsert:true,contentType:file.type||'image/png'});
    if(up.error)throw up.error;
    const url=c.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const patch={updated_at:new Date().toISOString()};
    patch[kind+'_url']=url;
    const r=await c.from('sb_profiles').update(patch).eq('id',user.id).select('avatar_url,banner_url,updated_at').maybeSingle();
    if(r.error)throw r.error;
    if(!r.data)throw new Error('No row updated.');
    show(r.data);
    if($('debug')) $('debug').textContent=JSON.stringify({saved:patch,result:r.data},null,2);
    setStatus(kind+' uploaded and saved to '+kind+'_url.');
    if(window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh) window.StreamBanditShellAuth.refresh();
  }catch(e){setStatus(kind+' upload/save failed: '+(e.message||e),true); if($('debug')) $('debug').textContent=String(e.message||e);}
}
window.StreamBanditProfileImages={loadImages,uploadAvatar:()=>uploadImage('avatar'),uploadBanner:()=>uploadImage('banner')};
})();