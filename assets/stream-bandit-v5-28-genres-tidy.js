(function(){
'use strict';
function clean(){
  try{
    var box=document.getElementById('sb528Box');
    if(box)box.remove();
    var st=document.getElementById('sb528Style');
    if(st)st.remove();
    document.body.classList.remove('sb528Genres');
  }catch(e){}
}
clean();
document.addEventListener('DOMContentLoaded',function(){setTimeout(clean,250);setTimeout(clean,1000);});
setTimeout(clean,1500);
})();
