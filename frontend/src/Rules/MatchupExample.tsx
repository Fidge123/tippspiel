import { useRecoilValue } from "recoil";

import { teamState } from "../State/states";
import { IStats, Game } from "../Schedule/types";

import Scores from "./ScoresExample";
import Stats from "./StatsExample";
import MatchupInput from "./MatchInputExample";
import TeamButton from "../Schedule/TeamButton";

function MatchUpExample({
  game,
  bets,
  setDoubler,
  setSelected,
  setPoints,
}: Props) {
  const home = useRecoilValue(teamState(`s:20~l:28~t:${game.homeTeam!.id}`));
  const away = useRecoilValue(teamState(`s:20~l:28~t:${game.awayTeam!.id}`));

  return (
    <div className="w-fit py-1">
      <div className="flex">
        <TeamButton
          team={away}
          selected={bets[0].winner === "away"}
          setSelected={() => {
            setSelected("away");
          }}
          disabled={false}
        ></TeamButton>
        <Scores
          game={game}
          selected={bets[0].winner}
          doubler={bets[0].doubler}
          setDoubler={setDoubler}
        ></Scores>
        <TeamButton
          team={home}
          selected={bets[0].winner === "home"}
          setSelected={() => {
            setSelected("home");
          }}
          disabled={false}
        ></TeamButton>
        <MatchupInput points={bets[0].bet} setPoints={setPoints}></MatchupInput>
      </div>
      <Stats game={game} stats={bets}></Stats>
    </div>
  );
}

interface Props {
  game: Game;
  bets: IStats[];
  setDoubler: (d: boolean) => void;
  setSelected: (d: "home" | "away") => void;
  setPoints: (d: number) => void;
}

export default MatchUpExample;
