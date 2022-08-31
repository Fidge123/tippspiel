import { Fragment } from "react";
import { useRecoilValue, selector } from "recoil";
import { Game, IStats } from "../Schedule/types";
import { widthState } from "../State/states";

const isCompactState = selector<boolean>({
  key: "isCompact",
  get: ({ get }) => get(widthState) < 720,
});

function Stats({ game, stats }: Props) {
  const isCompact = useRecoilValue(isCompactState);

  const homeScore = game.homeScore;
  const awayScore = game.awayScore;
  const wonBy = Math.abs(homeScore - awayScore) || 0;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  const awayVotes = stats.filter((value) => value?.winner === "away");
  const homeVotes = stats.filter((value) => value?.winner === "home");

  return (
    <div className="flex flex-row text-gray-800 dark:text-gray-300 font-xs leading-tight">
      <div className="w-28 sm:w-36 md:w-60 font-xs truncate grid auto-rows-min gap-x-0.5 stat-grid-4">
        {awayVotes.length > 0 && (
          <span className="col-start-3 text-center">
            {isCompact ? "T" : "Tipp"}
          </span>
        )}
        {awayVotes.length > 0 && (
          <span className="text-center">{isCompact ? "P" : "Punkte"}</span>
        )}
        {awayVotes.map((value, i) => (
          <Fragment key={`away${i}`}>
            <span>{value?.name}</span>
            <span>{value?.doubler ? "🌟" : ""}</span>
            <span className="text-center">{value?.bet}</span>
            <span className="text-center">{value?.points}</span>
          </Fragment>
        ))}
      </div>
      <div className="flex w-16 sm:w-20 mx-1 items-center justify-center">
        {awayWon && "< "}
        {wonBy}
        {homeWon && " >"}
      </div>
      <div className="w-28 sm:w-36 md:w-60 font-xs truncate grid auto-rows-min gap-x-0.5 stat-grid-4">
        {homeVotes.length > 0 && (
          <span className="col-start-3 text-center">
            {isCompact ? "T" : "Tipp"}
          </span>
        )}
        {homeVotes.length > 0 && (
          <span className="text-center">{isCompact ? "P" : "Punkte"}</span>
        )}
        {homeVotes.map((value, i) => (
          <Fragment key={`home${i}`}>
            <span>{value?.name}</span>
            <span>{value?.doubler ? "🌟" : ""}</span>
            <span className="text-center">{value?.bet}</span>
            <span className="text-center">{value?.points}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

interface Props {
  game: Game;
  stats: Partial<IStats>[];
}

export default Stats;
