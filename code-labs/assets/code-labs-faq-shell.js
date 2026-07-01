(function(){
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nav(){
var items=[
['index.html','H','Home','What Code Labs is'],
['about.html','A','About','Purpose and workflow'],
['file-lab.html','F','File Lab','Load full file'],
['rescue-room.html','R','Rescue Room','Describe problem'],
['v20.html','W','Workflow Hub','Choose route'],
['patch-desk.html','D','Patch Desk','Full fixed file'],
['patch-lab.html','L','Patch Lab','Manual fallback'],
['preview-test.html','T','Preview + Test','Check result'],
['checkpoints.html','C','Checkpoints','Rollback saved'],
['repo-desk.html','R','Repo Desk','Repo action'],
['publish-prep.html','G','GitHub Writer','Build handoff'],
['github-tracker.html','T','GitHub Tracker','Track PR'],
['connection-guide.html','?','Connection Guide','Safe next click'],
['faq.html','?','FAQ','Clear answers']
];
return items.map(function(x){return '<a '+(x[0]==='faq.html'?'class="active" ':'')+'href="'+x[0]+'"><span>'+x[1]+'</span><div>'+esc(x[2])+'<small>'+esc(x[3])+'</small></div></a>'}).join('')
}
function run(){
if(document.querySelector('.app'))return;
document.title='Code Labs FAQ - Current workflow answers';
document.body.innerHTML='<div class="app"><aside class="sidebar"><div class="logo"><img src="assets/code-labs-icon.svg" alt="" style="width:42px;height:42px"><div><b>Code Labs</b><small>Current FAQ</small></div></div><nav class="nav">'+nav()+'</nav><div class="sideBox"><b>FAQ</b><p>Clear answers for the current Code Labs repair workflow, GitHub handoff, and Supabase Repair History.</p></div></aside><main class="main"><div class="topbar"><div class="crumbs"><span>Code Labs</span><span>›</span><b>FAQ</b></div><div><span class="badge good">Current FAQ</span></div></div></main></div><div id="toast" class="toast"></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
