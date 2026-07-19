/* Code Labs Owner Gallery V171 - private owner-only image storage from Saved Files. */
(function () {
  'use strict';

  var VERSION = 'V171';
  var BUCKET = 'code-labs-owner-gallery';
  var MAX_BYTES = 10 * 1024 * 1024;
  var MAX_FILES_PER_UPLOAD = 10;
  var SIGNED_URL_SECONDS = 15 * 60;
  var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  var accessContext = null;
  var rendered = false;

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setStatus(message, kind) {
    var el = q('#clOwnerGalleryStatus');
    if (!el) return;
    el.className = 'badge ' + (kind || 'warn');
    el.textContent = message;
  }

  function setHelp(message) {
    var el = q('#clOwnerGalleryHelp');
    if (!el) return;
    el.textContent = message;
  }

  function safeName(value) {
    var name = String(value || 'image').split(/[\\/]/).pop();
    name = name.normalize ? name.normalize('NFKC') : name;
    name = name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-');
    name = name.replace(/^[-.]+|[-.]+$/g, '');
    return (name || 'image').slice(-120);
  }

  function randomPart() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return String(Date.now()) + '-image';
  }

  function ownerObjectPath(userId, filename) {
    return String(userId) + '/' + randomPart() + '-' + safeName(filename);
  }

  function allowedFile(file) {
    return !!file && ALLOWED_TYPES.indexOf(String(file.type || '').toLowerCase()) >= 0 &&
      Number(file.size || 0) > 0 && Number(file.size || 0) <= MAX_BYTES;
  }

  function activeAt(entitlement, now) {
    if (!entitlement || entitlement.plan_key !== 'pro' || entitlement.status !== 'active') return false;
    var instant = now || new Date();
    if (entitlement.starts_at && new Date(entitlement.starts_at) > instant) return false;
    if (entitlement.expires_at && new Date(entitlement.expires_at) <= instant) return false;
    return true;
  }

  async function currentUser() {
    var manager = window.CodeLabsSavedFilesV170;
    if (!manager || typeof manager.currentUser !== 'function') {
      throw new Error('Saved Files owner session is not ready.');
    }
    return manager.currentUser();
  }

  async function ownerAccess() {
    var current = await currentUser();
    if (current.error) throw current.error;
    if (!current.user) return { ok: false, reason: 'no_session' };

    var results = await Promise.all([
      current.sb.from('code_labs_owners').select('user_id').eq('user_id', current.user.id).maybeSingle(),
      current.sb.from('code_labs_entitlements')
        .select('plan_key,status,starts_at,expires_at')
        .eq('owner_id', current.user.id)
        .eq('product_key', 'code_labs')
        .maybeSingle()
    ]);
    if (results[0].error) throw results[0].error;
    if (results[1].error) throw results[1].error;
    if (!results[0].data || !activeAt(results[1].data)) return { ok: false, reason: 'not_owner_pro' };
    return { ok: true, sb: current.sb, user: current.user };
  }

  function addStyles() {
    if (q('#clOwnerGalleryV171Style')) return;
    var style = document.createElement('style');
    style.id = 'clOwnerGalleryV171Style';
    style.textContent = [
      '.clOwnerGallery[hidden]{display:none!important}',
      '.clOwnerGalleryGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-top:16px}',
      '.clOwnerGalleryCard{border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;overflow:hidden}',
      '.clOwnerGalleryCard img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#e2e8f0}',
      '.clOwnerGalleryCardBody{padding:10px;display:grid;gap:8px}',
      '.clOwnerGalleryCardName{font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.clOwnerGalleryCard .actions{gap:6px}',
      '.clOwnerGalleryCard .btn{padding:7px 9px;font-size:12px}',
      '.clOwnerGalleryUpload{display:flex;flex-wrap:wrap;gap:10px;align-items:center}',
      '.clOwnerGalleryUpload input[type=file]{max-width:100%}'
    ].join('');
    document.head.appendChild(style);
  }

  function injectUi() {
    if (rendered) return true;
    var hero = q('#clSavedFilesV170');
    var main = q('.main');
    if (!hero || !main) return false;

    addStyles();
    var actions = q('.actions', hero);
    var button = document.createElement('button');
    button.id = 'clOpenOwnerGallery';
    button.className = 'btn ghost';
    button.type = 'button';
    button.hidden = true;
    button.textContent = 'Owner image gallery';
    if (actions) actions.appendChild(button);

    var section = document.createElement('section');
    section.id = 'clOwnerGalleryV171';
    section.className = 'panel clOwnerGallery';
    section.hidden = true;
    section.innerHTML = '<h2>Private owner image gallery</h2>' +
      '<p>Images are stored in a private Code Labs bucket. Only the registered Code Labs owner with an active Pro entitlement can list, upload, preview or remove them.</p>' +
      '<div class="clOwnerGalleryUpload">' +
      '<input id="clOwnerGalleryFiles" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple>' +
      '<button class="btn primary" id="clOwnerGalleryUpload" type="button">Upload selected images</button>' +
      '<button class="btn ghost" id="clOwnerGalleryRefresh" type="button">Refresh gallery</button>' +
      '<button class="btn ghost" id="clOwnerGalleryClose" type="button">Close gallery</button>' +
      '<span id="clOwnerGalleryStatus" class="badge warn">Owner check required</span>' +
      '</div>' +
      '<div id="clOwnerGalleryHelp" class="notice">Private previews use temporary signed URLs. No image is public.</div>' +
      '<div id="clOwnerGalleryGrid" class="clOwnerGalleryGrid"><div class="empty">Gallery not loaded yet.</div></div>';
    var footer = q('.footerNote', main);
    if (footer) main.insertBefore(section, footer); else main.appendChild(section);

    button.addEventListener('click', openGallery);
    q('#clOwnerGalleryUpload').addEventListener('click', uploadSelected);
    q('#clOwnerGalleryRefresh').addEventListener('click', loadGallery);
    q('#clOwnerGalleryClose').addEventListener('click', function () { section.hidden = true; });
    rendered = true;
    return true;
  }

  async function makePreview(sb, path) {
    var result = await sb.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
    if (result.error) throw result.error;
    return result.data && result.data.signedUrl ? result.data.signedUrl : '';
  }

  function imageCard(item) {
    var card = document.createElement('article');
    card.className = 'clOwnerGalleryCard';
    var image = document.createElement('img');
    image.src = item.signedUrl;
    image.alt = item.displayName;
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    var body = document.createElement('div');
    body.className = 'clOwnerGalleryCardBody';
    var name = document.createElement('div');
    name.className = 'clOwnerGalleryCardName';
    name.textContent = item.displayName;
    var actions = document.createElement('div');
    actions.className = 'actions';
    var copy = document.createElement('button');
    copy.className = 'btn ghost';
    copy.type = 'button';
    copy.textContent = 'Copy temporary URL';
    copy.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(item.signedUrl);
        setStatus('Temporary URL copied', 'good');
      } catch (error) {
        setStatus('Copy was blocked', 'bad');
      }
    });
    var remove = document.createElement('button');
    remove.className = 'btn bad';
    remove.type = 'button';
    remove.textContent = 'Remove image';
    remove.addEventListener('click', function () { removeImage(item); });
    actions.appendChild(copy);
    actions.appendChild(remove);
    body.appendChild(name);
    body.appendChild(actions);
    card.appendChild(image);
    card.appendChild(body);
    return card;
  }

  async function loadGallery() {
    try {
      if (!accessContext || !accessContext.ok) accessContext = await ownerAccess();
      if (!accessContext.ok) throw new Error('Owner Pro access is required.');
      setStatus('Loading private gallery', 'warn');
      var result = await accessContext.sb.storage.from(BUCKET).list(accessContext.user.id, {
        limit: 60,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (result.error) throw result.error;
      var rows = (result.data || []).filter(function (row) { return row && row.name && row.name !== '.emptyFolderPlaceholder'; });
      var items = await Promise.all(rows.map(async function (row) {
        var path = accessContext.user.id + '/' + row.name;
        return { path: path, displayName: row.name.replace(/^[0-9a-f-]+-/i, ''), signedUrl: await makePreview(accessContext.sb, path) };
      }));
      var grid = q('#clOwnerGalleryGrid');
      grid.innerHTML = '';
      if (!items.length) grid.innerHTML = '<div class="empty">Your private owner gallery is empty.</div>';
      items.forEach(function (item) { grid.appendChild(imageCard(item)); });
      setStatus(items.length + ' private image' + (items.length === 1 ? '' : 's'), 'good');
      setHelp('Temporary preview URLs expire after 15 minutes. Refresh the gallery to create new previews.');
      return { ok: true, count: items.length };
    } catch (error) {
      setStatus('Gallery unavailable', 'bad');
      setHelp('The owner-only storage gate blocked or could not complete this request. No files were changed.');
      return { ok: false };
    }
  }

  async function uploadSelected() {
    try {
      if (!accessContext || !accessContext.ok) accessContext = await ownerAccess();
      if (!accessContext.ok) throw new Error('Owner Pro access is required.');
      var input = q('#clOwnerGalleryFiles');
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) {
        setHelp('Choose one or more image files first.');
        return { ok: false };
      }
      if (files.length > MAX_FILES_PER_UPLOAD) {
        setHelp('Upload no more than ' + MAX_FILES_PER_UPLOAD + ' images at once.');
        return { ok: false };
      }
      var invalid = files.find(function (file) { return !allowedFile(file); });
      if (invalid) {
        setHelp('Only JPEG, PNG, WebP, GIF or AVIF images up to 10 MB are accepted.');
        return { ok: false };
      }
      setStatus('Uploading privately', 'warn');
      for (var index = 0; index < files.length; index += 1) {
        var file = files[index];
        var path = ownerObjectPath(accessContext.user.id, file.name);
        var result = await accessContext.sb.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });
        if (result.error) throw result.error;
      }
      input.value = '';
      setStatus('Private upload complete', 'good');
      await loadGallery();
      return { ok: true, count: files.length };
    } catch (error) {
      setStatus('Upload blocked', 'bad');
      setHelp('The owner-only storage gate blocked or could not complete the upload. No public URL was created.');
      return { ok: false };
    }
  }

  async function removeImage(item) {
    if (!item || !item.path) return { ok: false };
    if (!window.confirm('Remove this image from your private Code Labs owner gallery?')) return { ok: false };
    try {
      if (!accessContext || !accessContext.ok) accessContext = await ownerAccess();
      if (!accessContext.ok) throw new Error('Owner Pro access is required.');
      setStatus('Removing private image', 'warn');
      var result = await accessContext.sb.storage.from(BUCKET).remove([item.path]);
      if (result.error) throw result.error;
      await loadGallery();
      return { ok: true };
    } catch (error) {
      setStatus('Remove blocked', 'bad');
      setHelp('The owner-only storage gate blocked or could not complete this removal.');
      return { ok: false };
    }
  }

  async function openGallery() {
    var section = q('#clOwnerGalleryV171');
    if (!section) return;
    section.hidden = false;
    await loadGallery();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function revealForOwner() {
    try {
      accessContext = await ownerAccess();
      if (!accessContext.ok) return false;
      var button = q('#clOpenOwnerGallery');
      if (button) button.hidden = false;
      return true;
    } catch (error) {
      return false;
    }
  }

  function boot(attempt) {
    attempt = attempt || 0;
    if (!injectUi()) {
      if (attempt < 20) window.setTimeout(function () { boot(attempt + 1); }, 150);
      return;
    }
    revealForOwner();
  }

  window.CodeLabsOwnerGalleryV171 = {
    version: VERSION,
    bucket: BUCKET,
    activeAt: activeAt,
    allowedFile: allowedFile,
    safeName: safeName,
    ownerObjectPath: ownerObjectPath,
    ownerAccess: ownerAccess,
    loadGallery: loadGallery,
    uploadSelected: uploadSelected
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(0); });
  else boot(0);
})();
