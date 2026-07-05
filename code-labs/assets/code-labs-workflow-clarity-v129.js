/* Code Labs Workflow Clarity V129 - route guidance, SEO descriptions, soft locks, no helper rewrite */
(function(){
  'use strict';

  var VERSION='Code Labs Workflow Clarity V129';
  var STATE_KEY='codeLabsV1State';

  var STEPS={
    'index':{n:1,title:'Start Code Labs',route:'index.html',desc:'Start a safe Code Labs repair workflow with a clear path before loading or changing any file.',purpose:'Start here. This page explains the full repair flow before any file work starts.',requires:[],next:'setup',action:'Start Setup'},
    'setup':{n:2,title:'Setup Workspace',route:'setup.html',desc:'Confirm the Code Labs workspace, repository, safety rules and repair context before loading files.',purpose:'Confirm workspace basics before file work.',requires:[],prev:'index',next:'project-picker',action:'Choose Project'},
    'project-picker':{n:3,title:'Choose Project',route:'project-picker.html',desc:'Choose the project and repair target used by File Lab, Packet Builder, Buddy Canvas and GitHub handoff.',purpose:'Choose or confirm the current project.',requires:[],prev:'setup',next:'file-lab',action:'Open File Lab'},
    'file-lab':{n:4,title:'Load Current File',route:'file-lab.html',desc:'Load the current full source file into Code Labs so every later step works from the same source of truth.',purpose:'Load the current full file. This is the source-of-truth step.',requires:[],prev:'project-picker',next:'rescue-room',action:'Describe Problem'},
    'rescue-room':{n:5,title:'Describe The Problem',route:'rescue-room.html',desc:'Explain what is broken, what must be preserved, and what a safe fix must prove before any output is built.',purpose:'Describe the problem and preserve rules before building a packet.',requires:['source'],prev:'file-lab',next:'v20',action:'Open Workflow Hub'},
    'v20':{n:6,title:'Workflow Hub',route:'v20.html',desc:'Choose the safest Code Labs route: read, generate, review, exact patch, Buddy Canvas, GitHub or connector help.',purpose:'Choose the safe repair lane. This page does not rewrite helper logic.',requires:['source'],prev:'rescue-room',next:'packet-builder',action:'Build Packet'},
    'packet-builder':{n:7,title:'Packet Builder',route:'packet-builder.html',desc:'Build the repair packet and send it to Buddy Canvas Source Control using the current Packet Builder bridge.',purpose:'Build the repair packet. This is the canonical send-to-Buddy/Source Control step.',requires:['source'],prev:'v20',next:'buddy-canvas',action:'Send to Buddy Canvas'},
    'buddy-canvas':{n:8,title:'Buddy Canvas',route:'buddy-canvas.html',desc:'Assistant lane for source proof, fixed full-file review, Buddy Canvas snapshots and Source Control preview state.',purpose:'Buddy/assistant lane. It reads source and fixed output; it does not replace the human workflow.',requires:['source'],prev:'packet-builder',next:'patch-desk',action:'Review Fixed File'},
    'patch-desk':{n:9,title:'Patch Desk',route:'patch-desk.html',desc:'Review a safe fixed full-file candidate before Preview and Test. Do not accept snippets as full replacements.',purpose:'Review the fixed full-file candidate before testing.',requires:['source'],prev:'buddy-canvas',next:'patch-lab',action:'Patch Lab Fallback'},
    'patch-lab':{n:10,title:'Patch Lab',route:'patch-lab.html',desc:'Manual fallback for exact full-file repair work when the normal assistant and connector route cannot finish safely.',purpose:'Fallback/manual route. Use only when needed, not before the normal tool path.',requires:['source'],prev:'patch-desk',next:'preview-test',action:'Preview + Test'},
    'preview-test':{n:11,title:'Preview And Test',route:'preview-test.html',desc:'Preview and test the repaired file before checkpointing or preparing a GitHub handoff.',purpose:'Test before promoting. This is where fixed output earns trust.',requires:['source'],prev:'patch-lab',next:'checkpoints',action:'Checkpoint'},
    'checkpoints':{n:12,title:'Checkpoints',route:'checkpoints.html',desc:'Save a repair checkpoint after preview and test have enough proof to continue safely.',purpose:'Checkpoint only after source and test context are clear.',requires:['source'],prev:'preview-test',next:'repo-desk',action:'Repo Desk'},
    'repo-desk':{n:13,title:'Repo Desk',route:'repo-desk.html',desc:'Prepare a clear repository handoff with target path, action, branch and notes before GitHub writing.',purpose:'Prepare repository handoff. Branch and target path must be clear.',requires:['source'],prev:'checkpoints',next:'publish-prep',action:'GitHub Writer'},
    'publish-prep':{n:14,title:'GitHub Writer',route:'publish-prep.html',desc:'Prepare a safe branch and pull request handoff. No direct main write and no partial fake full-file replacement.',purpose:'Prepare GitHub handoff only after testing and repo context are ready.',requires:['source'],prev:'repo-desk',next:'github-tracker',action:'Track PR'},
    'github-tracker':{n:15,title:'GitHub Tracker',route:'github-tracker.html',desc:'Track branch, pull request, preview, checks and safe next action after GitHub handoff.',purpose:'Track PR, preview and checks after handoff.',requires:['source'],prev:'publish-prep',next:'helper-route-map',action:'Scan Helpers'},
    'helper-route-map':{n:16,title:'Helper Route Map',route:'helper-route-map.html',desc:'Scan Code Labs pages, helpers, CSS, JavaScript, localStorage keys, window APIs, table tokens and warnings.',purpose:'Scanner page. Use it before changing helpers.',requires:[],prev:'github-tracker',next:'help',action:'Help'},
    'help':{n:17,title:'Help',route:'help.html',desc:'Get help using Code Labs, repair packets, preview testing, Buddy Canvas and GitHub handoff safely.',purpose:'User help and route support.',requires:[],prev:'helper-route-map',next:'faq',action:'FAQ'},
    'faq':{n:18,title:'FAQ',route:'faq.html',desc:'Clear answers about Code Labs workflow, safe writes, repair history, Buddy Canvas and connector separation.',purpose:'Plain-language answers for users and future assistants.',requires:[],prev:'help',next:'about',action:'About'},
    'about':{n:19,title:'About Code Labs',route:'about.html',desc:'Learn what Code Labs does, what it does not do, and how it stays separate from the Stream Bandit app.',purpose:'Explain the product boundary and safe repair-room role.',requires:[],prev:'faq'}
  };

  var ALIASES={
    'ai-handoff':{n:20,title:'AI Handoff',route:'ai-handoff.html',desc:'Package a clear assistant handoff without changing live files.',purpose:'Support page for AI handoff.',requires:['source'],prev:'patch-lab'},
    'fix-wizard':{n:21,title:'Fix Wizard',route:'fix-wizard.html',desc:'Guided support page for repair decisions.',purpose:'Support page for repair decisions.',requires:['source'],prev:'rescue-room'},
    'start-guide':{n:22,title:'Start Guide',route:'start-guide.html',desc:'Starter guide for Code Labs workflow.',purpose:'Support guide.',requires:[],prev:'index'},
    'context-packet':{n:23,title:'Context Packet',route:'context-packet.html',desc:'Support page for assistant-readable context.',purpose:'Support/proof page.',requires:[],prev:'packet-builder'},
    'connection-guide':{n:24,title:'Connection Guide',route:'connection-guide.html',desc:'Guide to connector separation and safe routing.',purpose:'Connector support page.',requires:[],prev:'connector-status'},
    'connector-status':{n:25,title:'Connector Status',route:'connector-status.html',desc:'Explains GitHub, Supabase and ChatGPT connector separation for Code Labs.',purpose:'Connector status page.',requires:[],prev:'connection-guide'},
    'chatgpt-connection':{n:26,title:'ChatGPT Connection',route:'chatgpt-connection.html',desc:'Support page for ChatGPT and Code Labs connection.',purpose:'Connection support page.',requires:[],prev:'connector-status'},
    'checklist-builder':{n:27,title:'Checklist Builder',route:'checklist-builder.html',desc:'Build a safe test checklist for Code Labs repair work.',purpose:'Checklist support page.',requires:['source'],prev:'preview-test'},
    'repair-bridge-status':{n:28,title:'Repair Bridge Status',route:'repair-bridge-status.html',desc:'Read-only status page for the repair bridge and safe branch pull request workflow.',purpose:'Read-only proof/status page.',requires:[],prev:'helper-route-map'},
    'owner-read-proof':{n:29,title:'Owner Read Proof',route:'owner-read-proof.html',desc:'Read-only owner proof page for connector and repair-room safety.',purpose:'Read-only proof page.',requires:[],prev:'helper-route-map'},
    'read-only-proof':{n:30,title:'Read Only Proof',route:'read-only-proof.html',desc:'Proof page showing read-only safety expectations.',purpose:'Read-only proof page.',requires:[],prev:'helper-route-map'},
    'oauth-discovery':{n:31,title:'OAuth Discovery',route:'oauth-discovery.html',desc:'Support page for OAuth discovery in Code Labs.',purpose:'OAuth support page.',requires:[],prev:'connection-guide'},
    'oauth-flow-test':{n:32,title:'OAuth Flow Test',route:'oauth-flow-test.html',desc:'Support page for OAuth flow testing in Code Labs.',purpose:'OAuth test page.',requires:[],prev:'connection-guide'},
    'app-reader-test':{n:33,title:'App Reader Test',route:'app-reader-test.html',desc:'Read test page for Code Labs app reading.',purpose:'Reader test page.',requires:[],prev:'helper-route-map'},
    'url-reader-test':{n:34,title:'URL Reader Test',route:'url-reader-test.html',desc:'Read test page for Code Labs URL reading.',purpose:'URL reader test page.',requires:[],prev:'helper-route-map'},
    'buddy-canvas-receipt-v115':{n:35,title:'Buddy Canvas Receipt',route:'buddy-canvas-receipt-v115.html',desc:'Receipt and proof page for Buddy Canvas handoff.',purpose:'Buddy Canvas receipt page.',requires:['source'],prev:'buddy-canvas'}
  };

  function q(sel,root){return (root||document).querySelector(sel);}
  function readState(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{};}catch(e){return{};}}
  function text(v){return String(v==null?'':v).trim();}
  function id(){return (document.body&&document.body.getAttribute('data-page'))||pageName();}
  function pageName(){return location.pathname.split('/').pop().replace(/\.html$/,'')||'index';}
  function step(){var key=id();return STEPS[key]||ALIASES[key]||null;}
  function hasSource(s){var f=s.file||{};return !!(text(f.currentCode)||text(f.code)||text(f.filename)||text(f.path)||(f.githubSource&&text(f.githubSource.path)));}
  function hasProblem(s){var j=s.job||{};return !!(text(j.problem)||text(s.problem));}
  function hasFixed(s){var f=s.file||{};return !!(text(f.fixedCode)||text(f.fixed)||text(f.repairedCode));}
  function hasNeed(name,s){if(name==='source')return hasSource(s);if(name==='problem')return hasProblem(s);if(name==='fixed')return hasFixed(s);return true;}
  function missing(req,s){return (req||[]).filter(function(r){return !hasNeed(r,s);});}
  function labelNeed(n){return n==='source'?'load a current file':(n==='problem'?'describe the problem':(n==='fixed'?'create or review a fixed full file':n));}
  function ensureMeta(name,content){if(!content)return;var m=q('meta[name="'+name+'"]');if(!m){m=document.createElement('meta');m.setAttribute('name',name);document.head.appendChild(m);}m.setAttribute('content',content);}
  function setSeo(st){if(!st)return;document.title=st.title+' | Code Labs';ensureMeta('description',st.desc);}
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function routeFor(key){var st=STEPS[key]||ALIASES[key];return st?st.route:'#';}
  function existingContainer(){return q('#clWorkflowClarityV129');}
  function insertTarget(){return q('.main')||q('main')||q('.content')||q('.wrap')||document.body;}
  function pageType(st){if(!st)return 'support';if(st.n<=15)return 'workflow';return 'support';}
  function saveMeaning(key){
    if(key==='file-lab')return 'Use save only after a current source file and path are clear. This means repair history context, not a live website change.';
    if(key==='buddy-canvas')return 'Save here means assistant/source or repair-history snapshot only. It does not write GitHub or change Stream Bandit pages.';
    if(key==='checkpoints')return 'Checkpoint only after preview/test context exists.';
    if(key==='publish-prep'||key==='repo-desk'||key==='github-tracker')return 'This lane prepares or tracks a branch/PR handoff. It is not a generic save step.';
    return 'Save should only appear when this step truly needs a snapshot or handoff.';
  }
  function buddyMessage(key){
    if(key==='packet-builder')return 'Canonical path: use Load for ChatGPT to send Packet Builder state into Source Control preview for Buddy Canvas.';
    if(['patch-desk','patch-lab','preview-test','checkpoints','repo-desk','publish-prep'].indexOf(key)>-1)return 'For assistant help, go through Packet Builder / Source Control before Buddy Canvas so source and path stay clear.';
    if(key==='buddy-canvas')return 'Buddy Canvas is the assistant lane. Load source through Source Control; do not treat it as a live writer.';
    return 'Buddy Canvas is available when this step needs assistant/full-code review.';
  }
  function render(){
    var st=step();if(!st||existingContainer())return;
    var s=readState();var miss=missing(st.requires,s);var locked=miss.length>0;var key=id();
    setSeo(st);
    document.documentElement.setAttribute('data-cl-step',String(st.n));
    if(locked)document.documentElement.setAttribute('data-cl-step-locked','true');else document.documentElement.removeAttribute('data-cl-step-locked');

    var prev=st.prev?routeFor(st.prev):'';
    var next=st.next?routeFor(st.next):'';
    var type=pageType(st);
    var actionHtml='';
    if(locked){
      actionHtml='<a class="cl-v129-back" href="'+escapeHtml(prev||'file-lab.html')+'">Back to previous step: '+escapeHtml((STEPS[st.prev]||ALIASES[st.prev]||{}).title||'complete earlier step')+'</a>';
    }else if(next){
      actionHtml='<a class="cl-v129-next" href="'+escapeHtml(next)+'">Next: '+escapeHtml(st.action||'Continue')+'</a>';
    }
    var buddyHref=key==='packet-builder'?'#packetToSourceControlV127':'packet-builder.html';
    var buddyText=key==='packet-builder'?'Use Packet Builder Source Control':'Go to Packet Builder to send to Buddy Canvas';

    var box=document.createElement('section');
    box.id='clWorkflowClarityV129';
    box.className='cl-v129-box '+(locked?'cl-v129-locked':'cl-v129-ready');
    box.innerHTML='<style id="clWorkflowClarityV129Style">'+
      '#clWorkflowClarityV129{border:1px solid #ffffff24;border-radius:24px;background:linear-gradient(135deg,#101529,#17122d);box-shadow:0 16px 44px #0007;padding:14px;margin:0 0 14px;color:#fff;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif}'+
      '#clWorkflowClarityV129 *{box-sizing:border-box}#clWorkflowClarityV129 .cl-v129-top{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}'+
      '#clWorkflowClarityV129 .cl-v129-badge,#clWorkflowClarityV129 .cl-v129-pill{display:inline-flex;border-radius:999px;padding:6px 10px;font-weight:950;border:1px solid #22d3a666;background:#22d3a624;color:#dfffee}'+
      '#clWorkflowClarityV129 .cl-v129-pill{font-size:12px;border-color:#ffffff28;background:#ffffff10;color:#dfe6ff}#clWorkflowClarityV129 .cl-v129-red{border-color:#ff4d6d88;background:#ff4d6d24;color:#ffd1da}'+
      '#clWorkflowClarityV129 h2{margin:10px 0 6px;font-size:22px;letter-spacing:-.03em}#clWorkflowClarityV129 p{margin:6px 0;color:#b9c0d8;line-height:1.45}'+
      '#clWorkflowClarityV129 .cl-v129-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;margin-top:10px}#clWorkflowClarityV129 .cl-v129-card{border:1px solid #ffffff18;background:#ffffff0c;border-radius:16px;padding:10px}'+
      '#clWorkflowClarityV129 .cl-v129-card b{display:block;color:#dfffee;margin-bottom:4px}#clWorkflowClarityV129 a{font-weight:950;text-decoration:none}'+
      '#clWorkflowClarityV129 .cl-v129-next,#clWorkflowClarityV129 .cl-v129-buddy{display:inline-flex;border-radius:999px;padding:10px 13px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#061017;margin:6px 8px 0 0}'+
      '#clWorkflowClarityV129 .cl-v129-back{display:inline-flex;border-radius:999px;padding:10px 13px;background:linear-gradient(135deg,#ff4d6d,#7c3cff);color:#fff;margin:6px 8px 0 0}'+
      '#clWorkflowClarityV129 .cl-v129-note{border-left:4px solid #ff4d6d;padding-left:10px}'+
      '@media(max-width:820px){#clWorkflowClarityV129 .cl-v129-next,#clWorkflowClarityV129 .cl-v129-back,#clWorkflowClarityV129 .cl-v129-buddy{width:100%;justify-content:center}}'+
      '</style>'+
      '<div class="cl-v129-top"><span class="cl-v129-badge">Page guide · '+escapeHtml(type)+'</span><span class="cl-v129-pill '+(locked?'cl-v129-red':'')+'">'+(locked?'Locked until previous step is complete':'Ready for this page')+'</span></div>'+
      '<h2>'+escapeHtml(st.title)+'</h2><p>'+escapeHtml(st.desc)+'</p>'+
      (locked?'<p class="cl-v129-note"><b>Missing:</b> '+escapeHtml(miss.map(labelNeed).join(', '))+'. Use the red back link first; do not skip the workflow.</p>':'')+
      '<div>'+actionHtml+'<a class="cl-v129-buddy" href="'+escapeHtml(buddyHref)+'">'+escapeHtml(buddyText)+'</a></div>'+
      '<div class="cl-v129-grid"><div class="cl-v129-card"><b>Purpose</b><p>'+escapeHtml(st.purpose)+'</p></div><div class="cl-v129-card"><b>Save wording</b><p>'+escapeHtml(saveMeaning(key))+'</p></div><div class="cl-v129-card"><b>Buddy Canvas</b><p>'+escapeHtml(buddyMessage(key))+'</p></div><div class="cl-v129-card"><b>Existing workflow buttons stay</b><p>The green Workflow buttons / where am I panel remains the main step map. This V129 panel only adds guidance and soft locks.</p></div></div>';

    var target=insertTarget();
    if(target.firstChild)target.insertBefore(box,target.firstChild);else target.appendChild(box);
  }

  function boot(){render();setTimeout(render,250);setTimeout(render,900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.CodeLabsWorkflowClarityV129={version:VERSION,steps:STEPS,aliases:ALIASES,render:render,state:readState};
})();
