/* Code Labs V105 Sol Pairing
   Secure controller for a separate same-origin Code Labs workspace window.
   Existing Buddy wording and page files remain unchanged.
*/
(function () {
  'use strict';

  var VERSION = 'V105';
  var ENDPOINT = 'https://xzxqfrvqdgkzwujbkdbk.supabase.co/functions/v1/code-labs-browser-control';
  var PUBLIC_KEY = 'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  var SESSION_ID_KEY = 'codeLabsSolPairingSessionV105';
  var SECRET_KEY = 'codeLabsSol