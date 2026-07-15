/* Code Labs Workbench Polish V228 - presentation only. */
(function () {
  'use strict';

  if (!document.body || document.body.getAttribute('data-page') === 'code-god') return;
  if (document.getElementById('clWorkbenchPolishV228')) return;

  var style = document.createElement('style');
  style.id = 'clWorkbenchPolishV228';
  style.textContent = [
    'body.clWorkbenchV228 .sidebar{z-index:80!important;pointer-events:auto!important;isolation:isolate}',
    'body.clWorkbenchV228 .nav,body.clWorkbenchV228 .nav a{pointer-events:auto!important;position:relative}',
    'body.clWorkbenchV228 .nav a{z-index:1;transition:transform .14s ease,border-color .14s ease,background .14s ease}',
    'body.clWorkbenchV228 .nav a:hover{transform:translateX(2px)}',
    'body.clWorkbenchV228 .nav a.active:after{content:"";position:absolute;right:8px;width:7px;height:7px;border-radius:50%;background:#37f28f;box-shadow:0 0 0 4px rgba(55,242,143,.13)}',
    'body.clWorkbenchV228 .main{max-width:1500px}',
    'body.clWorkbenchV228 .panel,body.clWorkbenchV228 .card{border-color:color-mix(in srgb,var(--line) 82%,var(--brand) 18%)}',
    'body.clWorkbenchV228 .panel>h2:first-child{display:flex;align-items:center;gap:9px;font-size:clamp(18px,2vw,24px);letter-spacing:-.025em}',
    'body.clWorkbenchV228 .panel>h2:first-child:before{content:"";width:9px;height:28px;border-radius:999px;background:linear-gradient(180deg,var(--brand),var(--brand2));flex:0 0 auto}',
    'body.clWorkbenchV228 .fieldRow,body.clWorkbenchV228 .fieldRow3{align-items:stretch}',
    'body.clWorkbenchV228 label{border:1px solid var(--line);border-radius:18px;background:var(--panel2);padding:11px}',
    'body.clWorkbenchV228 label input,body.clWorkbenchV228 label select,body.clWorkbenchV228 label textarea{background:var(--panel);margin-top:2px}',
    'body.clWorkbenchV228 .item{box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}',
    'body.clWorkbenchV228 .item:hover{border-color:color-mix(in srgb,var(--line) 55%,var(--brand) 45%)}',
    'body.clWorkbenchV228 #clProductTabsV227{border-width:1px;box-shadow:0 12px 32px rgba(20,32,58,.12)}',
    'body.clWorkbenchV228 .clProductTab{min-height:40px}',
    'body.clWorkbenchV228 details[data-cl-buddy-notes-ui="true"]{background:var(--panel2);border-style:solid!important}',
    'body.clWorkbenchV228 details[data-cl-buddy-notes-ui="true"] summary{font-weight:950}',
    'body.clWorkbenchV228 .actions{padding-top:2px}',
    'body.clWorkbenchV228 .btn{box-shadow:0 5px 14px rgba(20,32,58,.08)}',
    '@media(max-width:980px){body.clWorkbenchV228 .sidebar{z-index:auto!important}body.clWorkbenchV228 .nav a:hover{transform:none}body.clWorkbenchV228 label{padding:10px}}'
  ].join('');

  document.head.appendChild(style);
  document.body.classList.add('clWorkbenchV228');
  window.CodeLabsWorkbenchPolishV228 = { version: 'V228', active: true };
})();
