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
      <div className="stats">
        <div className="away">
          {awayVotes.map((value, i) => (
            <div key={`away-${i}`} className="stat-row">
              <span>
                {value.name}
                {value.doubler ? "🌟" : ""}
              </span>
              <span>
                {isCompact ? "T" : "Tipp: "}
                {value.bet}
              </span>
              {finished && (
                <span>
                  {isCompact ? "P" : "Punkte: "}
                  {value.points}
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
          {homeVotes.map((value, i) => (
            <div key={`home-${i}`} className="stat-row">
              <span>
                {value.name}
                {value.doubler ? "🌟" : ""}
              </span>
              <span>
                {isCompact ? "T" : "Tipp: "}
                {value.bet}
              </span>
              {finished && (
                <span>
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
