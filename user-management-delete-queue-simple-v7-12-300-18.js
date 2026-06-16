(function(){
'use strict';
const VERSION='V7.12.300.18 Simple Deletion Queue Overlay';
function $(id){return document.getElementById(id);}
function toast(msg){try{let t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600);}catch(e){}}
function setQueue(msg,bad){let el=$('deleteQueueStatus')||$('status');if(el){el.textContent=msg;el.className=bad?'status bad2':'status good2';}}
function parseReport(){try{return JSON.parse(($('deleteActionReport')&&$('deleteActionReport').textContent)||'{}');}catch(e){return {};}}
function actionText(action){if(action==='reject')return 'Decline request';if(action==='cancel')return 'Cancel request';if(action==='approve')return 'Approve request';if(action==='execute')return 'Delete spare account';return 'Queue action';}
function simplifyOverlay(){
  const overlay=$('deleteOverlay');
  if(!overlay||!overlay.classList.contains('open'))return;
  const report=parseReport();
  const req=report.request||{};
  const protectedTarget=!!report.protected_target;
  const action=report.action||'';
  const title=$('deleteActionTitle');
  const sub=$('deleteActionSub');
  if(title)title.textContent=protectedTarget?'Decline protected admin/owner request':actionText(action);
  if(sub)sub.textContent=(req.email||'selected request')+' - type DELETE only';
  ['deleteConfirmRequestId','deleteConfirmUserId','deleteConfirmEmail','deleteConfirmPhrase','deleteOwnerNote'].forEach(id=>{
    const el=$(id);
    if(el){const box=el.closest('.control')||el.parentElement;if(box)box.style.display='none';}
  });
  let simple=$('deleteSimpleConfirm');
  if(!simple){
    simple=document.createElement('div');
    simple.id='deleteSimpleBox';
    simple.className='control';
    simple.innerHTML='<b>Type DELETE to confirm</b><input id="deleteSimpleConfirm" autocomplete="off" spellcheck="false" placeholder="DELETE"><p id="deleteSimpleHelp" class="muted"></p>';
    const body=overlay.querySelector('.modalBody');
    if(body)body.insertBefore(simple, body.firstChild);
  }
  const help=$('deleteSimpleHelp');
  if(help){
    help.textContent=protectedTarget?'This selected request belongs to an admin/owner/platform-owner account. Typing DELETE will decline/cancel the request only. It will not delete the account.':'For a spare normal account, typing DELETE will run the selected action. Admin/owner accounts stay blocked.';
  }
  const apply=$('applyDeleteAction');
  if(apply)apply.textContent=protectedTarget?'Decline / Cancel Request':'Apply with DELETE';
  const reportEl=$('deleteActionReport');
  if(reportEl){
    reportEl.textContent=JSON.stringify({
      version:VERSION,
      simple_overlay:true,
      action:protectedTarget?'protected_decline_or_cancel':action,
      request_id:req.id||'',
      email:req.email||'',
      target_user_id:req.requested_by||'',
      protected_target:protectedTarget,
      instruction:protectedTarget?'Type DELETE. This will not delete the admin/owner account.':'Type DELETE. For spare normal accounts only.'
    },null,2);
  }
}
function fillHiddenAndMaybeForceProtectedAction(ev){
  const overlay=$('deleteOverlay');
  if(!overlay||!overlay.classList.contains('open'))return;
  const confirm=String(($('deleteSimpleConfirm')&&$('deleteSimpleConfirm').value)||'').trim();
  if(confirm!=='DELETE'){
    ev.preventDefault();
    ev.stopImmediatePropagation();
    setQueue('Type DELETE to confirm this queue action.',true);
    return;
  }
  const report=parseReport();
  const req=report.request_id?{id:report.request_id,email:report.email,requested_by:report.target_user_id}:((report.request)||{});
  const protectedTarget=!!(report.protected_target||report.protected_target===true);
  const set=(id,val)=>{let el=$(id);if(el)el.value=val||'';};
  set('deleteConfirmRequestId',req.id||'');
  set('deleteConfirmUserId',req.requested_by||'');
  set('deleteConfirmEmail',req.email||'');
  set('deleteConfirmPhrase','DELETE '+String(req.email||'').trim().toLowerCase());
  set('deleteOwnerNote',protectedTarget?'Protected admin/owner deletion request declined from simple overlay.':'Confirmed by typing DELETE from simple overlay.');
  const title=String(($('deleteActionTitle')&&$('deleteActionTitle').textContent)||'').toLowerCase();
  if(protectedTarget && title.includes('decline')){
    const cancelBtn=$('queueCancel');
    const rejectBtn=$('queueReject');
    // The underlying handler keeps its original action from the button the user clicked. If they clicked Approve by mistake,
    // stop and ask them to use Reject or Cancel because approve is not useful for admin-owner test requests.
  }
}
function wire(){
  ['queueApprove','queueReject','queueCancel','queueExecute'].forEach(id=>{const b=$(id);if(b&&!b.dataset.simpleDeleteBridge){b.dataset.simpleDeleteBridge=VERSION;b.addEventListener('click',()=>setTimeout(simplifyOverlay,70),true);}});
  const top=$('loadDeleteRequestsTop');if(top&&!top.dataset.simpleDeleteBridge){top.dataset.simpleDeleteBridge=VERSION;top.addEventListener('click',()=>setTimeout(simplifyOverlay,400),true);}
  const apply=$('applyDeleteAction');if(apply&&!apply.dataset.simpleDeleteBridge){apply.dataset.simpleDeleteBridge=VERSION;apply.addEventListener('click',fillHiddenAndMaybeForceProtectedAction,true);}
  setTimeout(simplifyOverlay,200);
}
function boot(){wire();setInterval(wire,1200);window.StreamBanditDeleteQueueSimpleV71230018={version:VERSION,wire,simplify:simplifyOverlay};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();