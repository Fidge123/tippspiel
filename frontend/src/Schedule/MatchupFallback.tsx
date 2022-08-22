import { lazy } from "react";
import { Game } from "./types";

const Scores = lazy(() => import("./Scores"));
const MatchupInput = lazy(() => import("./MatchupInput"));
const TeamButton = lazy(() => import("./TeamButton"));

function MatchupFallback({ game, weekId }: Props) {
  return (
    <div className="w-fit flex py-1">
      <TeamButton
        selected={false}
        setSelected={() => {}}
        disabled={true}
      ></TeamButton>
      <Scores game={game} weekId={weekId}></Scores>
      <TeamButton
        selected={false}
        setSelected={() => {}}
        disabled={true}
      ></TeamButton>
      <MatchupInput game={game}></MatchupInput>
    </div>
  );
}

interface Props {
  game: Game;
  weekId: string;
}

export default MatchupFallback;
