# 3. Modernization

Three separate questions, deliberately kept apart:

- **3.1** What can be updated *right now* with no logic changes?
- **3.2** What updates cost real work, and are they worth it given a planned rewrite?
- **3.3** What should the new stack be?

Measured baseline (this machine, from the committed lockfiles):

| | |
|---|---|
| `node_modules` | 418 MB frontend + 323 MB backend = **741 MB**, 1,424 packages |
| frontend build | 17.9 s, 2.1 MB output, **98 kB of gzipped JS** |
| backend build | 10.3 s |

---

## 3.1 Safe now — no logic changes

### Delete unused dependencies (do this first, it is free)

| Package | Where | Evidence |
|---|---|---|
| `vega`, `vega-lite`, `react-vega` | frontend | zero imports anywhere in `src/` or `public/` |
| `jwks-rsa` | backend | zero imports |

Three of the frontend's ten runtime dependencies are dead. `vega` alone pulls in ~30
transitive packages. This is the single best maintenance-cost-per-minute change available.

Likewise delete the dead code listed in §1.6 (`findBetsByGame`, `votesPerGame`,
`deleteUser`, the empty `UserService`, the commented-out `calculatePoints2021`).

### Drop-in version bumps

Within the current majors — patch/minor only, no API changes:

**Backend**: `pg` 8.3→8.23, `compression` 1.7→1.8, `cookie-parser` 1.4.6→1.4.7,
`reflect-metadata` 0.2.1→0.2.2, `rxjs` 7.3→7.8, `passport-jwt` 4.0.0→4.0.1,
`@aws-sdk/client-s3` (rolling), `typescript` 5.3→5.9, `prettier` 3.2→3.9,
`@typescript-eslint/*` 8.2→8.69, `@types/*`.

**Frontend**: `postcss` 8.4→8.5, `autoprefixer` 10.4→10.5, `prettier`, `@types/*`,
`react` / `react-dom` 18.2→18.3.

### Fix the broken configuration

None of these change behaviour, all of them are currently wrong:

- Root `package.json` declares `workspaces: ["workspace-a", "workspace-b"]` — directories
  that do not exist. Either make it a real workspace or delete the field.
- Backend lint is dead (ESLint 9 flat config + a config preset removed in
  `eslint-config-prettier` v8). Fix it — or replace the whole lint/format stack, see below.
- **Node**: `.nvmrc` pins v20 (end-of-life April 2026) and CI pins v18 (end-of-life
  April 2025). Move both — and the VPS — to **Node 24 "Krypton"**, the current Active LTS.
  Everything in this repo runs on it unchanged.
- CI: add backend build + lint + typecheck; run on pull requests too.
- The frontend `lint` script calls an `eslint` that is not a declared dependency.

### Recommended: replace ESLint + Prettier with Biome

One binary replaces `eslint`, `eslint-config-prettier`, `eslint-plugin-import`,
`@typescript-eslint/*` (2 packages) and `prettier` — six direct dependencies and their
trees, across both packages. One `biome.json`. Roughly 10× faster. Since backend linting
is broken anyway there is nothing to migrate away from, and
`schedule/schedule.service.ts` is already formatted with Biome's defaults (tabs, double
quotes), which suggests you have tried it.

The one real trade-off: Biome has no type-aware rules. For this codebase `tsc --noEmit`
plus tier-0 CI covers what those were giving you.

### Effort

~2–3 hours for everything in §3.1, and it removes roughly 40 packages.

---

## 3.2 Costly updates, weighed against the planned rewrite

The guiding rule: **spend effort only where it (a) keeps the site running, (b) reduces
maintenance cost now, or (c) carries over to the new stack.** Do not modernize code you
intend to delete.

