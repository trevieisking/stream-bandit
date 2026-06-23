/* Code Labs V1.2 - Supabase saved repair history */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
  var PUB='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  var LIVE='https://chatterfriendsstreambandit.co.uk';
  function $(s,r){return (r||document).querySelector(s);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function toast(msg){var t=$('#toast');if(!t){alert(msg);return;}t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2600);}
  function loadScript(){return new Promise(function(resolve,reject){if(window.supabase&&window.supabase.createClient)return resolve();var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  async function client(){await loadScript();if(!window.CL_SB){window.CL_SB=window.supabase.createClient(URL,PUB,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}return window.CL_SB;}
  function setStatus(msg,kind){var el=$('#clHistoryStatus');if(el){el.className='badge '+(kind||'warn');el.textContent=msg;}}
  function previewHost(){return location.hostname.indexOf('raw.githack.com')!==-1||location.hostname.indexOf('localhost')!==-1;}
  function setHelp(msg){var el=$('#clHistoryHelp');if(el)el.innerHTML='<p>'+msg+'</p>';}
  function userLabel(user){return user&&(user.email||user.id)?('Signed in'+(user.email?' as '+user.email:'')):'Sign in needed';}
  async function currentUser(){var sb=await client();var session=null;try{var sr=await sb.auth.getSession();session=sr&&sr.data?sr.data.session:null;}catch(e){}var res=await sb.auth.getUser();return {sb:sb,user:res&&res.data?res.data.user:null,session:session,error:res.error};}
  async function refreshAuth(){try{setStatus('Checking Supabase','warn');var cu=await currentUser();if(cu.user){setStatus('Signed in','good');setHelp('<b>Supabase ready:</b> '+esc(userLabel(cu.user))+'. GitHub does not need to be connected for Supabase repair history.');return cu;}if(previewHost()){setStatus('Preview mode','warn');setHelp('<b>Branch preview note:</b> this preview cannot share your live-site Supabase login. After merge, open the live Code Labs page and it should show signed in if you are signed in on the main site. GitHub connection is not required.');return cu;}setStatus('Sign in needed','bad');setHelp('<b>Sign-in needed:</b> open the normal Stream Bandit site, sign in, then return here and click Refresh sign-in. Supabase history works separately from GitHub.');return cu;}catch(err){console.error(err);setStatus('Supabase check failed','bad');setHelp('<b>Supabase check failed:</b> '+esc(err.message||err)+'. GitHub connection is not required for this panel.');return {user:null,error:err};}}
  function projectPayload(s){var p=s.project||{};return {workspace:p.workspace||'',site_name:p.siteName||'Untitled project',site_url:p.siteUrl||'',repo:p.repo||'',mode:p.mode||'manual',notes:p.notes||'',metadata:{source:'code-labs-v1.2',domain:location.hostname}};}
  async function saveAll(){
    try{
      setStatus('Checking Supabase','warn');
      var cu=await refreshAuth();
      if(!cu.user){toast(previewHost()?'Use the live domain for signed-in Supabase saves.':'Sign in to the site first, then save history.');return;}
      var s=state(), f=s.file||{}, p=s.project||{};
      setStatus('Saving','warn');
      var pr=await cu.sb.from('code_labs_projects').insert(projectPayload(s)).select('id').single();
      if(pr.error)throw pr.error;
      var projectId=pr.data.id;
      var fr=await cu.sb.from('code_labs_files').insert({project_id:projectId,filename:f.filename||'file.html',file_type:(f.filename||'').split('.').pop()||'html',current_code:f.currentCode||'',current_hash:String((f.currentCode||'').length),metadata:{site:p.siteName||''}}).select('id').single();
      if(fr.error)throw fr.error;
      var fileId=fr.data.id;
      var jr=await cu.sb.from('code_labs_jobs').insert({project_id:projectId,file_id:fileId,title:(f.problem||'Manual repair').slice(0,120),problem:f.problem||'',dont_touch:f.dontTouch||'',errors:f.errors||'',status:'saved',started_at:new Date().toISOString(),completed_at:new Date().toISOString(),metadata:{localLogCount:(s.log||[]).length}}).select('id').single();
      if(jr.error)throw jr.error;
      var jobId=jr.data.id;
      var versions=[];
      if(f.currentCode)versions.push({project_id:projectId,job_id:jobId,file_id:fileId,version_kind:'original',label:'Original code',filename:f.filename||'file.html',code:f.currentCode,note:'Saved from Code Labs V1.2'});
      if(f.fixedCode)versions.push({project_id:projectId,job_id:jobId,file_id:fileId,version_kind:'fixed',label:'Fixed code',filename:f.filename||'file.html',code:f.fixedCode,note:'Saved from Code Labs V1.2'});
      (s.checkpoints||[]).slice(0,20).forEach(function(c){versions.push({project_id:projectId,job_id:jobId,file_id:fileId,version_kind:c.kind||'checkpoint',label:c.label||'Checkpoint',filename:c.filename||f.filename||'file.html',code:c.code||'',note:c.note||''});});
      if(versions.length){var vr=await cu.sb.from('code_labs_versions').insert(versions);if(vr.error)throw vr.error;}
      if(f.packet){var pk=await cu.sb.from('code_labs_packets').insert({project_id:projectId,job_id:jobId,packet_type:f.packetType||'full-file-repair',packet_text:f.packet,metadata:{filename:f.filename||''}});if(pk.error)throw pk.error;}
      var tests=(s.tests||[]).slice(0,20).map(function(t){return {project_id:projectId,job_id:jobId,filename:t.filename||f.filename||'',result:t.result||'UNKNOWN',checked_count:t.checked||0,total_count:t.total||0,notes:t.notes||'',details:t};});
      if(tests.length){var tr=await cu.sb.from('code_labs_test_runs').insert(tests);if(tr.error)throw tr.error;}
      await cu.sb.from('code_labs_audit_log').insert({project_id:projectId,job_id:jobId,action:'saved_repair_history',details:{filename:f.filename||'',hasFixed:!!f.fixedCode,tests:tests.length}});
      setStatus('Saved to Supabase','good');setHelp('<b>Saved:</b> this repair history was saved to Supabase. No GitHub write happened.');toast('Repair history saved to Supabase.');
      loadHistory();
    }catch(err){console.error(err);setStatus('Save failed','bad');setHelp('<b>Save failed:</b> '+esc(err.message||err)+'. This is a Supabase issue, not a GitHub connection issue.');toast('Supabase save failed: '+(err.message||err));}
  }
  async function loadHistory(){
    try{
      var cu=await refreshAuth();
      if(!cu.user){return;}
      var r=await cu.sb.from('code_labs_projects').select('id,site_name,site_url,repo,mode,created_at').order('created_at',{ascending:false}).limit(8);
      if(r.error)throw r.error;
      var box=$('#clHistoryList');
      if(box){box.innerHTML=(r.data||[]).length?(r.data||[]).map(function(x){return '<div class="item"><b>'+esc(x.site_name||'Untitled')+'</b><p>'+esc(x.site_url||'No URL')+'</p><p>'+esc(new Date(x.created_at).toLocaleString())+' · '+esc(x.mode||'manual')+'</p></div>';}).join(''):'<div class="empty">No saved Supabase history yet.</div>';}
      setStatus('Signed in','good');setHelp('<b>History loaded:</b> Supabase repair history loaded. GitHub connection is not required.');
    }catch(err){console.error(err);setStatus('Load failed','bad');setHelp('<b>Load failed:</b> '+esc(err.message||err)+'.');toast('Could not load history: '+(err.message||err));}
  }
  function addPanel(){
    var main=$('.main');
    if(!main){setTimeout(addPanel,120);return;}
    if($('#clHistoryPanel'))return;
    var panel=document.createElement('section');panel.className='panel';panel.id='clHistoryPanel';
    panel.innerHTML='<h2>Supabase Repair History</h2><p>Save this repair job to your private Code Labs tables. Supabase repair history does not need GitHub to be connected and still does not change live files.</p><div class="actions"><span id="clHistoryStatus" class="badge warn">Not checked</span><button class="btn ghost" id="clRefreshAuth">Refresh sign-in</button><button class="btn primary" id="clSaveHistory">Save repair history</button><button class="btn ghost" id="clLoadHistory">Load saved history</button><a class="btn ghost" href="'+LIVE+'" target="_blank" rel="noopener">Open live site sign-in</a></div><div id="clHistoryHelp" class="notice"><p><b>Checking Supabase sign-in...</b></p></div><div id="clHistoryList" class="list"><div class="empty">History not loaded yet.</div></div>';
    var safety=$('#clSafetyTools');var footer=$('.footerNote');if(safety&&safety.parentNode){safety.parentNode.insertBefore(panel,safety.nextSibling);}else if(footer){main.insertBefore(panel,footer);}else{main.appendChild(panel);} 
    $('#clSaveHistory').onclick=saveAll;$('#clLoadHistory').onclick=loadHistory;$('#clRefreshAuth').onclick=refreshAuth;refreshAuth();
  }
  function start(){setTimeout(addPanel,180);setTimeout(addPanel,650);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
