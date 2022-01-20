import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { tokenState } from "../State/states";
import { fetchFromAPI } from "../api";
import { Team } from "../Schedule/types";

function Division() {
  const token = useRecoilValue(tokenState);
  const [divisions, setDivisions] = useState<DivisionRes[]>([]);
  const [divisionBets, setDivisionBets] = useState<any>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [sbBet, setSBBet] = useState("");

  useEffect(() => {
    (async () => {
      const res: DivisionRes[] = await fetchFromAPI("division", token); //TODO

      setDivisions(res);
      setTeams(
        res.reduce((result, curr) => [...result, ...curr.teams], [] as Team[])
      );
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      setDivisionBets(await fetchFromAPI("bet/division?season=2021", token)); //TODO
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      setSBBet(
        (await fetchFromAPI("bet/superbowl?season=2021", token))?.team?.id
      ); //TODO
    })();
  }, [token]);

  async function selectDivisionWinner(division: string, team: string) {
    setDivisionBets({ ...divisionBets, [division]: team });
    return await fetchFromAPI("bet/division", token, "POST", {
      division,
      team,
      year: 2021,
    });
  }

  async function selectSBWinner(teamId: string) {
    setSBBet(teamId);
    return await fetchFromAPI("bet/superbowl", token, "POST", {
      teamId,
      year: 2021,
    });
  }

  return (
    <div className="grid grid-cols-23 mx-4 sm:mx-8 gap-2 pb-8">
      <div className="flex flex-col flex-wrap w-21r">
        <h2>Wähle den Sieger je Division:</h2>
        {divisions
          .sort((divA, divB) => divA.name.localeCompare(divB.name))
          .map((division) => (
            <div key={division.name}>
              <h3>{division.name}</h3>
              <div className="flex flex-col flex-wrap space-y-2">
                {division.teams
                  .sort(
                    (a, b) =>
                      b.wins - a.wins || b.ties - a.ties || a.losses - b.losses
                  )
                  .map((team) => (
                    <button
                      key={"Div" + team.id}
                      disabled={new Date(2021, 8, 12, 19) < new Date()}
                      className="team-l"
                      style={styleByTeam(
                        team,
                        divisionBets[division.name] === team.id
                      )}
                      onClick={() =>
                        selectDivisionWinner(division.name, team.id)
                      }
                    >
                      {team.logo && (
                        <img
                          src={process.env.REACT_APP_IMG_URL + team.logo}
                          className="h-6 w-6 float-left"
                          alt="logo home team"
                          onError={(event: any) =>
                            (event.target.style.display = "none")
                          }
                        ></img>
                      )}
                      <span
                        className={
                          divisionBets[division.name] === team.id
                            ? "font-semibold text-gray-50"
                            : ""
                        }
                      >
                        {`${team.name} ${team.wins}-${team.losses}`}
                        {team.ties > 0 ? "-" + team.ties : ""}
                        {` (${
                          division.bets.filter((bet) => bet.team.id === team.id)
                            .length
                        })`}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
      </div>
      <div className="flex flex-col flex-wrap w-21r space-y-2">
        <h2>Wähle den Sieger des Superbowls:</h2>
        {teams.map((team) => (
          <button
            key={"SB" + team.id}
            disabled={new Date(2021, 8, 12, 19) < new Date()}
            className="team-l"
            style={styleByTeam(team, sbBet === team.id)}
            onClick={() => selectSBWinner(team.id)}
          >
            {team.logo && (
              <img
                src={process.env.REACT_APP_IMG_URL + team.logo}
                className="h-6 w-6 float-left"
                alt="logo home team"
                onError={(event: any) => (event.target.style.display = "none")}
              ></img>
            )}
            <span
              className={sbBet === team.id ? "font-semibold text-gray-50" : ""}
            >
              {team.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function styleByTeam(team: Team | undefined, selected: boolean) {
  return selected
    ? {
        borderColor: `#${team?.color2}ff`,
        backgroundColor: `#${team?.color1}aa`,
        opacity: 1,
      }
    : {
        borderColor: `#${team?.color1 || "000000"}ff`,
      };
}

interface DivisionRes {
  name: string;
  bets: {
    id: string;
    team: Team;
    year: number;
  }[];
  teams: Team[];
}

export default Division;
