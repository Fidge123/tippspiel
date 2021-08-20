import { createContext, useContext } from "react";
import { Bets, Bet, Action, ApiBet } from "../types";

export const TippDispatch = createContext<any>(null);
export const TippValues = createContext<any>(null);

export const initialTipps: Bets = {};

export function tippsReducer(state: Bets, action: Action): Bets {
  switch (action.type) {
    case "update":
      return { ...state, [action.payload.gameID]: action.payload.tipp };
    case "init":
      return { ...action.payload };
    default:
      throw new Error();
  }
}

export function useTipps(
  gameID: string,
  cb: (payload: ApiBet) => void
): [Bet, (tipp: Bet) => void] {
  const tipps = useContext(TippValues);
  const dispatch = useContext(TippDispatch);

  return [
    tipps[gameID] || { bets: { home: 0, away: 0 } },
    (tipp: Bet) => {
      cb({
        gameID,
        winner: tipp.selected,
        pointDiff: tipp.points,
      });
      dispatch({ type: "update", payload: { gameID, tipp } });
    },
  ];
}
