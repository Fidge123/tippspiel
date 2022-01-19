import { Fragment } from "react";
import { useRecoilValue } from "recoil";
import { statsState } from "../State/states";
import { StatProps } from "./types";

function Stats({ game, bets, home, away, isCompact, hidden }: StatProps) {
  const stats = useRecoilValue(statsState(game.id));

  if (new Date(game.date) < new Date() && stats) {
    const finished = !hidden && game.status === "STATUS_FINAL";
    const homeScore = game.homeScore;
    const awayScore = game.awayScore;
    const wonBy = Math.abs(homeScore - awayScore) || 0;
    const homeWon = homeScore > awayScore;
    const awayWon = awayScore > homeScore;

    const awayVotes = stats
      .filter((value) => value.winner === "away")
      .sort((a, b) =>
        finished
          ? Math.abs(a.bet - wonBy) - Math.abs(b.bet - wonBy)
          : b.bet - a.bet
      );
    const homeVotes = stats
      .filter((value) => value.winner === "home")
      .sort((a, b) =>
        finished
          ? Math.abs(a.bet - wonBy) - Math.abs(b.bet - wonBy)
          : b.bet - a.bet
      );

    return (
      <div className="flex flex-row text-gray-800 dark:text-gray-300 font-xs leading-tight">
        <div
          className={`w-7r sm:w-8.5r md:w-14.5r font-xs truncate grid auto-rows-min gap-x-0.5 ${
            finished ? "stat-grid-4" : "stat-grid-3"
          } `}
        >
          {awayVotes.length > 0 && (
            <span className="col-start-3 text-center">
              {isCompact ? "T" : "Tipp"}
            </span>
          )}
          {awayVotes.length > 0 && finished && (
            <span className="text-center">{isCompact ? "P" : "Punkte"}</span>
          )}
          {awayVotes.map((value, i) => (
            <Fragment key={`away${i}`}>
              <span>{value.name}</span>
              <span>{value.doubler ? "🌟" : ""}</span>
              <span className="text-center">{value.bet}</span>
              {finished && <span className="text-center">{value.points}</span>}
            </Fragment>
          ))}
        </div>
        <div className="flex w-16 sm:w-20 mx-1 items-center justify-center">
          {finished && awayWon && "< "}
          {finished && wonBy}
          {finished && homeWon && " >"}
        </div>
        <div
          className={`w-7r sm:w-8.5r md:w-14.5r font-xs truncate grid auto-rows-min gap-x-0.5 ${
            finished ? "stat-grid-4" : "stat-grid-3"
          }`}
        >
          {homeVotes.length > 0 && (
            <span className="col-start-3 text-center">
              {isCompact ? "T" : "Tipp"}
            </span>
          )}
          {homeVotes.length > 0 && finished && (
            <span className="text-center">{isCompact ? "P" : "Punkte"}</span>
          )}
          {homeVotes.map((value, i) => (
            <Fragment key={`home${i}`}>
              <span>{value.name}</span>
              <span>{value.doubler ? "🌟" : ""}</span>
              <span className="text-center">{value.bet}</span>
              {finished && <span className="text-center">{value.points}</span>}
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-row dark:text-gray-300">
      <div className="w-7r sm:w-8.5r md:w-14.5r px-0.5">
        <div>
          {bets.away || "0"} {bets.away === 1 ? "Stimme" : "Stimmen"}
        </div>
        {away && (
          <div>
            W-L{away.ties > 0 ? "-T" : ""}: {away.wins}-{away.losses}
            {away.ties > 0 ? "-" + away.ties : ""}
          </div>
        )}
      </div>
      <div className="flex w-16 sm:w-20 mx-1 items-center justify-center"></div>
      <div className="w-7r sm:w-8.5r md:w-14.5r px-0.5">
        <div>
          {bets.home || "0"} {bets.home === 1 ? "Stimme" : "Stimmen"}
        </div>
        {home && (
          <div>
            W-L{home.ties > 0 ? "-T" : ""}: {home.wins}-{home.losses}
            {home.ties > 0 ? "-" + home.ties : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;
