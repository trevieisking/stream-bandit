/* Code Labs Help polish */
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function make(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e}
function jump(id){var e=q(id);if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t||'');return}var a=document.createElement('textarea');a.value=t||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}
function card(title,text,id){return '<button class="btn ghost smallBtn" data-jump="'+id+'"><b>'+title+'</b><small>'+text+'</small></button>'}
function liveText(){return ['CODE LABS LIVE PACKET','Open the eight Code Labs pages.','Confirm Help starts with Tool Search.','Confirm shortcut buttons jump to tools.','Confirm Export state and Copy summary are visible.','Confirm FAQ opens without flicker.','Confirm wording says Connect GitHub and Connect Supabase.','Keep Code Labs separate from Stream Bandit.','Use small reviewed changes.'].join('\n')}
function livePanel(){var p=make('section','panel','<h2>Live packet gadget</h2><p>Copy a quick launch checklist for Code Labs.</p><div class="actions"><button class="btn primary" id="clMakeLivePacket">Build live packet</button><button class="btn ghost" id="clCopyLivePacket">Copy live packet</button></div><textarea id="clLivePacketOut" class="mid" readonly placeholder="Live packet appears here"></textarea>');p.id='clLivePacket';return p}
function order(main){
var search=q('#clToolSearch'),safe=q('#clSafeChangePacketTool'),raw=q('#clRawGitHubTool'),diff=q('#clLocalDiffTool'),local=q('#clLocalUtilityTool'),html=q('#clHtmlSafetyTool'),info=q('#clBackendVsHosting'),lane=q('#clToolsUtilityLane'),backup=q('#clBackupPanel');
if(!main||!search||q('#clHelpDashboard'))return false;
var dash=make('section','hero','<div><span class="badge good">Tools dashboard</span><h1>Code Labs Help</h1><p>Find the right helper fast, copy clean packets, check code locally, and prepare safer promotion work without adding more pages.</p><div class="actions"><button class="btn primary" data-jump="#clToolSearch">Search tools</button><button class="btn ghost" data-jump="#clSafeChangePacketTool">Build GitHub packet</button><button class="btn ghost" data-jump="#clLocalDiffTool">Compare code</button></div></div><div class="heroCard"><b>Best order</b><ol><li>Search for the tool you need.</li><li>Build or check the result locally.</li><li>Copy the clean packet into ChatGPT or GitHub.</li></ol></div>');
dash.id='clHelpDashboard';
var quick=make('section','panel','<h2>Tool shortcuts</h2><p>Jump straight to the common helpers.</p><div class="actions helpToolShortcuts">'+card('Tool Search','find the right helper','#clToolSearch')+card('Safe Change Packet','branch and PR request','#clSafeChangePacketTool')+card('Raw GitHub Links','repo branch path helper','#clRawGitHubTool')+card('Before / After Diff','compare fixed code','#clLocalDiffTool')+card('HTML Checker','duplicate IDs and page scan','#clHtmlSafetyTool')+card('Local Utility','JSON text and counts','#clLocalUtilityTool')+'</div>');
quick.id='clHelpShortcuts';
var live=livePanel();var top=main.firstElementChild;main.insertBefore(dash,top);main.insertBefore(quick,dash.nextSibling);main.insertBefore(search,quick.nextSibling);
if(safe)main.insertBefore(safe,search.nextSibling);if(live)main.insertBefore(live,safe?safe.nextSibling:search.nextSibling);if(raw)main.insertBefore(raw,live.nextSibling);if(diff)main.insertBefore(diff,raw?raw.nextSibling:live.nextSibling);if(html)main.insertBefore(html,diff?diff.nextSibling:live.nextSibling);if(local)main.insertBefore(local,html?html.nextSibling:live.nextSibling);if(backup)main.insertBefore(backup,local?local.nextSibling:live.nextSibling);if(info)main.appendChild(info);if(lane)main.appendChild(lane);
q('#clMakeLivePacket').onclick=function(){q('#clLivePacketOut').value=liveText()};q('#clCopyLivePacket').onclick=function(){copy(q('#clLivePacketOut').value||liveText())};
Array.prototype.forEach.call(document.querySelectorAll('[data-jump]'),function(b){b.addEventListener('click',function(){jump(b.getAttribute('data-jump'))})});
return true;
}
function run(){var main=q('.main');if(!order(main))setTimeout(run,300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,1200)});else setTimeout(run,1200);
setTimeout(run,2200);
})();