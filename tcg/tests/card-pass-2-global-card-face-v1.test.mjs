import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildCardDisplayRegistry } from '../../tcg-card-display-registry-builder-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const registryPath='assets/tcg/cards/set-one/tcg-card-display-registry-v1.json';
const registry=JSON.parse(read(registryPath));
const rebuilt=buildCardDisplayRegistry(root);

assert.equal(registry.schema,'stream-bandit-tcg-card-display-registry-v1');
assert.equal(registry.source_registry_id,'SB1-set-one-v0.2');
assert.equal(registry.card_count,193);
assert.equal(registry.records.length,193);
assert.equal(new Set(registry.records.map(x=>x.card_id)).size,193);
assert.equal(registry.approved_art_count,24);
assert.equal(registry.missing_art_count,169);
assert.deepEqual(rebuilt,registry,'generated display registry must be deterministic from canonical structured + printing/art sources');

const approved=registry.records.filter(x=>x.printing.artwork_status==='approved');
assert.equal(approved.length,24);
assert.ok(approved.every(x=>x.element==='Astral'),'current approved Standard/base art must remain the 24-card Astral package');
assert.equal(registry.records.filter(x=>x.printing.artwork_status!=='approved').length,169);

for(const row of registry.records){
  assert.equal(row.card_id,row.definition.id);
  assert.equal(row.name,row.definition.name);
  assert.equal(row.card_family,row.definition.card_family);
  assert.equal(row.printing.set_code,'SB1');
  assert.ok(['approved','missing'].includes(row.printing.artwork_status));
  if(row.card_family==='Creature'){
    assert.ok(Number.isFinite(Number(row.definition.creature.hp)));
    assert.ok(Number.isFinite(Number(row.definition.creature.withdrawal)));
    assert.ok(Number.isFinite(Number(row.definition.creature.reward_value)));
    assert.ok(Array.isArray(row.definition.creature.attacks));
    assert.ok(row.definition.creature.attacks.length>=1&&row.definition.creature.attacks.length<=2);
  }
}

const visual=JSON.parse(read('tcg-card-visual-printing-v1.json'));
assert.equal(visual.visual_authority.canonical_card_face_reference.url,'https://chatgpt.com/s/m_6aafc9a916c88191b0f63b164d1923cc');
assert.equal(visual.creature_card.header.top_left,'HP + value beside the name');
assert.equal(visual.creature_card.header.top_right,'Element / energy type badge');
assert.equal(visual.creature_card.footer.bottom_left,'Reward Cards + reward_value');
assert.deepEqual(visual.creature_card.footer.bottom_right,['rarity marker','Withdraw Cost + value directly beneath rarity']);
assert.equal(visual.creature_card.missing_artwork.gameplay_blocked,false);
assert.ok(visual.creature_card.legal_action_slot_shapes.some(x=>x.join('|')==='Ability|Attack 1|Attack 2'));

const source=read('stream-bandit-tcg-card-renderer-v2-4-51.js');
const sandbox={window:{},document:{baseURI:'https://example.invalid/'},URL};
vm.runInNewContext(source,sandbox,{filename:'stream-bandit-tcg-card-renderer-v2-4-51.js'});
const renderer=sandbox.window.StreamBanditTCGCardRendererV2451;
assert.ok(renderer);
assert.equal(renderer.version,'2.4.53');

const orbit=registry.records.find(x=>x.card_id==='astral-orbitortoise');
assert.ok(orbit);
const orbitHtml=renderer.renderCard(orbit,{mode:'full',abilityReady:true,interactiveAbility:true});
for(const token of ['HP</small><strong>170','Orbitortoise','Astral','Forecast Shell','Orbit Bash','Gravity Shell','50','80','REWARD CARDS','WITHDRAW']){
  assert.ok(orbitHtml.includes(token),`Orbitortoise face missing ${token}`);
}
assert.ok(!orbitHtml.includes('data-card-intent="ability"'),'triggered Ability must not become a manual button');

