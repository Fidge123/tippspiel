import { FormEvent, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchFromAPI, validateToken, refresh } from "../api";
import { leaguesState, tokenState } from "../State/states";
import LeagueRow from "./League";

function Leagues() {
  const [leagueName, setLeagueName] = useState("");
  const [leagues, setLeagues] = useRecoilState(leaguesState);
  const token = useRecoilValue(tokenState);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetchFromAPI(
      "leagues/create",
      validateToken(token) ? token : await refresh(),
      "POST",
      {
        name: leagueName,
      }
    );
    setLeagues([...leagues, res]);
    return res;
  }

  return (
    <article className="p-4 m-auto space-y-4 max-w-prose">
      <h1 className="text-xl font-bold">Liga-Verwaltung</h1>
      <section>
        <h1 className="pb-4 font-bold">Deine Tippspiel-Ligen</h1>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Teilnehmer</th>
              <th>Saison</th>
              <th>Aktiv?</th>
            </tr>
          </thead>
          <tbody>
            {leagues
              .filter((l) => l.season === 2022)
              .map((league) => (
                <LeagueRow
                  key={league.id}
                  league={league}
                  setLeague={(changed) =>
                    setLeagues([
                      ...leagues.filter((el) => el.id !== league.id),
                      changed,
                    ])
                  }
                ></LeagueRow>
              ))}
          </tbody>
        </table>
      </section>
      {/* <section>
        <h1 className="font-bold text-l">Abgeschlossene Ligen</h1>
        {[].map((league) => (
          <div>
            <p>Name</p>
            <p>Teilnehmer</p>
            <p>Platzierung</p>
          </div>
        ))}
      </section> */}
      <form onSubmit={handleCreate}>
        <h1 className="font-bold">Neue Liga erstellen</h1>
        <label htmlFor="email-input">Name der Liga</label>
        <input
          id="email-input"
          className="px-2 mx-4 mt-4 text-black border"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          required
        />
        <button type="submit">Erstellen</button>
      </form>
    </article>
  );
}

export default Leagues;
