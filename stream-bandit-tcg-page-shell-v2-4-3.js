(function(){
"use strict";
const VERSION="2.4.28";
const PRIMARY=[
 {key:"battle",label:"Battle",href:"tcg-play.html"},
 {key:"decks",label:"Decks",href:"tcg-decks.html"},
 {key:"collection",label:"Collection",href:"tcg-collection.html"},
 {key:"battlepass",label:"Battle Pass",href:"tcg-battle-pass.html"},
 {key:"shop",label:"Shop",href:"tcg-shop.html"},
 {key:"settings",label:"Settings",href:"tcg-settings.html"}
];
const FAMILIES={
 account:{label:"Account pages",items:[
  {key:"overview",label:"Overview",href:"tcg-account.html"},{key:"profile",label:"Profile",href:"tcg-account-profile.html"},
  {key:"security",label:"Security",href:"tcg-account-security.html"},{key:"privacy",label:"Privacy",href:"tcg-account-privacy.html"},
  {key:"notifications",label:"Notifications",href:"tcg-account-notifications.html"},{key:"preferences",label:"Preferences",href:"tcg-account-preferences.html"},
  {key:"leave",label:"Leave TCG",href:"tcg-account-leave.html"},{key:"delete",label:"Delete Account",href:"tcg-account-delete.html"}]},
 friends:{label:"Friends pages",items:[
  {key:"friends",label:"Friends",href:"tcg-friends.html"},{key:"requests",label:"Requests",href:"tcg-friend-requests.html"},
  {key:"find",label:"Find Players",href:"tcg-players.html"},{key:"blocked",label:"Blocked",href:"tcg-blocked.html"}]},
 players:{label:"Player pages",items:[
  {key:"players",label:"Players",href:"tcg-players.html"},{key:"profile",label:"Public TCG Player Profile",href:"tcg-player-profile.html"}]}
};
function primaryKey(body){
 const explicit=body.dataset.sbTcgPrimary;if(explicit)return explicit;
 const page=body.dataset.sbTcgPage||"";
 if(["play","home"].includes(page))return "battle";
 if(page==="packs")return "shop";
 if(page==="progress")return "battlepass";
 return PRIMARY.some(x=>x.key===page)?page:"";
}
function nav(items,label,current,className){
 const el=document.createElement("nav");el.className=className||"tcg-client-nav";el.setAttribute("aria-label",label);
 items.forEach(item=>{const a=document.createElement("a");a.href=item.href;a.dataset.key=item.key;a.textContent=item.label;
  if(item.key===current){a.classList.add("is-active");a.setAttribute("aria-current","page")}el.appendChild(a)});
 return el;
}
function mount(){
 const body=document.body,main=document.querySelector("main.tcg-page");
 if(!body||!main||body.dataset.sbTcgClientMounted==="1")return;
 body.dataset.sbTcgClientMounted="1";
 document.documentElement.dataset.sbTcgVisualAuthority="v2-4-28";
 const client=document.createElement("div");client.className="tcg-client";
 const top=document.createElement("header");top.className="tcg-client-topbar";
 const brand=document.createElement("a");brand.className="tcg-client-brand";brand.href="tcg-play.html";
 brand.innerHTML='<img src="assets/stream-bandit-original-stag-logo-v7-12-7.svg" alt=""><span class="tcg-client-brand-copy"><strong>Stream Bandit</strong><span>TCG</span></span>';
 top.appendChild(brand);top.appendChild(nav(PRIMARY,"Stream Bandit TCG",primaryKey(body),"tcg-client-nav"));
 const stage=document.createElement("section");stage.className="tcg-client-stage";
 main.parentNode.insertBefore(client,main);client.appendChild(top);client.appendChild(stage);stage.appendChild(main);
 const family=body.dataset.sbTcgFamily;
 if(family&&FAMILIES[family]){
  const sub=nav(FAMILIES[family].items,FAMILIES[family].label,body.dataset.sbTcgSubpage||"","tcg-subnav");
  main.insertBefore(sub,main.firstChild);
 }
}
window.StreamBanditTCGClientShell=Object.freeze({version:VERSION,primaryRoutes:PRIMARY,familyRoutes:FAMILIES});
window.StreamBanditTCGPageShellV243=window.StreamBanditTCGClientShell;
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();