| Update | Cost | Carries over? | Verdict |
|---|---|---|---|
| `helmet` 7→8 | 30 min | yes | **Do.** Called with no options; v8 only changes header defaults. Verify with `curl -I`. |
| `postmark` 4→5 | 30 min | yes | **Do.** Small, isolated in `email.ts`. |
| `@nestjs/*` 10→11→12 | 3–5 h | **no** | **Defer.** Two majors, and v11 moves to Express 5 (new route-matching, new query parser). Nest is the framework you are leaving. Only do it if a security advisory lands. |
| `typeorm` 0.3→1.x | 6–10 h | **no** | **Defer.** First stable major in the project's history; requires Node ≥20.19. It is the layer most likely to be replaced outright. |
| `typescript` 5.x→7 | unknown | yes, eventually | **Wait.** TS 7 (the Go-based compiler) is out but this is not the project to shake it out on. Go to 5.9 now. |
| `react-scripts` → Vite | 2–3 h | **yes** | **Conditional.** CRA still builds fine here (verified). Do it only if a Node upgrade breaks it, or if you decide against the rewrite. Vite carries over to nearly any target stack. |
| React 18→19 | 4–8 h | no | **Defer.** Blocked by Recoil (below). |
| Tailwind 3→4 | 2–3 h | **yes** | **Do it as part of the rewrite,** not before. The styles port over; `tailwind.config.js` still contains a `variants` block that has been dead since v2. |
| react-router 6→7 | 1–2 h | maybe | **Defer.** |

### The Recoil problem

`recoil@0.7.7` was published in **March 2023** and Meta has not shipped since. It is the
hard blocker on React 19, it has no maintainer to fix it, and it is woven through the
entire frontend — every data fetch in `State/states.ts` is a Recoil `selector`.

This is not a "swap the state library" job. Recoil selectors here *are* the data layer:
they fetch, cache and write back to the API. Replacing them means rewriting the data layer,
which means you may as well rewrite the frontend — which you already want to do, and which
the JavaScript-disabled requirement forces anyway.

**So: do not migrate off Recoil. Migrate off the SPA.** Freeze the frontend, keep it on
React 18, and put the effort into §3.3.

---

## 3.3 Target stack

### The constraint that decides everything

> "Ideally the new stack should enable the site to function with JS disabled."

That is not a styling preference, it is an architecture. It means server-rendered HTML,
real `<form method="post">` submissions, `303` redirects, and full page navigation — with
JavaScript layered on top as an enhancement, never as a requirement. The current
architecture (empty `<div id="root">`, client-side routing, `localStorage` JWT, fetch-only
mutations) cannot get there incrementally. Neither can "SPA framework in SSR mode".

It also settles the auth design for you: **a JWT in `localStorage` cannot work without
JavaScript.** The new stack needs a plain signed, `HttpOnly` session cookie. That is a
simplification — the access-token/refresh-token/`refresh()`-cache dance in
`frontend/src/api.ts` and `auth/` (~200 lines) disappears, and so does the 290-day cookie
bug (L1) and the one-year refresh token.

### Recommendation

**Hono + Hono JSX (server-rendered) + Kysely + Postgres, on Node 24 LTS, pnpm, Biome,
Tailwind 4, behind the existing nginx.**

| Layer | Choice | Why |
|---|---|---|
| HTTP | **Hono** | Effectively zero dependencies, small stable API, fast. Runs on Node, Bun, Deno and workers — so the runtime choice stays reversible. |
| Views | **Hono JSX**, server-side | You keep writing `.tsx` components; they render to a string. **Nothing ships to the browser.** The existing Rules/Impressum/table components port nearly 1:1. |
| Data | **Kysely** | Type-safe SQL, no decorators, no `reflect-metadata`, no lazy-relation surprises. What you write is what runs — which is how the N+1 leaderboard (M6) becomes one query. Migrations are plain TS. |
| Validation | **Zod** + `@hono/zod-validator` | Fixes M7 properly: one schema validates the form body *and* types the handler. |
| Auth | signed `HttpOnly` cookie + a `session` table | Works without JS. Deletes the JWT machinery. |
| Styling | **Tailwind 4** | Its CLI is Rust now — no PostCSS config, no autoprefixer. Your classes carry over. |
| Enhancement | ~50 lines of vanilla JS, or HTMX (14 kB) | Same forms, submitted with `fetch` for the no-reload feel. Optional by construction. |
| Tooling | **pnpm**, **Biome**, **Vitest** | See below. |

**Why Kysely over Drizzle**: both are good. The deciding factor is the leaderboard —
it is fundamentally one aggregate over bets, doublers and games, and Kysely lets you write
that as the SQL it is. Choose Drizzle instead if you would rather have a schema DSL and
generated migrations; it is the more popular choice and is not a wrong answer.

