import { atom, atomFamily, DefaultValue } from "recoil";
import { fetchFromAPI } from "../api";
import { ApiBet } from "../Schedule/types";
import {
  Division,
  Team,
  Leaderboard,
  Bet,
  Stats,
  Week,
} from "./response-types";

export const tokenState = atom<string>({
  key: "accessToken",
  default: "",
  effects_UNSTABLE: [
    ({ setSelf, resetSelf, onSet }) => {
      const item = window.localStorage.getItem("access_token");
      if (item) {
        const payload = JSON.parse(window.atob(item.split(".")[1]));
        if (new Date(payload.exp * 1000) <= new Date()) {
          resetSelf();
        }
        setSelf(item);
      }

      onSet((newValue, _, isReset) =>
        window.localStorage.setItem("access_token", isReset ? "" : newValue)
      );
    },
  ],
});

export const divisionsState = atom<Division[]>({
  key: "divisions",
  default: [],
});

export const teamsState = atom<Team[]>({
  key: "teams",
  default: [],
});

export const leaderboardState = atom<Leaderboard[]>({
  key: "leaderboard",
  default: [],
});

export const weeksState = atom<Week[]>({
  key: "weeks",
  default: [],
});

export const statsState = atom<Stats>({
  key: "stats",
  default: {},
});

export const gameBetsState = atomFamily<Bet, string>({
  key: "gameBets",
  default: { id: "", bets: { home: 0, away: 0 } },
  effects_UNSTABLE: (gameID) => [
    ({ onSet, getPromise }) => {
      onSet((bet, old) => {
        if (
          !(old instanceof DefaultValue) &&
          old.id !== "" &&
          JSON.stringify(bet) !== JSON.stringify(old) &&
          bet.points &&
          bet.selected
        ) {
          const body: ApiBet = {
            gameID,
            winner: bet.selected,
            pointDiff: bet.points,
          };
          fetchFromAPI("bet", getPromise(tokenState), "POST", body, true);
        }
      });
    },
  ],
});

export const doublerState = atom<any>({
  key: "doubler",
  default: {},
});

export const divisionBetsState = atom<Record<string, string>>({
  key: "divisionBets",
  default: {},
});

export const sbBetState = atom<string>({
  key: "sbBet",
  default: "",
});

export const userState = atom<any>({
  key: "user",
  default: {},
});

export const innerWidth = atom<number>({
  key: "innerWidth",
  default: window.innerWidth,
});
