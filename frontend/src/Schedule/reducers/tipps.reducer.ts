import { createContext, useContext } from "react";
import { Tipps, Tipp, Action, APITipp } from "../types";

export const TippDispatch = createContext<any>(null);
export const TippValues = createContext<any>(null);

export const initialTipps: Tipps = {};

export function tippsReducer(state: Tipps, action: Action): Tipps {
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
  cb: (payload: APITipp) => void
): [Tipp, (tipp: Tipp) => void] {
  const tipps = useContext(TippValues);
  const dispatch = useContext(TippDispatch);

  return [
    tipps[gameID] || { votes: { home: 0, away: 0 } },
    (tipp: Tipp) => {
      cb({
        game: gameID,
        winner: tipp.selected,
        pointDiff: tipp.points,
      });
      dispatch({ type: "update", payload: { gameID, tipp } });
    },
  ];
}
