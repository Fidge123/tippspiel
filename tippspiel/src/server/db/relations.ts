import { relations } from "drizzle-orm/relations";
import * as schema from "./schema";

export const betRelations = relations(schema.bet, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.bet.user],
    references: [schema.user.id],
  }),
  league: one(schema.league, {
    fields: [schema.bet.league],
    references: [schema.league.id],
  }),
  game: one(schema.game, {
    fields: [schema.bet.game],
    references: [schema.game.id],
  }),
}));

export const userRelations = relations(schema.user, ({ many }) => ({
  bets: many(schema.bet),
  superbowlBets: many(schema.superbowlBet),
  resetTokens: many(schema.resetToken),
  verifyTokens: many(schema.verifyToken),
  divisionBets: many(schema.divisionBet),
  betDoublers: many(schema.betDoubler),
  members: many(schema.member),
  admins: many(schema.admin),
}));

export const leagueRelations = relations(schema.league, ({ many }) => ({
  bets: many(schema.bet),
  superbowlBets: many(schema.superbowlBet),
  divisionBets: many(schema.divisionBet),
  betDoublers: many(schema.betDoubler),
  members: many(schema.member),
  admins: many(schema.admin),
}));

export const gameRelations = relations(schema.game, ({ one, many }) => ({
  bets: many(schema.bet),
  awayTeam: one(schema.team, {
    fields: [schema.game.awayTeam],
    references: [schema.team.id],
  }),
  homeTeam: one(schema.team, {
    fields: [schema.game.homeTeam],
    references: [schema.team.id],
  }),
  week: one(schema.week, {
    fields: [schema.game.week],
    references: [schema.week.id],
  }),
  betDoublers: many(schema.betDoubler),
}));

export const superbowlBetRelations = relations(
  schema.superbowlBet,
  ({ one }) => ({
    team: one(schema.team, {
      fields: [schema.superbowlBet.team],
      references: [schema.team.id],
    }),
    league: one(schema.league, {
      fields: [schema.superbowlBet.league],
      references: [schema.league.id],
    }),
    user: one(schema.user, {
      fields: [schema.superbowlBet.user],
      references: [schema.user.id],
    }),
  }),
);

export const teamRelations = relations(schema.team, ({ one, many }) => ({
  superbowlBets: many(schema.superbowlBet),
  division: one(schema.division, {
    fields: [schema.team.division],
    references: [schema.division.id],
  }),
  byes: many(schema.bye),
  divisionBets_second: many(schema.divisionBet, {
    relationName: "divisionBet_second_team_id",
  }),
  divisionBets_third: many(schema.divisionBet, {
    relationName: "divisionBet_third_team_id",
  }),
  divisionBets_fourth: many(schema.divisionBet, {
    relationName: "divisionBet_fourth_team_id",
  }),
  divisionBets_first: many(schema.divisionBet, {
    relationName: "divisionBet_first_team_id",
  }),
  games_awayTeam: many(schema.game, {
    relationName: "game_awayTeam_team_id",
  }),
  games_homeTeam: many(schema.game, {
    relationName: "game_homeTeam_team_id",
  }),
}));

export const resetRelations = relations(schema.resetToken, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.resetToken.user],
    references: [schema.user.id],
  }),
}));

export const verifyRelations = relations(schema.verifyToken, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.verifyToken.user],
    references: [schema.user.id],
  }),
}));

export const divisionRelations = relations(schema.division, ({ many }) => ({
  teams: many(schema.team),
  divisionBets: many(schema.divisionBet),
}));

export const byeRelations = relations(schema.bye, ({ one }) => ({
  team: one(schema.team, {
    fields: [schema.bye.team],
    references: [schema.team.id],
  }),
  week: one(schema.week, {
    fields: [schema.bye.week],
    references: [schema.week.id],
  }),
}));

export const weekRelations = relations(schema.week, ({ many }) => ({
  byes: many(schema.bye),
  games: many(schema.game),
  betDoublers: many(schema.betDoubler),
}));

export const divisionBetRelations = relations(
  schema.divisionBet,
  ({ one }) => ({
    division: one(schema.division, {
      fields: [schema.divisionBet.division],
      references: [schema.division.id],
    }),
    user: one(schema.user, {
      fields: [schema.divisionBet.user],
      references: [schema.user.id],
    }),
    league: one(schema.league, {
      fields: [schema.divisionBet.league],
      references: [schema.league.id],
    }),
    team_second: one(schema.team, {
      fields: [schema.divisionBet.second],
      references: [schema.team.id],
      relationName: "divisionBet_second_team_id",
    }),
    team_third: one(schema.team, {
      fields: [schema.divisionBet.third],
      references: [schema.team.id],
      relationName: "divisionBet_third_team_id",
    }),
    team_fourth: one(schema.team, {
      fields: [schema.divisionBet.fourth],
      references: [schema.team.id],
      relationName: "divisionBet_fourth_team_id",
    }),
    team_first: one(schema.team, {
      fields: [schema.divisionBet.first],
      references: [schema.team.id],
      relationName: "divisionBet_first_team_id",
    }),
  }),
);

export const betDoublerRelations = relations(schema.betDoubler, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.betDoubler.user],
    references: [schema.user.id],
  }),
  game: one(schema.game, {
    fields: [schema.betDoubler.game],
    references: [schema.game.id],
  }),
  league: one(schema.league, {
    fields: [schema.betDoubler.league],
    references: [schema.league.id],
  }),
  week: one(schema.week, {
    fields: [schema.betDoubler.week],
    references: [schema.week.id],
  }),
}));

export const memberRelations = relations(schema.member, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.member.user],
    references: [schema.user.id],
  }),
  league: one(schema.league, {
    fields: [schema.member.league],
    references: [schema.league.id],
  }),
}));

export const adminRelations = relations(schema.admin, ({ one }) => ({
  league: one(schema.league, {
    fields: [schema.admin.league],
    references: [schema.league.id],
  }),
  user: one(schema.user, {
    fields: [schema.admin.user],
    references: [schema.user.id],
  }),
}));
