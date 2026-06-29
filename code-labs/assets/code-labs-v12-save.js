/* Code Labs V2.0 - visible flow with GitHub Writer */
(function(){
  var ICON='assets/code-labs-icon.svg';
  var FLOW=[
    ['index','Home','Start here','index.html','🏠'],
    ['file-lab','File Lab','Load or read code','file-lab.html','📄'],
    ['v20','Workflow Hub','Ask ChatGPT','v20.html','🧰'],
    ['patch-desk','Patch Desk','Paste fixed file','patch-desk.html','🧩'],
    ['preview-test','Preview + Test','Check before live','preview-test.html','🧪'],
    ['checkpoints','Checkpoints','Rollback saved','checkpoints.html','💾'],
    ['repo-desk','Repo Desk','Choose action','repo-desk.html','🗄️'],
    ['publish-prep','GitHub Writer','Build handoff','publish-prep.html','🚀'],
    ['github-tracker','GitHub Tracker','PR and preview','github-tracker.html','🔎']
  ];
  var ADV=[
    ['about','About','What Code Labs does','about.html','ℹ️'],
    ['patch-lab','Patch Lab','Exact line tool','patch-lab.html','🧠'],
    ['checklist-builder','Checklist Builder','Build pass lists','checklist-builder.html','✅'],
    ['ai-handoff','AI Handoff','Review package','ai-handoff.html','📤'],
    ['help','Help + Tools','All utilities','help.html','🛠️'],
    ['faq','FAQ','Clear answers','faq.html','❓']
  ];
  var ALL=FLOW.concat(ADV), FLOW_INDEX={};
  FLOW.forEach(function(item,i){FLOW_INDEX[item[0]]=i;});
  var RESCUE=['rescue-room','Rescue Room','Repair safely','rescue-room.html','🛟'];
  var MENU_FLOW=FLOW.slice(0,2).concat([RESCUE],FLOW.slice(2));
  var NEXT={
    'index':'file-lab','start-guide':'file-lab','setup':'file-lab','project-picker':'file-lab','fix-wizard':'file-lab',
    'file-lab':'rescue-room','rescue-room':'v20','packet-builder':'v20','v20':'patch-desk',
    'patch-desk':'preview-test','patch-lab':'preview-test','checklist-builder':'help','preview-test':'checkpoints','checkpoints':'repo-desk','repo-desk':'publish-prep','publish-prep':'github-tracker','github-tracker':'index',
    'ai-handoff':'repo-desk','connector-status':'repo-desk','help':'about','about':'file-lab','faq':'file-lab'
  };
  var PREV={
    'index':'github-tracker','file-lab':'index','v20':'rescue-room','patch-desk':'v20','patch-lab':'patch-desk','checklist-builder':'patch-lab','preview-test':'patch-desk','checkpoints':'preview-test','repo-desk':'checkpoints','publish-prep':'repo-desk','github-tracker':'publish-prep',
    'start-guide':'index','setup':'index','project-picker':'index','fix-wizard':'index','rescue-room':'file-lab','packet-builder':'rescue-room','ai-handoff':'patch-desk','connector-status':'repo-desk','help':'index','about':'help','faq':'help'
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
  function ensureFavicon(){var icon=document.querySelector('link[rel="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}icon.type='image/svg+xml';icon.href=ICON;}
  function simplifyMenu(){var nav=document.querySelector('.nav');if(!nav)return;var id=page();while(nav.firstChild)nav.removeChild(nav.firstChild);var label=document.createElement('div');label.className='navGroupLabel';label.style.display='block';label.textContent='Workflow';nav.appendChild(label);MENU_FLOW.forEach(function(item){nav.appendChild(link(item,id));});var adv=document.createElement('div');adv.className='navGroupLabel';adv.style.display='block';adv.textContent='Tools';nav.appendChild(adv);ADV.forEach(function(item){nav.appendChild(link(item,id));});}
  function updatePageChrome(){var id=page(), item=findFlow(id), title=item[1];document.title=id==='index'?'Code Labs':'Code Labs - '+title;var crumbs=document.querySelector('.crumbs');if(crumbs){crumbs.innerHTML='<span>Code Labs</span><span>›</span><b>'+esc(title)+'</b>';}}
  function flowInfo(id){var next=flowOnly(NEXT[id])||FLOW[1], prev=flowOnly(PREV[id])||FLOW[0], pos=FLOW_INDEX[id], item=findFlow(id), note;if(typeof pos==='number'){note='This is step '+(pos+1)+' of '+FLOW.length+' in the main Code Labs flow.';}else{note='This tool page is outside the main flow. Use Previous or Next to return.';}if(id==='repo-desk')note='Repo Desk chooses the GitHub action before the final handoff is built.';if(id==='publish-prep')note='GitHub Writer builds the final handoff for add, change, or verified cleanup work.';if(id==='github-tracker')note='GitHub Tracker records PR and preview links after GitHub responds.';return {next:next,prev:prev,title:item[1],note:note};}
  function addNextFlowPanel(){var main=document.querySelector('.main');if(!main||document.querySelector('#clNextFlowPanel'))return;var id=page(), info=flowInfo(id);var panel=document.createElement('section');panel.className='panel';panel.id='clNextFlowPanel';panel.style.border='2px solid rgba(15,159,110,.28)';panel.innerHTML='<h2>Workflow buttons</h2><p><b>'+esc(info.title)+'</b> · '+esc(info.note)+'</p><div class="actions"><a class="btn ghost" href="'+info.prev[3]+'">Previous: '+esc(info.prev[1])+'</a><a class="btn good" href="'+info.next[3]+'">Next: '+esc(info.next[1])+'</a></div>';var top=document.querySelector('.topbar');if(top&&top.parentNode){top.parentNode.insertBefore(panel,top.nextSibling);return;}var first=document.querySelector('.hero,.panel');if(first&&first.parentNode){first.parentNode.insertBefore(panel,first);}else{main.insertBefore(panel,main.firstChild);}}
  function simpleText(){textReplace(document.body,'Code Labs V1 Manual Rescue Build','Code Labs simple workflow build');textReplace(document.body,'Local manual mode · No live writes from these pages.','Simple workflow · browser prepares, ChatGPT/GitHub handles repo work.');textReplace(document.body,'Future app links','Extra connector info');textReplace(document.body,'Manual rescue works now. GitHub and Supabase are planned connector layers.','Use the simple workflow. GitHub connector work happens through ChatGPT; Supabase history is separate.');textReplace(document.body,'Publish Prep','GitHub Writer');textReplace(document.body,'Safe Change','GitHub Change');}
  function addHelpShortcut(){if(document.querySelector('#clHelpShortcut'))return;var main=document.querySelector('.main');if(!main)return;var div=document.createElement('div');div.id='clHelpShortcut';div.className='footerNote';div.innerHTML='Simple Code Labs flow: Home → File Lab → Rescue Room → Workflow Hub → Patch Desk → Preview + Test → Checkpoints → Repo Desk → GitHub Writer → GitHub Tracker. Repo Desk chooses the action. GitHub Writer builds the final handoff. GitHub Tracker records PR and preview links.';main.appendChild(div);}
  function run(){ensureFavicon();simplifyMenu();updatePageChrome();simpleText();addNextFlowPanel();addHelpShortcut();}
  loadHistory();setTimeout(run,120);setTimeout(run,500);setTimeout(run,1000);setTimeout(run,1800);setTimeout(run,2800);
})();
