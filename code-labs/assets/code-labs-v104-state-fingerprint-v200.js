/* Code Labs V104 state-sensitive page fingerprint guard.
   Wraps the V140 page bridge without changing its public compatibility name.
*/
(function () {
  'use strict';

  var VERSION = 'V200.19-v104-state-fingerprint';
  var installed = false;

  function hash32(value) {
    var text = String(value == null ? '' : value);
    var hash = 0;
    for (var i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function stateProof(packet) {
    packet = packet || {};
    return JSON.stringify({
      page: packet.page || '',
      title: packet.title || '',
      url: String(packet.url || '').split('#')[0],
      repo: packet.repo || '',
      path: packet.path || '',
      source_branch: packet.source_branch || '',
      request_branch: packet.request_branch || '',
      action: packet.action || '',
      current_source_hash: packet.current_source && packet.current_source.hash32 || '',
      fixed_output_hash: packet.fixed_output && packet.fixed_output.hash32 || '',
      sections: (packet.sections || []).map(function (section) {
        return {
          key: section.key || '',
          hidden: !!section.hidden,
          hash32: section.hash32 || '',
          fields: (section.fields || []).map(function (field) {
            return {
              key: field.key || '',
              hash32: field.hash32 || '',
              writable: !!field.writable,
              disabled: !!field.disabled,
              readonly: !!field.readonly
            };
          }),
          actions: (section.actions || []).map(function (action) {
            return {
              key: action.key || '',
              href: action.href || '',
              disabled: !!action.disabled,
              dangerous: !!action.dangerous,
              approved: !!action.approved
            };
          })
        };
      })
    });
  }

  function install() {
    if (installed) return true;
    var bridge = window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge;
    if (!bridge || !bridge.readPage || !bridge.applyCommand) return false;
    if (bridge.stateFingerprintVersion === VERSION) { installed = true; return true; }

    var originalRead = bridge.readPage.bind(bridge);
    var originalApply = bridge.applyCommand.bind(bridge);

    bridge.readPage = function () {
      var packet = originalRead() || {};
      packet.bridge_route_fingerprint = packet.page_fingerprint || '';
      packet.page_fingerprint = hash32(stateProof(packet));
      packet.state_fingerprint_version = VERSION;
      return packet;
    };

    bridge.applyCommand = function (command) {
      var current = originalRead() || {};
      var safeCommand = command;
      if (command && typeof command === 'object') {
        safeCommand = {};
        Object.keys(command).forEach(function (key) { safeCommand[key] = command[key]; });
        safeCommand.expected_page_fingerprint = current.page_fingerprint || '';
      }
      return originalApply(safeCommand);
    };

    bridge.stateFingerprintVersion = VERSION;
    window.CodeLabsBuddyPageBridgeV140 = bridge;
    window.CodeLabsBuddyPageBridge = bridge;
    document.documentElement.setAttribute('data-cl-v104-state-fingerprint', VERSION);
    installed = true;
    return true;
  }

  function run(attempt) {
    if (install()) return;
    if ((attempt || 0) < 100) setTimeout(function () { run((attempt || 0) + 1); }, 50);
  }

  run(0);
  window.CodeLabsV104StateFingerprintV200 = { version: VERSION, install: install };
})();