const essenceRailHtml=renderer.renderCard(orbit,{
  mode:'battle',
  attachedEssenceUnits:[
    {element:'Astral',count:3},
    {element:'Tide',count:2},
  ],
});
assert.ok(essenceRailHtml.includes('data-essence-rail'));
assert.ok(essenceRailHtml.includes('aria-label="Attached Essence: 3 Astral, 2 Tide"'));
assert.ok(essenceRailHtml.includes('data-essence-element="Astral" data-essence-count="3"'));
assert.ok(essenceRailHtml.includes('data-essence-element="Tide" data-essence-count="2"'));
const railStart=essenceRailHtml.indexOf('data-essence-rail');
const railEnd=essenceRailHtml.indexOf('</div>',railStart);
const railOnly=essenceRailHtml.slice(railStart,railEnd);
assert.equal((railOnly.match(/data-essence-element="Astral"/g)||[]).length,4,'expanded Astral orbs plus one counted Astral fallback must exist');
assert.equal((railOnly.match(/data-essence-element="Tide"/g)||[]).length,3,'expanded Tide orbs plus one counted Tide fallback must exist');
assert.ok(orbitHtml.includes('aria-label="Attack Cost: 2 Astral"'),'Attack cost must use the same element identity system as attached Essence');

const notReadyHtml=renderer.renderCard(orbit,{mode:'battle',interactiveAttacks:true,attackStates:{1:{eligible:false,reason:'attack_essence_cost_not_met'},2:{eligible:true,reason:null}}});
assert.ok(notReadyHtml.includes('Needs more matching Essence'));
assert.ok(notReadyHtml.includes('Ready · Attack 2 · Turn ends after full resolution'));
assert.ok(notReadyHtml.includes('data-attack-slot="1" aria-disabled="true"'));
assert.ok(notReadyHtml.includes('data-attack-blocked-reason="Needs more matching Essence"'));
assert.ok(notReadyHtml.includes('data-attack-slot="2"'));

const noArt=structuredClone(orbit);
noArt.printing.artwork_status='missing';
const noArtHtml=renderer.renderCard(noArt,{mode:'full'});
assert.ok(noArtHtml.includes('Artwork Pending'));
assert.ok(noArtHtml.includes('Orbit Bash'));
assert.ok(noArtHtml.includes('Gravity Shell'));

const active=registry.records.find(x=>x.card_family==='Creature'&&x.definition.creature?.ability?.mode==='active');
assert.ok(active,'Set One must contain an active Ability example');
const activeHtml=renderer.renderCard(active,{mode:'battle',abilityReady:true,interactiveAbility:true,abilityWhere:'reserve',abilityIndex:0});
assert.ok(activeHtml.includes('ABILITY READY'));
assert.ok(activeHtml.includes('data-card-intent="ability"'));

const formula=registry.records.find(x=>x.card_id==='volt-arcprowler');
assert.ok(formula);
const formulaHtml=renderer.renderCard(formula,{mode:'full'});
assert.ok(formulaHtml.includes('Relay Strike'));
assert.ok(formulaHtml.includes('60'),'formula attack must expose its canonical baseline instead of 0');

const battleHtml=read('tcg-battle-v2.html');
const battleController=read('stream-bandit-tcg-v2-battle-controller.js');
assert.ok(battleHtml.includes('data-sb-tcg-card-face="v1"'));
assert.ok(battleHtml.includes('stream-bandit-tcg-card-renderer-v2-4-51.js'));
assert.ok(battleController.includes("actionBase('field_actions')"));
assert.ok(battleController.includes("actionBase('use_ability')"));
assert.ok(battleController.includes('StreamBanditTCGCardRendererV2451'));
assert.ok(battleController.includes('sb-hand-card-shell'));
assert.ok(battleController.includes('function attachedEssenceUnits'));
assert.ok(battleController.includes('essence.provides'));
assert.ok(battleController.includes('attachedEssenceUnits: essenceUnits'));
assert.ok(battleController.includes("document.querySelectorAll('[data-essence-rail]')"));
assert.ok(battleController.includes('required > available'));

const presentation=read('stream-bandit-tcg-product-presentation-v2-4-46.js');
assert.ok(presentation.includes('data-sb-tcg-render-card'));
assert.ok(presentation.includes('StreamBanditTCGCardRendererV2451'));

console.log('Global card face v1 PASS: 193 identities, shared card renderer, Ability/Attack readiness and attached Essence-orb presentation verified.');
