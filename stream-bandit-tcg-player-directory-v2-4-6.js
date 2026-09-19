/* Stream Bandit TCG Player Directory V2.4.6
   Thin browser client for the verified privacy-first Directory owner.
   Reads only public.tcg_search_public_players / public.tcg_get_public_player
   and the signed-in user's own public.tcg_player_directory_preferences row.
   No service-role key, source-table browsing, friend/block reuse, or gameplay rules. */
(function(){
  'use strict';

  var VERSION = '2.4.6';
  var sbClient = null;

  function byId(id){ return document.getElementById(id); }
  function text(value){ return String(value == null ? '' : value); }
  function wait(ms){ return new Promise(function(resolve){ setTimeout(resolve, ms); }); }

  function readConfig(){
    try{
      if(window.StreamBanditShell && typeof window.StreamBanditShell.config === 'function'){
        var cfg = window.StreamBanditShell.config();
        if(cfg && cfg.url && cfg.key) return cfg;
      }
    }catch(error){}
    var c = window.StreamBanditSupabaseConfig || window.StreamBanditShellConfig || {};
    return {
      url: window.SUPABASE_URL || c.url || '',
      key: window.SUPABASE_KEY || c.key || c.anonKey || c.anon_key || ''
    };
  }

  async function client(){
    if(sbClient) return sbClient;
    if(!window.supabase || typeof window.supabase.createClient !== 'function') throw new Error('Supabase browser SDK is unavailable.');
    var cfg = readConfig();
    for(var i=0; i<30 && (!cfg.url || !cfg.key); i++){
      await wait(100);
      cfg = readConfig();
    }
    if(!cfg.url || !cfg.key) throw new Error('Stream Bandit public Supabase configuration is unavailable.');
    sbClient = window.supabase.createClient(cfg.url, cfg.key);
    return sbClient;
  }

  async function signedInUser(){
    var c = await client();
    var result = await c.auth.getUser();
    if(result.error) throw result.error;
    if(!result.data || !result.data.user) throw new Error('Sign in is required.');
    return result.data.user;
  }

  function setState(message, isError){
    var state = byId('tcgDirectoryState');
    if(!state) return;
    state.textContent = message;
    state.dataset.state = isError ? 'error' : 'ready';
  }

  function safeAvatar(url, alt){
    var value = text(url).trim();
    if(!value) return null;
    try{
      var parsed = new URL(value, location.href);
      if(parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
      var img = document.createElement('img');
      img.src = parsed.href;
      img.alt = alt || '';
      img.loading = 'lazy';
      img.width = 72;
      img.height = 72;
      img.style.borderRadius = '16px';
      img.style.objectFit = 'cover';
      return img;
    }catch(error){ return null; }
  }

  function labelFor(player){
    return text(player.display_name || player.username || 'TCG Player').trim() || 'TCG Player';
  }

  function statLine(player){
    if(player.arcade_matches == null && player.player_xp == null) return 'Progression hidden by this player.';
    var parts = [];
    if(player.player_xp != null) parts.push(text(player.player_xp) + ' XP');
    if(player.arcade_matches != null) parts.push(text(player.arcade_matches) + ' matches');
    if(player.arcade_wins != null) parts.push(text(player.arcade_wins) + ' wins');
    if(player.arcade_losses != null) parts.push(text(player.arcade_losses) + ' losses');
    return parts.join(' · ');
  }

  function playerCard(player){
    var card = document.createElement('article');
    card.className = 'tcg-card';

    var avatar = safeAvatar(player.avatar_url, '');
    if(avatar) card.appendChild(avatar);

    var h = document.createElement('h2');
    h.textContent = labelFor(player);
    card.appendChild(h);

    if(player.username){
      var handle = document.createElement('p');
      handle.textContent = '@' + text(player.username);
      card.appendChild(handle);
    }

    var stats = document.createElement('p');
    stats.textContent = statLine(player);
    card.appendChild(stats);

    var actions = document.createElement('div');
    actions.className = 'tcg-actions';
    var link = document.createElement('a');
    link.className = 'tcg-btn secondary';
    link.href = 'tcg-player-profile.html?player=' + encodeURIComponent(text(player.player_id));
    link.textContent = 'View TCG profile';
    actions.appendChild(link);
    card.appendChild(actions);
    return card;
  }

  async function searchPlayers(query){
    await signedInUser();
    var c = await client();
    var result = await c.rpc('tcg_search_public_players', {
      p_query: text(query).trim() || null,
      p_limit: 25,
      p_offset: 0
    });
    if(result.error) throw result.error;
    return Array.isArray(result.data) ? result.data : [];
  }

  async function renderPlayers(query){
    var results = byId('tcgPlayerResults');
    if(!results) return;
    setState('Searching the privacy-safe TCG directory…', false);
    results.replaceChildren();
    try{
      var rows = await searchPlayers(query);
      rows.forEach(function(player){ results.appendChild(playerCard(player)); });
      setState(rows.length ? (rows.length + ' discoverable TCG player' + (rows.length === 1 ? '' : 's') + ' found.') : 'No discoverable TCG players matched this search.', false);
    }catch(error){
      setState('Directory unavailable: ' + (error.message || text(error)), true);
    }
  }

  function bootPlayers(){
    var input = byId('playerSearch');
    var form = byId('tcgPlayerSearchForm');
    if(!input || !form) return;
    input.disabled = false;
    input.removeAttribute('aria-disabled');
    input.placeholder = 'Search by public name or username';
    form.addEventListener('submit', function(event){
      event.preventDefault();
      renderPlayers(input.value);
    });
    renderPlayers('');
  }

  function requestedPlayerId(){
    try{
      var value = new URL(location.href).searchParams.get('player') || '';
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : '';
    }catch(error){ return ''; }
  }

  async function bootProfile(){
    var target = byId('tcgPublicPlayerProfile');
    if(!target) return;
    var playerId = requestedPlayerId();
    if(!playerId){
      setState('Choose a discoverable player from the Players page.', false);
      return;
    }
    setState('Loading public TCG profile…', false);
    try{
      await signedInUser();
      var c = await client();
      var result = await c.rpc('tcg_get_public_player', { p_player_id: playerId });
      if(result.error) throw result.error;
      var row = Array.isArray(result.data) ? result.data[0] : result.data;
      if(!row){
        setState('This TCG profile is not currently discoverable.', false);
        return;
      }
      target.replaceChildren(playerCard(row));
      setState('Public TCG profile loaded from the privacy-safe Directory owner.', false);
    }catch(error){
      setState('Profile unavailable: ' + (error.message || text(error)), true);
    }
  }

  async function loadPreferences(){
    var user = await signedInUser();
    var c = await client();
    var result = await c.from('tcg_player_directory_preferences')
      .select('discoverable,show_arcade_stats')
      .eq('user_id', user.id)
      .maybeSingle();
    if(result.error) throw result.error;
    return {
      user: user,
      discoverable: !!(result.data && result.data.discoverable),
      show_arcade_stats: result.data ? result.data.show_arcade_stats !== false : true
    };
  }

  async function bootPrivacy(){
    var discoverable = byId('tcgDirectoryDiscoverable');
    var showStats = byId('tcgDirectoryShowStats');
    var save = byId('tcgDirectoryPrivacySave');
    if(!discoverable || !showStats || !save) return;
    try{
      var prefs = await loadPreferences();
      discoverable.checked = prefs.discoverable;
      showStats.checked = prefs.show_arcade_stats;
      discoverable.disabled = false;
      showStats.disabled = false;
      save.disabled = false;
      save.removeAttribute('aria-disabled');
      setState(prefs.discoverable ? 'Your TCG profile is discoverable. You can switch this off at any time.' : 'Your TCG profile is private by default and is not listed in Players.', false);
    }catch(error){
      setState('Privacy settings unavailable: ' + (error.message || text(error)), true);
      return;
    }

    save.addEventListener('click', async function(){
      save.disabled = true;
      setState('Saving TCG privacy settings…', false);
      try{
        var user = await signedInUser();
        var c = await client();
        var result = await c.from('tcg_player_directory_preferences').upsert({
          user_id: user.id,
          discoverable: !!discoverable.checked,
          show_arcade_stats: !!showStats.checked,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if(result.error) throw result.error;
        setState(discoverable.checked ? 'Saved. Your approved public TCG profile can now appear in Players.' : 'Saved. Your TCG profile is hidden from Players.', false);
      }catch(error){
        setState('Could not save privacy settings: ' + (error.message || text(error)), true);
      }finally{
        save.disabled = false;
      }
    });
  }

  function boot(){
    var page = (document.body && document.body.dataset.sbTcgPage) || '';
    if(page === 'players') bootPlayers();
    else if(page === 'player-profile') bootProfile();
    else if(page === 'account-privacy') bootPrivacy();
  }

  window.StreamBanditTCGPlayerDirectoryV246 = Object.freeze({
    version: VERSION,
    searchPlayers: searchPlayers,
    loadPreferences: loadPreferences
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
