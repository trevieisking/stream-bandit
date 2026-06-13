/* Stream Bandit Supabase Editor Test Route Lock V7.12.278
   Small local route-map shim for the Supabase Library Editor clean-nav test page.
   Purpose: let the existing protected-page helper use the normal editor_admin_owner rule
   before the global route map is promoted.
   No writes. No redirects. No storage actions.
*/
(function(){
  'use strict';
  var VERSION='V7.12.278 Supabase Editor Test Route Lock';
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
  window.StreamBanditRouteAccessMapV712271={version:VERSION,routes:ROUTES,old:{},fileOf:fileOf,canonical:canonical,lookup:lookup,all:all};
  document.documentElement.dataset.sbSupabaseEditorTestRouteLock='v7-12-278';
})();