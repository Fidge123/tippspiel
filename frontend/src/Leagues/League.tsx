import { FormEvent, useState } from "react";
import { useRecoilState } from "recoil";
import { fetchFromAPI, getDecodedToken } from "../api";
import { League } from "../State/response-types";
import { activeLeagueState } from "../State/states";
import Member from "./Member";

function LeagueRow({ league, setLeague }: Props) {
  const [email, setEmail] = useState("");
  const me = getDecodedToken().id;
  const [activeLeague, setActiveLeague] = useRecoilState(activeLeagueState);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const res = await fetchFromAPI("leagues/add", "POST", {
      leagueId: league.id,
      email,
    });
    setLeague({ ...league, members: res.members });
    return res;
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    const name = prompt(
      "Are you sure? Enter the name of the league to delete it."
    );
    if (league.name === name) {
      const res = await fetchFromAPI("leagues/delete", "POST", {
        leagueId: league.id,
      });
      setLeague(undefined);
      return res;
    }
  }

  return (
    <tr key={league.id}>
      <td>
        <div>{league.name}</div>
        {league.admins.some((a) => a.id === me) && (
          <button onClick={handleDelete}>Delete League</button>
        )}
      </td>
      <td className="text-left">
        {league.members.map((m) => (
          <Member
            key={m.id}
            member={m}
            league={league}
            setLeague={setLeague}
            showControls={league.admins.some((a) => a.id === me)}
          ></Member>
        ))}
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
  setLeague: (league?: League) => void;
}

export default LeagueRow;
