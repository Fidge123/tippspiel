import { createContext, useContext } from "react";
import { AllStats, IStats, Action } from "../types";

export const StatDispatch = createContext<any>(null);
export const StatValues = createContext<any>(null);

export const initialStats: AllStats = {};

export function statsReducer(state: AllStats, action: Action): AllStats {
  switch (action.type) {
    case "update":
      return { ...state, [action.payload.gameID]: action.payload.stats };
    case "init":
      return { ...action.payload };
    default:
      throw new Error();
  }
}

export function useStats(
  gameID: string
): [IStats[] | undefined, (stats: IStats[]) => void] {
  const stats = useContext(StatValues);
  const dispatch = useContext(StatDispatch);

  return [
    stats[gameID],
    (stats: IStats[]) => {
      dispatch({ type: "update", payload: { gameID, stats } });
    },
  ];
}
