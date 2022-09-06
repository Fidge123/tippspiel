import { LBResponse, Leaderboard } from "./response-types";

function formatBet(bet: any) {
  return {
    first: {
      logo: bet?.first?.logo
        ? process.env.REACT_APP_IMG_URL + bet?.first?.logo
        : null,
    },
    second: {
      logo: bet?.second?.logo
        ? process.env.REACT_APP_IMG_URL + bet?.second?.logo
        : null,
    },
    third: {
      logo: bet?.third?.logo
        ? process.env.REACT_APP_IMG_URL + bet?.third?.logo
        : null,
    },
    fourth: {
      logo: bet?.fourth?.logo
        ? process.env.REACT_APP_IMG_URL + bet?.fourth?.logo
        : null,
    },
    points: bet?.points || 0,
  };
}

function formatSbBet(bet: any) {
  return {
    logo: bet?.second?.logo
      ? process.env.REACT_APP_IMG_URL + bet?.second?.logo
      : null,
    points: bet?.points || 0,
  };
}

function sum(list: number[]) {
  return list.reduce((a, b) => a + b, 0);
}

export function formatLb(res: LBResponse[]): Leaderboard[] {
  return res
    .map((user) => ({
      name: user.user,
      points:
        user.bets.reduce((prev, { points }) => prev + sum(points), 0) +
        user.divBets.reduce((p, c) => p + c.points, 0) +
        user.sbBet.points,
      correct: user.bets.reduce((a, b) => (b.points[0] > 0 ? a + 1 : a), 0),
      exact: user.bets.reduce((a, b) => (b.points[1] > 0 ? a + 1 : a), 0),
      offThree: user.bets.reduce((a, b) => (b.points[2] > 0 ? a + 1 : a), 0),
      offSix: user.bets.reduce((a, b) => (b.points[3] > 0 ? a + 1 : a), 0),
      doubler: user.bets.reduce(
        (a, b) =>
          b.points[0] === 4 ? a + b.points.reduce((a, b) => a + b) / 2 : a,
        0
      ),
      total: user.bets.length,
      divBets: [
        formatBet(user.divBets.find((bet) => bet.name === "AFC North")),
        formatBet(user.divBets.find((bet) => bet.name === "AFC South")),
        formatBet(user.divBets.find((bet) => bet.name === "AFC West")),
        formatBet(user.divBets.find((bet) => bet.name === "AFC East")),
        formatBet(user.divBets.find((bet) => bet.name === "NFC North")),
        formatBet(user.divBets.find((bet) => bet.name === "NFC South")),
        formatBet(user.divBets.find((bet) => bet.name === "NFC West")),
        formatBet(user.divBets.find((bet) => bet.name === "NFC East")),
      ],
      sbBet: formatSbBet(user.sbBet),
    }))
    .sort((a, b) =>
      a.points === b.points ? b.total - a.total : b.points - a.points
    );
}
