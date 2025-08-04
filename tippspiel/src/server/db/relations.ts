import { relations } from "drizzle-orm/relations";
import {
  admin,
  bet,
  betDoubler,
  bye,
  division,
  divisionBet,
  game,
  league,
  member,
  reset,
  superbowlBet,
  team,
  user,
  verify,
  week,
} from "./schema";

export const betRelations = relations(bet, ({ one }) => ({
  user: one(user, {
    fields: [bet.userId],
    references: [user.id],
  }),
  league: one(league, {
    fields: [bet.leagueId],
    references: [league.id],
  }),
  game: one(game, {
    fields: [bet.gameId],
    references: [game.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  bets: many(bet),
  superbowlBets: many(superbowlBet),
  resets: many(reset),
  verifies: many(verify),
  divisionBets: many(divisionBet),
  betDoublers: many(betDoubler),
  members: many(member),
  admins: many(admin),
}));

export const leagueRelations = relations(league, ({ many }) => ({
  bets: many(bet),
  superbowlBets: many(superbowlBet),
  divisionBets: many(divisionBet),
  betDoublers: many(betDoubler),
  members: many(member),
  admins: many(admin),
}));

export const gameRelations = relations(game, ({ one, many }) => ({
  bets: many(bet),
  team_awayTeamId: one(team, {
    fields: [game.awayTeamId],
    references: [team.id],
    relationName: "game_awayTeamId_team_id",
  }),
  team_homeTeamId: one(team, {
    fields: [game.homeTeamId],
    references: [team.id],
    relationName: "game_homeTeamId_team_id",
  }),
  week: one(week, {
    fields: [game.weekId],
    references: [week.id],
  }),
  betDoublers: many(betDoubler),
}));

export const superbowlBetRelations = relations(superbowlBet, ({ one }) => ({
  team: one(team, {
    fields: [superbowlBet.teamId],
    references: [team.id],
  }),
  league: one(league, {
    fields: [superbowlBet.leagueId],
    references: [league.id],
  }),
  user: one(user, {
    fields: [superbowlBet.userId],
    references: [user.id],
  }),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  superbowlBets: many(superbowlBet),
  division: one(division, {
    fields: [team.divisionName],
    references: [division.name],
  }),
  byes: many(bye),
  divisionBets_secondId: many(divisionBet, {
    relationName: "divisionBet_secondId_team_id",
  }),
  divisionBets_thirdId: many(divisionBet, {
    relationName: "divisionBet_thirdId_team_id",
  }),
  divisionBets_fourthId: many(divisionBet, {
    relationName: "divisionBet_fourthId_team_id",
  }),
  divisionBets_firstId: many(divisionBet, {
    relationName: "divisionBet_firstId_team_id",
  }),
  games_awayTeamId: many(game, {
    relationName: "game_awayTeamId_team_id",
  }),
  games_homeTeamId: many(game, {
    relationName: "game_homeTeamId_team_id",
  }),
}));

export const resetRelations = relations(reset, ({ one }) => ({
  user: one(user, {
    fields: [reset.userId],
    references: [user.id],
  }),
}));

export const verifyRelations = relations(verify, ({ one }) => ({
  user: one(user, {
    fields: [verify.userId],
    references: [user.id],
  }),
}));

export const divisionRelations = relations(division, ({ many }) => ({
  teams: many(team),
  divisionBets: many(divisionBet),
}));

export const byeRelations = relations(bye, ({ one }) => ({
  team: one(team, {
    fields: [bye.teamId],
    references: [team.id],
  }),
  week: one(week, {
    fields: [bye.weekId],
    references: [week.id],
  }),
}));

export const weekRelations = relations(week, ({ many }) => ({
  byes: many(bye),
  games: many(game),
  betDoublers: many(betDoubler),
}));

export const divisionBetRelations = relations(divisionBet, ({ one }) => ({
  division: one(division, {
    fields: [divisionBet.divisionName],
    references: [division.name],
  }),
  user: one(user, {
    fields: [divisionBet.userId],
    references: [user.id],
  }),
  league: one(league, {
    fields: [divisionBet.leagueId],
    references: [league.id],
  }),
  team_secondId: one(team, {
    fields: [divisionBet.secondId],
    references: [team.id],
    relationName: "divisionBet_secondId_team_id",
  }),
  team_thirdId: one(team, {
    fields: [divisionBet.thirdId],
    references: [team.id],
    relationName: "divisionBet_thirdId_team_id",
  }),
  team_fourthId: one(team, {
    fields: [divisionBet.fourthId],
    references: [team.id],
    relationName: "divisionBet_fourthId_team_id",
  }),
  team_firstId: one(team, {
    fields: [divisionBet.firstId],
    references: [team.id],
    relationName: "divisionBet_firstId_team_id",
  }),
}));

export const betDoublerRelations = relations(betDoubler, ({ one }) => ({
  user: one(user, {
    fields: [betDoubler.userId],
    references: [user.id],
  }),
  game: one(game, {
    fields: [betDoubler.gameId],
    references: [game.id],
  }),
  league: one(league, {
    fields: [betDoubler.leagueId],
    references: [league.id],
  }),
  week: one(week, {
    fields: [betDoubler.weekId],
    references: [week.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  league: one(league, {
    fields: [member.leagueId],
    references: [league.id],
  }),
}));

export const adminRelations = relations(admin, ({ one }) => ({
  league: one(league, {
    fields: [admin.leagueId],
    references: [league.id],
  }),
  user: one(user, {
    fields: [admin.userId],
    references: [user.id],
  }),
}));
