(function(){
'use strict';

const VERSION='2.4.46';
const ACTIVE_STARTER_ID='deck-astral-second-sky';
const SOURCES=Object.freeze({
  starters:'tcg-set-one-starters-v0.2.json',
  intake:'assets/tcg/cards/set-one/tcg-card-art-intake-v1.json',
  production:'assets/tcg/art-direction/tcg-art-production-ledger-v1.json',
  accessories:'assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json',
  art:'assets/tcg/tcg-art-manifest.json'
});

let readyPromise=null;
let model=null;

function esc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function absolute(path){
  return new URL(String(path||''),document.baseURI).href;
}
async function readJson(path){
  const response=await fetch(absolute(path),{credentials:'same-origin'});
  if(!response.ok)throw new Error('TCG presentation source unavailable: '+path+' (HTTP '+response.status+')');
  return response.json();
}
function flattenProduction(production){
  const batches=production&&production.card_art_batches&&Array.isArray(production.card_art_batches.batch_order)
    ? production.card_art_batches.batch_order:[];
  return batches.flatMap(batch=>(Array.isArray(batch.cards)?batch.cards:[]).map(card=>Object.assign({
    element:batch.element,
    card_family:batch.card_family
  },card)));
}
function buildModel(starters,intake,production,accessories,art){
  const starter=(starters.starters||[]).find(item=>item.starter_id===ACTIVE_STARTER_ID);
  if(!starter)throw new Error('Second Sky starter is unavailable.');
  const metaById=new Map((intake.cards||[]).map(card=>[String(card.card_id),card]));
  const productionRows=flattenProduction(production);
  const productionById=new Map(productionRows.map(card=>[String(card.card_id),card]));
  const recipe=(starter.cards||[]).map(entry=>{
    const cardId=String(entry[0]||'');
    const quantity=Number(entry[1]||0);
    const prod=productionById.get(cardId)||{};
    const meta=metaById.get(cardId)||{};
    return Object.freeze({
      card_id:cardId,
      quantity,
      name:String(meta.name||prod.card_name||cardId),
      element:String(prod.element||meta.element||starter.element||''),
      card_family:String(prod.card_family||meta.card_family||'Card'),
      artwork_status:String(prod.artwork_status||'missing'),
      art_path:String(prod.target_path||meta.expected_asset_path||'')
    });
  });
  const pool=productionRows.filter(card=>String(card.element)===String(starter.element)).map(prod=>{
    const meta=metaById.get(String(prod.card_id))||{};
    return Object.freeze({
      card_id:String(prod.card_id),
      name:String(meta.name||prod.card_name||prod.card_id),
      element:String(prod.element||starter.element),
      card_family:String(prod.card_family||meta.card_family||'Card'),
      artwork_status:String(prod.artwork_status||'missing'),
      art_path:String(prod.target_path||meta.expected_asset_path||'')
    });
  });
  const bundle=((accessories&&accessories.deck_products)||[]).find(item=>item.starter_id===starter.starter_id)
    ||((accessories&&accessories.official_deck_products)||[]).find(item=>item.starter_id===starter.starter_id)
    ||((accessories&&accessories.bundles)||[]).find(item=>item.starter_id===starter.starter_id)
    ||null;
  const showcase=art&&art.showcases&&art.showcases.launch
    ? String(art.showcases.launch[String(starter.element||'').toLowerCase()]||'')
    :'';
  const complete=recipe.length>0&&recipe.every(card=>card.artwork_status==='approved'&&card.art_path);
  const total=recipe.reduce((sum,card)=>sum+card.quantity,0);
  const signature=recipe.find(card=>card.quantity===1&&card.card_family==='Creature')||recipe[0]||null;
  return Object.freeze({
    starter:Object.freeze(Object.assign({},starter)),
    recipe:Object.freeze(recipe),
    pool:Object.freeze(pool),
    bundle,
    showcase,
    complete,
    total,
    signature
  });
}
function img(path,alt,className){
  if(!path)return '<div class="tcg-product-art-missing" aria-label="Artwork pending">Artwork pending</div>';
  return '<img class="'+esc(className||'')+'" src="'+esc(path)+'" alt="'+esc(alt)+'" loading="lazy" decoding="async">';
}
function cardTile(card,quantity){
  const qty=quantity?'<span class="tcg-product-qty">×'+esc(quantity)+'</span>':'';
  return '<article class="tcg-product-card" data-card-id="'+esc(card.card_id)+'">'+
    img(card.art_path,card.name+' artwork','tcg-product-card-art')+
    '<div class="tcg-product-card-copy"><strong>'+esc(card.name)+'</strong><small>'+esc(card.card_family)+'</small></div>'+qty+
    '</article>';
}
function deckHero(){
  const deck=model.starter;
  const signature=model.signature;
  return '<div class="tcg-product-hero">'+
    '<div class="tcg-product-hero-art">'+img(model.showcase||signature&&signature.art_path,deck.name+' starter showcase','tcg-product-showcase')+'</div>'+
    '<div class="tcg-product-hero-copy"><span class="tcg-product-kicker">Set One · '+esc(deck.element)+' Starter</span>'+
    '<h2>'+esc(deck.name)+'</h2>'+
    '<p><strong>'+esc(model.total)+'</strong> cards · <strong>'+esc(model.recipe.length)+'</strong> unique identities · '+(model.complete?'24/24 Astral artwork ready':'artwork still in production')+'</p>'+
    '<div class="tcg-product-badges"><span>Starter ID · '+esc(deck.starter_id)+'</span><span>Server legality unchanged</span></div>'+
    '</div></div>';
}
function accessoryMarkup(){
  const rows=model.bundle&&Array.isArray(model.bundle.accessories)?model.bundle.accessories:[];
  if(!rows.length)return '<div class="tcg-product-accessories"><span>Matching sleeves</span><span>Battle coin</span><span>Deck box</span></div>';
  return '<div class="tcg-product-accessories">'+rows.map(item=>
    '<span><strong>'+esc(item.label||item.accessory_type||'Accessory')+'</strong><small>'+esc(item.artwork_status==='approved'?'Artwork ready':'Artwork pending')+'</small></span>'
  ).join('')+'</div>';
}
function mountHome(){
  const grid=document.querySelector('.tcg-grid');
  if(!grid||grid.querySelector('[data-sb-second-sky]'))return;
  const article=document.createElement('article');
  article.className='tcg-card tcg-product-feature tcg-product-feature-wide';
  article.dataset.sbSecondSky='home';
  article.innerHTML=deckHero()+'<div class="tcg-actions"><a class="tcg-btn" href="tcg-decks.html">View Second Sky</a><a class="tcg-btn secondary" href="tcg-shop.html">Shop Preview</a></div>';
  grid.prepend(article);
}
function mountPlay(){
  const stack=document.querySelector('.tcg-side-stack');
  if(!stack||stack.querySelector('[data-sb-second-sky]'))return;
  const article=stack.querySelector('.tcg-frame');
  if(!article)return;
  const preview=document.createElement('div');
  preview.className='tcg-product-mini';
  preview.dataset.sbSecondSky='play';
  preview.innerHTML='<h3>Starter Preview · '+esc(model.starter.name)+'</h3>'+
    img(model.signature&&model.signature.art_path,model.signature?model.signature.name+' artwork':'Second Sky artwork','tcg-product-mini-art')+
    '<small>Presentation only · matchmaking still uses the server-owned legal deck selected on the left.</small>';
  article.appendChild(preview);
}
function mountDecks(){
  const feed=document.querySelector('.tcg-core-layout > section.tcg-detail-panel .tcg-card-feed');
  if(!feed||feed.dataset.sbSecondSky==='1')return;
  feed.dataset.sbSecondSky='1';
  feed.innerHTML='<div class="tcg-product-inline-note"><strong>Official Starter Preview · '+esc(model.starter.name)+'</strong><span>This is the exact canonical 60-card recipe; it does not create or save a deck in your account.</span></div>'+
    '<div class="tcg-product-card-grid">'+model.recipe.map(card=>cardTile(card,card.quantity)).join('')+'</div>';
}
function mountCollection(){
  const feed=document.getElementById('tcgCollectionFeed');
  if(!feed||feed.dataset.sbSecondSky==='1')return;
  feed.dataset.sbSecondSky='1';
  const panel=feed.closest('.tcg-detail-panel');
  const h2=panel&&panel.querySelector('h2');
  const p=panel&&panel.querySelector('p');
  if(h2)h2.textContent='Astral Collection Preview';
  if(p)p.textContent='All 24 Set One Astral identities are shown as a visual preview. Account ownership remains server-owned and is not inferred here.';
  feed.innerHTML='<div class="tcg-product-card-grid">'+model.pool.map(card=>cardTile(card,0)).join('')+'</div>';
}
function mountShop(){
  const center=document.querySelector('.tcg-core-layout > section.tcg-detail-panel .tcg-card-feed');
  if(center&&center.dataset.sbSecondSky!=='1'){
    center.dataset.sbSecondSky='1';
    center.innerHTML='<article class="tcg-product-shop-tile">'+deckHero()+
      '<p>Official starter product preview. Purchase state, prices and entitlement receipts remain gated to the canonical economy owner.</p>'+
      '</article>';
  }
  const panels=Array.from(document.querySelectorAll('.tcg-core-layout > aside.tcg-detail-panel'));
  const detail=panels[panels.length-1];
  const feed=detail&&detail.querySelector('.tcg-feed');
  if(feed&&feed.dataset.sbSecondSky!=='1'){
    feed.dataset.sbSecondSky='1';
    feed.innerHTML=img(model.signature&&model.signature.art_path,model.signature?model.signature.name+' artwork':'Second Sky artwork','tcg-product-detail-art')+
      '<h3>'+esc(model.starter.name)+'</h3>'+
      '<p>'+esc(model.starter.element)+' starter · '+esc(model.total)+' cards · matching accessory bundle.</p>'+
      accessoryMarkup()+
      '<button class="tcg-btn secondary" disabled aria-disabled="true" data-owner-state="gated">Purchase Unavailable · Preview Only</button>';
  }
}
function mountBattlePass(){
  const state=document.querySelector('.tcg-state');
  if(state)state.innerHTML='<strong>Set One — Season 1</strong><br>Visual presentation preview is active. Tier assignments, progression values and entitlements remain unpublished and server-owned.';
  const topGrid=document.querySelector('.tcg-grid');
  if(topGrid&&!topGrid.querySelector('[data-sb-second-sky]')){
    const status=topGrid.querySelector('.tcg-frame');
    if(status){
      const hero=document.createElement('div');
      hero.className='tcg-product-pass-hero';
      hero.dataset.sbSecondSky='battlepass';
      hero.innerHTML=img(model.showcase,model.starter.name+' showcase','tcg-product-pass-art')+
        '<div><strong>Featured launch starter · '+esc(model.starter.name)+'</strong><small>Astral is the first completed Set One art package.</small></div>';
      status.appendChild(hero);
    }
  }
  const rail=document.querySelector('.tcg-reward-rail');
  if(rail&&rail.dataset.sbSecondSky!=='1'){
    rail.dataset.sbSecondSky='1';
    const samples=model.pool.slice(0,12);
    rail.innerHTML=samples.map((card,index)=>
      '<article class="tcg-reward tcg-product-reward'+(index%3===0?' premium':'')+'">'+
      img(card.art_path,card.name+' artwork','tcg-product-reward-art')+
      '<strong>Season 1 Preview</strong><span>'+esc(card.name)+'</span><small>Presentation sample · tier not assigned</small></article>'
    ).join('');
  }
}
function mount(){
  if(!model||!model.complete)return;
  document.documentElement.dataset.sbTcgProductPresentation='second-sky-v1';
  const page=String(document.body&&document.body.dataset.sbTcgPage||'');
  if(page==='home')mountHome();
  else if(page==='play')mountPlay();
  else if(page==='decks')mountDecks();
  else if(page==='collection')mountCollection();
  else if(page==='shop')mountShop();
  else if(page==='battlepass')mountBattlePass();
}
function ready(){
  if(!readyPromise){
    readyPromise=Promise.all([
      readJson(SOURCES.starters),
      readJson(SOURCES.intake),
      readJson(SOURCES.production),
      readJson(SOURCES.accessories),
      readJson(SOURCES.art)
    ]).then(parts=>{
      model=buildModel(...parts);
      mount();
      return api;
    });
  }
  return readyPromise;
}
const api=Object.freeze({version:VERSION,ready,getModel:()=>model});
window.StreamBanditTCGProductPresentationV2446=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>ready().catch(()=>{}),{once:true});else ready().catch(()=>{});
})();