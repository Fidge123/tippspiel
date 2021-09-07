import { useState, useEffect } from "react";
import "./Division.css";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";
import { Team } from "../Schedule/types";

function Division() {
  const [token] = useToken();
  const [divisions, setDivisions] = useState<DivisionRes[]>([]);
  const [bets, setBets] = useState<any>({});

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "division", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: DivisionRes[] = await response.json();

      setDivisions(res);
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "bet/division", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: any = await response.json();

      setBets(res);
    })();
  }, [token]);

  async function select(division: string, team: string) {
    setBets({ ...bets, [division]: team });
    return await fetch(BASE_URL + "bet/division", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ division, team }),
    });
  }

  return (
    <div className="divisionParent">
      <h2>Wähle den Sieger je Division:</h2>
      {divisions.map((division) => (
        <div key={division.name}>
          <h3>{division.name}</h3>
          <div className="division">
            {division.teams.map((team) => (
              <button
                key={team.id}
                disabled={new Date(2021, 8, 10) < new Date()}
                className="divisionButton"
                style={styleByTeam(team, bets[division.name] === team.id)}
                onClick={() => select(division.name, team.id)}
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
                  className={bets[division.name] === team.id ? "selected" : ""}
                >
                  {team.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
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
