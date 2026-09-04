import { BASE_URL } from '../../src/schedule/schedule.service';
import type { Corpus } from './corpus';

/**
 * Replaces global `fetch` with the recorded corpus. The importer only ever
 * calls three ESPN endpoints; anything else is a bug in the test and fails
 * loudly rather than silently reaching the network.
 */
export function installEspnStub(corpus: Corpus, clock: () => Date) {
  const real = globalThis.fetch;

  globalThis.fetch = (async (input: any) => {
    const url = String(typeof input === 'string' ? input : input.url);
    if (!url.startsWith(BASE_URL)) {
      throw new Error(
        `Unexpected network call in a golden master test: ${url}`,
      );
    }

    const asOf = clock();
    const path = url.slice(BASE_URL.length);
    let body: unknown;

    if (path.startsWith('scoreboard?')) {
      const q = new URLSearchParams(path.slice('scoreboard?'.length));
      body = await corpus.scoreboard(
        Number(q.get('dates')),
        Number(q.get('seasontype')),
        Number(q.get('week')),
        asOf,
      );
    } else if (path === 'groups') {
      body = await corpus.groups(asOf);
    } else if (path.startsWith('teams/')) {
      body = await corpus.team(path.slice('teams/'.length), asOf);
    } else {
      throw new Error(`No recorded ESPN response for ${url}`);
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  return () => {
    globalThis.fetch = real;
  };
}
