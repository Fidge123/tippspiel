import { createContext, useContext } from "react";
import { Bets, Bet, Action, ApiBet } from "../types";

export const TippDispatch = createContext<any>(null);
export const TippValues = createContext<any>(null);

export const initialBets: Bets = {};

export function betsReducer(state: Bets, action: Action): Bets {
  switch (action.type) {
    case "update":
      return { ...state, [action.payload.gameID]: action.payload.bet };
    case "init":
      return { ...action.payload };
    default:
      throw new Error();
  }
}

export function useBets(
  gameID: string,
  cb: (payload: ApiBet) => void
): [Bet, (bet: Bet) => void] {
  const bets = useContext(TippValues);
  const dispatch = useContext(TippDispatch);

  return [
    bets[gameID] || { bets: { home: 0, away: 0 } },
    (bet: Bet) => {
      cb({
        gameID,
        winner: bet.selected,
        pointDiff: bet.points,
      });
      dispatch({ type: "update", payload: { gameID, bet: bet } });
    },
  ];
}
