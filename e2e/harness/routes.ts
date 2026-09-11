import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const nginxConfig = resolve(
  __dirname,
  '../../server/deploy/nginx.conf.example',
);

/**
 * Reads the deployed nginx config rather than restating it, so the harness
 * cannot drift from the routing the strangler migration actually ships.
 * Only exact-match locations count: /tippspiel/ still falls through to the SPA,
 * which client-side routes every path these blocks do not claim.
 */
export function honoRoutes(): string[] {
  const config = readFileSync(nginxConfig, 'utf8');
  const routes = [...config.matchAll(/^\s*location\s*=\s*(\S+)\s*\{/gm)].map(
    (match) => match[1],
  );

  if (!routes.length) {
    throw new Error(
      `No exact-match location blocks in ${nginxConfig}. The route split would silently send everything to the SPA.`,
    );
  }

  return routes;
}