**Why not Remix / React Router 7 framework mode**: it is the strongest *React* answer to
progressive enhancement (`<Form>` degrades correctly, loaders/actions are server-side) and
it would preserve more of your existing components. But it still ships a React runtime to
the browser, still needs a build step, and the Remix/React-Router lineage has churned
hard — three identities in four years. For a hobby project where the goal is *low
maintenance*, Hono JSX gives you the same JSX authoring model with a fraction of the moving
parts.

**Why not Astro**: excellent resource profile and genuinely zero-JS by default, and a fine
choice for Rules/Impressum. But this app is mostly authenticated forms and tables, which is
Astro's weakest area, and it pulls in a build pipeline you would otherwise not need.

**Why not keep NestJS and add views**: least migration work, but Nest is the single
heaviest thing in the tree and its decorator/DI style is precisely the "legacy" you want to
leave. Adding a view layer to it locks it in for another five years.

**Why not Go or Elixir**: the lowest resource use by some distance, and the wrong trade for
a project one person maintains in their spare time in a language they already know.

### Runtime: Node vs Bun

**Node 24 LTS.** Reasons, in order:

1. It is what the VPS and CI already run, one LTS line up. Boring is the whole point.
2. Node now strips TypeScript types natively, so `ts-node` and the `nest build` step can
   leave the production path entirely — you run `.ts` directly under systemd.
3. Security updates arrive through the distro on the VPS. Bun's do not.
4. Bun is genuinely faster to install and boot, but it is a single-vendor runtime with a
   shorter production track record for long-running services, and occasional surprises at
   the edges (`pg`, `crypto`, native modules) are exactly the maintenance cost you are
   trying to avoid.

Hono runs on both, so this is a reversible decision. Use `bun` locally if you like it;
deploy Node.

### Package manager: pnpm

- Content-addressed store — one copy of each package version on disk, which matters on a
  small VPS when `node_modules` currently weighs **741 MB**.
- Strict `node_modules` catches phantom dependencies. This repo has one already: the
  frontend's `lint` script calls an `eslint` it never declared.
- `pnpm import` converts the existing `yarn.lock` files.
- Yarn 1 is end-of-life; keeping it is the reason the two lockfiles have drifted apart.

npm is an acceptable second choice (slower, more disk). Bun's package manager is fast but
couples the project to Bun. While you are in there, make the root a real workspace
(`pnpm-workspace.yaml`) or drop the fictional `workspace-a`/`workspace-b` entry.

### Expected resource profile

| | Now | Target |
|---|---|---|
| Processes on the VPS | 1 Node (Nest) + nginx static | 1 Node (Hono) + nginx static |
| RSS, idle | ~150–250 MB (Nest + TypeORM metadata) | ~60–80 MB |
| Cold boot | seconds | ~100 ms |
| JS shipped to the browser | **98 kB gzipped**, required | 0 kB required, ~5 kB optional |
| Works with JS off | no | yes |
| `node_modules` | 741 MB | ~80–120 MB |
| Direct dependencies | 42 | ~12 |

### Migration path: strangler-fig behind nginx

Do not big-bang this. Run the new Hono app on a second port and move routes across one at
a time in the nginx config:

1. `/impressum`, `/rules` — static content, no auth. Proves the rendering and deploy story.
2. `/leaderboard` — read-only, table-shaped, no mutations. Proves Kysely and the one-query
   leaderboard.
3. Login/register/reset — proves the cookie session. Both apps must accept the session
   during this window.
4. `/` (schedule + betting) — the hard one. Real forms, deadlines, the doubler.
5. `/division` — the pre-season bets.
6. Delete `frontend/`.

**This is only safe because of the golden-master tests in §2.** They pin the leaderboard
numbers against a real recorded season, so a leaderboard rewritten in Kysely can be proved
to produce byte-identical output to the TypeORM one. That is the whole reason testing comes
before modernization in the roadmap.

### Effort

| | |
|---|---|
| §3.1 safe updates + config fixes | 2–3 h |
| §3.2 selected updates (`helmet`, `postmark`) | 1 h |
| New stack skeleton (Hono + Kysely + session auth + layout) | 8–12 h |
| Steps 1–2 of the strangler (static pages + leaderboard) | 6–8 h |
| Steps 3–5 (auth, betting, division bets) | 20–30 h |
| Decommission the SPA | 2 h |
| **Rewrite total** | **~40–55 h** |

Spread across a season that is a weekend a month. And every step is independently
shippable, behind nginx, with the old app one config line away.
