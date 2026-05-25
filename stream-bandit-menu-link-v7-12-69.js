/* Stream Bandit V7.12.71 Owner Menu Link Fix
   Safe UI-only navigation fix. No Supabase writes. No deletes. No payment unlocks.
   Fix: if this owner scanner page loads before the shell shows Owner, create the Owner group here. */
(function(){
  'use strict';

  var VERSION = 'v7-12-71-owner-group-fix';
  var OWNER_PAGE_NAME = 'global-helper-property-owner-scan-v7-12-67-test.html';

  var OWNER_PAGES = [
    ['🧠','One Machine','stream-bandit-one-machine-v7-12-72-test.html'],
    ['🧬','Global Whatnots','global-helper-property-owner-scan-v7-12-67-test.html'],
    ['🎛️','Platform Control Centre','platform-control-centre-combined-v7-12-61-test.html'],
    ['🗂️','Brand / App Icons','settings-brand-icons-promoted-v7-12-21-test.html'],
    ['🖼️','Brand Image Helper','brand-logo-helper-responsive-v7-12-20-test.html'],
    ['🦌','Favicon / App Icon Builder','favicon-app-icon-builder-v7-12-15-test.html']
  ];

  function esc(s){
    return String(s || '').replace(/[&<>\"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  function groupName(group){
    var btn = group && group.querySelector('.sb-shell-group-btn');
    if(!btn) return '';
    var first = btn.querySelector('span');
    return String((first && first.textContent) || btn.textContent || '').replace(/\d+$/,'').trim().toLowerCase();
  }

  function findOwnerGroup(drawer){
    var direct = drawer.querySelector('.sb-shell-group.owner');
    if(direct && groupName(direct) === 'owner') return direct;
    var groups = drawer.querySelectorAll('.sb-shell-group');
    for(var i=0;i<groups.length;i++){
      if(groupName(groups[i]) === 'owner') return groups[i];
    }
    return null;
  }

  function isOwnerScannerPage(){
    return String(location.pathname || '').indexOf(OWNER_PAGE_NAME) !== -1;
  }

  function buildOwnerGroup(drawer){
    var section = document.createElement('section');
    section.className = 'sb-shell-group owner open';
    section.setAttribute('data-sb-wrap','');
    section.innerHTML = '<button class="sb-shell-group-btn" data-sb-group type="button"><span>Owner</span><span class="sb-shell-pill">' + OWNER_PAGES.length + '</span></button><div class="sb-shell-items"></div>';
    drawer.appendChild(section);
    return section;
  }

  function addLinks(ownerGroup){
    var box = ownerGroup && ownerGroup.querySelector('.sb-shell-items');
    if(!box) return false;

    OWNER_PAGES.forEach(function(p,index){
      if(box.querySelector('a[href="' + p[2] + '"]')) return;
      var a = document.createElement('a');
      a.className = 'sb-shell-link owner';
      a.href = p[2];
      a.setAttribute('data-sb-text',(p[1] + ' owner global whatnots property helper settings bucket supabase role gate').toLowerCase());
      a.innerHTML = '<span style="width:24px">' + esc(p[0]) + '</span>' + esc(p[1]);
      box.insertBefore(a, box.children[index] || null);
    });

    var pill = ownerGroup.querySelector('.sb-shell-pill');
    if(pill) pill.textContent = String(box.querySelectorAll('a').length);
    ownerGroup.classList.add('open','owner');
    return true;
  }

  function make(){
    var drawer = document.getElementById('sbShellDrawer');
    if(!drawer) return false;

    var ownerGroup = findOwnerGroup(drawer);

    var wrong = drawer.querySelectorAll('a[href="' + OWNER_PAGE_NAME + '"]');
    wrong.forEach(function(a){
      if(!ownerGroup || !ownerGroup.contains(a)) a.remove();
    });

    if(!ownerGroup){
      if(!isOwnerScannerPage()){
        document.documentElement.dataset.streamBanditMenuExtraLink = VERSION + '-waiting-owner';
        return false;
      }
      ownerGroup = buildOwnerGroup(drawer);
    }

    addLinks(ownerGroup);
    document.documentElement.dataset.streamBanditMenuExtraLink = VERSION;
    return true;
  }

  function start(){
    var n = 0;
    var timer = setInterval(function(){
      n++;
      if(make() || n > 60) clearInterval(timer);
    },250);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  try{
    new MutationObserver(function(){ make(); }).observe(document.documentElement,{childList:true,subtree:true});
  }catch(e){}
})();
