(function(){
  "use strict";
  const VERSION="2.4.3";
  const PRIMARY=[
    {key:"home",label:"Game Home",href:"tcg-game-home.html"},
    {key:"play",label:"Play",href:"tcg-play.html"},
    {key:"collection",label:"Collection",href:"tcg-collection.html"},
    {key:"decks",label:"Decks",href:"tcg-decks.html"},
    {key:"packs",label:"Packs",href:"tcg-packs.html"},
    {key:"players",label:"Players",href:"tcg-players.html"},
    {key:"friends",label:"Friends",href:"tcg-friends.html"},
    {key:"learn",label:"Learn",href:"tcg-learn.html"},
    {key:"progress",label:"Progress",href:"tcg-progress.html"},
    {key:"settings",label:"Settings",href:"tcg-settings.html"},
    {key:"account",label:"Account",href:"tcg-account.html"}
  ];
  const FAMILIES={
    account:{label:"Account pages",items:[
      {key:"overview",label:"Overview",href:"tcg-account.html"},
      {key:"profile",label:"Profile",href:"tcg-account-profile.html"},
      {key:"security",label:"Security",href:"tcg-account-security.html"},
      {key:"privacy",label:"Privacy",href:"tcg-account-privacy.html"},
      {key:"notifications",label:"Notifications",href:"tcg-account-notifications.html"},
      {key:"preferences",label:"Preferences",href:"tcg-account-preferences.html"},
      {key:"leave",label:"Leave TCG",href:"tcg-account-leave.html"},
      {key:"delete",label:"Delete Account",href:"tcg-account-delete.html"}
    ]},
    friends:{label:"Friends pages",items:[
      {key:"friends",label:"Friends",href:"tcg-friends.html"},
      {key:"requests",label:"Requests",href:"tcg-friend-requests.html"},
      {key:"find",label:"Find Players",href:"tcg-players.html"},
      {key:"blocked",label:"Blocked",href:"tcg-blocked.html"}
    ]},
    players:{label:"Player pages",items:[
      {key:"players",label:"Players",href:"tcg-players.html"},
      {key:"profile",label:"Public TCG Player Profile",href:"tcg-player-profile.html"}
    ]}
  };
  function buildNav(items,label,current){
    const nav=document.createElement("nav");
    nav.className="tcg-nav";
    nav.setAttribute("aria-label",label);
    items.forEach(item=>{
      const a=document.createElement("a");
      a.className="tcg-pill"+(item.key===current?" is-active":"");
      a.href=item.href;
      a.textContent=item.label;
      if(item.key===current)a.setAttribute("aria-current","page");
      nav.appendChild(a);
    });
    return nav;
  }
  function mount(){
    const body=document.body;
    const main=document.querySelector("main.tcg-page");
    if(!body||!main||body.dataset.sbTcgBattle)return;
    const page=body.dataset.sbTcgPage||"";
    const primaryKey=body.dataset.sbTcgPrimary||page;
    main.before(buildNav(PRIMARY,"TCG pages",primaryKey));
    const family=body.dataset.sbTcgFamily;
    if(family&&FAMILIES[family]){
      const sub=buildNav(FAMILIES[family].items,FAMILIES[family].label,body.dataset.sbTcgSubpage||"");
      main.before(sub);
    }
  }
  window.StreamBanditTCGPageShellV243=Object.freeze({version:VERSION,primaryRoutes:PRIMARY,familyRoutes:FAMILIES});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
