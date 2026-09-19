/* Stream Bandit TCG V2.4.31 Config Bridge
   Public client configuration only.
   Intentionally does NOT boot Stream Bandit website routes, theme, header, footer or global helpers. */
(function(){
  'use strict';
  const CONFIG=Object.freeze({
    url:'https://xzxqfrvqdgkzwujbkdbk.supabase.co',
    key:'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN',
    source:'stream-bandit-tcg-config-v2-4-31.js'
  });
  window.StreamBanditTCGConfig=CONFIG;
  window.StreamBanditSupabaseConfig=CONFIG;
  window.SUPABASE_URL=window.SUPABASE_URL||CONFIG.url;
  window.SUPABASE_KEY=window.SUPABASE_KEY||CONFIG.key;
  document.documentElement.dataset.sbTcgConfigBridge='v2-4-31';
})();