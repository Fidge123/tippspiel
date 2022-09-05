import { useRecoilValue } from "recoil";
import { activeLeagueState } from "./State/states";

function LeagueDisplay() {
  const league = useRecoilValue(activeLeagueState);

  return <span className="text-xs text-center text-white">{league.name}</span>;
}

export default LeagueDisplay;
