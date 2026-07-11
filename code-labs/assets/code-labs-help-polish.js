/* Code Labs Help polish */
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function make(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e}
function jump(id){var e=q(id);if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t||'');return}var a=document.createElement('textarea');a.value=t||