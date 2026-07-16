/* Code Labs Workbench Polish V250 - shared visual system only. */
(function () {
  'use strict';

  if (!document.body || document.body.getAttribute('data-page') === 'code-god') return;
  if (document.getElementById('clWorkbenchPolishV250')) return;

  var style = document.createElement('style');
  style.id = 'clWorkbenchPolishV250';
  style.textContent = [
    'body.clWorkbenchV250 .sidebar{z-index:80!important;pointer-events:auto!important;isolation:isolate;padding:12px;gap:10px;grid-template-rows:auto minmax(0,1fr) auto auto}',
    'body.clWorkbenchV250 .logo{gap:10px;padding:1px 1px 7px}',
    'body.clWorkbenchV250 .logoMark{width:44px;height:44px;border-radius:14px;background-size:42px 42px}',
    'body.clWorkbenchV250 .logo b{font-size:18px}',
    'body.clWorkbenchV250 .logo small{font-size:11px;line-height:1.2}',
    'body.clWorkbenchV250 .nav{gap:5px;padding:2px 3px 8px 0;overscroll-behavior:contain;scrollbar-gutter:stable}',
    'body.clWorkbenchV250 .nav a{pointer-events:auto!important;position:relative;z-index:1;grid-template-columns:30px 1fr;gap:8px;min-height:50px;padding:7px 9px;border-radius:14px;font-size:13px;line-height:1.2;transition:transform .14s ease,border-color .14s ease,background .14s ease}',
    'body.clWorkbenchV250 .nav a:hover{transform:translateX(2px)}',
    'body.clWorkbenchV250 .nav a.active:after{content:"";position:absolute;right:7px;width:7px;height:7px;border-radius:50%;background:#37f28f;box-shadow:0 0 0 4px rgba(55,242,143,.13)}',
    'body.clWorkbenchV250 .nav small{font-size:10.5px;line-height:1.25;margin-top:1px}',
    'body.clWorkbenchV250 .sideBox{border-radius:15px;padding:9px}',
    'body.clWorkbenchV250 .sideBox b{margin-bottom:4px;font-size:13px}',
    'body.clWorkbenchV250 .sideBox p{font-size:11px;line-height:1.35}',
    'body.clWorkbenchV250 .main{max-width:1500px;padding:18px 20px 30px}',
    'body.clWorkbenchV250 .topbar{margin-bottom:10px}',
    'body.clWorkbenchV250 .hero{border-radius:26px;padding:20px;gap:16px;margin-bottom:12px;box-shadow:0 14px 42px rgba(20,32,58,.11)}',
    'body.clWorkbenchV250 .hero h1{font-size:clamp(36px,4.6vw,64px);line-height:.96;margin:7px 0;letter-spacing:-.055em}',
    'body.clWorkbenchV250 .hero p{font-size:16px;line-height:1.5}',
    'body.clWorkbenchV250 .heroCard{border-radius:20px;padding:14px}',
    'body.clWorkbenchV250 #clProductTabsV227{top:8px;margin:0 0 12px;padding:8px;border-radius:18px;border-width:1px;box-shadow:0 9px 28px rgba(20,32,58,.11)}',
    'body.clWorkbenchV250 .clProductTabsHead{margin:0 2px 6px}',
    'body.clWorkbenchV250 .clProductTabsHead b{font-size:14px}',
    'body.clWorkbenchV250 .clProductTabsHead span{font-size:11px}',
    'body.clWorkbenchV250 .clProductTabList{gap:6px}',
    'body.clWorkbenchV250 .clProductTab{min-height:38px;padding:8px 11px;font-size:13px}',
    'body.clWorkbenchV250 .panel,body.clWorkbenchV250 .card,body.clWorkbenchV250 .notice,body.clWorkbenchV250 .danger,body.clWorkbenchV250 .success{border-radius:20px;padding:16px;margin-bottom:12px}',
    'body.clWorkbenchV250 .panel{box-shadow:0 10px 30px rgba(20,32,58,.09);border-color:color-mix(in srgb,var(--line) 86%,var(--brand) 14%)}',
    'body.clWorkbenchV250 .card{box-shadow:none}',
    'body.clWorkbenchV250 .panel>h2:first-child{display:flex;align-items:center;gap:9px;font-size:clamp(18px,1.8vw,23px);line-height:1.2;letter-spacing:-.025em}',
    'body.clWorkbenchV250 .panel>h2:first-child:not(.clNumberedHeading):before{content:"";width:7px;height:24px;border-radius:999px;background:linear-gradient(180deg,var(--brand),var(--brand2));flex:0 0 auto}',
    'body.clWorkbenchV250 .panel>h2.clNumberedHeading:before{display:none!important}',
    'body.clWorkbenchV250 .clPanelNumber{min-width:34px;height:34px;padding:0 9px;border-radius:11px;font-size:14px}',
    'body.clWorkbenchV250 .fieldRow,body.clWorkbenchV250 .fieldRow3{align-items:stretch}',
    'body.clWorkbenchV250 label{border:1px solid var(--line);border-radius:14px;background:var(--panel2);padding:10px;gap:6px}',
    'body.clWorkbenchV250 label input,body.clWorkbenchV250 label select,body.clWorkbenchV250 label textarea{background:var(--panel);margin-top:1px}',
    'body.clWorkbenchV250 input,body.clWorkbenchV250 select,body.clWorkbenchV250 textarea{border-radius:12px;padding:11px 12px}',
    'body.clWorkbenchV250 textarea{min-height:150px;line-height:1.55;font-size:13px;tab-size:2}',
    'body.clWorkbenchV250 textarea.mid{min-height:220px}',
    'body.clWorkbenchV250 textarea.big{min-height:340px}',
    'body.clWorkbenchV250 .actions{gap:8px;margin-top:10px;padding-top:0}',
    'body.clWorkbenchV250 .btn{min-height:42px;padding:10px 14px;box-shadow:0 4px 12px rgba(20,32,58,.07)}',
    'body.clWorkbenchV250 .card>button.btn,body.clWorkbenchV250 .card>a.btn{min-height:48px}',
    'body.clWorkbenchV250 .item{border-radius:16px;padding:11px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}',
    'body.clWorkbenchV250 .item:hover{border-color:color-mix(in srgb,var(--line) 60%,var(--brand) 40%)}',
    'body.clWorkbenchV250 .diffBox{border-radius:15px;line-height:1.55}',
    'body.clWorkbenchV250 details[data-cl-buddy-notes-ui="true"]{background:var(--panel2);border-style:solid!important}',
    'body.clWorkbenchV250 details[data-cl-buddy-notes-ui="true"] summary{font-weight:950}',
    'body.clWorkbenchV250 .footerNote{margin:22px 0}',
    '@media(max-width:980px){body.clWorkbenchV250 .sidebar{z-index:auto!important;padding:12px}body.clWorkbenchV250 .nav{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:10px}body.clWorkbenchV250 .nav a{min-height:48px}body.clWorkbenchV250 .nav a:hover{transform:none}body.clWorkbenchV250 .main{padding:12px}body.clWorkbenchV250 .hero{padding:17px;border-radius:22px}body.clWorkbenchV250 .hero h1{font-size:clamp(36px,10vw,54px)}body.clWorkbenchV250 .panel,body.clWorkbenchV250 .card,body.clWorkbenchV250 .notice,body.clWorkbenchV250 .danger,body.clWorkbenchV250 .success{padding:14px;border-radius:18px}body.clWorkbenchV250 label{padding:9px}body.clWorkbenchV250 #clProductTabsV227{top:auto}}',
    '@media(max-width:560px){body.clWorkbenchV250 .nav{grid-template-columns:1fr}body.clWorkbenchV250 .main{padding:10px}body.clWorkbenchV250 .clProductTabsHead span{display:none}body.clWorkbenchV250 .clProductTabList{scroll-snap-type:x proximity}body.clWorkbenchV250 .clProductTab{scroll-snap-align:start}body.clWorkbenchV250 .hero h1{font-size:clamp(34px,12vw,48px)}}',
    '@media(prefers-reduced-motion:reduce){body.clWorkbenchV250 .nav a{transition:none!important}}'
  ].join('');

  document.head.appendChild(style);
  document.body.classList.add('clWorkbenchV228', 'clWorkbenchV250');
  window.CodeLabsWorkbenchPolishV228 = { version: 'V250-shared-visual-system', active: true };
})();
