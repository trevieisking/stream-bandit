/* Stream Bandit Supabase Editor Test Route Lock V7.12.279
   Local route-map shim for the Supabase Library Editor clean-nav test page.
   Uses the existing protected-page helper and editor_admin_owner rule.
   Also bridges Supabase config early by reading the legacy shell file on the same origin.
   No writes. No redirects. No storage actions.
*/
(function(){
  'use strict';
  var VERSION='V7.12.279 Supabase Editor Test Route Lock / Early Config Bridge';
  var ROUTES={
    'supabase-library-editor-clean-nav-v7-12-277-test.html': {
      group:'Browse',
      label:'Supabase Library Editor Clean Nav Test',
      access:'editor_admin_owner',
      routeClass:'editor_admin_owner',
      feature:'library_editor',
      mode:'movie_editor',
      noFlashGate:true
    }
  };
  function fileOf(value){return String(value||'').split('/').pop().split('?')[0].split('#')[0];}
  function canonical(value){return fileOf(value);}
  function lookup(value){return ROUTES[canonical(value)]||null;}
  function all(){return Object.assign({},ROUTES);}
  function bridgeConfig(){
    try{
      if(window.StreamBanditSupabaseConfig&&window.StreamBanditSupabaseConfig.url&&window.StreamBanditSupabaseConfig.key)return;
      var xhr=new XMLHttpRequest();
      xhr.open('GET','stream-bandit-shell-v6-24.js?v=editor-test-config-279',false);
      xhr.send(null);
      if(xhr.status<200||xhr.status>=300)return;
      var text=String(xhr.responseText||'');
      var url=(text.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'';
      var key=(text.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||'';
      if(url&&key){
        window.StreamBanditSupabaseConfig={url:url,key:key,source:'stream-bandit-supabase-editor-test-route-lock-v7-12-279.js'};
        window.StreamBanditShellConfig=window.StreamBanditShellConfig||window.StreamBanditSupabaseConfig;
        window.SUPABASE_URL=window.SUPABASE_URL||url;
        window.SUPABASE_KEY=window.SUPABASE_KEY||key;
      }
    }catch(e){}
  }
  bridgeConfig();
  window.StreamBanditRouteAccessMapV712271={version:VERSION,routes:ROUTES,old:{},fileOf:fileOf,canonical:canonical,lookup:lookup,all:all};
  document.documentElement.dataset.sbSupabaseEditorTestRouteLock='v7-12-279';
})();