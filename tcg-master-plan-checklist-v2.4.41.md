# Stream Bandit TCG V2.4.41 Checklist — Coin Toss / Coin-Flip Foundation

## Randomization owner
- [x] One canonical `runtimeV02FlipCoin` primitive exists in the Randomization Engine.
- [x] A flip resolves only to `heads` or `tails`.
- [x] The primitive delegates to the existing unbiased `runtimeV02UniformRandomInt(2)`.
- [x] No previous-result memory, alternation or streak correction exists.
- [x] Consecutive heads or tails are explicitly valid.
- [x] Browser/client code contains no gameplay RNG.

## Opening toss
- [x] Match starts in `opening_coin_call` instead of preselecting a winning seat.
- [x] The server exposes the designated `coin_call_seat`.
- [x] Only that seat can call Heads or Tails.
- [x] Invalid/wrong-seat calls consume zero random draws and do not mutate state.
- [x] A valid call consumes exactly one server coin result.
- [x] Matching call → caller wins toss; miss → other seat wins toss.
- [x] Toss winner still chooses Go first / Go second through the existing Match Flow owner.
- [x] Existing setup order is preserved.

## Visibility / Battle Coin
- [x] Heads maps to the coin front.
- [x] Tails maps to the coin back.
- [x] The authoritative result is visibly rendered before the toss winner chooses turn order.
- [x] Battle Coin accessory remains cosmetic only.
- [x] Cosmetic selection cannot influence server randomness.
- [x] Client cannot generate or override the result.
- [ ] Themed Battle Coin artwork remains 0/8 approved and will decorate the existing result hook later.

## Future card effects
- [x] Existing runtime coin consumers share the canonical coin primitive.
- [x] New cards may reuse the primitive without a second RNG helper.
- [x] The user's Essence-search/attach example is recorded as an example only, not added as a card.
- [ ] Generic structured coin-result conditional grammar for future card programs remains open until implemented through the canonical effect owners.

## Release
- [x] PR-branch source change only.
- [x] No database migration required.
- [x] No Supabase production deployment performed by this checkpoint.
- [x] `main` / live / production remain unchanged.
- [ ] Fresh exact-head Validation, Migration Replay and Functional Smoke must pass before this checkpoint is accepted.
- [ ] Manual two-player Heads/Tails visible-flow check remains a later live/private-alpha verification gate.
