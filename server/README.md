# Server

The server-rendered application that replaces the SPA and the Nest API, one route at a time.
See #85 for the plan and #86 for the step that created this package.

Hono on Bun, Hono JSX rendered to a string, Tailwind 4.
Nothing ships to the browser: every page here works with JavaScript disabled because there is no JavaScript to disable.

## Run it

```
bun install
bun run build:css
bun run dev
```

Then open http://localhost:5002/tippspiel/impressum.

`DATABASE_URL` is only needed for `/health`, which is the one route that touches the database at this point.

## Layout

| Path | What |
|---|---|
| `src/app.tsx` | The Hono app and its routes. Runtime-agnostic, so the test suite can import it under Node |
| `src/index.tsx` | The Bun entry. Adds static file serving and exports `{ fetch, port }` for `Bun.serve` |
| `src/views/` | Hono JSX components, rendered server-side |
| `styles/app.css` | Tailwind source. `build:css` emits `static/app.css`, which is generated and not committed |
| `deploy/` | systemd unit, nginx blocks, and the cut-over and rollback procedure |

## Tests

Vitest on Node, driving `app.request()` directly.
That is why `src/app.tsx` must not import `hono/bun`: the Bun-only pieces live in `src/index.tsx`.
