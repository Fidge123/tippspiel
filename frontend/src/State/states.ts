import { atom, selector } from "recoil";
import {
  Division,
  Team,
  Leaderboard,
  Bets,
  Stats,
  Week,
} from "./response-types";

export const tokenState = atom<string>({
  key: "accessToken",
  default: "",
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
