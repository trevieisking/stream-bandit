(function(){'use strict';
var V='V141',R='clSolV141',HK='clSolV141History',RK='clSolV141Response',busy=false;
if(document.documentElement.dataset.clSolV141)return;document.documentElement.dataset.clSolV141='1';
function q(s,r){return(r||document).querySelector(s)}
function get(k,d){try{return JSON.parse(localStorage.getItem(k)||'null')||d}catch(e){return d}}
function put(k,v){localStorage.setItem(k,JSON.stringify