import { useState, useEffect } from "react";
import "./Division.css";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";
import { Team } from "../Schedule/types";

function Division() {
  const [token] = useToken();
  const [divisions, setDivisions] = useState<DivisionRes[]>([]);
  const [divisionBets, setDivisionBets] = useState<any>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [sbBet, setSBBet] = useState("");

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "division", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: DivisionRes[] = await response.json();

      setDivisions(res);
      setTeams(
        res.reduce((result, curr) => [...result, ...curr.teams], [] as Team[])
      );
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "bet/division?season=2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: any = await response.json();

      setDivisionBets(res);
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "bet/superbowl?season=2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: any = await response.json();
      setSBBet(res?.team?.id);
    })();
  }, [token]);

  async function selectDivisionWinner(division: string, team: string) {
    setDivisionBets({ ...divisionBets, [division]: team });
    return await fetch(BASE_URL + "bet/division", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ division, team, year: 2021 }),
    });
  }

  async function selectSBWinner(teamId: string) {
    setSBBet(teamId);
    return await fetch(BASE_URL + "bet/superbowl", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamId, year: 2021 }),
    });
  }

  return (
    <div className="divisionParent">
      <div className="divBet">
        <h2>Wähle den Sieger je Division:</h2>
        {divisions.map((division) => (
          <div key={division.name}>
            <h3>{division.name}</h3>
            <div className="division">
              {division.teams.map((team) => (
                <button
                  key={"Div" + team.id}
                  disabled={new Date(2021, 8, 12, 19) < new Date()}
                  className="divisionButton"
                  style={styleByTeam(
                    team,
                    divisionBets[division.name] === team.id
                  )}
                  onClick={() => selectDivisionWinner(division.name, team.id)}
                >
                  {team.logo && (
                    <img
                      src={process.env.REACT_APP_IMG_URL + team.logo}
                      className="logo"
                      alt="logo home team"
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                  )}
                  <span
                    className={
                      divisionBets[division.name] === team.id ? "selected" : ""
                    }
                  >
                    {team.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="sbBet">
        <h2>Wähle den Sieger des Superbowls:</h2>
        {teams.map((team) => (
          <button
            key={"SB" + team.id}
            disabled={new Date(2021, 8, 12, 19) < new Date()}
            className="sbButton"
            style={styleByTeam(team, sbBet === team.id)}
            onClick={() => selectSBWinner(team.id)}
          >
            {team.logo && (
              <img
                src={process.env.REACT_APP_IMG_URL + team.logo}
                className="logo"
                alt="logo home team"
                onError={(event: any) => (event.target.style.display = "none")}
              ></img>
            )}
            <span className={sbBet === team.id ? "selected" : ""}>
              {team.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function styleByTeam(team: Team | undefined, selected: boolean) {
  return {
    border: `2px solid #${selected ? team?.color2 : team?.color1 || "000000"}${
      selected ? "ff" : "55"
    }`,
    backgroundColor: selected ? `#${team?.color1}aa` : "#fff",
    boxShadow: "none",
  };
}

interface DivisionRes {
  name: string;
  teams: Team[];
}

export default Division;
