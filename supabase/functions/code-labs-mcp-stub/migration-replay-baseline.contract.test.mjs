import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../../..');
const migrations = path.join(root, 'supabase', 'migrations');
const manifestPath = path.join(migrations, 'STREAM_BANDIT_REPLAY_BASELINE_MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const baselinePattern = /^(\d{14})_stream_bandit_replay_foundation_(\d{2})\.sql$/;
const firstRecordedVersion = '20260527201804';
const expectedTables = [
  'code_labs_audit_log', 'code_labs_files', 'code_labs_jobs', 'code_labs_owners',
  'code_labs_packets', 'code_labs_projects', 'code_labs_test_runs', 'code_labs_versions',
  'code_labs_write_requests', 'sb_account_deletion_requests', 'sb_channels',
  'sb_collection_movies', 'sb_collections', 'sb_favourites', 'sb_form_submissions',
  'sb_genres', 'sb_import_batches', 'sb_likes', 'sb_movies', 'sb_playlist_movies',
  'sb_playlists', 'sb_policy_documents', 'sb_profile_social_settings', 'sb_profiles',
  'sb_social_group_members', 'sb_social_groups', 'sb_social_notifications',
  'sb_social_post_comments', 'sb_social_post_media', 'sb_social_posts', 'sb_submissions',
  'sb_user_friends', 'sb_watch_progress', 'sb_watchlist',
].sort();

function baselineFiles() {
  const matches = fs.readdirSync(migrations).filter((name) => baselinePattern.test(name)).sort();
  assert.equal(matches.length, manifest.foundation_parts, 'replay-foundation part count must match the manifest');
  matches.forEach((name, index) => {
    const match = name.match(baselinePattern);
    assert.ok(match, 'baseline filename must contain a 14-digit migration version and part number');
    assert.ok(match[1] < firstRecordedVersion, 'every baseline part must sort before the first recorded migration');
    assert.equal(match[2], String(index).padStart(2, '0'), 'baseline part numbers must be contiguous');
  });
  return matches.map((name) => path.join(migrations, name));
}
function baselineSource() {
  return baselineFiles().map((file) => fs.readFileSync(file, 'utf8')).join('\n');
}

test('manifest freezes the complete 34-table dependency closure', () => {
  assert.equal(manifest.first_recorded_migration, '20260527201804_create_private_messages_v7_12_105');
  assert.equal(manifest.required_baseline_version_before, firstRecordedVersion);
  assert.deepEqual([...manifest.tables].sort(), expectedTables);
  assert.equal(new Set(manifest.tables).size, 34);
  assert.equal(manifest.foundation_parts, 7);
});
test('baseline is schema-only and non-destructive', () => {
  const source = baselineSource();
  assert.doesNotMatch(source, /\binsert\s+into\b/i);
  assert.doesNotMatch(source, /\bupdate\s+[A-Za-z0-9_."]+\s+set\b/i);
  assert.doesNotMatch(source, /\bdelete\s+from\b/i);
  assert.doesNotMatch(source, /\btruncate\s+table\b/i);
  assert.doesNotMatch(source, /\bdrop\s+(table|schema)\b/i);
  assert.doesNotMatch(source, /\bcopy\b/i);
});
test('baseline creates every required table idempotently', () => {
  const source = baselineSource();
  for (const table of expectedTables) {
    const pattern = new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\b`, 'i');
    assert.match(source, pattern, `missing idempotent base table: ${table}`);
  }
});
test('baseline separates foreign-key creation from base-table creation', () => {
  const source = baselineSource();
  const firstForeignKey = source.search(/\bforeign\s+key\b/i);
  assert.notEqual(firstForeignKey, -1, 'baseline must restore foreign-key contracts');
  for (const table of expectedTables) {
    const creation = source.search(new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\b`, 'i'));
    assert.ok(creation >= 0 && creation < firstForeignKey, `${table} must be created before foreign keys are added`);
  }
});
test('baseline protects replay boundaries explicitly', () => {
  const source = baselineSource();
  assert.match(source, /SOURCE CANDIDATE ONLY/i);
  assert.match(source, /schema-only/i);
  assert.match(source, /fresh database/i);
  assert.match(source, /alter table public\.sb_profiles enable row level security/i);
  assert.match(source, /alter table public\.code_labs_write_requests enable row level security/i);
});
