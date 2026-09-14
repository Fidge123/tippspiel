import type { FC } from 'hono/jsx';
import { basePath, imageUrl } from '../config';
import type { DivisionPick, DivisionTeam } from '../division/query';

const POSITIONS = ['Erster', 'Zweiter', 'Dritter', 'Vierter'];

const Seed: FC<{ team: DivisionTeam }> = ({ team }) => (
  <>
    <img
      src={`${imageUrl}${team.logo}`}
      width="24"
      height="24"
      alt=""
      class="inline-block"
    />{' '}
    {team.name}
  </>
);

const DivisionForm: FC<{
  division: { name: string; teams: DivisionTeam[] };
  pick: DivisionPick | undefined;
  counts: Map<string, number>;
  closed: boolean;
  error?: string;
}> = ({ division, pick, counts, closed, error }) => (
  <section class="py-2">
    <h2 class="text-lg">{division.name}</h2>
    {error ? <p class="text-red-600">{error}</p> : ''}
    <form method="post" action={`${basePath}/division`} class="space-y-1">
      <input type="hidden" name="division" value={division.name} />
      {POSITIONS.map((position, index) => (
        <div class="flex items-center gap-2">
          <label
            class="w-20"
            for={`${division.name}-${index}`}
          >{`${position}:`}</label>
          <select
            id={`${division.name}-${index}`}
            name="team"
            class="px-1"
            disabled={closed}
            required
          >
            <option value="">—</option>
            {division.teams.map((team) => (
              <option value={team.id} selected={pick?.teams[index] === team.id}>
                {team.name}
                {index === 0 && counts.get(team.id)
                  ? ` (${counts.get(team.id)})`
                  : ''}
              </option>
            ))}
          </select>
        </div>
      ))}
      {closed ? '' : <button type="submit">Speichern</button>}
    </form>
    <ul class="pt-1 text-xs">
      {division.teams.map((team) => (
        <li class="rounded team-l flex items-center gap-2">
          <Seed team={team} />
          <span>
            {team.wins}-{team.losses}
            {(team.ties ?? 0) > 0 ? `-${team.ties}` : ''}
          </span>
        </li>
      ))}
    </ul>
  </section>
);

export const Division: FC<{
  divisions: { name: string; teams: DivisionTeam[] }[];
  picks: DivisionPick[];
  champion: string | null;
  counts: { first: Map<string, number>; champion: Map<string, number> };
  closed: boolean;
  errors: Map<string, string>;
  notice?: string;
}> = ({ divisions, picks, champion, counts, closed, errors, notice }) => (
  <div class="flex flex-wrap sm:mx-4">
    <article class="py-4 ml-4 w-min">
      <h1 class="text-xl font-semibold">Wähle den Sieger je Division:</h1>
      {notice ? <p>{notice}</p> : ''}
      <p class="max-w-prose">
        {closed
          ? 'Die Saison läuft, die Tipps sind geschlossen. Die Zahl in Klammern zeigt, wie viele Mitspieler dieses Team auf Platz eins gesetzt haben.'
          : 'Wähle für jede Division eine Reihenfolge. Jedes Team darf nur einmal vorkommen.'}
      </p>
      {divisions.map((division) => (
        <DivisionForm
          division={division}
          pick={picks.find((p) => p.name === division.name)}
          counts={counts.first}
          closed={closed}
          error={errors.get(division.name)}
        />
      ))}
    </article>
    <article class="py-4 ml-4 w-min">
      <h1 class="text-xl font-semibold">Champion:</h1>
      {errors.get('champion') ? (
        <p class="text-red-600">{errors.get('champion')}</p>
      ) : (
        ''
      )}
      <form
        method="post"
        action={`${basePath}/division/champion`}
        class="pt-2 space-x-2"
      >
        <select
          name="team"
          class="px-1"
          disabled={closed}
          required
          aria-label="Champion"
        >
          <option value="">—</option>
          {divisions
            .flatMap((division) => division.teams)
            .map((team) => (
              <option value={team.id} selected={champion === team.id}>
                {team.name}
                {counts.champion.get(team.id)
                  ? ` (${counts.champion.get(team.id)})`
                  : ''}
              </option>
            ))}
        </select>
        {closed ? '' : <button type="submit">Speichern</button>}
      </form>
    </article>
  </div>
);
