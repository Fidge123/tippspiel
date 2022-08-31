import { useState } from "react";
import { Game, IStats } from "../Schedule/types";
import MatchUp from "./MatchupExample";

function WeekExample() {
  const [gamesAndBets, setGamesAndBets] = useState([
    createGameAndBets(1, 24, 12),
    createGameAndBets(3, 7, 7),
    createGameAndBets(5, 44, 45),
  ]);

  return (
    <>
      <p>
        Ausgangspunktestand Spieler 1 (4), Spieler 2 (29) und Spieler 3 (-9)
      </p>
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
                [
                  {
                    ...bets[0],
                    winner,
                    points: calcPoints({ ...bets[0], winner }, game),
                  },
                  ...bets.slice(1),
                ],
              ],
              ...gamesAndBets.slice(i + 1),
            ])
          }
          setDoubler={(doubler) =>
            setGamesAndBets([
              ...setDoublerToFalse(gamesAndBets.slice(0, i)),
              [
                game,
                [
                  {
                    ...bets[0],
                    doubler,
                    points: calcPoints({ ...bets[0], doubler }, game),
                  },
                  ...bets.slice(1),
                ],
              ],
              ...setDoublerToFalse(gamesAndBets.slice(i + 1)),
            ])
          }
          setPoints={(bet) =>
            setGamesAndBets([
              ...gamesAndBets.slice(0, i),
              [
                game,
                [
                  {
                    ...bets[0],
                    bet,
                    points: calcPoints({ ...bets[0], bet }, game),
                  },
                  ...bets.slice(1),
                ],
              ],
              ...gamesAndBets.slice(i + 1),
            ])
          }
        ></MatchUp>
      ))}
      <p>
        Endpunktestand Spieler 1 (
        {4 +
          gamesAndBets
            .map(([, bet]) => bet.find((b) => b.name === "Spieler 1"))
            .reduce((a, b) => a + (b?.points ?? -1), 0)}
        ), Spieler 2 (
        {29 +
          gamesAndBets
            .map(([, bet]) => bet.find((b) => b.name === "Spieler 2"))
            .reduce((a, b) => a + (b?.points ?? -1), 0)}
        ) und Spieler 3 (
        {-9 +
          gamesAndBets
            .map(([, bet]) => bet.find((b) => b.name === "Spieler 3"))
            .reduce((a, b) => a + (b?.points ?? -1), 0)}
        )
      </p>
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
        points: calcPoints({ ...bets[0], doubler: false }, game),
      },
      ...bets.slice(1),
    ],
  ]);
}

function calcPoints(bet: IStats, game: Game) {
  let mult = bet.doubler ? 2 : 1;
  if (bet.bet && game.homeScore > game.awayScore) {
    return bet.winner === "home" ? bet.bet * mult : -bet.bet;
  }
  if (bet.bet && game.awayScore > game.homeScore) {
    return bet.winner === "away" ? bet.bet * mult : -bet.bet;
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

  const bet1 = {
    name: "Spieler 1",
    winner: "home",
    doubler: false,
    bet: getRandomBet(),
  } as IStats;

  const bet2 = {
    name: "Spieler 2",
    winner: "away",
    doubler: false,
    bet: getRandomBet(),
  } as IStats;

  const bet3 = {
    name: "Spieler 3",
    winner: "home",
    doubler: false,
    bet: getRandomBet(),
  } as IStats;

  return [
    game,
    [
      {
        ...bet1,
        points: calcPoints(bet1, game),
      },
      {
        ...bet2,
        points: calcPoints(bet2, game),
      },
      {
        ...bet3,
        points: calcPoints(bet3, game),
      },
    ],
  ];
}

export default WeekExample;
