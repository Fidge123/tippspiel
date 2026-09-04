import { getJSON, listKeys } from './r2';

export interface Snapshot {
  key: string;
  group: string;
  recordedAt: Date;
}

// `recordToFile()` changed its key format in 9b40445 and both layouts are still
// in the bucket: `scoreboard-2022-2-12-<iso>.json.gz` and `.../<iso>.json.gz`.
const FLAT = /^(.*)-(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\.json\.gz$/;
const SLASH = /^(.*)\/(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\.json\.gz$/;

export function parseKey(key: string): Snapshot | undefined {
  const match = SLASH.exec(key) ?? FLAT.exec(key);
  if (!match) {
    return undefined;
  }
  return { key, group: match[1], recordedAt: new Date(match[2]) };
}

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

export async function loadCorpus(season: number): Promise<Corpus> {
  const [scoreboards, groups, teams] = await Promise.all([
    snapshotsOf(`scoreboard-${season}-`),
    snapshotsOf('groups'),
    snapshotsOf('teams-'),
  ]);

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
    // A `teams-<division>` object holds the responses for a whole division, so
    // the divisions are searched for the one that recorded this team.
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
