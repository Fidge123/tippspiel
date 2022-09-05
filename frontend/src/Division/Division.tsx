import {
  Division as DivisionType,
  DivisionBet,
  Team,
} from "../State/response-types";

function Division({ division, divisionBets, setDivisionBets }: Props) {
  function getIndex(teamId: string) {
    const index =
      divisionBets?.teams.findIndex((t) => t?.id === teamId) ??
      division.teams.findIndex((t) => t?.id === teamId);

    return index === -1 ? 4 : index;
  }

  return (
    <section>
      <h2 className="text-lg">{division.name}</h2>
      {[...division.teams]
        .sort((a, b) => getIndex(a.id) - getIndex(b.id))
        // .sort((a, b) => a.playoffSeed - b.playoffSeed)
        .map((team, i) => (
          <div
            key={"Div" + team.id}
            className="flex items-center justify-between pr-0 rounded team-l"
            style={styleByTeam(
              team,
              divisionBets?.teams.some((t) => t?.id === team.id)
            )}
          >
            {team.logo && (
              <img
                src={process.env.REACT_APP_IMG_URL + team.logo}
                width="24"
                height="24"
                alt="logo home team"
                onError={(event: any) => (event.target.style.display = "none")}
              ></img>
            )}
            <span
              className={
                divisionBets?.teams.some((t) => t?.id === team.id)
                  ? "text-gray-50"
                  : ""
              }
            >
              <span className="font-semibold">{team.name}</span>
              {` ${team.wins}-${team.losses}${
                team.ties > 0 ? "-" + team.ties : ""
              }`}
            </span>
            <span className="space-x-0.5">
              <button
                className="p-0 text-xl bg-transparent border-0 disabled:opacity-50"
                disabled={new Date(2022, 8, 11, 19) < new Date() || i === 0}
                onClick={() => {
                  setDivisionBets({
                    name: division.name,
                    teams: [...division.teams].sort((a, b) => {
                      let aIndex = getIndex(a.id);
                      let bIndex = getIndex(b.id);
                      if (a.id === team.id) {
                        aIndex -= 1.1;
                      }
                      if (b.id === team.id) {
                        bIndex -= 1.1;
                      }
                      return aIndex - bIndex;
                    }),
                  });
                }}
              >
                ⬆️
              </button>
              <button
                className="text-xl bg-transparent border-0 disabled:opacity-50"
                disabled={new Date(2022, 8, 11, 19) < new Date() || i === 3}
                onClick={() => {
                  setDivisionBets({
                    name: division.name,
                    teams: [...division.teams].sort((a, b) => {
                      let aIndex = getIndex(a.id);
                      let bIndex = getIndex(b.id);
                      if (a.id === team.id) {
                        aIndex += 1.1;
                      }
                      if (b.id === team.id) {
                        bIndex += 1.1;
                      }
                      return aIndex - bIndex;
                    }),
                  });
                }}
              >
                ⬇️
              </button>
            </span>
          </div>
        ))}
    </section>
  );
}

interface Props {
  division: DivisionType;
  divisionBets?: DivisionBet;
  setDivisionBets: (teams: DivisionBet) => void;
}

function styleByTeam(team: Team | undefined, betSubmitted: boolean = false) {
  return betSubmitted
    ? {
        borderColor: `#${team?.color2}ff`,
        backgroundColor: `#${team?.color1}aa`,
        opacity: 1,
      }
    : {
        borderColor: `#${team?.color1 || "000000"}ff`,
      };
}

export default Division;
