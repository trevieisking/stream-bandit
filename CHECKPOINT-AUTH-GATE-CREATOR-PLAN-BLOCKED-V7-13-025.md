# Auth Gate Creator Plan Checkpoint V7.13.025

Date: 2026-06-19

Status: SCANNED / PATCH REQUIRED / DIRECT HELPER WRITE BLOCKED BY CONNECTOR SAFETY

Governing plan: `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`

## What was found

`stream-bandit-route-registry-v7-13-001.js` now has the correct group-play route class:

```text
creator_plan
```

and the group-play route rows now carry plan metadata such as:

```text
Playlists -> minPlan viewer_plus / feature playlists
Channels -> minPlan creator_starter / feature channels
Collections -> minPlan creator_growth / feature collections
```

`stream-bandit-route-access-map-v7-12-271.js` already understands creator-plan style locking.

`stream-bandit-auth-entry-gate-v7-13-001.js` still needs to understand the new foundation registry route class `creator_plan` if Web Builder/global gate checks rely on the foundation registry rather than the older access map.

## Required central helper behavior

The shared auth entry gate should treat:

```text
routeClass === 'creator_plan'
```

as protected and allow only:

```text
owner
admin
profile.plan_key >= route.minPlan
profile.permissions_json[route.feature] enabled
```

It should continue to leave:

```text
public
account_optional
```

unblocked.

## Direct patch status

A full helper replacement was attempted but blocked by the connector safety layer.

No unsafe workaround was used.

## Safety status

```text
HTML pages changed: no
SQL: no
RLS: no
Storage: no
Payment: no
Index/Home: no
Main App and Web Builder separation: preserved
```

## Next action

Patch `stream-bandit-auth-entry-gate-v7-13-001.js` only when the connector permits a safe helper update, or when a smaller line-level patch route is available.

Do not patch Playlists, Channels or Collections just to work around this. The lock should stay central.
