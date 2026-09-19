# Stream Bandit TCG V2.4.41 Ledger — Coin Toss Ownership

## Ownership map

| Concern | Canonical owner | Contract |
|---|---|---|
| Random heads/tails result | `tcg-match-randomization-engine-v0-2.ts` | `runtimeV02FlipCoin`; independent server 50/50 result only |
| Opening call / toss winner / phase | `tcg-match-flow-engine-v0-2.ts` | Validates caller and call, requests one flip, derives winner, advances to `opening_choice` |
| Setup transport / persistence | `tcg-private-alpha-api` | Auth, revision/nonce fence, canonical commit and private/public views |
| Battle presentation | `stream-bandit-tcg-v2-battle-controller.js` | Submit Heads/Tails intent and render returned side; never generate randomness |
| Themed coin visual | Deck accessory ledger / future art resolver | Cosmetic face/art only; never gameplay authority |
| Card-effect consequence | Existing Attack / Ability / Tactic / Essence / Card-Zone owners | May consume the shared result but retain their own consequence/mutation authority |

No new gameplay-owner family is created.

## State contract

Opening setup adds:

- `phase: "opening_coin_call"`
- `coin_call_seat`
- `coin_call: null | "heads" | "tails"`
- `coin_result: null | "heads" | "tails"`
- `toss_winner_seat: null | 1 | 2`

After a valid call and one server flip, Match Flow stores the call/result/winner and moves to the existing `opening_choice` state.

## Probability contract

Each flip is a fresh call to the server Randomization owner. Historical results are not input. Therefore a run such as Heads, Heads, Heads, Heads is legal; the next accepted flip is still governed by the same two-way 50/50 rule.

## Visual face contract

- Heads = front.
- Tails = back.
- `data-coin-side` is a presentation hook only.
- Owned Battle Coin art may replace the generic visual later without changing result semantics.

The accessory ledger remains explicit that Battle Coins have `gameplay_effect: false` and `randomness_effect: false`.

## Future card-program contract

Coin-flip card text must not add local randomness. A future structured program requests the shared coin result, then delegates searches, selections, Essence attachments, card movement, damage, healing or other consequences to the already-canonical engines that own those operations.

The Essence-search/three-attach sentence discussed for V2.4.41 is a design example only; no card identity or effect program is created here.

## Release boundary

PR #576 branch only. No Supabase write/deployment, merge, `main`, live or production action belongs to this ledger entry.
