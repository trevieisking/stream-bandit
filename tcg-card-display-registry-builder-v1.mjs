import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from './tcg-set-one-registry-builder-v0.2.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const readJson=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const flattenProduction=(production)=>(production?.card_art_batches?.batch_order||[]).flatMap(batch=>
  (batch.cards||[]).map(card=>({...card,element:batch.element,card_family:batch.card_family,finish:batch.finish||'standard'}))
);

export function buildCardDisplayRegistry(base=root){
  const registry=buildSetOneRegistry(base);
  const printing=readJson('assets/tcg/cards/tcg-printing-art-ledger-v1.json');
  const production=readJson('assets/tcg/art-direction/tcg-art-production-ledger-v1.json');
  const printingById=new Map((printing.base_printings||[]).map(row=>[String(row.card_id),row]));
  const productionById=new Map(flattenProduction(production).map(row=>[String(row.card_id),row]));
  const records=registry.definitions.map(row=>{
    const definition=row.definition;
    const print=printingById.get(row.card_id)||{};
    const art=productionById.get(row.card_id)||{};
    return {
      card_id:row.card_id,
      name:row.name,
      element:row.element,
      card_family:row.card_family,
      definition,
      printing:{
        printing_id:print.printing_id||art.printing_id||null,
        set_code:print.set_code||'SB1',
        edition_code:print.edition_code||'standard',
        finish_family:print.finish_family||art.finish||'standard',
        rarity:print.rarity??null,
        artwork_id:print.artwork_id||art.artwork_id||null,
        artwork_status:art.artwork_status==='approved'?'approved':'missing',
        art_path:art.target_path||print.asset_path||null
      }
    };
  });
  return {
    schema:'stream-bandit-tcg-card-display-registry-v1',
    version:'1.0.0',
    recorded_at:'2026-09-20',
    authority:'Derived browser display registry. Gameplay/rules authority remains the SB1 structured card registry.',
    source_registry_id:registry.registry_id,
    card_schema:registry.card_schema,
    set_code:registry.set_code,
    card_count:records.length,
    approved_art_count:records.filter(x=>x.printing.artwork_status==='approved').length,
    missing_art_count:records.filter(x=>x.printing.artwork_status!=='approved').length,
    canonical_card_face_reference:'https://chatgpt.com/s/m_6aafc9a916c88191b0f63b164d1923cc',
    records
  };
}
export function serializeCardDisplayRegistry(base=root){
  return JSON.stringify(buildCardDisplayRegistry(base),null,2)+'\n';
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){
  const out=process.argv[2];
  const content=serializeCardDisplayRegistry(root);
  if(out)fs.writeFileSync(path.resolve(process.cwd(),out),content,'utf8');
  else process.stdout.write(content);
}
