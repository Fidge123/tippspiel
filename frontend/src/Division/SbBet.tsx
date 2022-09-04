import { useRecoilState, useRecoilValue } from "recoil";
import { fetchFromAPI } from "../api";
import { Team } from "../State/response-types";
import {
  activeLeagueState,
  sbBetState,
  teamsState,
  tokenState,
} from "../State/states";

function SbBet() {
  const token = useRecoilValue(tokenState);
  const league = useRecoilValue(activeLeagueState);

  const teams = useRecoilValue(teamsState);
  const [sbBet, setSBBet] = useRecoilState(sbBetState);

  async function selectSBWinner(teamId: string) {
    setSBBet(teamId);
    return await fetchFromAPI("bet/superbowl", token, "POST", {
      teamId,
      league: league.id,
      year: 2022,
    });
  }

  return (
    <article className="py-4 ml-4 w-min">
      <h1 className="text-xl font-semibold">
        Wähle den Sieger des Superbowls:
      </h1>
      {teams.map((team) => (
        <button
          key={"SB" + team.id}
          disabled={new Date(2022, 8, 11, 19) < new Date()}
          className="team-l"
          style={styleByTeam(team, sbBet === team.id)}
          onClick={() => selectSBWinner(team.id)}
        >
          {team.logo && (
            <img
              src={process.env.REACT_APP_IMG_URL + team.logo}
              className="float-left"
              width="24"
              height="24"
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
    </article>
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

export default SbBet;
