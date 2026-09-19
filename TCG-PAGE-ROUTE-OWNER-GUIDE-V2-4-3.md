# Stream Bandit TCG — Page Route / Owner Guide V2.4.3

**Source base:** `main` @ `bf3579b7f2021df8b53c441ca32f25ec6484286b`  
**Scope:** outside-match standalone application routes only.  
**Battle boundary:** `tcg-battle-v2.html` stays board-only and does not load the outside-match TCG page shell.

## Shared shell

All normal signed-in TCG routes reuse `stream-bandit-tcg-page-shell-v2-4-3.css`, `stream-bandit-tcg-page-shell-v2-4-3.js`, the existing Auth Gate and the existing theme/header/footer shell assets.

Primary rail: `Game Home · Play · Collection · Decks · Packs · Players · Friends · Learn · Progress · Settings · Account`. There is no new Shop route.

## Primary routes

| Player label | Route | Scope in V2.4.3 |
| --- | --- | --- |
| Game Home | `tcg-game-home.html` | Navigation/summary shell |
| Play | `tcg-play.html` | Match-entry shell; no fake/local match creation |
| Collection | `tcg-collection.html` | Collection route; data binding gated |
| Decks | `tcg-decks.html` | Deck Builder destination; persistence/legality gated |
| Packs | `tcg-packs.html` | Pack/economy destination; opening gated |
| Players | `tcg-players.html` | Single Directory route; search gated |
| Friends | `tcg-friends.html` | TCG-scoped social route; writes gated |
| Learn | `tcg-learn.html` | Player guidance; no runtime-rule duplication |
| Progress | `tcg-progress.html` | Progress route; data binding gated |
| Settings | `tcg-settings.html` | Game/client settings; persistence gated |
| Account | `tcg-account.html` | Account overview using existing identity/auth boundaries |

## Players/Friends routes

Players: `tcg-players.html`; Public Profile: `tcg-player-profile.html`; Friends: `tcg-friends.html`; Requests: `tcg-friend-requests.html`; Find Players: `tcg-players.html`; Blocked: `tcg-blocked.html`.

`sb_user_friends` and `sb_user_blocks` remain general Stream Bandit infrastructure and are not treated as the TCG graph.

## Account routes

Overview `tcg-account.html`; Profile `tcg-account-profile.html`; Security `tcg-account-security.html`; Privacy `tcg-account-privacy.html`; Notifications `tcg-account-notifications.html`; Preferences `tcg-account-preferences.html`; Leave TCG `tcg-account-leave.html`; Delete Account `tcg-account-delete.html`.

Whole-account deletion remains tied to the reviewed lifecycle beginning with `sb_account_deletion_requests`; Leave TCG remains a separate lifecycle.

## Safety contract

Route existence is separate from backend authority. A missing owner is represented by a disabled/unwired control (`aria-disabled="true"`, `data-owner-state="gated"`), never browser-only success state, weakened RLS, reuse of the wrong global social table, or raw destructive deletion. The 40 gameplay-owner architecture remains unchanged.
