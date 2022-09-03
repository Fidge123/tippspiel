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
    <article className="max-w-prose m-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Liga-Verwaltung</h1>
      <section>
        <h1 className="text-l font-bold">Aktive Ligen</h1>
        <table>
          <thead>
            <th>Name</th>
            <th>Teilnehmer</th>
            <th>Admins</th>
            <th>Saison</th>
            <th>Aktiv?</th>
          </thead>
          <tbody>
            {leagues.map((league) => (
              <tr>
                <td>{league.name}</td>
                <td>{league.members.map((m) => m.name).join(",")}</td>
                <td>{league.admins.map((m) => m.name).join(",")}</td>
                <td>{league.season}</td>
                <td>
                  <button onClick={() => setActiveLeague(league)}>
                    {league.id === activeLeague.id ? "Gerade Aktiv" : " "}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h1 className="text-l font-bold">Abgeschlossene Ligen</h1>
        {[].map((league) => (
          <div>
            <p>Name</p>
            <p>Teilnehmer</p>
            <p>Platzierung</p>
          </div>
        ))}
      </section>
      <form onSubmit={handleSubmit}>
        <p>Neue Liga erstellen</p>
        <label htmlFor="email-input">
          <h1 className="font-bold">Name der Liga</h1>
        </label>
        <input
          id="email-input"
          className="text-black px-2 mt-4 mr-4 border"
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
