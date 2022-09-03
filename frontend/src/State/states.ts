import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { refresh, fetchFromAPI } from "../api";
import { ApiBet } from "../Schedule/types";
import {
  Division,
  Team,
  League,
  Leaderboard,
  Bet,
  Stat,
  Stats,
  Week,
  UserSettings,
  Doubler,
} from "./response-types";
import { formatLb } from "./util";

export const userIdState = selector<string>({
  key: "accessToken/id",
  get: ({ get }) => {
    const payload = JSON.parse(window.atob(get(tokenState).split(".")[1]));
    return payload.id;
  },
});

export const nameState = selector<string>({
  key: "accessToken/name",
  get: ({ get }) => {
    const payload = JSON.parse(window.atob(get(tokenState).split(".")[1]));
    return payload.name;
  },
  set: ({ get, reset }, newValue) => {
    if (newValue instanceof DefaultValue) {
      throw new Error("Can't reset name");
    }

    fetchFromAPI(
      "user/change/name",
      get(tokenState),
      "POST",
      {
        name: newValue,
      },
      true
    );

    reset(tokenState);
  },
});

export const tokenState = atom<string>({
  key: "accessToken",
  default: window.localStorage.getItem("access_token") || "",
  effects: [
    ({ setSelf, onSet }) => {
      const item = window.localStorage.getItem("access_token");
      const refreshSelf = async () => {
        const token = await refresh();
        if (token && !token.startsWith("[object")) {
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
        isReset
          ? refreshSelf()
          : window.localStorage.setItem("access_token", newValue)
      );
    },
  ],
});

export const activeLeagueState = selector<League>({
  key: "leagues/Active",
  get: ({ get }) => {
    return (
      get(leaguesState).find((l) => l.id === get(userState).league) ??
      get(leaguesState)[0]
    );
  },
  set: ({ get, set }, newValue) => {
    const id =
      newValue instanceof DefaultValue ? get(leaguesState)[0].id : newValue.id;
    fetchFromAPI(
      "user/league",
      get(tokenState),
      "POST",
      {
        league: id,
      },
      true
    );

    set(userState, {
      ...get(userState),
      league: id,
    });
  },
});

export const leaguesState = atom<League[]>({
  key: "leagues",
  default: selector({
    key: "leagues/Default",
    get: async ({ get }) =>
      await fetchFromAPI<League[]>(`leagues`, get(tokenState)),
  }),
});

export const divisionsState = atom<Division[]>({
  key: "divisions",
  default: selector({
    key: "divisions/Default",
    get: async ({ get }) =>
      (
        await fetchFromAPI<Division[]>(
          `division?season=${get(activeLeagueState).season}`,
          get(tokenState)
        )
      ).sort((divA, divB) => divA.name.localeCompare(divB.name)),
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

export const teamState = selectorFamily<Team | undefined, string | undefined>({
  key: "team",
  get:
    (id) =>
    ({ get }) =>
      get(teamsState).find((t) => t.id === id),
});

export const leaderboardState = atom<Leaderboard[]>({
  key: "leaderboard",
  default: selector({
    key: "leaderboard/Default",
    get: async ({ get }) =>
      formatLb(
        await fetchFromAPI(
          `leaderboard?season=${get(activeLeagueState).season}&league=${
            get(activeLeagueState).id
          }`,
          get(tokenState)
        )
      ),
  }),
});

export const weeksState = atom<Week[]>({
  key: "weeks",
  default: selector({
    key: "weeks/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Week[]>(
        `schedule/${get(activeLeagueState).season}`,
        get(tokenState)
      ),
  }),
});

export const currentWeekState = selectorFamily<boolean, string>({
  key: "weeks/current",
  get:
    (weekId) =>
    ({ get }) => {
      const now = new Date();
      const week = get(weeksState).reduce((prev, curr) => {
        const startA = new Date(prev.start);
        const endA = new Date(prev.end);
        const startB = new Date(curr.start);
        const endB = new Date(curr.end);
        if (now <= endA && now >= startA) {
          return prev; // if in period A, return prev
        }
        if (now <= endB && now >= startB) {
          return curr; // if in period B, return curr
        }
        if (endA <= now && endB <= now) {
          return endA > endB ? prev : curr; // if both before, return later period
        }
        if (endA >= now && endB >= now) {
          return endA < endB ? prev : curr; // if both after, return earlier period
        }
        return endA < now ? prev : curr; // if between periods, return later period
      });
      return `${week.year}-${week.seasontype}-${week.week}` === weekId;
    },
});

export const statsState = atom<Stats>({
  key: "stats",
  default: selector({
    key: "stats/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Stats>(
        `leaderboard/games?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`,
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
      await fetchFromAPI<Bet[]>(
        `bet?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`,
        get(tokenState)
      ),
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
            leagueId: get(activeLeagueState).id,
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
      await fetchFromAPI<Doubler[]>(
        `bet/doubler?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`,
        get(tokenState)
      ),
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
            league: get(activeLeagueState).id,
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
        `bet/division?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`,
        get(tokenState)
      ),
  }),
});

export const sbBetState = atom<string>({
  key: "sbBet",
  default: selector({
    key: "sbBet/Default",
    get: async ({ get }) =>
      (
        await fetchFromAPI(
          `bet/superbowl?season=${get(activeLeagueState).season}&league=${
            get(activeLeagueState).id
          }`,
          get(tokenState)
        )
      )?.team?.id,
  }),
});

export const hideByDefaultState = selector<boolean>({
  key: "hidden/Default",
  get: ({ get }) => {
    return get(userState).hideByDefault ?? true;
  },
  set: ({ get, set }, newValue) => {
    const hideByDefault = newValue instanceof DefaultValue ? true : newValue;
    fetchFromAPI(
      "user/hidden/default",
      get(tokenState),
      "POST",
      {
        hideByDefault,
      },
      true
    );

    set(userState, {
      ...get(userState),
      hideByDefault,
    });
  },
});

export const hiddenState = selectorFamily<boolean, string>({
  key: "hidden",
  get:
    (weekId) =>
    ({ get }) => {
      const { hidden } = get(userState);
      return hidden && typeof hidden[weekId] !== "undefined"
        ? hidden[weekId]
        : get(hideByDefaultState);
    },

  set:
    (weekId) =>
    ({ get, set }, newValue) => {
      const hidden =
        newValue instanceof DefaultValue ? get(hideByDefaultState) : newValue;

      fetchFromAPI(
        "user/hidden",
        get(tokenState),
        "POST",
        {
          hidden,
          weekId,
        },
        true
      );

      set(userState, {
        ...get(userState),
        hidden: {
          ...get(userState).hidden,
          [weekId]: hidden,
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

export const widthState = atom<number>({
  key: "innerWidth",
  default: window.innerWidth,
});
