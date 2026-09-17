import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl=new URL('../../supabase/migrations/20260917201805_tcg_player_directory_v0_1.sql',import.meta.url);
const sql=(await readFile(migrationUrl,'utf8')).toLowerCase();

test('directory preference owner is privacy-first and RLS protected',()=>{
  assert.match(sql,/create table if not exists public\.tcg_player_directory_preferences/);
  assert.match(sql,/discoverable boolean not null default false/);
  assert.match(sql,/alter table public\.tcg_player_directory_preferences enable row level security/);
  assert.match(sql,/for select to authenticated[\s\S]*auth\.uid\(\)[\s\S]*user_id/);
  assert.match(sql,/for insert to authenticated[\s\S]*with check[\s\S]*auth\.uid\(\)[\s\S]*user_id/);
  assert.match(sql,/for update to authenticated[\s\S]*using[\s\S]*auth\.uid\(\)[\s\S]*with check[\s\S]*auth\.uid\(\)/);
  assert.match(sql,/revoke all on table public\.tcg_player_directory_preferences from public, anon/);
  assert.match(sql,/grant select, insert, update on table public\.tcg_player_directory_preferences to authenticated/);
});

test('directory RPCs are narrow authenticated security-definer seams',()=>{
  assert.match(sql,/function public\.tcg_search_public_players\(/);
  assert.match(sql,/function public\.tcg_get_public_player\(/);
  assert.equal((sql.match(/security definer/g)||[]).length,2);
  assert.equal((sql.match(/set search_path = ''/g)||[]).length,2);
  assert.equal((sql.match(/if auth\.uid\(\) is null/g)||[]).length,2);
  assert.match(sql,/grant execute on function public\.tcg_search_public_players\(text, integer, integer\) to authenticated, service_role/);
  assert.match(sql,/grant execute on function public\.tcg_get_public_player\(uuid\) to authenticated, service_role/);
  assert.match(sql,/least\(greatest\(coalesce\(p_limit, 25\), 1\), 50\)/);
});

test('public discovery requires TCG opt-in plus active shared public profile',()=>{
  assert.match(sql,/dp\.discoverable is true/);
  assert.match(sql,/sp\.account_status = 'active'/);
  assert.match(sql,/ss\.profile_visibility = 'public'/);
  for(const forbidden of ['admin_level','permissions_json','admin_notes','battle_pass_tokens','trade_tokens','shop_coins','starter_granted_at']){
    assert.equal(sql.includes(forbidden),false,`directory migration must not expose ${forbidden}`);
  }
});

test('directory migration does not weaken source-table RLS',()=>{
  assert.equal(sql.includes('alter table public.tcg_player_profiles disable row level security'),false);
  assert.equal(sql.includes('alter table public.sb_profiles disable row level security'),false);
  assert.equal(sql.includes('create policy')&&sql.includes('on public.tcg_player_profiles'),false);
  assert.equal(sql.includes('create policy')&&sql.includes('on public.sb_profiles'),false);
});
