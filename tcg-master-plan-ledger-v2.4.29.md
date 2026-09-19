# Stream Bandit TCG V2.4.29 Ledger
## V2.4.29-001 — Human evidence
The Play screenshot showed `Loading your decks...` followed by a false approval error while platform account chrome showed an authenticated admin context.

## V2.4.29-002 — Source proof
Shared Auth Gate `enforce()` returns `lastDecision` immediately when `running` is already true. On initial boot that value can still be null. V2.4.27 Play called `enforce()` as soon as the API existed and rejected null.

## V2.4.29-003 — Repair
Play now resolves authorization through the existing gate owner: `enforce()` → existing `decide()` fallback → short existing-state observation. No direct profile-role/status evaluator is added to Play.

## V2.4.29-004 — Protected boundaries
No database, RLS, migration, Edge Function, gameplay engine, deck legality, matchmaking, card data, visual authority or economy owner changes.
