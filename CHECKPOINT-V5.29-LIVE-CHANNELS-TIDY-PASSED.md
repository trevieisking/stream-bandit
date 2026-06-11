# Stream Bandit V7.12.269 - Channels Entitlement + Extra Channels Success

Checkpoint name:

`Stream Bandit V7.12.269 Stable - Channels Entitlement and Extra Channels Passed`

## Status

PASS. The Channels flow now works after removing the old Supabase one-channel-per-owner index.

Working page:

`channels-global-helpers-v7-5-3-test.html`

Locked working commit:

`11af31a58714e068e0a1dee564bd9af3fc4a4174`

## User confirmation

Owner/admin smoke test passed:

- page loads
- Add / Remove Videos opens
- dropdown shows owned videos plus Stream Bandit main/library videos
- other normal users' personal/private videos do not appear in the attach dropdown
- creating an extra channel works after the old index removal
- adding videos to the extra channel works
- removing videos works
- deleting the extra channel works
- no Web Builder, Library Editor, Owner Admin Hub, registry, or index promotion was needed

Girlfriend / creator-plan smoke test passed:

- her plan still allows the expected creator actions
- she can add channels
- she can add videos to her channels
- she can remove her own videos
- she can delete her channel

## Supabase fix that made it pass

Removed old retired index:

`sb_channels_one_channel_per_owner_uidx`

Reason:

The old index forced one channel per owner. That was an old V5/V6-style rule and conflicted with the V7 entitlement model. Current channels should be controlled by plan/permission limits, not by a hard one-channel database clamp.

Verification query returned no rows:

```sql
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'sb_channels'
  and indexname = 'sb_channels_one_channel_per_owner_uidx';
```

Expected result:

`0 rows`

## Important rollback truth

Do not reintroduce:

- `sb_channels_one_channel_per_owner_uidx`
- `sb_channel_movies` for this current Channels fix
- a hard one-channel-per-owner clamp
- new page rewrites for this passed flow

Keep:

- `sb_profiles` for profile/default channel identity
- `sb_channels` for extra/group channels
- `sb_movies.owner_id` for owned/profile-channel videos
- `sb_movies.channel_id` for current extra-channel assignment
- `stream-bandit-entitlements-v7-12-269.js` for frontend plan/permission checks

## Privacy and future curation notes

Current safe interim rule:

- users can use their own videos
- users can use Stream Bandit main/library videos
- users cannot attach another normal user's personal/private videos unless future explicit curation permission allows it

Future privacy model should include:

- public
- private
- unlisted
- invite-only
- followers/subscribers-only
- paywalled
- age restricted
- scheduled/embargoed
- owner approval for other users adding videos to channels/playlists/collections

## Cleanup rule learned

When a new V7 page or system replaces old V5/V6 behavior, old rules must not silently remain active.

Old page/file/rule options:

1. delete it if safely obsolete
2. replace it with the new checkpoint/page
3. park it clearly as inactive/reference-only
4. preserve it only if it still holds protected useful logic

## Protected areas

Do not casually change:

- Player 1
- Player 2
- audio boost / accessibility
- Supabase Library Editor
- Owner Admin Hub
- Web Builder routes
- global shell helpers
- route registry
- `index.html`

## Next recommended page

Continue the planned Group Play pass only after this checkpoint stays stable:

1. Playlists
2. Collections
3. Admin/Owner no-flash visibility gates
