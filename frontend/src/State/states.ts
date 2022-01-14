import { atom } from "recoil";
import {
  Division,
  Team,
  Leaderboard,
  Bets,
  Stats,
  Week,
} from "./response-types";

function getToken() {
  try {
    const item = window.localStorage.getItem("access_token");
    if (item) {
      const payload = JSON.parse(window.atob(item.split(".")[1]));
      if (new Date(payload.exp * 1000) <= new Date()) {
        window.localStorage.setItem("access_token", "");
        return "";
      }
    }
    return item ? item : "";
  } catch (error) {
    console.log(error);
    return "";
  }
}

export const tokenState = atom<string>({
  key: "accessToken",
  default: getToken(),
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

export const gameBetsState = atom<Bets>({
  key: "gameBets",
  default: {},
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
