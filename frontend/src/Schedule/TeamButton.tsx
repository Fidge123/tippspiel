import { useRecoilValue } from "recoil";

import { widthState } from "../State/states";
import { Team } from "./types";

function TeamButton({ team, disabled, selected, setSelected }: Props) {
  const innerWidth = useRecoilValue(widthState);

  return (
    <button
      className="team"
      disabled={disabled}
      style={styleByTeam(team, selected)}
      onClick={() => setSelected()}
    >
      {team?.logo && (
        <img
          src={process.env.REACT_APP_IMG_URL + team.logo}
          className="float-left"
          alt={`${team.name} logo`}
          width="24"
          height="24"
          loading="lazy"
          onError={(event: any) => (event.target.style.display = "none")}
        ></img>
      )}
      <span className={selected ? "font-semibold text-gray-50" : ""}>
        {innerWidth > 720 && team?.name}
        {innerWidth < 720 && innerWidth > 448 && team?.shortName}
        {innerWidth < 448 && team?.abbreviation}
      </span>
    </button>
  );
}

function styleByTeam(team: Team | undefined, selected: boolean) {
  return selected
    ? {
        borderColor: `#${team?.color2}ff`,
        backgroundColor: `#${team?.color1}aa`,
      }
    : {
        borderColor: `#${team?.color1 || "000000"}ff`,
      };
}

interface Props {
  team?: Team;
  disabled: boolean;
  selected: boolean;
  setSelected: Function;
}

export default TeamButton;
