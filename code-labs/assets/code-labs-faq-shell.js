(function(){
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nav(){
var items=[
['index.html','H','Home','Start here'],
['file-lab.html','F','File Lab','Load or read code'],
['v20.html','W','Workflow Hub','Ask ChatGPT'],
['patch-desk.html','P','Patch Desk','Paste fixed file'],
['preview-test.html','T','Preview + Test','Check before live'],
['checkpoints.html','C','Checkpoints','Rollback saved'],
['patch-lab.html','L','Patch Lab','Exact line tool'],
['help.html','?','Help + Tools','All utilities'],
['faq.html','?','FAQ','Clear answers']
];
return items.map(function(x){return '<a '+(x[0]==='faq.html'?'class="active" ':'')+'href="'+x[0]+'"><span>'+x[1]+'</span><div>'+esc(x[2])+'<small>'+esc(x[3])+'</small></div></a>'}).join('')
}
function run(){
if(document.querySelector('.app'))return;
document.title='Code Labs - FAQ';
document.body.innerHTML='<div class="app"><aside class="sidebar"><div class="logo"><img src="assets/code-labs-icon.svg" alt="" style="width:42px;height:42px"><div><b>Code Labs</b><small>FAQ</small></div></div><nav class="nav">'+nav()+'</nav><div class="sideBox"><b>FAQ</b><p>Clear answers for the current Code Labs build.</p></div></aside><main class="main"><div class="topbar"><div class="crumbs"><span>Code Labs</span><span>›</span><b>FAQ</b></div><div><span class="badge good">FAQ</span></div></div></main></div><div id="toast" class="toast"></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();