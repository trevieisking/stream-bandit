/* Stream Bandit V5.37.4 TEST — Report Paused Logs Supplement
   Tiny test helper. It does not touch Final Boss, player, HLS, volume, playbar or Supabase.
   It appends V5.37.3 paused-dead-source localStorage logs when the admin report bubble copies text. */
(function(){
'use strict';
var VERSION='V5.37.4 Report Paused Logs Supplement TEST';
function safe(fn,fb){try{return fn();}catch(e){return fb||'';}}
function extra(){
  var keys=['sb5373_paused_dead_source_log','sb5373_paused_dead_reload_at','sb5373_paused_dead_resume_time'];
  var lines=['','--- V5.37.3 PAUSED DEAD-SOURCE EXTRA LOGS ---'];
  var found=false;
  keys.forEach(function(k){var v=safe(function(){return localStorage.getItem(k);},'');if(v){found=true;lines.push('['+k+']');lines.push(String(v).slice(0,2500));}});
  if(!found)lines.push('No V5.37.3 paused-dead-source logs found yet.');
  lines.push('Supplement version: '+VERSION);
  return lines.join('\n');
}
function install(){
  if(!navigator.clipboard||!navigator.clipboard.writeText||navigator.clipboard.writeText._sb5374)return;
  var old=navigator.clipboard.writeText.bind(navigator.clipboard);
  var fn=function(text){
    var out=String(text||'');
    if(out.indexOf('Stream Bandit Admin Report Bubble')===0&&out.indexOf('V5.37.3 PAUSED DEAD-SOURCE EXTRA LOGS')<0){out+=extra();}
    return old(out);
  };
  fn._sb5374=true;
  navigator.clipboard.writeText=fn;
  console.log('[Stream Bandit]',VERSION+' installed.');
}
install();setTimeout(install,1000);setTimeout(install,2500);
})();