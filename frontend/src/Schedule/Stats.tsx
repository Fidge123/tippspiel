import { useStats } from "./reducers/stats.reducer";
import "./Stats.css";
import { StatProps } from "./types";

function Stats({ game, bets, home, away, isCompact }: StatProps) {
  const [stats] = useStats(game.id);

  if (new Date(game.date) < new Date() && stats) {
    const finished = game.status === "STATUS_FINAL";
    const homeScore = game.homeScore;
    const awayScore = game.awayScore;
    const wonBy = Math.abs(homeScore - awayScore) || 0;
    const homeWon = homeScore > awayScore;
    const awayWon = awayScore > homeScore;

    const awayVotes = Object.entries(stats)
      .filter(([key, value]) => value.winner === "away")
      .sort(([ak, av], [bk, bv]) =>
        finished
          ? Math.abs(av.tipp - wonBy) - Math.abs(bv.tipp - wonBy)
          : bv.tipp - av.tipp
      );
    const homeVotes = Object.entries(stats)
      .filter(([key, value]) => value.winner === "home")
      .sort(([ak, av], [bk, bv]) =>
        finished
          ? Math.abs(av.tipp - wonBy) - Math.abs(bv.tipp - wonBy)
          : bv.tipp - av.tipp
      );

    return (
      <div className="stats">
        <div className="away">
          {awayVotes.map(([key, value], i) => (
            <div key={`away-${i}`} className="stat-row">
              <span>{value.name}</span>
              <span>
                {isCompact ? "T" : "Tipp: "}
                {value.tipp}
              </span>
              {awayWon && finished && (
                <span>
                  {isCompact ? "D" : "Distanz: "}
                  {Math.abs(value.tipp - wonBy)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="scores">
          {finished && awayWon && "< "}
          {finished && wonBy}
          {finished && homeWon && " >"}
        </div>
        <div className="home">
          {homeVotes.map(([key, value], i) => (
            <div key={`home-${i}`} className="stat-row">
              <span>{value.name}</span>
              <span>
                {isCompact ? "T" : "Tipp: "}
                {value.tipp}
              </span>
              {homeWon && finished && (
                <span>
                  {isCompact ? "D" : "Distanz: "}
                  {Math.abs(value.tipp - wonBy)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="stats">
      <div className="away">
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
      <div className="scores"></div>
      <div className="home">
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
