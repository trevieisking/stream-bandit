/* Code Labs V1.2.5 - Supabase saved repair history + stable bottom placement */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
  var PUB='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  function $(s,r){return (r||document).querySelector(s);}
  function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function toast(msg){var t=$('#toast');if(!t){console.log(msg);return;}t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2600);}
  function loadScript(){return new Promise(function(resolve,reject){if(window.supabase&&window.supabase.createClient)return resolve();var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  async function client(){await loadScript();if(!window.CL_SB){window.CL_SB=window.supabase.createClient(URL,PUB,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}return window.CL_SB;}
  function setStatus(msg,kind){var el=$('#clHistoryStatus');if(el){el.className='badge '+(kind||'warn');el.textContent=msg;}}
  function setHelp(html){var el=$('#clHistoryHelp');if(el)el.innerHTML=html;}
  async function currentUser(){var sb=await client();var res=await sb.auth.getUser();return {sb:sb,user:res&&res.data?res.data.user:null,error:res.error};}
  function projectPayload(s){var p=s.project||{};return {workspace:p.workspace||'',site_name:p.siteName||'Untitled project',site_url:p.siteUrl||'',repo:p.repo||'',mode:p.mode||'manual',notes:p.notes||'',metadata:{source:'code-labs-v1.2.5',domain:location.hostname}};}
  async function refreshStatus(){try{setStatus('Checking Supabase','warn');var cu=await currentUser();if(cu.user){setStatus('Supabase ready','good');setHelp('<p><b>Supabase:</b> ready for Code Labs repair history. Remove clears selected Code Labs history rows only.</p>');}else{setStatus('Connect Supabase','warn');setHelp('<p><b>Supabase:</b> not active for this Code Labs session. Connect Supabase when asked by ChatGPT/settings, then refresh this panel. Do not use Stream Bandit login for this page.</p>');}return cu;}catch(err){console.error(err);setStatus('Supabase unavailable','bad');setHelp('<p><b>Supabase:</b> check failed. Connect Supabase when asked, then try again. GitHub is separate.</p>');return {user:null,error:err};}}
  async function saveAll(){
    try{
      var cu=await refreshStatus();
      if(!cu.user){toast('Connect Supabase for Code Labs first, then save history.');return {ok:false,reason:'no_supabase_session'};}
      var s=state(), f=s.file||{}, p=s.project||{};
      setStatus('Saving','warn');
      var pr=await cu.sb.from('code_labs_projects').insert(projectPayload(s)).select('id').single();
      if(pr.error)throw pr.error;
      var projectId=pr.data.id;
      var fr=await cu.sb.from('code_labs_files').insert({project_id:projectId,filename:f.filename||'file.html',file_type:(f.filename||'').split('.').pop()||'html',current_code:f.currentCode||'',current_hash:String((f.currentCode||'').length),metadata:{site:p.siteName||'',source:'code-labs-v1.2.5'}}).select('id').single();
      if(fr.error)throw fr.error;
      var fileId=fr.data.id;
      var jr=await cu.sb.from('code_labs_jobs').insert({project_id:projectId,file_id:fileId,title:(f.problem||'Manual repair').slice(0,120),problem:f.problem||'',dont_touch:f.dontTouch||'',errors:f.errors||'',status:'saved',started_at:new Date().toISOString(),completed_at:new Date().toISOString(),metadata:{localLogCount:(s.log||[]).length,buddyCanvas:f.buddyCanvas||null}}).select('id').single();
      if(jr.error)throw jr.error;
      var jobId=jr.data.id;
      var versions=[];
      if(f.currentCode)versions.push({project_id:projectId,job_id:jobId,file_id:fileId,version_kind:'original',label:'Original code',filename:f.filename||'file.html',code:f.currentCode,note:'Saved from Code Labs V1.2.5'});
      if(f.fixedCode)versions.push({project_id:projectId,job_id:jobId,file_id:fileId,version_kind:'fixed',label:'Fixed code',filename:f.filename||'file.html',code:f.fixedCode,note:'Saved from Code Labs V1.2.5'});
      (s.checkpoints||[]).slice(0,20).forEach(function(c){versions.push({project_id:projectId,job_id:jobId,file_id:fileId,version_kind:c.kind||'checkpoint',label:c.label||'Checkpoint',filename:c.filename||f.filename||'file.html',code:c.code||'',note:c.note||''});});
      if(versions.length){var vr=await cu.sb.from('code_labs_versions').insert(versions);if(vr.error)throw vr.error;}
      if(f.packet){var pk=await cu.sb.from('code_labs_packets').insert({project_id:projectId,job_id:jobId,packet_type:f.packetType||'full-file-repair',packet_text:f.packet,metadata:{filename:f.filename||''}});if(pk.error)throw pk.error;}
      var tests=(s.tests||[]).slice(0,20).map(function(t){return {project_id:projectId,job_id:jobId,filename:t.filename||f.filename||'',result:t.result||'UNKNOWN',checked_count:t.checked||0,total_count:t.total||0,notes:t.notes||'',details:t};});
      if(tests.length){var tr=await cu.sb.from('code_labs_test_runs').insert(tests);if(tr.error)throw tr.error;}
      await cu.sb.from('code_labs_audit_log').insert({project_id:projectId,job_id:jobId,action:'saved_repair_history',details:{filename:f.filename||'',hasFixed:!!f.fixedCode,tests:tests.length,source:'code-labs-v1.2.5'}});
      setStatus('Saved to Supabase','good');setHelp('<p><b>Saved:</b> Code Labs repair history saved to Supabase. No GitHub write happened.</p>');toast('Repair history saved to Supabase.');
      loadHistory();
      return {ok:true,project_id:projectId,file_id:fileId,job_id:jobId};
    }catch(err){console.error(err);setStatus('Supabase save failed','bad');setHelp('<p><b>Supabase save failed:</b> '+esc(err.message||err)+'. GitHub is separate.</p>');toast('Supabase save failed: '+(err.message||err));return {ok:false,error:String(err.message||err)};}
  }
  async function removeProject(projectId,label){
    try{
      projectId=String(projectId||'').trim();
      if(!projectId){toast('No history id found.');return {ok:false,reason:'missing_project_id'};}
      var name=label||'this saved repair history entry';
      if(!confirm('Remove '+name+' from Code Labs Supabase history? This does not remove GitHub files, website files, or live pages.'))return {ok:false,reason:'cancelled'};
      var cu=await refreshStatus();
      if(!cu.user){toast('Connect Supabase for Code Labs first, then remove history.');return {ok:false,reason:'no_supabase_session'};}
      setStatus('Removing','warn');
      var box=$('#clHistoryList');
      var item=box?$('[data-cl-history-item="'+projectId+'"]',box):null;
      if(item){item.style.opacity='.55';}
      var childTables=['code_labs_audit_log','code_labs_test_runs','code_labs_packets','code_labs_versions','code_labs_jobs','code_labs_files'];
      for(var i=0;i<childTables.length;i++){
        var rr=await cu.sb.from(childTables[i]).delete().eq('project_id',projectId).eq('owner_id',cu.user.id);
        if(rr.error)throw rr.error;
      }
      var pr=await cu.sb.from('code_labs_projects').delete().eq('id',projectId).eq('owner_id',cu.user.id).select('id').maybeSingle();
      if(pr.error)throw pr.error;
      if(!pr.data||pr.data.id!==projectId){throw new Error('Supabase did not remove this history row. Check delete permission for this signed-in user.');}
      var check=await cu.sb.from('code_labs_projects').select('id').eq('id',projectId).maybeSingle();
      if(check.error)throw check.error;
      if(check.data&&check.data.id){throw new Error('History row is still present after remove.');}
      setStatus('Removed history','good');
      setHelp('<p><b>Removed:</b> the selected Code Labs repair history entry was removed from Supabase. GitHub and website files were not touched.</p>');
      toast('Repair history removed.');
      await loadHistory();
      return {ok:true,project_id:projectId};
    }catch(err){console.error(err);setStatus('Remove failed','bad');setHelp('<p><b>Remove failed:</b> '+esc(err.message||err)+'.</p>');toast('Remove failed: '+(err.message||err));loadHistory();return {ok:false,error:String(err.message||err)};}
  }
  function renderHistoryItem(project, file){
    file=file||{};
    var filename=file.filename||project.site_url||project.site_name||'Saved repair history';
    var chars=file.current_hash?(' · '+file.current_hash+' chars'):'';
    var projectName=project.site_name||project.repo||'Code Labs';
    var sub=projectName+' · '+(project.mode||'manual')+chars;
    var url=project.site_url||'No URL';
    return '<div class="item" data-cl-history-item="'+esc(project.id)+'"><b>'+esc(filename)+'</b><p>'+esc(sub)+'</p><p>'+esc(new Date(project.created_at).toLocaleString())+'</p><p>'+esc(url)+'</p><div class="actions"><button class="btn bad smallBtn" data-cl-remove-history="'+esc(project.id)+'" data-cl-history-name="'+esc(filename)+'" type="button">Remove</button></div></div>';
  }
  async function loadHistory(){
    try{
      var cu=await refreshStatus();
      if(!cu.user){return;}
      var r=await cu.sb.from('code_labs_projects').select('id,site_name,site_url,repo,mode,created_at').order('created_at',{ascending:false}).limit(8);
      if(r.error)throw r.error;
      var projects=r.data||[];
      var ids=projects.map(function(x){return x.id;});
      var byProject={};
      if(ids.length){
        var fr=await cu.sb.from('code_labs_files').select('project_id,filename,current_hash,metadata').in('project_id',ids);
        if(fr.error)throw fr.error;
        (fr.data||[]).forEach(function(f){if(f&&f.project_id&&!byProject[f.project_id])byProject[f.project_id]=f;});
      }
      var box=$('#clHistoryList');
      if(box){
        box.innerHTML=projects.length?projects.map(function(x){return renderHistoryItem(x,byProject[x.id]);}).join(''):'<div class="empty">No saved Supabase history yet.</div>';
        $all('[data-cl-remove-history]',box).forEach(function(btn){btn.onclick=function(){removeProject(btn.getAttribute('data-cl-remove-history'),btn.getAttribute('data-cl-history-name'));};});
      }
      setStatus('History loaded','good');
      setHelp('<p><b>Supabase:</b> history cards show the saved file row first, not stale project text.</p>');
    }catch(err){console.error(err);setStatus('Load failed','bad');setHelp('<p><b>Load failed:</b> '+esc(err.message||err)+'.</p>');toast('Could not load history: '+(err.message||err));}
  }
  window.CodeLabsRepairHistory={refreshStatus:refreshStatus,saveAll:saveAll,loadHistory:loadHistory,currentUser:currentUser,removeProject:removeProject};
  function placeHistoryPanel(panel){
    var main=$('.main');
    if(!main||!panel)return;
    var backup=$('#clBackupPanel');
    var footer=$('.footerNote');
    if(backup&&backup.parentNode===main){
      if(backup.nextSibling!==panel)main.insertBefore(panel,backup.nextSibling);
      return;
    }
    if(footer&&footer.parentNode===main){
      main.insertBefore(panel,footer);
      return;
    }
    if(panel.parentNode!==main)main.appendChild(panel);
  }
  function addPanel(){
    var main=$('.main');
    if(!main){setTimeout(addPanel,120);return;}
    var existing=$('#clHistoryPanel');
    if(existing){placeHistoryPanel(existing);return;}
    var panel=document.createElement('section');panel.className='panel';panel.id='clHistoryPanel';
    panel.innerHTML='<h2>Supabase Repair History</h2><p>Save or remove Code Labs repair history. Remove only clears selected Code Labs history rows; it does not touch GitHub, website files, or live pages.</p><div class="actions"><span id="clHistoryStatus" class="badge warn">Not checked</span><button class="btn ghost" id="clRefreshHistoryStatus">Refresh Supabase</button><button class="btn primary" id="clSaveHistory">Save repair history</button><button class="btn ghost" id="clLoadHistory">Load saved history</button></div><div id="clHistoryHelp" class="notice"><p><b>Supabase:</b> not checked yet. This panel never sends you to Stream Bandit login.</p></div><div id="clHistoryList" class="list"><div class="empty">History not loaded yet.</div></div>';
    placeHistoryPanel(panel);
    $('#clSaveHistory').onclick=saveAll;$('#clLoadHistory').onclick=loadHistory;$('#clRefreshHistoryStatus').onclick=refreshStatus;refreshStatus();
  }
  function start(){setTimeout(addPanel,180);setTimeout(addPanel,650);setTimeout(addPanel,1400);setTimeout(addPanel,2600);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();