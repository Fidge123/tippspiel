import { env } from 'node:process';
import { stringify } from 'node:querystring';
import { sendEmail } from '../email/send';
import { loadHTML, loadTXT } from '../email/templates';
import type { Competitors, Scoreboard, Team } from './espn.types';

export const BASE_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/';

export interface WeekKey {
  year: number;
  seasontype: number;
  week: number;
}

export async function notify(url: string): Promise<void> {
  await sendEmail({
    to: env.EMAIL,
    subject: 'API Request failed',
    text: await loadTXT('requestFailed', { url }),
    html: await loadHTML('requestFailed', { url }),
  }).catch((error) => console.error(error));
}

/** Throws rather than returning undefined, so a caller cannot read through it. */
export async function loadScoreboard({
  year,
  seasontype,
  week,
}: WeekKey): Promise<Scoreboard> {
  const query = stringify({ dates: year, seasontype, week });
  const response = await fetch(`${BASE_URL}scoreboard?${query}`);

  if (!response.ok) {
    await notify(`${BASE_URL}scoreboard?${query}`);
    throw new Error(
      `Failed to load scoreboard for ${year}-${seasontype}-${week}: ${response.status}`,
    );
  }

  return (await response.json()) as Scoreboard;
}

export async function loadGroups(): Promise<{ groups: unknown[] }> {
  const response = await fetch(`${BASE_URL}groups`);

  if (!response.ok) {
    await notify(`${BASE_URL}groups`);
    throw new Error(`Failed to load divisions: ${response.status}`);
  }

  return (await response.json()) as { groups: unknown[] };
}

/** ESPN serves several sizes; the database stores the file name of the first. */
export function logoFile(team: Team): string {
  const href = team.logos?.[0]?.href;
  if (!href) {
    throw new Error(`ESPN returned no logo for ${team.uid}`);
  }
  return href.split('/').reverse()[0] ?? href;
}

/** A team ESPN has no record for yet reads as zero rather than failing the import. */
export function findStat(team: Team, name: string): number {
  return (
    team.record?.items[0]?.stats.find((stat) => stat.name === name)?.value ?? 0
  );
}

export function getWinner(
  home: Competitors,
  away: Competitors,
): 'home' | 'away' | 'none' {
  if (home.winner) {
    return 'home';
  }
  if (away.winner) {
    return 'away';
  }
  return 'none';
}
