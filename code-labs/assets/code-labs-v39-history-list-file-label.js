/* Code Labs V3.10 - show saved file row only in Supabase Repair History list */
(function(){
  'use strict';
  function q(sel,root){return(root||document).querySelector(sel)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function setStatus(msg,kind){var el=q('#clHistoryStatus');if(el){el.className='badge '+(kind||'warn');el.textContent=msg}}
  function setHelp(html){var el=q('#clHistoryHelp');if(el)el.innerHTML=html}
  async function loadHistoryWithFiles(){
    var api=window.CodeLabsRepairHistory;
    if(!api||!api.currentUser){return api&&api.loadHistory?api.loadHistory():null}
    try{
      var cu=await api.currentUser();
      if(!cu.user){setStatus('Connect Supabase','warn');return}
      var pr=await cu.sb.from('code_labs_projects').select('id,site_name,site_url,repo,mode,created_at').order('created_at',{ascending:false}).limit(8);
      if(pr.error)throw pr.error;
      var projects=pr.data||[], ids=projects.map(function(x){return x.id});
      var byProject={};
      if(ids.length){
        var fr=await cu.sb.from('code_labs_files').select('project_id,filename,current_hash,metadata').in('project_id',ids);
        if(fr.error)throw fr.error;
        (fr.data||[]).forEach(function(f){if(!byProject[f.project_id])byProject[f.project_id]=f});
      }
      var box=q('#clHistoryList');
      if(box){
        box.innerHTML=projects.length?projects.map(function(x){
          var f=byProject[x.id]||{};
          var filename=f.filename||x.site_name||x.repo||'Saved repair history';
          var chars=f.current_hash?(' · '+f.current_hash+' chars'):'';
          var project=x.site_name||x.repo||'Code Labs';
          var savedLine='Saved file row · '+filename;
          return '<div class="item" data-cl-history-item="'+esc(x.id)+'"><b>'+esc(filename)+'</b><p>'+esc(project)+' · '+esc(x.mode||'manual')+chars+'</p><p>'+esc(new Date(x.created_at).toLocaleString())+'</p><p>'+esc(savedLine)+'</p><div class="actions"><button class="btn bad smallBtn" data-cl-remove-history="'+esc(x.id)+'" data-cl-history-name="'+esc(filename)+'" type="button">Remove</button></div></div>';
        }).join(''):'<div class="empty">No saved Supabase history yet.</div>';
        Array.prototype.slice.call(box.querySelectorAll('[data-cl-remove-history]')).forEach(function(btn){btn.onclick=function(){api.removeProject(btn.getAttribute('data-cl-remove-history'),btn.getAttribute('data-cl-history-name'))}});
      }
      setStatus('History loaded','good');
      setHelp('<p><b>Supabase:</b> history cards now show saved file rows only. Stale project URL labels are hidden.</p>');
    }catch(err){console.error(err);setStatus('Load failed','bad');setHelp('<p><b>Load failed:</b> '+esc(err.message||err)+'.</p>')}
  }
  function hook(){
    var api=window.CodeLabsRepairHistory;
    if(!api||!api.loadHistory){setTimeout(hook,160);return}
    if(!api.__v310FileRowOnlyList){
      api.loadHistory=loadHistoryWithFiles;
      api.__v310FileRowOnlyList=true;
    }
    var btn=q('#clLoadHistory');
    if(btn)btn.onclick=loadHistoryWithFiles;
    loadHistoryWithFiles();
  }
  function start(){hook();setTimeout(hook,500);setTimeout(hook,1200);setTimeout(hook,2400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();