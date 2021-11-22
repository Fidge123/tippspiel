import { useStats } from "./reducers/stats.reducer";
import { StatProps } from "./types";

function Stats({ game, bets, home, away, isCompact, hidden }: StatProps) {
  const [stats] = useStats(game.id);

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
      <div className="flex flex-row dark:text-gray-300">
        <div className="w-7r sm:w-8.5r md:w-14.5r py-1.5 px-0.5">
          {awayVotes.map((value, i) => (
            <div key={`away-${i}`} className="flex justify-between">
              <span className="w-20 truncate font-xs">
                {value.name}
                {value.doubler ? "🌟" : ""}
              </span>
              <span className="w-8 md:w-20 font-xs">
                {isCompact ? "T" : "Tipp: "}
                {value.bet}
              </span>
              {finished && (
                <span className="w-8 md:w-20 font-xs">
                  {isCompact ? "P" : "Punkte: "}
                  {value.points}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex w-16 sm:w-20 mx-1 items-center justify-center">
          {finished && awayWon && "< "}
          {finished && wonBy}
          {finished && homeWon && " >"}
        </div>
        <div className="w-7r sm:w-8.5r md:w-14.5r py-1.5 px-0.5">
          {homeVotes.map((value, i) => (
            <div key={`home-${i}`} className="flex justify-between">
              <span className="w-20 truncate font-xs">
                {value.doubler ? "🌟" : ""}
                {value.name}
              </span>
              <span className="w-8 md:w-20 font-xs">
                {isCompact ? "T" : "Tipp: "}
                {value.bet}
              </span>
              {finished && (
                <span className="w-8 md:w-20 font-xs">
                  {isCompact ? "P" : "Punkte: "}
                  {value.points}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-row dark:text-gray-300">
      <div className="w-7r sm:w-8.5r md:w-14.5r py-1.5 px-0.5">
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
      <div className="w-7r sm:w-8.5r md:w-14.5r py-1.5 px-0.5">
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
