# UI Structure

Architecture simulator frontend — routing, layouts, and design decisions.

## Design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Landing visual | Static canvas preview (not interactive) | Gives the game impression without the complexity of an embedded live game |
| Game layout | Canvas + left/right side panels | Metrics on left, improvements on right; canvas center |
| Learn section | Standalone pages + in-game links | `/learn` routes exist standalone; game panels link to relevant concepts |
| Device target | Responsive including mobile | Game panels collapse to bottom tab bar on mobile |
| App shell in game | Minimal nav bar (logo + exit icon) | Game is the focus; full nav would waste vertical space |
| End-of-game feedback | Inline overlay / modal | No navigation change; player stays on the canvas |
| Tournament leaderboard | Post-game only | Shown on results overlay after scenario submission |
| Auth trigger | Only visible to logged-in users; unauthenticated users see feature description → redirect to dashboard on CTA click | No mid-flow auth interruption |

## Layouts

| Layout | File | Used for |
|---|---|---|
| `landing` | `layouts/landing.vue` | Landing, `/play` browser, `/learn` pages |
| `auth` | `layouts/auth.vue` | Login/auth pages — no nav chrome |
| `game` | `layouts/game.vue` | `/play/[slug]`, tournament play — minimal top bar |
| `dashboard` | `layouts/dashboard.vue` | Authenticated user area — different nav with sidebar |

> `game` and `dashboard` layouts are not yet implemented.

## Routes

### Public (no auth required)

```
/                         Landing page
/play                     Predefined scenario browser (card grid)
/play/[slug]              Game view  [game layout]
/learn                    Learning section overview
/learn/[slug]             Individual concept page
/join                     Enter room code + nickname to join tournament
/join/[code]              Pre-filled join page (shared link)
/tournaments/[id]/lobby   Waiting room after joining, before host starts
/tournaments/[id]/play    Tournament game view  [game layout]
```

### Authenticated

```
/dashboard                    My scenarios + my tournaments (tabbed)
/dashboard/scenarios          My custom scenarios
/dashboard/tournaments        My tournaments
/scenarios/new                Custom scenario designer
/tournaments/new              Create tournament room (pick scenario, configure)
/tournaments/[id]/host        Host dashboard — participant list, start button, live status
```

## Navigation

### Landing layout nav

```
Left:  Archimulant (logo/text → /)
Right: Play  Learn  [ColorMode]  Sign in  (or Dashboard if authed)
Mobile panel: same links as right, stacked vertically
```

### Game layout nav

```
Left:  Archimulant (text)   Scenario name
Right: [Exit icon → /play]
```

### Dashboard layout nav (future)

Different nav with sidebar; left-rail navigation for dashboard sections.

## Mobile game layout

When `game` layout is active on mobile, the three panels (canvas, improvements, metrics) switch to a **bottom tab bar**:
- Tab 1: Canvas (default)
- Tab 2: Improvements
- Tab 3: Metrics

## Landing page sections

1. **Hero** — headline, description, primary CTA (Play) + secondary CTA (Learn). Static canvas topology preview on the right.
2. **Features** — 3 features: Simulate / Learn / Compete
3. **CTA** — "No account needed to start" with Play now button

Auth-gated features (creating scenarios, hosting tournaments) are described in the features section but the CTA leads to Dashboard which handles auth redirect.

---

*Updated: 2026-06-06. Covers landing page implementation. Game, dashboard layouts TBD.*
