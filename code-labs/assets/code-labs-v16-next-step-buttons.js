/* Code Labs V1.6 Next Step Buttons
   Adds clear green next-step buttons to Code Labs flow pages.
   V165: keeps big next guidance below the page intro/workflow panel.
   No GitHub write from browser. No direct-main write.
*/
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body&&document.body.getAttribute('data-page')||''}
function state(){try{return JSON.parse(localStorage.getItem('codeLabsV1State')||'{}')||{}}catch(e){return{}}}
function hasFixed(){var s=state(),f=s.file||{};return String(f.fixedCode||'').length>120}
function style(){if(q('#clNextStepButtonStyle'))return;var st=document.createElement('style');st.id='clNextStepButtonStyle';st.textContent='.clNextStepWrap{border:3px solid rgba(15,159,110,.30);background:#ecfdf5;border-radius:18px;padding:12px;margin:10px 0}.clNextStepWrap.bad{border-color:rgba(180,35,24,.32);background:#fff1f2}.clNextStepBtn{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:999px;padding:14px 22px;min-height:48px;font-size:16px;font-weight:950;text-decoration:none;background:linear-gradient(135deg,#10b981,#2563eb);color:white!important;box-shadow:0 10px 24px rgba(15,159,110,.24);margin:6px 8px 6px 0}.clNextStepBtn.wait{background:#94a3b8;box-shadow:none}.clNextStepBtn.small{font-size:14px;padding:10px 14px;min-height:40px}.clNextStepWrap b{color:#0f172a}';document.head.appendChild(st)}
function makeButton(href,text,ready){var a=document.createElement('a');a.href=href;a.className='clNextStepBtn '+(ready?'':'wait');a.textContent=text+(ready?'':' - WAIT');if(!ready){a.addEventListener('click',function(e){e.preventDefault();alert('Finish and save the current step first.');})}return a}
function place(wrap){var main=q('.main');var after=q('#clWorkflowGuardV138')||q('#clWorkflowClarityV130')||q('.hero')||q('.topbar');if(after&&after.parentNode){after.parentNode.insertBefore(wrap,after.nextSibling);return}if(main)main.insertBefore(wrap,main.firstChild)}
function patchLabButton(){if(page()!=='patch-lab'||q('#clPatchLabNextStep'))return;var save=q('#plSave');if(!save)return;var wrap=document.createElement('div');wrap.id='clPatchLabNextStep';var ready=hasFixed();wrap.className='clNextStepWrap '+(ready?'':'bad');wrap.innerHTML=ready?'<b>Saved.</b> Now press the green button to move to Preview + Test.':'<b>Next step locked.</b> First press <b>3. Save Full Fixed Output</b>. Then this button turns ready.';wrap.appendChild(makeButton('preview-test.html','4. Save to Preview + Test',ready));var parent=save.parentNode;if(parent&&parent.parentNode){parent.parentNode.insertBefore(wrap,parent.nextSibling)}save.addEventListener('click',function(){setTimeout(function(){var old=q('#clPatchLabNextStep');if(old)old.remove();patchLabButton()},300)})}
function genericButton(){var id=page();var old=q('#clGenericNextStep');if(old){place(old);return}var map={
'preview-test':{href:'checkpoints.html',text:'Save to Checkpoints',note:'After preview looks good, use this button.'},
'checkpoints':{href:'repo-desk.html',text:'Send to Repo Desk - Buddy Lane',note:'After checkpoint/backup is saved, this becomes buddy lane.'},
'repo-desk':{href:'publish-prep.html',text:'Send to GitHub Writer - Buddy Lane',note:'Buddy handles the repo action details.'},
'publish-prep':{href:'github-tracker.html',text:'Send to GitHub Tracker - After PR',note:'Use this after buddy gives the PR or result links.'},
'github-tracker':{href:'patch-lab.html',text:'Back to Patch Lab',note:'Tracker is after PR only. Go back if another fix is needed.'}
};
var m=map[id];if(!m)return;var ready=id==='github-tracker'||hasFixed();var wrap=document.createElement('section');wrap.id='clGenericNextStep';wrap.className='panel clNextStepWrap '+(ready?'':'bad');wrap.innerHTML='<h2>Big next button</h2><p><b>'+m.note+'</b></p>'+(ready?'<p>Safe next click is below.</p>':'<p>Fixed output is not saved yet. Go back to Patch Lab first if this is a repair.</p>');wrap.appendChild(makeButton(m.href,m.text,ready));place(wrap)}
function run(){style();patchLabButton();genericButton()}
setTimeout(run,400);setTimeout(run,1200);setTimeout(run,2500);setInterval(run,4000);
})();