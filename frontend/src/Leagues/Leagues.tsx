import { FormEvent, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchFromAPI } from "../api";
import { activeLeagueState, leaguesState, tokenState } from "../State/states";

function Leagues() {
  const [leagueName, setLeagueName] = useState("");
  const [activeLeague, setActiveLeague] = useRecoilState(activeLeagueState);
  const leagues = useRecoilValue(leaguesState);
  const token = useRecoilValue(tokenState);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    return await fetchFromAPI("leagues/create", token, "POST", {
      name: leagueName,
    });
  }

  return (
    <article className="p-4 m-auto space-y-4 max-w-prose">
      <h1 className="text-xl font-bold">Liga-Verwaltung</h1>
      <section>
        <h1 className="pb-4 font-bold">Aktive Ligen</h1>
        <table className="w-full text-sm">
          <thead>
            <th>Name</th>
            <th>Teilnehmer</th>
            <th>Admins</th>
            <th>Saison</th>
            <th>Aktiv?</th>
          </thead>
          <tbody>
            {leagues
              .filter((l) => l.season === 2022)
              .map((league) => (
                <tr>
                  <td>{league.name}</td>
                  <td>{league.members.map((m) => m.name).join(",")}</td>
                  <td>{league.admins.map((m) => m.name).join(",")}</td>
                  <td>{league.season}</td>

                  {league.id === activeLeague.id ? (
                    <td>Gerade aktiv</td>
                  ) : (
                    <td className="py-2">
                      <button onClick={() => setActiveLeague(league)}>
                        Aktivieren
                      </button>
                    </td>
                  )}
                </tr>
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
      <form onSubmit={handleSubmit}>
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
