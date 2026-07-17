/* Code Labs Buddy Bridge Tab V264 - keep fourth tab selected across native redraws. */
(function(){
'use strict';
var V='V264-buddy-tab-stable',ROOT='clProductTabsV227',BRIDGE='clBuddyPageBridgeV139',GROUP='buddy',wrapped=false,timer=0;
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html