import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { refresh, fetchFromAPI } from "../api";
import { ApiBet } from "../Schedule/types";
import {
  Division,
  Team,
  Leaderboard,
  Bet,
  Stat,
  Stats,
  Week,
  UserSettings,
  Doubler,
} from "./response-types";
import { formatLb } from "./util";

export const tokenState = atom<string>({
  key: "accessToken",
  default: window.localStorage.getItem("access_token") || "",
  effects: [
    ({ setSelf, onSet }) => {
      const item = window.localStorage.getItem("access_token");
      const refreshSelf = async () => {
        const token = await refresh();
        if (token) {
          setSelf(token);
          window.localStorage.setItem("access_token", token);
        }
      };

      if (item) {
        const payload = JSON.parse(window.atob(item.split(".")[1]));
        if (new Date(payload.exp * 1000) <= new Date()) {
          refreshSelf();
        } else {
          setSelf(item);
        }
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
  default: selector({
    key: "leaderboard/Default",
    get: async ({ get }) =>
      formatLb(await fetchFromAPI("leaderboard/2021", get(tokenState))),
  }),
});

export const weeksState = atom<Week[]>({
  key: "weeks",
  default: selector({
    key: "weeks/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Week[]>("schedule/2021", get(tokenState)),
  }),
});

export const statsState = atom<Stats>({
  key: "stats",
  default: selector({
    key: "stats/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Stats>(
        "leaderboard/games?season=2021",
        get(tokenState)
      ),
  }),
});

export const statState = selectorFamily<Stat[], string>({
  key: "stat",
  get:
    (gameId) =>
    ({ get }) =>
      get(statsState)[gameId],
});

export const allGameBetsState = atom<Bet[]>({
  key: "allGameBets",
  default: selector({
    key: "allGameBets/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Bet[]>("bet?season=2021", get(tokenState)),
  }),
});

export const gameBetsState = selectorFamily<Bet, string>({
  key: "gameBets",
  get:
    (gameId) =>
    ({ get }) =>
      get(allGameBetsState).find((bet) => bet.id === gameId) || {
        id: "",
        bets: { home: 0, away: 0 },
      },
  set:
    (gameId) =>
    ({ set, get }, newValue) => {
      if (
        !(newValue instanceof DefaultValue) &&
        JSON.stringify(get(gameBetsState(gameId))) !== JSON.stringify(newValue)
      ) {
        set(allGameBetsState, [
          ...get(allGameBetsState).filter((bet: Bet) => bet.id !== gameId),
          newValue,
        ]);

        if (newValue.points && newValue.selected) {
          const body: ApiBet = {
            gameId: gameId,
            winner: newValue.selected,
            pointDiff: newValue.points,
          };
          fetchFromAPI("bet", get(tokenState), "POST", body, true);
        }
      }
    },
});

export const doublersState = atom<Doubler[]>({
  key: "doublers",
  default: selector({
    key: "doublers/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Doubler[]>("bet/doubler?season=2021", get(tokenState)),
  }),
});

export const doublerState = selectorFamily<string, string>({
  key: "doubler",
  get:
    (weekId) =>
    ({ get }) =>
      get(doublersState).find(({ week }) => week === weekId)?.game || "",
  set:
    (weekId) =>
    ({ set, get }, newValue) => {
      if (
        !(newValue instanceof DefaultValue) &&
        get(doublerState(weekId)) !== newValue
      ) {
        set(doublersState, [
          ...get(doublersState).filter(({ week }) => week !== weekId),
          {
            game: newValue,
            week: weekId,
          },
        ]);
        fetchFromAPI(
          "bet/doubler",
          get(tokenState),
          "POST",
          {
            game: newValue,
            week: weekId,
          },
          true
        );
      }
    },
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
  default: selector({
    key: "user/Default",
    get: async ({ get }) =>
      await fetchFromAPI<UserSettings>("user/settings", get(tokenState)),
  }),
});
