/* Code Labs Live V105 packet-size guard V106
   Compacts only oversized V140 live snapshots before they leave Sol Control.
   Existing Buddy wording, page controls and normal-sized packets stay unchanged.
*/
(function () {
  'use strict';

  var INSTALL_KEY = 'data-cl-live-packet-guard-v106-installed';
  var MAX_FULL_PACKET = 500000;
  var MAX_FIELD_VALUE = 12000;
  var MAX_SECTION_TEXT = 6000;
  var MAX_SMALL_OBJECT = 16000;
  var originalStringify = JSON.stringify.bind(JSON);

  if (document.documentElement.getAttribute(INSTALL_KEY) === 'yes') return;
  document.documentElement.setAttribute(INSTALL_KEY, 'yes');

  function trimText(value, limit) {
    if (typeof value !== 'string') return value;
    if (value.length <= limit) return value;
    return value.slice(0, limit) + '\n...[trimmed only for live pairing transport]';
  }

  function isPacket(value) {
    return Boolean(
      value &&
      typeof value === 'object' &&
      typeof value.page_fingerprint === 'string' &&
      Array.isArray(value.sections) &&
      Array.isArray(value.fields)
    );
  }

  function copyKeys(source, keys, target) {
    keys.forEach(function (key) {
      if (source && Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
    });
    return target;
  }

  function compactField(field, includeValue) {
    var result = copyKeys(field, [
      'key', 'field_key', 'id', 'name', 'label', 'type', 'tag',
      'section_key', 'writable', 'sensitive', 'blocked', 'readonly',
      'disabled', 'required', 'placeholder', 'preview'
    ], {});
    if (typeof result.preview === 'string') result.preview = trimText(result.preview, 2000);
    if (includeValue && field && Object.prototype.hasOwnProperty.call(field, 'value')) {
      result.value = trimText(field.value, MAX_FIELD_VALUE);
    }
    return result;
  }

  function compactAction(action) {
    return copyKeys(action, [
      'key', 'action_key', 'id', 'name', 'label', 'text', 'type', 'tag',
      'section_key', 'dangerous', 'approved', 'disabled', 'confirmed'
    ], {});
  }

  function copySmallTopLevel(packet, compact) {
    var excluded = {
      fields: true,
      sections: true,
      actions: true,
      current_source: true,
      fixed_output: true,
      text: true,
      packet_text: true,
      source_text: true
    };
    Object.keys(packet || {}).forEach(function (key) {
      if (excluded[key]) return;
      var value = packet[key];
      if (value == null || typeof value === 'number' || typeof value === 'boolean') {
        compact[key] = value;
        return;
      }
      if (typeof value === 'string') {
        compact[key] = trimText(value, 4000);
        return;
      }
      try {
        var text = originalStringify(value);
        if (text.length <= MAX_SMALL_OBJECT) compact[key] = JSON.parse(text);
      } catch (error) {}
    });
  }

  function compactPacket(packet, originalLength) {
    var compact = {};
    copySmallTopLevel(packet, compact);

    compact.fields = (packet.fields || []).slice(0, 250).map(function (field) {
      return compactField(field, true);
    });
    compact.actions = (packet.actions || []).slice(0, 300).map(compactAction);
    compact.sections = (packet.sections || []).slice(0, 120).map(function (section) {
      var result = copyKeys(section, [
        'key', 'section_key', 'id', 'name', 'title', 'label', 'hidden', 'active'
      ], {});
      result.text = trimText(section && section.text, MAX_SECTION_TEXT);
      result.fields = (section && section.fields || []).slice(0, 120).map(function (field) {
        return compactField(field, false);
      });
      result.actions = (section && section.actions || []).slice(0, 120).map(compactAction);
      return result;
    });

    if (packet.current_source) compact.current_source = compactField(packet.current_source, false);
    if (packet.fixed_output) compact.fixed_output = compactField(packet.fixed_output, false);

    compact.live_pairing_transport = {
      compact: true,
      guard_version: 'V106',
      original_characters: originalLength,
      note: 'Repeated large values were trimmed for transport. Stable page, field, section and action keys remain available.'
    };
    return compact;
  }

  function prepare(value) {
    if (isPacket(value)) {
      var packetText = originalStringify(value);
      return packetText.length > MAX_FULL_PACKET ? compactPacket(value, packetText.length) : value;
    }
    if (value && typeof value === 'object' && isPacket(value.page_snapshot)) {
      var snapshotText = originalStringify(value.page_snapshot);
      if (snapshotText.length > MAX_FULL_PACKET) {
        var copy = Object.assign({}, value);
        copy.page_snapshot = compactPacket(value.page_snapshot, snapshotText.length);
        return copy;
      }
    }
    return value;
  }

  JSON.stringify = function (value, replacer, space) {
    return originalStringify(prepare(value), replacer, space);
  };

  window.CodeLabsLivePacketGuardV106 = {
    version: 'V106',
    compactPacket: compactPacket
  };
})();
