/* Code Labs Buddy Canvas V131 - Supabase repair-history autosave with one visible full-file validator */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var timer=null;
  var lastSaved='';

  function q(s){return document.querySelector(s);}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function write(s){localStorage.setItem(KEY,JSON.stringify(s||{}));}
  function fixed(){var el=q('#fixedCode');return el?String(el.value||''):'';}
  function source(){
    var visible=q('#loadedCode');
    var value=visible?String(visible.value||''):'';
    if(value&&value!=='No File Lab code loaded yet.')return value;
    var s=state();
    return String((s.file||{}).currentCode||'');
  }
  function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
  function filePath(s){var f=s.file||{},g=f.githubSource||{};return g.path||f.path||f.filename||'';}
  function repoName(s){var f=s.file||{},g=f.githubSource||{},p=s.project||{};if(g.owner&&g.repo)return g.owner+'/'+g.repo;return p.repo||'trevieisking/stream-bandit';}
  function isBuddyMarkdown(path,code){path=String(path||'');code=String(code||'');return /STREAM-BANDIT-BUDDY-(MEMORY|WORKBENCH)-LATEST\.md$/i.test(path)&&/^CODE LABS BUDDY /i.test(code.trim())&&code.length>120&&lines(code)>=3;}

  function setBadge(msg,kind){
    var el=q('#buddyCanvasSupabaseBadge');
    if(!el){
      el=document.createElement('span');
      el.id='buddyCanvasSupabaseBadge';
      el.className='badge warn';
      var line=q('.statusLine');
      if(line)line.appendChild(el);
    }
    if(el){el.className='badge '+(kind||'warn');el.textContent=msg;el.title=msg;}
  }

  function validateFullFile(){
    var s=state();
    var path=filePath(s);
    var code=fixed();
    var old=source();

    if(isBuddyMarkdown(path,code))return{ok:true,reason:'buddy_markdown'};
    if(!path)return{ok:false,reason:'target path is missing'};
    if(!code.trim())return{ok:false,reason:'fixed canvas is empty'};
    if(/BEGIN PATCH|Find:\s*\n|Replace with:|JSON START|CODE LABS SAFE WRITE REQUEST/i.test(code)){
      return{ok:false,reason:'fixed canvas contains a patch or request, not a full file'};
    }
    if(/\.html?$/i.test(path)&&!(/<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code))){
      return{ok:false,reason:'HTML target is not a complete HTML document'};
    }
    if(old.trim()&&code.length<Math.max(120,Math.floor(old.length*.65))){
      return{ok:false,reason:'fixed canvas is much smaller than the visible source'};
    }
    if(lines(code)<3&&code.length<120){
      return{ok:false,reason:'fixed canvas looks like a snippet'};
    }
    return{ok:true,reason:'complete_file'};
  }

  function ensureHistoryHelper(){
    return new Promise(function(resolve){
      if(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll)return resolve(true);
      if(document.querySelector('script[data-buddy-history-helper]')){
        setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll));},900);
        return;
      }
      var sc=document.createElement('script');
      sc.src='assets/code-labs-v1-2-history.js?v=buddy-canvas-v131';
      sc.setAttribute('data-buddy-history-helper','yes');
      sc.onload=function(){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll));},400);};
      sc.onerror=function(){resolve(false);};
      document.head.appendChild(sc);
    });
  }

  function syncLocal(){
    var s=state(),f=s.file||{},p=s.project||{},code=fixed(),path=filePath(s),repo=repoName(s);
    f.fixedCode=code;
    f.currentCode=source()||f.currentCode||'';
    if(path){f.filename=path;f.path=path;}
    f.buddyCanvas=f.buddyCanvas||{};
    f.buddyCanvas.supabaseAutosave='V131';
    f.buddyCanvas.path=path;
    f.buddyCanvas.repo=repo;
    f.buddyCanvas.lastSupabaseAutosaveTry=new Date().toISOString();
    f.buddyCanvas.markdownPacket=isBuddyMarkdown(path,code);
    p.siteName=p.siteName||'stream-bandit';
    p.siteUrl=path||p.siteUrl||location.pathname;
    p.repo=repo;
    p.mode='buddy-canvas';
    s.file=f;
    s.project=p;
    write(s);
  }

  async function saveHistory(force){
    var code=fixed();
    if(!code){setBadge('Supabase blocked - fixed canvas is empty','bad');return false;}
    if(!force&&code===lastSaved){setBadge('Supabase no changes','good');return true;}

    var verdict=validateFullFile();
    if(!verdict.ok){setBadge('Supabase blocked - '+verdict.reason,'bad');return false;}

    syncLocal();
    setBadge('Supabase helper loading','warn');
    var helperOk=await ensureHistoryHelper();
    if(!helperOk){setBadge('Supabase helper missing','bad');return false;}

    setBadge('Supabase saving','warn');
    try{
      var result=await window.CodeLabsRepairHistory.saveAll();
      if(result&&result.ok){
        lastSaved=code;
        setBadge('Supabase saved','good');
        return true;
      }
      var reason=result&&result.error?String(result.error):'save did not complete';
      setBadge('Supabase waiting - '+reason.slice(0,90),'warn');
      return false;
    }catch(e){
      setBadge('Supabase failed - '+String(e&&e.message||e).slice(0,100),'bad');
      return false;
    }
  }

  function schedule(delay){
    clearTimeout(timer);
    setBadge('Supabase save in '+Math.ceil((delay||5000)/1000)+'s','warn');
    timer=setTimeout(function(){saveHistory(false);},delay||5000);
  }

  function bindRetry(id,delay){
    var btn=q(id);
    if(btn){btn.addEventListener('click',function(){setTimeout(function(){saveHistory(true);},delay||450);});}
  }

  function boot(){
    var el=q('#fixedCode');
    if(!el){setTimeout(boot,300);return;}
    setBadge('Supabase ready','warn');
    el.addEventListener('input',function(){schedule(5000);});
    bindRetry('#saveNow',300);
    bindRetry('#autoFill',650);
    bindRetry('#useLoaded',650);
    setTimeout(function(){if(fixed().trim())saveHistory(false);},900);
  }

  window.CodeLabsBuddyCanvasSupabaseAutosaveV131={
    version:'V131',
    validate:validateFullFile,
    save:function(){return saveHistory(true);}
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
