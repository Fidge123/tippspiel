import type { FC } from 'hono/jsx';
import { basePath } from '../config';
import type { LeagueView } from '../leagues/query';

const Controls: FC<{
  league: LeagueView;
  member: LeagueView['members'][0];
}> = ({ league, member }) => (
  <form method="post" class="inline space-x-1">
    <input type="hidden" name="league" value={league.id} />
    <input type="hidden" name="user" value={member.id} />
    {member.isAdmin ? (
      <button type="submit" formaction={`${basePath}/leagues/demote`}>
        Demote
      </button>
    ) : (
      <button type="submit" formaction={`${basePath}/leagues/promote`}>
        Promote
      </button>
    )}
    <button type="submit" formaction={`${basePath}/leagues/kick`}>
      Kick
    </button>
  </form>
);

const Row: FC<{ league: LeagueView; active: boolean }> = ({
  league,
  active,
}) => (
  <tr>
    <td>
      <div>{league.name}</div>
      {league.amAdmin ? (
        <details>
          <summary class="cursor-pointer text-xs">Anpassen</summary>
          <form
            method="post"
            action={`${basePath}/leagues/rename`}
            class="pt-2 space-x-1"
          >
            <input type="hidden" name="league" value={league.id} />
            <input
              name="name"
              class="px-1"
              value={league.name}
              minlength={3}
              required
              aria-label="Liga umbenennen"
            />
            <button type="submit">Umbenennen</button>
          </form>
          <form
            method="post"
            action={`${basePath}/leagues/delete`}
            class="pt-2 space-x-1"
          >
            <input type="hidden" name="league" value={league.id} />
            <label class="text-xs" for={`confirm-${league.id}`}>
              Zum Löschen den Namen eingeben
            </label>
            <input
              id={`confirm-${league.id}`}
              name="confirm"
              class="px-1"
              required
            />
            <button type="submit">Löschen</button>
          </form>
        </details>
      ) : (
        ''
      )}
    </td>
    <td class="text-left">
      {league.members.map((member) => (
        <div class="flex flex-row items-center justify-between w-full">
          <div>{`${member.name}${member.isAdmin ? ' (Admin)' : ''}`}</div>
          {league.amAdmin ? <Controls league={league} member={member} /> : ''}
        </div>
      ))}
      {league.amAdmin ? (
        <form
          method="post"
          action={`${basePath}/leagues/add`}
          class="pt-2 space-x-1"
        >
          <input type="hidden" name="league" value={league.id} />
          <input
            name="email"
            type="email"
            class="p-0.5 mr-2"
            required
            aria-label="E-Mail des neuen Mitglieds"
          />
          <button type="submit">Hinzufügen</button>
        </form>
      ) : (
        ''
      )}
    </td>
    <td>{league.season}</td>
    <td class="py-2">
      {active ? (
        'Gerade aktiv'
      ) : (
        <form method="post" action={`${basePath}/leagues/activate`}>
          <input type="hidden" name="league" value={league.id} />
          <button type="submit">Aktivieren</button>
        </form>
      )}
    </td>
  </tr>
);

export const Leagues: FC<{
  leagues: LeagueView[];
  activeId?: string;
  error?: string;
  notice?: string;
}> = ({ leagues, activeId, error, notice }) => (
  <article class="p-4 m-auto space-y-4 max-w-prose">
    <h1 class="text-xl font-bold">Liga-Verwaltung</h1>
    {error ? <p>🚨 {error}</p> : ''}
    {notice ? <p>{notice}</p> : ''}
    <section>
      <h1 class="pb-4 font-bold">Deine Tippspiel-Ligen</h1>
      <table class="w-full text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th class="text-left">Teilnehmer</th>
            <th>Saison</th>
            <th>Aktiv?</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map((league) => (
            <Row
              league={league}
              active={league.id === (activeId ?? leagues[0]?.id)}
            />
          ))}
        </tbody>
      </table>
    </section>
    <form method="post" action={`${basePath}/leagues/create`}>
      <h1 class="font-bold">Neue Liga erstellen</h1>
      <label for="league-name-input">Name der Liga</label>
      <input
        id="league-name-input"
        name="name"
        class="px-2 mx-4 mt-4 text-black border"
        minlength={3}
        required
      />
      <button type="submit">Erstellen</button>
    </form>
  </article>
);
