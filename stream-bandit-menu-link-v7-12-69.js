/* Stream Bandit V7.12.72 Stable Owner Menu Link
   Emergency stabiliser: one-shot only. No MutationObserver. No interval loop.
   Adds/restores the Owner group on the Global Whatnots scanner page only.
   Safe UI-only navigation helper: no Supabase writes, no deletes, no live promotion, no payment unlocks. */
(function(){
  'use strict';

  var VERSION = 'v7-12-72-stable-one-shot';
  var OWNER_PAGE_NAME = 'global-helper-property-owner-scan-v7-12-67-test.html';
  var done = false;

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
    var groups = drawer.querySelectorAll('.sb-shell-group');
    for(var i=0;i<groups.length;i++){
      if(groups[i].classList.contains('owner') || groupName(groups[i]) === 'owner') return groups[i];
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

  function addOwnerLinks(ownerGroup){
    var box = ownerGroup && ownerGroup.querySelector('.sb-shell-items');
    if(!box) return false;

    OWNER_PAGES.forEach(function(p){
      if(box.querySelector('a[href="' + p[2] + '"]')) return;
      var a = document.createElement('a');
      a.className = 'sb-shell-link owner';
      a.href = p[2];
      a.setAttribute('data-sb-text',(p[1] + ' owner global whatnots settings bucket supabase role gate').toLowerCase());
      a.innerHTML = '<span style="width:24px">' + esc(p[0]) + '</span>' + esc(p[1]);
      box.appendChild(a);
    });

    var pill = ownerGroup.querySelector('.sb-shell-pill');
    if(pill) pill.textContent = String(box.querySelectorAll('a').length);
    ownerGroup.classList.add('owner','open');
    return true;
  }

  function runOnce(){
    if(done) return;
    var drawer = document.getElementById('sbShellDrawer');
    if(!drawer) return;

    var ownerGroup = findOwnerGroup(drawer);
    if(!ownerGroup && isOwnerScannerPage()) ownerGroup = buildOwnerGroup(drawer);
    if(!ownerGroup){
      document.documentElement.dataset.streamBanditMenuExtraLink = VERSION + '-no-owner-visible';
      done = true;
      return;
    }

    addOwnerLinks(ownerGroup);
    document.documentElement.dataset.streamBanditMenuExtraLink = VERSION;
    done = true;
  }

  function start(){
    // Give the shared shell a moment to build its drawer, then do exactly one pass.
    setTimeout(runOnce, 900);
    setTimeout(runOnce, 1800);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
