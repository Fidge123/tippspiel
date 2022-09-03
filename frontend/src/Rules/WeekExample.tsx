import { useState } from "react";
import { Game, IStats } from "../Schedule/types";
import MatchUp from "./MatchupExample";

function WeekExample() {
  const [gamesAndBets, setGamesAndBets] = useState([
    createGameAndBets(1, 24, 12),
    createGameAndBets(3, 7, 7),
    createGameAndBets(5, 44, 45),
    createGameAndBets(7, 3, 12),
  ]);

  return (
    <>
      <p className="pb-4">Lade die Seite neu um die Tipps neu zu generieren.</p>
      {gamesAndBets.map(([game, bets], i) => (
        <MatchUp
          key={game.id}
          game={game}
          bets={bets}
          setSelected={(winner) =>
            setGamesAndBets([
              ...gamesAndBets.slice(0, i),
              [
                game,
                calcAllPoints(
                  [
                    {
                      ...bets[0],
                      winner,
                      points: calcPoints({ ...bets[0], winner }, bets, game),
                    },
                    ...bets.slice(1),
                  ],
                  game
                ),
              ],
              ...gamesAndBets.slice(i + 1),
            ])
          }
          setDoubler={(doubler) =>
            setGamesAndBets([
              ...setDoublerToFalse(gamesAndBets.slice(0, i)),
              [
                game,
                calcAllPoints(
                  [
                    {
                      ...bets[0],
                      doubler,
                      points: calcPoints({ ...bets[0], doubler }, bets, game),
                    },
                    ...bets.slice(1),
                  ],
                  game
                ),
              ],
              ...setDoublerToFalse(gamesAndBets.slice(i + 1)),
            ])
          }
          setPoints={(bet) =>
            setGamesAndBets([
              ...gamesAndBets.slice(0, i),
              [
                game,
                calcAllPoints(
                  [
                    {
                      ...bets[0],
                      bet,
                      points: calcPoints({ ...bets[0], bet }, bets, game),
                    },
                    ...bets.slice(1),
                  ],
                  game
                ),
              ],
              ...gamesAndBets.slice(i + 1),
            ])
          }
        ></MatchUp>
      ))}
      <h2 className="pt-4">Beispiel Punktestand</h2>
      <ul className="pl-4 list-disc">
        <li>
          Spieler 1: vorher 4, danach{" "}
          {4 +
            gamesAndBets
              .map(([, bet]) => bet.find((b) => b.name === "Spieler 1"))
              .reduce((a, b) => a + (b?.points ?? -1), 0)}
        </li>
        <li>
          Spieler 2: 29 ➡️{" "}
          {29 +
            gamesAndBets
              .map(([, bet]) => bet.find((b) => b.name === "Spieler 2"))
              .reduce((a, b) => a + (b?.points ?? -1), 0)}
        </li>
        <li>
          Spieler 3: -9 ➡️{" "}
          {-9 +
            gamesAndBets
              .map(([, bet]) => bet.find((b) => b.name === "Spieler 3"))
              .reduce((a, b) => a + (b?.points ?? -1), 0)}
        </li>
      </ul>
    </>
  );
}

function setDoublerToFalse(input: [Game, IStats[]][]): [Game, IStats[]][] {
  return input.map(([game, bets]) => [
    game,
    [
      {
        ...bets[0],
        doubler: false,
        points: calcPoints({ ...bets[0], doubler: false }, bets, game),
      },
      ...calcAllPoints(bets.slice(1), game),
    ],
  ]);
}

function calcPoints(bet: IStats, bets: IStats[], game: Game) {
  let mult = bet.doubler ? 2 : 1;
  if (bet.bet && game.homeScore > game.awayScore) {
    if (bet.winner === "home") {
      return bets.filter((bet) => bet.winner === "home").length * 3 <=
        bets.length
        ? (bet.bet + 1) * mult
        : bet.bet * mult;
    }
    return -bet.bet;
  }
  if (bet.bet && game.awayScore > game.homeScore) {
    if (bet.winner === "away") {
      return bets.filter((bet) => bet.winner === "away").length * 3 <=
        bets.length
        ? (bet.bet + 1) * mult
        : bet.bet * mult;
    }
    return -bet.bet;
  }
  if (bet.bet && game.awayScore === game.homeScore) {
    return 0;
  }
  return -1;
}

function getRandomBet() {
  return Math.floor(Math.random() * (5 - 1 + 1)) + 1;
}

function createGameAndBets(
  index: number,
  score1: number,
  score2: number
): [Game, IStats[]] {
  const game = {
    id: index.toString(),
    date: "",
    homeTeam: {
      id: (index + 1).toString(),
      name: "",
    },
    awayTeam: {
      id: (index + 2).toString(),
      name: "",
    },
    homeScore: score1,
    awayScore: score2,
    status: "STATUS_FINAL",
  };

  return [
    game,
    calcAllPoints(
      [
        createBetWithoutPoints("Spieler 1"),
        createBetWithoutPoints("Spieler 2"),
        createBetWithoutPoints("Spieler 3"),
      ],
      game
    ),
  ];
}

function calcAllPoints(bets: IStats[], game: Game) {
  return bets.map((bet, _, bets) => ({
    ...bet,
    points: calcPoints(bet, bets, game),
  }));
}

function createBetWithoutPoints(name: string) {
  return {
    name,
    winner: Math.random() > 0.5 ? "home" : "away",
    doubler: false,
    bet: getRandomBet(),
  } as IStats;
}

export default WeekExample;
