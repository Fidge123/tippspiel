import { type Kysely, sql } from 'kysely';

/**
 * The schema TypeORM owned, so a database can still be built from empty once
 * backend/ is gone. Dumped from the migration chain it replaces rather than
 * retyped.
 *
 * A no-op where that chain has already run, which is every environment that
 * existed before 6/6. Kysely is configured to allow unordered migrations so
 * this can sort before 001-session on a fresh database while staying unapplied
 * on the ones that already carry it.
 */
const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public`,
  `CREATE TABLE public.admin ( "leagueId" uuid NOT NULL, "userId" uuid NOT NULL )`,
  `CREATE TABLE public.bet ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, winner character varying NOT NULL, "pointDiff" integer NOT NULL, "gameId" character varying, "userId" uuid, "leagueId" uuid )`,
  `CREATE TABLE public."betDoubler" ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, "gameId" character varying, "userId" uuid, "leagueId" uuid, "weekId" character varying )`,
  `CREATE TABLE public.bye ( "teamId" character varying NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, "weekId" character varying NOT NULL, id uuid DEFAULT public.uuid_generate_v4() NOT NULL )`,
  `CREATE TABLE public.division ( name character varying NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL )`,
  `CREATE TABLE public."divisionBet" ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, year integer NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, "divisionName" character varying, "firstId" character varying, "userId" uuid, "leagueId" uuid, "secondId" character varying, "thirdId" character varying, "fourthId" character varying )`,
  `CREATE TABLE public.game ( id character varying NOT NULL, date timestamp without time zone NOT NULL, "awayScore" integer NOT NULL, "homeScore" integer NOT NULL, winner character varying NOT NULL, status character varying NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, "awayTeamId" character varying, "homeTeamId" character varying, "weekId" character varying )`,
  `CREATE TABLE public.league ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, name character varying NOT NULL, season integer NOT NULL )`,
  `CREATE TABLE public.member ( "leagueId" uuid NOT NULL, "userId" uuid NOT NULL )`,
  `CREATE TABLE public.reset ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, token character varying NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "userId" uuid )`,
  `CREATE TABLE public."superbowlBet" ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, year integer NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, "teamId" character varying, "userId" uuid, "leagueId" uuid )`,
  `CREATE TABLE public.team ( id character varying NOT NULL, logo character varying NOT NULL, abbreviation character varying NOT NULL, "shortName" character varying NOT NULL, name character varying NOT NULL, "playoffSeed" integer, wins integer, losses integer, ties integer, "pointsFor" integer, "pointsAgainst" integer, streak integer, color1 character varying, color2 character varying, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, "divisionName" character varying )`,
  `CREATE TABLE public.team_season ( "teamId" character varying NOT NULL, year integer NOT NULL, logo character varying NOT NULL, abbreviation character varying NOT NULL, "shortName" character varying NOT NULL, name character varying NOT NULL, "divisionName" character varying, "playoffSeed" integer, wins integer, losses integer, ties integer, "pointsFor" integer, "pointsAgainst" integer, streak integer, color1 character varying, color2 character varying, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL )`,
  `CREATE TABLE public."user" ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, email character varying NOT NULL, password character varying NOT NULL, salt character varying NOT NULL, name character varying NOT NULL, settings jsonb NOT NULL, verified boolean DEFAULT false NOT NULL, "consentedAt" timestamp without time zone NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL )`,
  `CREATE TABLE public.verify ( id uuid DEFAULT public.uuid_generate_v4() NOT NULL, token character varying NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "userId" uuid )`,
  `CREATE TABLE public.week ( year integer NOT NULL, seasontype integer NOT NULL, week integer NOT NULL, start timestamp without time zone NOT NULL, "end" timestamp without time zone NOT NULL, label character varying NOT NULL, "createdAt" timestamp without time zone DEFAULT now() NOT NULL, "updatedAt" timestamp without time zone DEFAULT now() NOT NULL, id character varying NOT NULL )`,
  `ALTER TABLE ONLY public.league ADD CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.week ADD CONSTRAINT "PK_1f85dfadd5f363a1d0bce2b9664" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.division ADD CONSTRAINT "PK_296566b07c0653123c292aa2f85" PRIMARY KEY (name)`,
  `ALTER TABLE ONLY public.member ADD CONSTRAINT "PK_33fb0a114cfa389eaedef7ad4ad" PRIMARY KEY ("leagueId", "userId")`,
  `ALTER TABLE ONLY public.game ADD CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.bet ADD CONSTRAINT "PK_4ceea2cdef435807614b8e17aed" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public."superbowlBet" ADD CONSTRAINT "PK_5bdc4915ccde383df0eb16c0bc6" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.reset ADD CONSTRAINT "PK_5d04f4fd10772663543c6ccc512" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.admin ADD CONSTRAINT "PK_79fcd73148573cf4e07c3606272" PRIMARY KEY ("leagueId", "userId")`,
  `ALTER TABLE ONLY public."betDoubler" ADD CONSTRAINT "PK_86b7307232e7e8822fddefbeb02" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.bye ADD CONSTRAINT "PK_a455633f8630887792176d19380" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.verify ADD CONSTRAINT "PK_c554da021aecbe3860c4b631be5" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public."user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "PK_ebb19619dff8654fc623e5336dd" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.team ADD CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY (id)`,
  `ALTER TABLE ONLY public.team_season ADD CONSTRAINT "PK_team_season" PRIMARY KEY ("teamId", year)`,
  `ALTER TABLE ONLY public."user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email)`,
  `CREATE INDEX "IDX_05c82c10f7c651b94c36370112" ON public.admin USING btree ("leagueId")`,
  `CREATE INDEX "IDX_08897b166dee565859b7fb2fcc" ON public.member USING btree ("userId")`,
  `CREATE INDEX "IDX_1f2f5fed6227e9266b8e6f4040" ON public.game USING btree (status)`,
  `CREATE INDEX "IDX_23a1f21c2ca2a0b6797564d2b4" ON public.bet USING btree ("userId")`,
  `CREATE UNIQUE INDEX "IDX_321447fccd6338ee2776aa9936" ON public."divisionBet" USING btree ("divisionName", "userId", "leagueId", year)`,
  `CREATE INDEX "IDX_439998ed986bab5ccce25fb69d" ON public.member USING btree ("leagueId")`,
  `CREATE INDEX "IDX_585dc8593e1c01b0f5e78477cf" ON public.game USING btree (date)`,
  `CREATE UNIQUE INDEX "IDX_960a28d375395804d5ce7a7a0f" ON public.week USING btree (year, seasontype, week)`,
  `CREATE UNIQUE INDEX "IDX_e3018c27fdac8174ca49115411" ON public."betDoubler" USING btree ("weekId", "userId", "leagueId")`,
  `CREATE INDEX "IDX_f8a889c4362d78f056960ca6da" ON public.admin USING btree ("userId")`,
  `CREATE UNIQUE INDEX "IDX_fe022bce1d0feba556dc3c6721" ON public.bet USING btree ("gameId", "userId", "leagueId")`,
  `CREATE INDEX "IDX_team_season_year" ON public.team_season USING btree (year)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_016828005f3c492f9634962cbde" FOREIGN KEY ("fourthId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_03c3e8cb0af3416d31fcee760a8" FOREIGN KEY ("secondId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public.admin ADD CONSTRAINT "FK_05c82c10f7c651b94c36370112d" FOREIGN KEY ("leagueId") REFERENCES public.league(id) ON UPDATE CASCADE ON DELETE CASCADE`,
  `ALTER TABLE ONLY public.verify ADD CONSTRAINT "FK_076d3a77ca71ace5e2d2d47cc9d" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public.member ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public.game ADD CONSTRAINT "FK_1a206693bb12335a59cb181b355" FOREIGN KEY ("awayTeamId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public."superbowlBet" ADD CONSTRAINT "FK_1b5aaa18aa7ee71b9bb2c5a504a" FOREIGN KEY ("teamId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public.bet ADD CONSTRAINT "FK_23a1f21c2ca2a0b6797564d2b41" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public.member ADD CONSTRAINT "FK_439998ed986bab5ccce25fb69d5" FOREIGN KEY ("leagueId") REFERENCES public.league(id) ON UPDATE CASCADE ON DELETE CASCADE`,
  `ALTER TABLE ONLY public.bye ADD CONSTRAINT "FK_478aa45033037c58eda5d02e5c0" FOREIGN KEY ("weekId") REFERENCES public.week(id)`,
  `ALTER TABLE ONLY public.bye ADD CONSTRAINT "FK_64072cdad2912c04f305967a989" FOREIGN KEY ("teamId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public.game ADD CONSTRAINT "FK_6454b249c4795083f0233b59535" FOREIGN KEY ("homeTeamId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public.reset ADD CONSTRAINT "FK_667cdc8d0a3d3e5db228ae6fd6f" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_75bd2d496547e979b0752ce408d" FOREIGN KEY ("divisionName") REFERENCES public.division(name)`,
  `ALTER TABLE ONLY public."betDoubler" ADD CONSTRAINT "FK_77b48151105414a855067c67e78" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_803fb683d12f38c1d8bf1514dba" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_897c55ab90c7a9710873b8239b2" FOREIGN KEY ("firstId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public."betDoubler" ADD CONSTRAINT "FK_9710c752a1ce65b0e66714feb1d" FOREIGN KEY ("gameId") REFERENCES public.game(id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_9ae306a1080324e5dfa2ac7f3f5" FOREIGN KEY ("leagueId") REFERENCES public.league(id)`,
  `ALTER TABLE ONLY public."superbowlBet" ADD CONSTRAINT "FK_a95035da5676fc3ba76279417c2" FOREIGN KEY ("leagueId") REFERENCES public.league(id)`,
  `ALTER TABLE ONLY public.team ADD CONSTRAINT "FK_b26165dec51bf4779372ab399cd" FOREIGN KEY ("divisionName") REFERENCES public.division(name)`,
  `ALTER TABLE ONLY public."betDoubler" ADD CONSTRAINT "FK_c4ff5474eac77625549d97c4554" FOREIGN KEY ("leagueId") REFERENCES public.league(id)`,
  `ALTER TABLE ONLY public.bet ADD CONSTRAINT "FK_d0ef89e99e899c9c225ade76827" FOREIGN KEY ("leagueId") REFERENCES public.league(id)`,
  `ALTER TABLE ONLY public."betDoubler" ADD CONSTRAINT "FK_d1e3ccd0aa94c2699caaff0b26b" FOREIGN KEY ("weekId") REFERENCES public.week(id)`,
  `ALTER TABLE ONLY public."superbowlBet" ADD CONSTRAINT "FK_db8e24f19e8506b807c15a02660" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public."divisionBet" ADD CONSTRAINT "FK_eebc9b1703cccd6792abde4a548" FOREIGN KEY ("thirdId") REFERENCES public.team(id)`,
  `ALTER TABLE ONLY public.bet ADD CONSTRAINT "FK_f276722ac17d4b80a327a9b8340" FOREIGN KEY ("gameId") REFERENCES public.game(id)`,
  `ALTER TABLE ONLY public.admin ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES public."user"(id)`,
  `ALTER TABLE ONLY public.game ADD CONSTRAINT "FK_fa3503be7803a0d1b80a76e31c8" FOREIGN KEY ("weekId") REFERENCES public.week(id)`,
  `ALTER TABLE ONLY public.team_season ADD CONSTRAINT "FK_team_season_division" FOREIGN KEY ("divisionName") REFERENCES public.division(name) ON DELETE SET NULL`,
  `ALTER TABLE ONLY public.team_season ADD CONSTRAINT "FK_team_season_team" FOREIGN KEY ("teamId") REFERENCES public.team(id) ON DELETE CASCADE`,
];

export async function up(db: Kysely<unknown>): Promise<void> {
  const { rows } = await sql<{ present: string | null }>`
    select to_regclass('public."user"')::text as present
  `.execute(db);

  if (rows[0]?.present) {
    return;
  }

  for (const statement of STATEMENTS) {
    await sql.raw(statement).execute(db);
  }
}

export async function down(): Promise<void> {
  throw new Error('The legacy schema is not reversible.');
}
