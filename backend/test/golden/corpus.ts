import { getJSON, listKeys } from './r2';

/**
 * `recordToFile()` has written every ESPN response to R2 since October 2022,
 * under two key layouts:
 *
 *   flat   `scoreboard-2022-2-12-2022-11-02T06:48:01.714Z.json.gz`
 *   slash  `scoreboard-2022-2-12/2023-03-03T15:47:23.964Z.json.gz`
 *
 * The layout changed in 9b40445; both are still in the bucket, so both are
 * accepted here. Everything from 2023 onwards is in the slash layout.
 */
export interface Snapshot {
  key: string;
  group: string;
  recordedAt: Date;
}

const FLAT = /^(.*)-(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\.json\.gz$/;
const SLASH = /^(.*)\/(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\.json\.gz$/;

export function parseKey(key: string): Snapshot | undefined {
  const match = SLASH.exec(key) ?? FLAT.exec(key);
  if (!match) {
    return undefined;
  }
  return { key, group: match[1], recordedAt: new Date(match[2]) };
}

/** Snapshots of one group, oldest first. */
export async function snapshotsOf(prefix: string): Promise<Snapshot[]> {
  const keys = await listKeys(prefix);
  return keys
    .map(parseKey)
    .filter((s): s is Snapshot => !!s)
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
}

/** The newest snapshot of `group` recorded at or before `asOf`. */
export function pick(
  snapshots: Snapshot[],
  group: string,
  asOf: Date,
): Snapshot {
  const candidates = snapshots.filter(
    (s) => s.group === group && s.recordedAt <= asOf,
  );
  const chosen = candidates[candidates.length - 1];
  if (!chosen) {
    const first = snapshots.find((s) => s.group === group);
    throw new Error(
      first
        ? `No snapshot of ${group} at or before ${asOf.toISOString()}; the earliest is ${first.recordedAt.toISOString()}.`
        : `No snapshots of ${group} in the corpus.`,
    );
  }
  return chosen;
}

export interface Corpus {
  scoreboard(
    year: number,
    seasontype: number,
    week: number,
    asOf: Date,
  ): Promise<any>;
  groups(asOf: Date): Promise<any>;
  team(id: string, asOf: Date): Promise<any>;
}

/**
 * Serves the ESPN endpoints the importer calls from the recorded corpus,
 * always choosing the newest snapshot at or before the as-of date.
 */
export async function loadCorpus(season: number): Promise<Corpus> {
  const [scoreboards, groups, teams] = await Promise.all([
    snapshotsOf(`scoreboard-${season}-`),
    snapshotsOf('groups'),
    snapshotsOf('teams-'),
  ]);

  // `teams-<division>` objects hold the responses for a whole division, so the
  // index is built lazily per snapshot and keyed by team id.
  const teamsBySnapshot = new Map<string, Map<string, any>>();

  return {
    async scoreboard(year, seasontype, week, asOf) {
      return getJSON(
        pick(scoreboards, `scoreboard-${year}-${seasontype}-${week}`, asOf).key,
      );
    },
    async groups(asOf) {
      return getJSON(pick(groups, 'groups', asOf).key);
    },
    async team(id, asOf) {
      const divisions = [...new Set(teams.map((s) => s.group))];
      for (const division of divisions) {
        const { key } = pick(teams, division, asOf);
        if (!teamsBySnapshot.has(key)) {
          const responses = await getJSON<any[]>(key);
          teamsBySnapshot.set(
            key,
            new Map(responses.map((r) => [String(r.team.id), r])),
          );
        }
        const found = teamsBySnapshot.get(key).get(String(id));
        if (found) {
          return found;
        }
      }
      throw new Error(`No recorded response for team ${id}.`);
    },
  };
}
