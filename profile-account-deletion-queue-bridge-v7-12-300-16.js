(function(){
'use strict';
const VERSION='V7.12.300.16 Account Deletion Request Queue Bridge';
const REQUEST_TABLE='sb_account_deletion_requests';
function $(id){return document.getElementById(id)}
function toast(msg){try{let t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}catch(e){}}
function getClient(){
  if(window.__sbAccountDeleteBridgeClient)return window.__sbAccountDeleteBridgeClient;
  if(!window.supabase)throw new Error('Supabase SDK missing');
  let c=null;
  try{c=window.StreamBanditShell&&window.StreamBanditShell.config?window.StreamBanditShell.config():null}catch(e){}
  c=c||window.StreamBanditSupabaseConfig||window.StreamBanditShellConfig||{};
  if(!c.url||!c.key)throw new Error('Shared Supabase config missing');
  window.__sbAccountDeleteBridgeClient=window.supabase.createClient(c.url,c.key);
  return window.__sbAccountDeleteBridgeClient;
}
async function getSession(){
  const c=getClient();
  const res=await c.auth.getSession();
  const user=res&&res.data&&res.data.session&&res.data.session.user?res.data.session.user:null;
  if(!user)throw new Error('Sign in first');
  return {client:c,user,session:res.data.session};
}
function currentState(){
  try{return window.StreamBanditProfileAccountCentreV71230015&&window.StreamBanditProfileAccountCentreV71230015.state?window.StreamBanditProfileAccountCentreV71230015.state():{}}catch(e){return {}}
}
function reasonText(){return String(($('deleteReason')&&$('deleteReason').value)||'').trim()}
function confirmText(){return String(($('deleteConfirm')&&$('deleteConfirm').value)||'').trim()}
function output(obj){try{if($('requestOut'))$('requestOut').textContent=JSON.stringify(obj,null,2)}catch(e){}}
function setDeleteStatus(text,bad){try{if($('deleteStatus')){$('deleteStatus').textContent=text;$('deleteStatus').className=bad?'danger':'status'}}catch(e){}}
function setDebug(extra){
  try{
    if(!$('debug'))return;
    let old={};
    try{old=JSON.parse($('debug').textContent||'{}')}catch(e){}
    old.accountDeletionQueueBridge={version:VERSION,requestTable:REQUEST_TABLE,requestDbWrite:true,browserAuthDelete:false,edgeFunctionRequiredForAuthDelete:true,serviceRoleInBrowser:false,last:extra||null};
    $('debug').textContent=JSON.stringify(old,null,2);
  }catch(e){}
}
async function saveRealDeletionRequest(){
  try{
    const reason=reasonText();
    const confirm=confirmText();
    if(confirm!=='DELETE')throw new Error('Type DELETE to confirm request creation');
    if(reason.length<10)throw new Error('Reason must be at least 10 characters');
    const {client,user}=await getSession();
    const state=currentState();
    const profile=state&&state.profile?state.profile:null;
    const payload={
      type:'stream_bandit_account_deletion_request',
      version:VERSION,
      generated_at:new Date().toISOString(),
      source_page:'profile-settings-complete-v7-0-4-test.html',
      browser_action:'database_request_only',
      auth_delete:false,
      service_role:false,
      server_side_required:true,
      user:{id:user.id,email:user.email||''},
      profile_id:profile&&profile.id?profile.id:user.id,
      reason:reason,
      requested_next_step:'owner/admin queue review, then Edge Function on spare normal account only'
    };
    let row=null;
    let rpcError=null;
    try{
      const rpc=await client.rpc('sb_request_account_deletion',{p_reason:reason,p_email:user.email||'',p_payload:payload});
      if(rpc.error)throw rpc.error;
      row=rpc.data;
    }catch(e){
      rpcError=e;
      const ins=await client.from(REQUEST_TABLE).insert({requested_by:user.id,profile_id:user.id,email:user.email||'',reason:reason,requester_confirmed:true,request_payload:payload}).select('*').maybeSingle();
      if(ins.error)throw ins.error;
      row=ins.data;
    }
    const out={ok:true,type:'stream_bandit_account_deletion_request_saved',version:VERSION,table:REQUEST_TABLE,row:row,rpc_fallback_used:!!rpcError,browser_auth_delete:false,edge_function_required:true,service_role_in_browser:false,created_at:new Date().toISOString()};
    window.StreamBanditAccountDeletionLatestRequest=out;
    output(out);
    setDeleteStatus('Deletion request saved to real queue. No account was deleted from the browser.');
    setDebug(out);
    toast('Deletion request saved');
    return out;
  }catch(e){
    const out={ok:false,version:VERSION,error:e.message||String(e),table:REQUEST_TABLE,browser_auth_delete:false,service_role_in_browser:false};
    output(out);
    setDeleteStatus('Request save failed: '+out.error,true);
    setDebug(out);
    toast('Request save failed');
    return out;
  }
}
function wire(){
  const btn=$('buildDeleteRequest');
  if(btn&&!btn.dataset.sbQueueBridge){
    btn.dataset.sbQueueBridge='v7-12-300-16';
    btn.textContent='Save Real Delete Request';
    btn.addEventListener('click',function(ev){ev.preventDefault();ev.stopImmediatePropagation();saveRealDeletionRequest();},true);
  }
  const copy=$('copyDeleteRequest');
  if(copy&&!copy.dataset.sbQueueBridge){
    copy.dataset.sbQueueBridge='v7-12-300-16';
    copy.addEventListener('click',function(ev){
      if(window.StreamBanditAccountDeletionLatestRequest){ev.preventDefault();ev.stopImmediatePropagation();navigator.clipboard.writeText(JSON.stringify(window.StreamBanditAccountDeletionLatestRequest,null,2)).then(()=>toast('Saved request copied')).catch(()=>toast('Copy blocked'))}
    },true);
  }
  setDebug({wired:true});
}
function boot(){wire();setTimeout(wire,800);setTimeout(wire,2000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.StreamBanditAccountDeletionQueueBridge={version:VERSION,save:saveRealDeletionRequest,wire:wire};
})();