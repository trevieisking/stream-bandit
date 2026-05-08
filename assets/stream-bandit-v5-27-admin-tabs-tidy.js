(function(){
'use strict';
try{
  document.body.classList.remove('sb527Admin');
  Array.prototype.slice.call(document.querySelectorAll('#sb527RealTabs,.sb527RealTabs,#sb527Note,#sb527Helper')).forEach(function(el){el.remove();});
  Array.prototype.slice.call(document.querySelectorAll('.sb527Off,.sb527Hidden')).forEach(function(el){el.classList.remove('sb527Off');el.classList.remove('sb527Hidden');el.style.display='';});
  var a=document.getElementById('sb527Style'); if(a)a.remove();
  var b=document.getElementById('sb527Css'); if(b)b.remove();
}catch(e){}
})();
