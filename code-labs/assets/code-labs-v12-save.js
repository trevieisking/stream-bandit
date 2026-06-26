/* Code Labs V1.8.0 - simple workflow menu and next-step buttons */
(function(){
  var FLOW=[
    ['index','Home','Start here','index.html','🏠'],
    ['file-lab','File Lab','Load or read code','file-lab.html','📄'],
    ['v20','Workflow Hub','Ask ChatGPT','v20.html','🧰'],
    ['patch-lab','Patch Lab','Patch exact lines','patch-lab.html','🧠'],
    ['preview-test','Preview + Test','Check before live','preview-test.html','🧪'],
    ['checkpoints','Checkpoints','Rollback saved','checkpoints.html','💾']
  ];
  var FLOW_INDEX={};
  FLOW.forEach(function(item,i){FLOW_INDEX[item[0]]=i;});
  var NEXT={
    'index':'file-lab','start-guide':'file-lab','setup':'file-lab','project-picker':'file-lab','fix-wizard':'file-lab',
    'file-lab':'v20','rescue-room':'v20','packet-builder':'v20','v20':'patch-lab','patch-desk':'patch-lab',
    'patch-lab':'preview-test','preview-test':'checkpoints','checkpoints':'index',
    'ai-handoff':'index','publish-prep':'index','repo-desk':'index','github-tracker':'index','connector-status':'index','help':'index'
  };
  function page(){return document.body.getAttribute('data-page')||'index';}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function toast(msg){var t=document.querySelector('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}}
  function copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'').then(function(){toast('Copied');});return;}var a=document.createElement('textarea');a.value=text||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied');}
  function loadHistory(){var s=document.createElement('script');s.src='assets/code-labs-v1-2-history.js';document.head.appendChild(s);}
  function textReplace(root,from,to){var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),node;while((node=walker.nextNode())){if(node.nodeValue.indexOf(from)!==-1){node.nodeValue=node.nodeValue.split(from).join(to);}}}
  function link(item,id){var a=document.createElement('a');a.href=item[3];if(item[0]===id)a.className='active';a.innerHTML='<span>'+item[4]+'</span><div>'+item[1]+'<small>'+item[2]+'</small></div>';return a;}
  function simplifyMenu(){
    var nav=document.querySelector('.nav');if(!nav)return;
    var id=page();while(nav.firstChild)nav.removeChild(nav.firstChild);
    var label=document.createElement('div');label.className='navGroupLabel';label.style.display='block';label.textContent='Workflow';nav.appendChild(label);
    FLOW.forEach(function(item){nav.appendChild(link(item,id));});
  }
  function flowInfo(id){
    var nextId=NEXT[id]||'file-lab';
    var next=FLOW.filter(function(x){return x[0]===nextId;})[0]||FLOW[1];
    var pos=FLOW_INDEX[id];
    var step=(typeof pos==='number')?pos+1:'Extra';
    var title=(typeof pos==='number')?FLOW[pos][1]:'Extra tool';
    var note=(typeof pos==='number')?'This is part '+step+' of '+FLOW.length+' in the main Code Labs flow.':'This extra page is not in the main flow. Use the button to return to the simple workflow.';
    return {next:next,step:step,title:title,note:note};
  }
  function addNextFlowPanel(){
    var main=document.querySelector('.main');if(!main||document.querySelector('#clNextFlowPanel'))return;
    var id=page(), info=flowInfo(id);
    var panel=document.createElement('section');panel.className='panel';panel.id='clNextFlowPanel';panel.style.border='2px solid rgba(15,159,110,.28)';
    panel.innerHTML='<h2>Next in flow</h2><p><b>'+esc(info.title)+'</b> · '+esc(info.note)+'</p><div class="actions"><a class="btn good" href="'+info.next[3]+'">Next: '+esc(info.next[1])+'</a><a class="btn ghost" href="patch-lab.html">Open Patch Lab</a></div>';
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
  function addHelpShortcut(){
    if(document.querySelector('#clHelpShortcut'))return;
    var main=document.querySelector('.main');if(!main)return;
    var div=document.createElement('div');div.id='clHelpShortcut';div.className='footerNote';div.innerHTML='Simple Code Labs flow: Home → File Lab → Workflow Hub → Patch Lab → Preview + Test → Checkpoints. Extra pages are still kept but hidden from the main menu.';
    main.appendChild(div);
  }
  function run(){simplifyMenu();simpleText();addNextFlowPanel();addHelpShortcut();}
  loadHistory();setTimeout(run,120);setTimeout(run,500);setTimeout(run,1000);setTimeout(run,1800);
})();