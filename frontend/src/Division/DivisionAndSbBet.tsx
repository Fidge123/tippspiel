import { useRecoilValue, useRecoilState } from "recoil";

import {
  divisionsState,
  divisionBetsState,
  activeLeagueState,
} from "../State/states";
import { fetchFromAPI } from "../api";
import Division from "./Division";
import SbBet from "./SbBet";
import { DivisionBet } from "../State/response-types";

function DivisionAndSbBet() {
  const divisions = useRecoilValue(divisionsState);
  const league = useRecoilValue(activeLeagueState);
  const [divisionBets, setDivisionBets] = useRecoilState(divisionBetsState);

  async function upateDivisonBets(bet: DivisionBet) {
    const res = await fetchFromAPI("bet/division", "POST", {
      division: bet.name,
      teams: bet.teams.map((t) => t?.id),
      year: league.season,
      league: league.id,
    });
    setDivisionBets(
      [...divisionBets.filter((db) => db.name !== bet.name), bet].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    return res;
  }

  return (
    <div className="flex flex-wrap sm:mx-4">
      <article className="py-4 ml-4 w-min">
        <h1 className="text-xl font-semibold">Wähle den Sieger je Division:</h1>
        <p>
          Sortiere die Teams mit ⬆️ und ⬇️. Für Teams mit weißem Hintergrund
          wurde noch kein Tipp übermittelt.
        </p>
        {divisions.map((division) => (
          <Division
            key={division.name}
            division={division}
            divisionBets={divisionBets.find(
              (bet) => bet.name === division.name
            )}
            setDivisionBets={upateDivisonBets}
          ></Division>
        ))}
      </article>
      <SbBet></SbBet>
    </div>
  );
}

export default DivisionAndSbBet;
