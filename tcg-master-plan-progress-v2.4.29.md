# Stream Bandit TCG Master Plan Progress V2.4.29 — Auth Gate Startup Parity

## Proven defect
The V2.4.27 Play controller waited only for the Auth Gate API object to exist. The shared Auth Gate boots by calling `enforce()`; while that call is already running, a second `enforce()` returns `lastDecision`, which is temporarily null on first load. Play treated that null as an approval failure and stopped before reading `tcg_decks`.

This exactly explains the human screenshot: the page could display authenticated platform context while Play still emitted "Sign in with an approved Stream Bandit account to play" and left the deck field loading.

## Bounded fix
- keep the existing Auth Gate as sole approval owner;
- call its existing `enforce()`;
- if first-load concurrency returns no decision, call the same owner's existing `decide()`;
- if necessary, briefly observe the same owner's `state().lastDecision`;
- only reject after a completed authoritative decision is unavailable or denied;
- do not add approval/profile rules to Play;
- leave RLS deck reads and server matchmaking unchanged.

## Inherited visual authority
V2.4.28 remains immutable: seven approved visual references, fixed viewport, internal-feed scrolling only, no website header/footer, TCG-owned Battle/Decks/Collection/Battle Pass/Shop/Settings navigation.

## Release boundary
PR #576 remains draft/unmerged. main, Pages/public, full-live and Supabase runtime remain unchanged until exact-head CI and human test.
