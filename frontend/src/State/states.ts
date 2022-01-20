import {
  atom,
  atomFamily,
  DefaultValue,
  selector,
  selectorFamily,
} from "recoil";
import { fetchFromAPI } from "../api";
import { ApiBet } from "../Schedule/types";
import {
  Division,
  Team,
  Leaderboard,
  Bet,
  Stat,
  Week,
  UserSettings,
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
  default: selector({
    key: "divisions/Default",
    get: async ({ get }) =>
      (await fetchFromAPI<Division[]>("division", get(tokenState))).sort(
        (divA, divB) => divA.name.localeCompare(divB.name)
      ),
  }),
});

export const teamsState = selector<Team[]>({
  key: "teams",
  get: ({ get }) =>
    get(divisionsState).reduce(
      (result, curr) => [...result, ...curr.teams],
      [] as Team[]
    ),
});

export const leaderboardState = atom<Leaderboard[]>({
  key: "leaderboard",
  default: [],
});

export const weeksState = atom<Week[]>({
  key: "weeks",
  default: [],
});

export const statsState = atomFamily<Stat[], string>({
  key: "stats",
  default: [],
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

export const doublerState = atomFamily<
  string | undefined,
  [number, number, number]
>({
  key: "doubler",
  default: undefined,
  effects_UNSTABLE: ([week, seasontype, year]) => [
    ({ onSet, getPromise }) => {
      onSet((doubler, old) => {
        if (
          !(old instanceof DefaultValue) &&
          old !== undefined &&
          JSON.stringify(doubler) !== JSON.stringify(old)
        ) {
          fetchFromAPI(
            "bet/doubler",
            getPromise(tokenState),
            "POST",
            {
              gameID: doubler,
              week: {
                week,
                year,
                seasontype,
              },
            },
            true
          );
        }
      });
    },
  ],
});

export const divisionBetsState = atom<Record<string, string>>({
  key: "divisionBets",
  default: selector({
    key: "divisionBets/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Record<string, string>>(
        "bet/division?season=2021",
        get(tokenState)
      ),
  }),
});

export const sbBetState = atom<string>({
  key: "sbBet",
  default: selector({
    key: "sbBet/Default",
    get: async ({ get }) =>
      (await fetchFromAPI("bet/superbowl?season=2021", get(tokenState)))?.team
        ?.id,
  }),
});

export const hiddenState = selectorFamily<boolean, string>({
  key: "hidden",
  get:
    (weekId) =>
    ({ get }) => {
      const { hidden } = get(userState);
      return hidden && typeof hidden[weekId] !== "undefined"
        ? hidden[weekId]
        : true;
    },

  set:
    (weekId) =>
    ({ get, set }, newValue) => {
      fetchFromAPI(
        "user/hidden",
        get(tokenState),
        "POST",
        {
          hidden: newValue,
          weekId,
        },
        true
      );

      set(userState, {
        ...get(userState),
        hidden: {
          ...get(userState).hidden,
          [weekId]: !!newValue, // FIXME
        },
      });
    },
});

export const userState = atom<UserSettings>({
  key: "user",
  default: {},
});

export const innerWidth = atom<number>({
  key: "innerWidth",
  default: window.innerWidth,
});
