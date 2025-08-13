import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    email: varchar().notNull(),
    password: varchar().notNull(),
    salt: varchar().notNull(),
    name: varchar().notNull(),
    settings: jsonb().notNull(),
    verified: boolean().default(false).notNull(),
    consentedAt: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
  },
  (table) => [unique("UQ_e12875dfb3b1d92d7d7c5377e22").on(table.email)],
);

export const bet = pgTable(
  "bet",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    winner: varchar().notNull(),
    pointDiff: integer().notNull(),
    gameId: varchar(),
    userId: uuid(),
    leagueId: uuid(),
  },
  (table) => [
    // index("IDX_23a1f21c2ca2a0b6797564d2b4").using(
    //   "btree",
    //   table.userId.asc().nullsLast().op("uuid_ops"),
    // ),
    // uniqueIndex("IDX_fe022bce1d0feba556dc3c6721").using(
    //   "btree",
    //   table.gameId.asc().nullsLast().op("uuid_ops"),
    //   table.userId.asc().nullsLast().op("uuid_ops"),
    //   table.leagueId.asc().nullsLast().op("uuid_ops"),
    // ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_23a1f21c2ca2a0b6797564d2b41",
    }),
    foreignKey({
      columns: [table.leagueId],
      foreignColumns: [league.id],
      name: "FK_d0ef89e99e899c9c225ade76827",
    }),
    foreignKey({
      columns: [table.gameId],
      foreignColumns: [game.id],
      name: "FK_f276722ac17d4b80a327a9b8340",
    }),
  ],
);

export const superbowlBet = pgTable(
  "superbowlBet",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    year: integer().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    teamId: varchar(),
    userId: uuid(),
    leagueId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [team.id],
      name: "FK_1b5aaa18aa7ee71b9bb2c5a504a",
    }),
    foreignKey({
      columns: [table.leagueId],
      foreignColumns: [league.id],
      name: "FK_a95035da5676fc3ba76279417c2",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_db8e24f19e8506b807c15a02660",
    }),
  ],
);

export const reset = pgTable(
  "reset",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    token: varchar().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    userId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_667cdc8d0a3d3e5db228ae6fd6f",
    }),
  ],
);

export const verify = pgTable(
  "verify",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    token: varchar().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    userId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_076d3a77ca71ace5e2d2d47cc9d",
    }),
  ],
);

export const failedLoginAttempt = pgTable("failedLoginAttempt", {
  id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  email: varchar().notNull(),
  ipAddress: varchar(),
  userAgent: varchar(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const team = pgTable(
  "team",
  {
    id: varchar().primaryKey().notNull(),
    logo: varchar().notNull(),
    abbreviation: varchar().notNull(),
    shortName: varchar().notNull(),
    name: varchar().notNull(),
    wins: integer(),
    losses: integer(),
    ties: integer(),
    color1: varchar(),
    color2: varchar(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    divisionName: varchar(),
    playoffSeed: integer(),
    pointsFor: integer(),
    pointsAgainst: integer(),
    streak: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.divisionName],
      foreignColumns: [division.name],
      name: "FK_b26165dec51bf4779372ab399cd",
    }),
  ],
);

export const division = pgTable("division", {
  name: varchar().primaryKey().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const bye = pgTable(
  "bye",
  {
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    teamId: varchar().notNull(),
    weekId: varchar().notNull(),
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [team.id],
      name: "FK_64072cdad2912c04f305967a989",
    }),
    foreignKey({
      columns: [table.weekId],
      foreignColumns: [week.id],
      name: "FK_478aa45033037c58eda5d02e5c0",
    }),
  ],
);

export const divisionBet = pgTable(
  "divisionBet",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    year: integer().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    divisionName: varchar(),
    firstId: varchar(),
    userId: uuid(),
    leagueId: uuid(),
    secondId: varchar(),
    thirdId: varchar(),
    fourthId: varchar(),
  },
  (table) => [
    // uniqueIndex("IDX_321447fccd6338ee2776aa9936").using(
    //   "btree",
    //   table.divisionName.asc().nullsLast().op("uuid_ops"),
    //   table.userId.asc().nullsLast().op("int4_ops"),
    //   table.leagueId.asc().nullsLast().op("int4_ops"),
    //   table.year.asc().nullsLast().op("uuid_ops"),
    // ),
    foreignKey({
      columns: [table.divisionName],
      foreignColumns: [division.name],
      name: "FK_75bd2d496547e979b0752ce408d",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_803fb683d12f38c1d8bf1514dba",
    }),
    foreignKey({
      columns: [table.leagueId],
      foreignColumns: [league.id],
      name: "FK_9ae306a1080324e5dfa2ac7f3f5",
    }),
    foreignKey({
      columns: [table.secondId],
      foreignColumns: [team.id],
      name: "FK_03c3e8cb0af3416d31fcee760a8",
    }),
    foreignKey({
      columns: [table.thirdId],
      foreignColumns: [team.id],
      name: "FK_eebc9b1703cccd6792abde4a548",
    }),
    foreignKey({
      columns: [table.fourthId],
      foreignColumns: [team.id],
      name: "FK_016828005f3c492f9634962cbde",
    }),
    foreignKey({
      columns: [table.firstId],
      foreignColumns: [team.id],
      name: "FK_897c55ab90c7a9710873b8239b2",
    }),
  ],
);

