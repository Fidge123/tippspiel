import { FormEvent, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchFromAPI } from "../api";
import { League } from "../State/response-types";
import { activeLeagueState, tokenState, userIdState } from "../State/states";

function LeagueRow({ league, setLeague }: Props) {
  const [email, setEmail] = useState("");
  const me = useRecoilValue(userIdState);
  const [activeLeague, setActiveLeague] = useRecoilState(activeLeagueState);
  const token = useRecoilValue(tokenState);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const res = await fetchFromAPI("leagues/add", token, "POST", {
      leagueId: league.id,
      email,
    });
    setLeague({ ...league, members: res.members });
  }

  return (
    <tr key={league.id}>
      <td>{league.name}</td>
      <td>
        {league.members.map((m) =>
          league.admins.some((a) => a.id === m.id) ? (
            <div key={m.id}>{m.name} (Admin)</div>
          ) : (
            <div key={m.id}>{m.name}</div>
          )
        )}
        {league.admins.some((a) => a.id === me) && (
          <form onSubmit={handleAdd}>
            <input
              className="p-0.5 mr-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Hinzufügen</button>
          </form>
        )}
      </td>

      <td>{league.season}</td>

      {league.id === activeLeague.id ? (
        <td>Gerade aktiv</td>
      ) : (
        <td className="py-2">
          <button onClick={() => setActiveLeague(league)}>Aktivieren</button>
        </td>
      )}
    </tr>
  );
}

interface Props {
  league: League;
  setLeague: (league: League) => void;
}

export default LeagueRow;
