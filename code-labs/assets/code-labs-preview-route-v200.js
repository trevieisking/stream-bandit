/* Code Labs Preview Base Adapter V201 - scoped srcdoc normalization only. */
(function(){
'use strict';
var VERSION='V201-preview-base-adapter';
var MARKER='data-cl-preview-route-v200';
var observer=null;

function q(selector){return document.querySelector(selector)}
function previewBase(){
  try{return new URL('./',document.baseURI).href}
  catch(error){return''}
}
function baseMarkup(){
  var href=previewBase();
  return href?'<base href="'+href.replace(/"/g,'&quot;')+'"><meta name="'+MARKER+'" content="'+VERSION+'">':'';
}
function normalize(html){
  var source=String(html||''),base=baseMarkup();
  if(!source.trim()||!base||source.indexOf(MARKER)!==-1)return source;
  if(/<head[\s>]/i.test(source))return source.replace(/<head([^>]*)>/i,'<head$1>'+base);
  if(/<html[\s>]/i.test(source))return source.replace(/<html([^>]*)>/i,'<html$1><head>'+base+'</head>');
  return'<!doctype html><html><head>'+base+'</head><body>'+source+'</body></html>';
}
function apply(){
  var frame=q('#preview');
  if(!frame)return false;
  var current=String(frame.getAttribute('srcdoc')||frame.srcdoc||''),next=normalize(current);
  if(next===current)return false;
  frame.srcdoc=next;
  return true;
}
function bind(){
  var frame=q('#preview');
  if(!frame)return{ok:false,reason:'preview_frame_missing'};
  if(frame.getAttribute('data-cl-preview-base-owner')===VERSION)return{ok:true,reused:true};
  frame.setAttribute('data-cl-preview-base-owner',VERSION);
  observer=new MutationObserver(function(records){
    if(records.some(function(record){return record.attributeName==='srcdoc'}))apply();
  });
  observer.observe(frame,{attributes:true,attributeFilter:['srcdoc']});
  apply();
  return{ok:true,reused:false};
}
function selfCheck(){
  var sample='<!doctype html><html><head><title>x</title></head><body></body></html>',once=normalize(sample),twice=normalize(once);
  return{
    ok:!!previewBase()&&once.indexOf('<base href=')!==-1&&once.indexOf(MARKER)!==-1&&once===twice,
    version:VERSION,
    base:previewBase(),
    owns:['preview-srcdoc-base-normalization'],
    doesNotOwn:['workflow-routes','workflow-order','page-rendering','button-actions','storage','network','backend-writes']
  };
}
window.CodeLabsPreviewRouteV200=Object.freeze({version:VERSION,apply:apply,bind:bind,normalize:normalize,base:previewBase,selfCheck:selfCheck});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
