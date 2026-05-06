/* Stream Bandit V5.6.2B — Sidebar Logo From Settings
   Visual sync only. Reads existing local Settings plus Supabase app settings when available.
   No Supabase writes, Mux, player, menu routing, storage upload, or database logic changes. */
(function(){
'use strict';

var VERSION='V5.6.2B';
var KEY='streambandit_v25_data';
var SB_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var SB_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var lastSig='';
var supa=null;
var supabaseSettings=null;
var supabaseTried=false;

function clean(s){return String(s==null?'':s).trim();}
function safeText(s){return clean(s).replace(/[&<>\"]/g,'');}
function safeUrl(u){
  u=clean(u);
  if(!u)return '';
  if(u.indexOf('data:image/')===0)return u;
  if(/^https?:\/\//i.test(u))return u;
  if(/^blob:/i.test(u))return u;
  return '';
}
function client(){
  if(supa)return supa;
  if(!window.supabase||!window.supabase.createClient)return null;
  supa=window.supabase.createClient(SB_URL,SB_KEY);
  return supa;
}
function pick(obj,names){
  if(!obj||typeof obj!=='object')return '';
  for(var i=0;i<names.length;i++){
    var k=names[i];
    if(obj[k]!=null&&clean(obj[k]))return obj[k];
  }
  return '';
}
function mergeSetting(out,obj){
  if(!obj||typeof obj!=='object')return out;
  var logo=pick(obj,['logo','logoUrl','logo_url','appLogo','app_logo','brandLogo','brand_logo','sidebarLogo','sidebar_logo','image','imageUrl','image_url','avatar','avatarUrl','avatar_url','profileLogo','profile_logo','profileImage','profile_image','channelImage','channel_image']);
  var name=pick(obj,['appName','app_name','siteName','site_name','name','brandName','brand_name','title']);
  var tag=pick(obj,['tagline','subTitle','subtitle','sub_title','description','desc','strapline']);
  if(!out.logo&&safeUrl(logo))out.logo=safeUrl(logo);
  if(!out.appName&&clean(name))out.appName=clean(name);
  if(!out.tagline&&clean(tag))out.tagline=clean(tag);
  return out;
}
function scanObject(obj,out,depth){
  if(!obj||typeof obj!=='object'||depth>4)return out;
  mergeSetting(out,obj);
  Object.keys(obj).some(function(k){
    if(out.logo&&out.appName&&out.tagline)return true;
    var v=obj[k];
    if(v&&typeof v==='object')scanObject(v,out,depth+1);
    return false;
  });
  return out;
}
function readLocalSettings(){
  var out={logo:'',appName:'',tagline:''};
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){
      var data=JSON.parse(raw);
      scanObject(data&&data.settings?data.settings:data,out,0);
    }
  }catch(e){}
  try{
    for(var i=0;i<localStorage.length;i++){
      if(out.logo&&out.appName&&out.tagline)break;
      var k=localStorage.key(i);
      var v=localStorage.getItem(k)||'';
      if(!v||v.length>600000)continue;
      if(v.charAt(0)==='{'||v.charAt(0)==='['){
        try{scanObject(JSON.parse(v),out,0);}catch(e){}
      }
    }
  }catch(e){}
  return out;
}
function parseSettingValue(row){
  if(!row||typeof row!=='object')return null;
  var key=clean(row.key||row.name||row.setting_key||row.setting||row.slug||row.id);
  var val=row.value!=null?row.value:(row.setting_value!=null?row.setting_value:(row.json_value!=null?row.json_value:(row.data!=null?row.data:null)));
  if(typeof val==='string'){
    try{if(val.charAt(0)==='{'||val.charAt(0)==='[')val=JSON.parse(val);}catch(e){}
  }
  if(val&&typeof val==='object')return val;
  var o={};
  if(key)o[key]=val;
  mergeSetting(o,row);
  return o;
}
async function readSupabaseSettings(){
  if(supabaseTried)return supabaseSettings;
  supabaseTried=true;
  var c=client();
  if(!c)return null;
  try{
    var q=await c.from('sb_app_settings').select('*').limit(100);
    if(q.error||!q.data)return null;
    var out={logo:'',appName:'',tagline:''};
    q.data.forEach(function(row){
      scanObject(row,out,0);
      scanObject(parseSettingValue(row),out,0);
    });
    supabaseSettings=out;
    applyLogo();
    return out;
  }catch(e){return null;}
}
function currentBrandFallback(){
  var brand=document.querySelector('.side .brand');
  return {
    appName:clean(brand&&brand.querySelector('h1')&&brand.querySelector('h1').textContent)||'Stream Bandit',
    tagline:clean(brand&&brand.querySelector('p')&&brand.querySelector('p').textContent)||'Chatterfriends Movies'
  };
}
function addStyle(){
  if(document.getElementById('sb562Style'))return;
  var st=document.createElement('style');
  st.id='sb562Style';
  st.textContent='\n.side .brand .logo{background:linear-gradient(135deg,rgba(255,45,85,.22),rgba(124,60,255,.24));border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 32px rgba(0,0,0,.32)}.side .brand .logo img{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}\n';
  document.head.appendChild(st);
}
function applyLogo(){
  addStyle();
  var side=document.querySelector('.side');
  var brand=side&&side.querySelector('.brand');
  if(!side||!brand)return;
  var local=readLocalSettings();
  var sup=supabaseSettings||{};
  var fallback=currentBrandFallback();
  var logoUrl=safeUrl(sup.logo)||safeUrl(local.logo);
  var appName=clean(sup.appName)||clean(local.appName)||fallback.appName;
  var tagline=clean(sup.tagline)||clean(local.tagline)||fallback.tagline;
  var sig=[logoUrl,appName,tagline].join('|');
  if(sig===lastSig&&brand.dataset.sb562Applied==='1')return;
  lastSig=sig;
  brand.dataset.sb562Applied='1';
  var logo=brand.querySelector('.logo');
  if(logo&&logoUrl){
    logo.innerHTML='<img alt="'+safeText(appName)+' logo" src="'+logoUrl.replace(/"/g,'%22')+'">';
    logo.dataset.sb562Source=sup.logo?'supabase':'settings';
  }
  var h=brand.querySelector('h1');
  if(h&&appName)h.textContent=appName;
  var p=brand.querySelector('p');
  if(p&&tagline)p.textContent=tagline;
  readSupabaseSettings();
}
function run(){applyLogo();}
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,500);});
window.addEventListener('storage',run);
setInterval(run,1300);
setTimeout(function(){run();try{var t=document.createElement('div');t.className='toast';t.textContent=VERSION+' logo sync loaded';document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}catch(e){}},900);
})();
