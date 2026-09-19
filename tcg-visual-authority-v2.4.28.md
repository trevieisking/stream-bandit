# Stream Bandit TCG V2.4.28 — Approved Visual Authority

Status: USER APPROVED / LOCKED

The seven supplied 1672×941 visual references are the immutable art-direction authority for the TCG client. They must not be regenerated, restyled, recolored, replaced or materially reinterpreted without explicit user approval.

| Screen | Source SHA-256 |
|---|---|
| Play | `54865d2301ad013cc6391ad13f59af65596a1bac9a1e1a1918bd7652f577f2a5` |
| Battle | `b273438d760e540cddca3e0a675b71736bbc0376ec5f1ec99bed66b3aa11cf73` |
| Decks | `fd033dda73ebfc302d5963e075f826a1ad1bd6a8a69e73fade86955e8ffc88d5` |
| Collection | `bc67b65d0cc8a4cabf97cdac4614b23f3c52ee2f01f1f74053feaa71f68da86c` |
| Battle Pass | `9be366dd25c2ce132f8df05890de7502662a893c61388e78df1c6d167fc37137` |
| Shop | `5c188a82c43c6406536d8cc9b45a692f24552d4aee69ced1d6ad25a7a09b2b97` |
| Settings | `97aed0d704f0adb760e598d6092ec625e84699f0004f2b3d4ccda6f5ff8a5ad1` |

## Locked visual rules
1. TCG owns the full viewport. Generic Stream Bandit website header/search/account/footer chrome is forbidden on TCG pages.
2. Stream Bandit shared functions/config/auth may still be used invisibly.
3. Primary game navigation is: Battle · Decks · Collection · Battle Pass · Shop · Settings.
4. The viewport itself never scrolls. `html`, `body`, the TCG client and the page stage are fixed to the visible viewport with overflow hidden.
5. Long content uses bounded internal feeds only: card grids, deck lists, collection results, pack/shop catalogs, reward tracks, friends/player lists and similar data surfaces.
6. Active battle remains a one-screen tabletop. Any game navigation is TCG-owned UI, never website chrome.
7. Card/rules data remains structured and server-authoritative. Visual work must not create browser rules, local economy, fake deck legality, fake reward claims or fake progression.
8. Card artwork remains data-driven from card/printing metadata; these approved visual references define presentation, not gameplay authority.
9. New pages must inherit this client visual system rather than invent another style.

## Battle Pass
Battle Pass is now a required player-facing TCG route. Visual surface and feed architecture may exist before the backend owner, but XP, paid/free tracks, currencies, challenges and reward claims must not become authoritative until connected to the canonical progression/economy system.
