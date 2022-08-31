import { useState } from "react";
import { useRecoilValue } from "recoil";

import { teamState } from "../State/states";
import { Game } from "../Schedule/types";

import Scores from "./ScoresExample";
import Stats from "./StatsExample";
import MatchupInput from "./MatchInputExample";
import TeamButton from "../Schedule/TeamButton";

function MatchUpExample({ game, doubler }: Props) {
  const home = useRecoilValue(teamState(`s:20~l:28~t:${game.homeTeam!.id}`));
  const away = useRecoilValue(teamState(`s:20~l:28~t:${game.awayTeam!.id}`));
  const [selected, setSelected] = useState<"home" | "away">("home");
  const [points, setPoints] = useState(3);

  function getScore() {
    let mult = doubler[0] === game.id ? 2 : 1;
    if (game.homeScore > game.awayScore) {
      return selected === "home" ? points * mult : -points;
    }
    if (game.awayScore > game.homeScore) {
      return selected === "away" ? points * mult : -points;
    }
    return 0;
  }

  return (
    <div className="w-fit py-1">
      <div className="flex">
        <TeamButton
          team={away}
          selected={selected === "away"}
          setSelected={() => {
            setSelected("away");
          }}
          disabled={false}
        ></TeamButton>
        <Scores game={game} selected={selected} doubler={doubler}></Scores>
        <TeamButton
          team={home}
          selected={selected === "home"}
          setSelected={() => {
            setSelected("home");
          }}
          disabled={false}
        ></TeamButton>
        <MatchupInput points={points} setPoints={setPoints}></MatchupInput>
      </div>
      <Stats
        game={game}
        stats={[
          {
            name: "Spieler 1",
            winner: selected,
            doubler: doubler[0] === game.id,
            bet: points,
            points: getScore(),
          },
        ]}
      ></Stats>
    </div>
  );
}

interface Props {
  game: Game;
  doubler: [string | undefined, Function];
}

export default MatchUpExample;
