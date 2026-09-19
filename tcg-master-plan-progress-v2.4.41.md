# Stream Bandit TCG Progress V2.4.41 — Server-Authoritative Coin Toss

V2.4.41 locks the coin toss as one reusable game-system rule rather than a browser animation or a card-specific helper.

## Opening toss

1. The setup lifecycle enters `opening_coin_call`.
2. The server designates `coin_call_seat`; the current v0.2 setup assigns Seat 1 as the caller. Calling has no probability advantage.
3. That player chooses exactly `heads` or `tails`.
4. Only after the call is valid, Match Flow requests exactly one result from the canonical Randomization Engine.
5. A matching call wins the opening toss; a miss gives the toss to the other seat.
6. The toss winner keeps the existing accepted rule: choose **Go first** or **Go second**.
7. Setup order and every later gameplay rule remain unchanged.

## Probability contract

`runtimeV02FlipCoin` is the one reusable coin primitive. It consumes the existing server-side `runtimeV02UniformRandomInt(2)` path backed by secure uint32 randomness and rejection sampling.

Every accepted flip is independent. There is no alternation, streak correction, pity rule, remembered previous result or client-side random source. Heads can occur many times in a row and tails can occur many times in a row; each new flip still has the same 50/50 two-outcome rule.

## Visible coin contract

The authoritative server result is public for the toss:

- `heads` → **front**
- `tails` → **back**

The battle UI exposes the call buttons and renders the returned result with a `data-coin-side` hook. Future themed Battle Coin artwork may use that hook, but the artwork/accessory can never generate, bias, replace or reinterpret the server result.

## Future card/effect flips

Existing in-battle condition resolution now consumes the same `runtimeV02FlipCoin` primitive instead of keeping a second local coin helper.

The user example — “search for Essence, flip a coin, and on heads search for three Essence and attach them” — is **illustrative only**. V2.4.41 adds **no new card** and does not silently invent that effect. Future card programs that need heads/tails must request the shared Randomization result and let their canonical effect/selection/attachment owners apply the consequence.

Generic coin-result conditional grammar for brand-new structured card programs remains an explicit future runtime-extension task rather than being falsely marked complete.

## Release boundary

This checkpoint is source-only on PR #576. Supabase production functions, database, `main`, live and production are unchanged until fresh exact-head validation and later promotion evidence explicitly authorize them.
