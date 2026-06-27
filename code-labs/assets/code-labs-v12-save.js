/* Code Labs V1.8.6 - Rescue Room in workflow menu */
(function(){
  var ICON='assets/code-labs-icon.svg';
  var FLOW=[
    ['index','Home','Start here','index.html','🏠'],
    ['file-lab','File Lab','Load or read code','file-lab.html','📄'],
    ['v20','Workflow Hub','Ask ChatGPT','v20.html','🧰'],
    ['patch-desk','Patch Desk','Paste fixed file','patch-desk.html','🧩'],
    ['preview-test','Preview + Test','Check before live','preview-test.html','🧪'],
    ['checkpoints','Checkpoints','Rollback saved','checkpoints.html','💾']
  ];
  var ADV=[
    ['patch-lab','Patch Lab','Exact line tool','patch-lab.html','🧠'],
    ['help','Help + Tools','All utilities','help.html','🛠️']
  ];
  var ALL=FLOW.concat(ADV);
  var FLOW_INDEX={};
  FLOW.forEach(function(item,i){FLOW_INDEX[item[0]]=i;});
  var RESCUE=['rescue-room','Rescue Room','Repair safely','rescue-room.html','🛟'];
  var MENU_FLOW=FLOW.slice(0,2).concat([RESCUE],FLOW.slice(2));
  var NEXT={
    'index':'file-lab','start-guide':'file-lab','setup':'file-lab','project-picker':'file-lab','fix-wizard':'file-lab',
    'file-lab':'rescue-room','rescue-room':'v20','packet-builder':'v20','v20':'patch-desk',
    'patch-desk':'preview-test','patch-lab':'preview-test','preview-test':'checkpoints','checkpoints':'index',
    'ai-handoff':'index','publish-prep':'index','repo-desk':'index','github-tracker':'index','connector-status':'index','help':'index'
  };
  var PREV={
    'index':'checkpoints','file-lab':'index','v20':'file-lab','patch-desk':'v20','patch-lab':'patch-desk','preview-test':'patch-desk','checkpoints':'preview-test',
    'start-guide':'index','setup':'index','project-picker':'index','fix-wizard':'index','rescue-room':'file-lab','packet-builder':'file-lab','ai-handoff':'patch-desk','publish-prep':'patch-desk','repo-desk':'patch-desk','github-tracker':'patch-desk','connector-status':'index','help':'index'
  };
  function page(){return document.body.getAttribute('data-page')||'index';}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function toast(msg){var t=document.querySelector('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}}
  function copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'').then(function(){toast('Copied');});return;}var a=document.createElement('textarea');a.value=text||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied');}
  function loadHistory(){if(document.querySelector('script[data-code-labs-history]'))return;var s=document.createElement('script');s.src='assets/code-labs-v1-2-history.js';s.setAttribute('data-code-labs-history','yes');document.head.appendChild(s);}
  function textReplace(root,from,to){var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),node;while((node=walker.nextNode())){if(node.nodeValue.indexOf(from)!==-1){node.nodeValue=node.nodeValue.split(from).join(to);}}}
  function findFlow(id){if(id==='rescue-room')return RESCUE;return ALL.filter(function(x){return x[0]===id;})[0]||FLOW[0];}
  function flowOnly(id){if(id==='rescue-room')return RESCUE;return FLOW.filter(function(x){return x[0]===id;})[0]||null;}
  function link(item,id){var a=document.createElement('a');a.href=item[3];if(item[0]===id)a.className='active';a.innerHTML='<span>'+item[4]+'</span><div>'+item[1]+'<small>'+item[2]+'</small></div>';return a;}
  function ensureFavicon(){
    var icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}
    icon.type='image/svg+xml';icon.href=ICON;
  }
  function simplifyMenu(){
    var nav=document.querySelector('.nav');if(!nav)return;
    var id=page();while(nav.firstChild)nav.removeChild(nav.firstChild);
    var label=document.createElement('div');label.className='navGroupLabel';label.style.display='block';label.textContent='Workflow';nav.appendChild(label);
    MENU_FLOW.forEach(function(item){nav.appendChild(link(item,id));});
    var adv=document.createElement('div');adv.className='navGroupLabel';adv.style.display='block';adv.textContent='Advanced';nav.appendChild(adv);
    ADV.forEach(function(item){nav.appendChild(link(item,id));});
  }
  function updatePageChrome(){
    var id=page(), item=findFlow(id), title=item[1];
    document.title=id==='index'?'Code Labs':'Code Labs - '+title;
    var crumbs=document.querySelector('.crumbs');
    if(crumbs){crumbs.innerHTML='<span>Code Labs</span><span>›</span><b>'+esc(title)+'</b>';}
  }
  function flowInfo(id){
    var next=flowOnly(NEXT[id])||FLOW[1], prev=flowOnly(PREV[id])||FLOW[0];
    var pos=FLOW_INDEX[id];
    var step=(typeof pos==='number')?pos+1:'Advanced';
    var title=(typeof pos==='number')?FLOW[pos][1]:(id==='patch-lab'?'Patch Lab advanced tool':id==='help'?'Help + Tools':id==='rescue-room'?'Rescue Room':'Extra tool');
    var note=(typeof pos==='number')?'This is part '+step+' of '+FLOW.length+' in the main Code Labs flow.':(id==='patch-lab'?'Patch Lab is kept as an advanced exact-line tool. Patch Desk is the main workflow patching page.':id==='help'?'Help keeps the useful tools and feedback in one place.':id==='rescue-room'?'Rescue Room checks and repairs after File Lab before Workflow Hub.':'This extra page is not in the main flow. Use Previous or Next to return to the simple workflow.');
    return {next:next,prev:prev,step:step,title:title,note:note};
  }
  function addNextFlowPanel(){
    var main=document.querySelector('.main');if(!main||document.querySelector('#clNextFlowPanel'))return;
    var id=page(), info=flowInfo(id);
    var panel=document.createElement('section');panel.className='panel';panel.id='clNextFlowPanel';panel.style.border='2px solid rgba(15,159,110,.28)';
    panel.innerHTML='<h2>Workflow buttons</h2><p><b>'+esc(info.title)+'</b> · '+esc(info.note)+'</p><div class="actions"><a class="btn ghost" href="'+info.prev[3]+'">Previous: '+esc(info.prev[1])+'</a><a class="btn good" href="'+info.next[3]+'">Next: '+esc(info.next[1])+'</a></div>';
    var top=document.querySelector('.topbar');
    if(top&&top.parentNode){top.parentNode.insertBefore(panel,top.nextSibling);return;}
    var first=document.querySelector('.hero,.panel');
    if(first&&first.parentNode){first.parentNode.insertBefore(panel,first);}else{main.insertBefore(panel,main.firstChild);}
  }
  function simpleText(){
    textReplace(document.body,'Code Labs V1 Manual Rescue Build','Code Labs simple workflow build');
    textReplace(document.body,'Local manual mode · No live writes from these pages.','Simple workflow · browser prepares, ChatGPT/GitHub handles repo work.');
    textReplace(document.body,'Future app links','Extra connector info');
    textReplace(document.body,'Manual rescue works now. GitHub and Supabase are planned connector layers.','Use the simple workflow. GitHub connector work happens through ChatGPT; Supabase history is separate.');
    textReplace(document.body,'GitHub later','GitHub through ChatGPT');
    textReplace(document.body,'Supabase later','Supabase history separate');
  }
  function addPublicHelpGuide(){
    if(page()!=='help'||document.querySelector('#clPublicHelpGuide'))return;
    var main=document.querySelector('.main');if(!main)return;
    var panel=document.createElement('section');panel.className='panel';panel.id='clPublicHelpGuide';panel.style.border='2px solid rgba(36,91,255,.22)';
    panel.innerHTML='<h2>Code Labs public guide</h2><p>Use this page when you are not sure what to copy, what to preserve, or whether a change is safe to promote.</p><div class="grid3"><div class="item"><b>Use in 60 seconds</b><p>Start in File Lab, use Rescue Room if needed, build the request in Workflow Hub, paste the fixed file in Patch Desk, preview it, then save a checkpoint.</p><span class="badge good">Normal flow</span></div><div class="item"><b>Promotion checklist</b><p>Only promote after the page opens, menu/buttons work, mobile looks acceptable, no obvious error text is visible, and a checkpoint exists.</p><span class="badge warn">Before live</span></div><div class="item"><b>Problem report</b><p>Tell ChatGPT the page, what you clicked, what happened, what must not change, and paste any copied report from these tools.</p><span class="badge">Copy evidence</span></div></div><div class="notice"><p><b>Safe rule:</b> the tested workflow stays locked. Help adds guidance only; it does not replace the File Lab → Rescue Room → Workflow Hub → Patch Desk → Preview + Test → Checkpoints flow.</p></div>';
    var first=document.querySelector('#clBackendVsHosting,.panel');
    if(first&&first.parentNode){first.parentNode.insertBefore(panel,first);}else{main.appendChild(panel);}
  }
  function addHelpFeedback(){
    if(page()!=='help'||document.querySelector('#clHelpFeedback'))return;
    var main=document.querySelector('.main');if(!main)return;
    var panel=document.createElement('section');panel.className='panel';panel.id='clHelpFeedback';
    panel.innerHTML='<h2>Feedback</h2><p>Use this to tell ChatGPT what is useful, confusing, broken, or missing. It saves in this browser only and can be copied into ChatGPT.</p><div class="grid2"><label>Rating<select id="clFeedbackRating"><option>PASS - useful</option><option>OK - needs polish</option><option>FAIL - confusing</option></select></label><label>Page or tool<input id="clFeedbackPage" placeholder="Example: Patch Desk, File Lab, Help"></label></div><label>What worked?<textarea id="clFeedbackWorked" class="mid" placeholder="What helped you?"></textarea></label><label>What needs fixing?<textarea id="clFeedbackFix" class="mid" placeholder="What was confusing or missing?"></textarea></label><div class="actions"><button class="btn primary" id="clSaveFeedback">Save feedback</button><button class="btn ghost" id="clCopyFeedback">Copy feedback</button></div><textarea id="clFeedbackOutput" class="mid" readonly placeholder="Saved feedback report will appear here"></textarea>';
    main.appendChild(panel);
    function report(){return ['CODE LABS FEEDBACK','Rating: '+(document.querySelector('#clFeedbackRating')||{}).value,'Page/tool: '+(document.querySelector('#clFeedbackPage')||{}).value,'','What worked:',(document.querySelector('#clFeedbackWorked')||{}).value,'','What needs fixing:',(document.querySelector('#clFeedbackFix')||{}).value,'','Rule: keep Code Labs simple and useful for non-coders.'].join('\n');}
    function save(){var out=document.querySelector('#clFeedbackOutput');var text=report();if(out)out.value=text;localStorage.setItem('codeLabsFeedbackLatest',text);toast('Feedback saved');}
    document.querySelector('#clSaveFeedback').onclick=save;
    document.querySelector('#clCopyFeedback').onclick=function(){save();copyText((document.querySelector('#clFeedbackOutput')||{}).value||'');};
    var old=localStorage.getItem('codeLabsFeedbackLatest');if(old){document.querySelector('#clFeedbackOutput').value=old;}
  }
  function addHelpShortcut(){
    if(document.querySelector('#clHelpShortcut'))return;
    var main=document.querySelector('.main');if(!main)return;
    var div=document.createElement('div');div.id='clHelpShortcut';div.className='footerNote';div.innerHTML='Simple Code Labs flow: Home → File Lab → Rescue Room → Workflow Hub → Patch Desk → Preview + Test → Checkpoints. Patch Lab stays as an advanced exact-line tool. Help keeps all useful extra tools and feedback.';
    main.appendChild(div);
  }
  function run(){ensureFavicon();simplifyMenu();updatePageChrome();simpleText();addNextFlowPanel();addPublicHelpGuide();addHelpFeedback();addHelpShortcut();}
  loadHistory();setTimeout(run,120);setTimeout(run,500);setTimeout(run,1000);setTimeout(run,1800);
})();