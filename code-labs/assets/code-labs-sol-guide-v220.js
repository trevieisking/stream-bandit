(function(){
'use strict';
var VERSION='V221';
var ROOT_ID='clSolGuideV220';
var HISTORY_KEY='clSolGuideV220History';
var RESPONSE_KEY='clSolGuideV220Response';
var busy=false;
if(document.documentElement.getAttribute('data-cl-sol-guide-v220-installed')==='yes')return;
document.documentElement.setAttribute('data-cl-sol-guide-v220-installed','yes');
function q(selector,root){return(root||document).querySelector(selector)}
function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
function readJson(key,fallback){try{var value=JSON.parse(localStorage.getItem(key)||'null');return value==null