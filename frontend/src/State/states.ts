import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { fetchFromAPI } from "../api";
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
  DivisionBet,
  DivBet,
  DivBetByTeam,
} from "./response-types";

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
    get: async () => await fetchFromAPI<League[]>("leagues"),
  }),
});

export const divBetsByTeamState = atom<DivBetByTeam>({
  key: "divisionBetsByTeam",
  default: selector({
    key: "divisionBetsByTeam/Default",
    get: async ({ get }) =>
      await fetchFromAPI<DivBetByTeam>(
        `leaderboard/divisions?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`
      ),
  }),
});

export const divisionsState = atom<Division[]>({
  key: "divisions",
  default: selector({
    key: "divisions/Default",
    get: async () =>
      (await fetchFromAPI<Division[]>(`division`)).sort((divA, divB) =>
        divA.name.localeCompare(divB.name)
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

export const teamState = selectorFamily<Team | undefined, string | undefined>({
  key: "team",
  get:
    (id) =>
    ({ get }) =>
      get(teamsState).find((t) => t.id === id),
});

export const divisionLeaderboardState = selectorFamily<
  DivBet | undefined,
  [string, string]
>({
  key: "leaderboard/Division",
  get:
    ([userId, divisionName]) =>
    ({ get }) =>
      get(leaderboardState)
        .find((l) => l.user.id === userId)
        ?.divBets.find((bet) => bet.name === divisionName),
});

export const leaderboardState = atom<Leaderboard[]>({
  key: "leaderboard",
  default: selector({
    key: "leaderboard/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Leaderboard[]>(
        `leaderboard?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`
      ),
  }),
});

export const weeksState = atom<Week[]>({
  key: "weeks",
  default: selector({
    key: "weeks/Default",
    get: async ({ get }) =>
      await fetchFromAPI<Week[]>(`schedule/${get(activeLeagueState).season}`),
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
        }`
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
        }`
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
          fetchFromAPI("bet", "POST", body, true);
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
        }`
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
      if (newValue instanceof DefaultValue) {
        fetchFromAPI(
          "bet/doubler",
          "DELETE",
          {
            league: get(activeLeagueState).id,
            week: weekId,
          },
          true
        );
        set(
          doublersState,
          get(doublersState).filter(({ week }) => week !== weekId)
        );
      }
      if (
        !(newValue instanceof DefaultValue) &&
        get(doublerState(weekId)) !== newValue
      ) {
        fetchFromAPI(
          "bet/doubler",
          "POST",
          {
            league: get(activeLeagueState).id,
            game: newValue,
            week: weekId,
          },
          true
        );
        set(doublersState, [
          ...get(doublersState).filter(({ week }) => week !== weekId),
          {
            game: newValue,
            week: weekId,
          },
        ]);
      }
    },
});

export const divisionBetsState = atom<DivisionBet[]>({
  key: "divisionBets",
  default: selector({
    key: "divisionBets/Default",
    get: async ({ get }) =>
      await fetchFromAPI<DivisionBet[]>(
        `bet/division?season=${get(activeLeagueState).season}&league=${
          get(activeLeagueState).id
        }`
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
          }`
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

export const sendReminderState = selector<boolean>({
  key: "sendReminder",
  get: ({ get }) => {
    return get(userState).sendReminder ?? true;
  },
  set: ({ get, set }, newValue) => {
    const sendReminder = newValue instanceof DefaultValue ? true : newValue;
    fetchFromAPI(
      "user/send-reminder",
      "POST",
      {
        sendReminder,
      },
      true
    );

    set(userState, {
      ...get(userState),
      sendReminder,
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
    get: async ({ get }) => await fetchFromAPI<UserSettings>("user/settings"),
  }),
});

export const widthState = atom<number>({
  key: "innerWidth",
  default: window.innerWidth,
});