export const league = pgTable("league", {
  id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
  name: varchar().notNull(),
  season: integer().notNull(),
});

export const week = pgTable(
  "week",
  {
    year: integer().notNull(),
    seasontype: integer().notNull(),
    week: integer().notNull(),
    start: timestamp({ mode: "string" }).notNull(),
    end: timestamp({ mode: "string" }).notNull(),
    label: varchar().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    id: varchar().primaryKey().notNull(),
  },
  // (table) => [
  //   uniqueIndex("IDX_960a28d375395804d5ce7a7a0f").using(
  //     "btree",
  //     table.year.asc().nullsLast().op("int4_ops"),
  //     table.seasontype.asc().nullsLast().op("int4_ops"),
  //     table.week.asc().nullsLast().op("int4_ops"),
  //   ),
  // ],
);

export const game = pgTable(
  "game",
  {
    id: varchar().primaryKey().notNull(),
    date: timestamp({ mode: "string" }).notNull(),
    awayScore: integer().notNull(),
    homeScore: integer().notNull(),
    winner: varchar().notNull(),
    status: varchar().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    awayTeamId: varchar(),
    homeTeamId: varchar(),
    weekId: varchar(),
  },
  (table) => [
    // index("IDX_1f2f5fed6227e9266b8e6f4040").using(
    //   "btree",
    //   table.status.asc().nullsLast().op("text_ops"),
    // ),
    // index("IDX_585dc8593e1c01b0f5e78477cf").using(
    //   "btree",
    //   table.date.asc().nullsLast().op("timestamp_ops"),
    // ),
    foreignKey({
      columns: [table.awayTeamId],
      foreignColumns: [team.id],
      name: "FK_1a206693bb12335a59cb181b355",
    }),
    foreignKey({
      columns: [table.homeTeamId],
      foreignColumns: [team.id],
      name: "FK_6454b249c4795083f0233b59535",
    }),
    foreignKey({
      columns: [table.weekId],
      foreignColumns: [week.id],
      name: "FK_fa3503be7803a0d1b80a76e31c8",
    }),
  ],
);

export const betDoubler = pgTable(
  "betDoubler",
  {
    id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
    gameId: varchar(),
    userId: uuid(),
    leagueId: uuid(),
    weekId: varchar(),
  },
  (table) => [
    // uniqueIndex("IDX_e3018c27fdac8174ca49115411").using(
    //   "btree",
    //   table.weekId.asc().nullsLast().op("uuid_ops"),
    //   table.userId.asc().nullsLast().op("text_ops"),
    //   table.leagueId.asc().nullsLast().op("text_ops"),
    // ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_77b48151105414a855067c67e78",
    }),
    foreignKey({
      columns: [table.gameId],
      foreignColumns: [game.id],
      name: "FK_9710c752a1ce65b0e66714feb1d",
    }),
    foreignKey({
      columns: [table.leagueId],
      foreignColumns: [league.id],
      name: "FK_c4ff5474eac77625549d97c4554",
    }),
    foreignKey({
      columns: [table.weekId],
      foreignColumns: [week.id],
      name: "FK_d1e3ccd0aa94c2699caaff0b26b",
    }),
  ],
);

export const member = pgTable(
  "member",
  {
    leagueId: uuid().notNull(),
    userId: uuid().notNull(),
  },
  (table) => [
    // index("IDX_08897b166dee565859b7fb2fcc").using(
    //   "btree",
    //   table.userId.asc().nullsLast().op("uuid_ops"),
    // ),
    // index("IDX_439998ed986bab5ccce25fb69d").using(
    //   "btree",
    //   table.leagueId.asc().nullsLast().op("uuid_ops"),
    // ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_08897b166dee565859b7fb2fcc8",
    }),
    foreignKey({
      columns: [table.leagueId],
      foreignColumns: [league.id],
      name: "FK_439998ed986bab5ccce25fb69d5",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.leagueId, table.userId],
      name: "PK_33fb0a114cfa389eaedef7ad4ad",
    }),
  ],
);

export const admin = pgTable(
  "admin",
  {
    leagueId: uuid().notNull(),
    userId: uuid().notNull(),
  },
  (table) => [
    // index("IDX_05c82c10f7c651b94c36370112").using(
    //   "btree",
    //   table.leagueId.asc().nullsLast().op("uuid_ops"),
    // ),
    // index("IDX_f8a889c4362d78f056960ca6da").using(
    //   "btree",
    //   table.userId.asc().nullsLast().op("uuid_ops"),
    // ),
    foreignKey({
      columns: [table.leagueId],
      foreignColumns: [league.id],
      name: "FK_05c82c10f7c651b94c36370112d",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "FK_f8a889c4362d78f056960ca6dad",
    }),
    primaryKey({
      columns: [table.leagueId, table.userId],
      name: "PK_79fcd73148573cf4e07c3606272",
    }),
  ],
);
