-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"salt" varchar NOT NULL,
	"name" varchar NOT NULL,
	"settings" jsonb NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"consentedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bet" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"winner" varchar NOT NULL,
	"pointDiff" integer NOT NULL,
	"gameId" varchar,
	"userId" uuid,
	"leagueId" uuid
);
--> statement-breakpoint
CREATE TABLE "superbowlBet" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"year" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"teamId" varchar,
	"userId" uuid,
	"leagueId" uuid
);
--> statement-breakpoint
CREATE TABLE "reset" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"token" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid
);
--> statement-breakpoint
CREATE TABLE "verify" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"token" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" varchar PRIMARY KEY NOT NULL,
	"logo" varchar NOT NULL,
	"abbreviation" varchar NOT NULL,
	"shortName" varchar NOT NULL,
	"name" varchar NOT NULL,
	"wins" integer,
	"losses" integer,
	"ties" integer,
	"color1" varchar,
	"color2" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"divisionName" varchar,
	"playoffSeed" integer,
	"pointsFor" integer,
	"pointsAgainst" integer,
	"streak" integer
);
--> statement-breakpoint
CREATE TABLE "division" (
	"name" varchar PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bye" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"teamId" varchar NOT NULL,
	"weekId" varchar NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "typeorm_metadata" (
	"type" varchar NOT NULL,
	"database" varchar,
	"schema" varchar,
	"table" varchar,
	"name" varchar,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "divisionBet" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"year" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"divisionName" varchar,
	"firstId" varchar,
	"userId" uuid,
	"leagueId" uuid,
	"secondId" varchar,
	"thirdId" varchar,
	"fourthId" varchar
);
--> statement-breakpoint
CREATE TABLE "league" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"name" varchar NOT NULL,
	"season" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "week" (
	"year" integer NOT NULL,
	"seasontype" integer NOT NULL,
	"week" integer NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"label" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" varchar PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"awayScore" integer NOT NULL,
	"homeScore" integer NOT NULL,
	"winner" varchar NOT NULL,
	"status" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"awayTeamId" varchar,
	"homeTeamId" varchar,
	"weekId" varchar
);
--> statement-breakpoint
CREATE TABLE "betDoubler" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"gameId" varchar,
	"userId" uuid,
	"leagueId" uuid,
	"weekId" varchar
);
--> statement-breakpoint
CREATE TABLE "member" (
	"leagueId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "PK_33fb0a114cfa389eaedef7ad4ad" PRIMARY KEY("leagueId","userId")
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"leagueId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "PK_79fcd73148573cf4e07c3606272" PRIMARY KEY("leagueId","userId")
);
--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "FK_23a1f21c2ca2a0b6797564d2b41" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "FK_d0ef89e99e899c9c225ade76827" FOREIGN KEY ("leagueId") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "FK_f276722ac17d4b80a327a9b8340" FOREIGN KEY ("gameId") REFERENCES "public"."game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superbowlBet" ADD CONSTRAINT "FK_1b5aaa18aa7ee71b9bb2c5a504a" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superbowlBet" ADD CONSTRAINT "FK_a95035da5676fc3ba76279417c2" FOREIGN KEY ("leagueId") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superbowlBet" ADD CONSTRAINT "FK_db8e24f19e8506b807c15a02660" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reset" ADD CONSTRAINT "FK_667cdc8d0a3d3e5db228ae6fd6f" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verify" ADD CONSTRAINT "FK_076d3a77ca71ace5e2d2d47cc9d" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "FK_b26165dec51bf4779372ab399cd" FOREIGN KEY ("divisionName") REFERENCES "public"."division"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bye" ADD CONSTRAINT "FK_64072cdad2912c04f305967a989" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bye" ADD CONSTRAINT "FK_478aa45033037c58eda5d02e5c0" FOREIGN KEY ("weekId") REFERENCES "public"."week"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_75bd2d496547e979b0752ce408d" FOREIGN KEY ("divisionName") REFERENCES "public"."division"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_803fb683d12f38c1d8bf1514dba" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_9ae306a1080324e5dfa2ac7f3f5" FOREIGN KEY ("leagueId") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_03c3e8cb0af3416d31fcee760a8" FOREIGN KEY ("secondId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_eebc9b1703cccd6792abde4a548" FOREIGN KEY ("thirdId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_016828005f3c492f9634962cbde" FOREIGN KEY ("fourthId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_897c55ab90c7a9710873b8239b2" FOREIGN KEY ("firstId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "FK_1a206693bb12335a59cb181b355" FOREIGN KEY ("awayTeamId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "FK_6454b249c4795083f0233b59535" FOREIGN KEY ("homeTeamId") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "FK_fa3503be7803a0d1b80a76e31c8" FOREIGN KEY ("weekId") REFERENCES "public"."week"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_77b48151105414a855067c67e78" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_9710c752a1ce65b0e66714feb1d" FOREIGN KEY ("gameId") REFERENCES "public"."game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_c4ff5474eac77625549d97c4554" FOREIGN KEY ("leagueId") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_d1e3ccd0aa94c2699caaff0b26b" FOREIGN KEY ("weekId") REFERENCES "public"."week"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "FK_439998ed986bab5ccce25fb69d5" FOREIGN KEY ("leagueId") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "FK_05c82c10f7c651b94c36370112d" FOREIGN KEY ("leagueId") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_23a1f21c2ca2a0b6797564d2b4" ON "bet" USING btree ("userId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_fe022bce1d0feba556dc3c6721" ON "bet" USING btree ("gameId" uuid_ops,"userId" uuid_ops,"leagueId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_321447fccd6338ee2776aa9936" ON "divisionBet" USING btree ("divisionName" uuid_ops,"userId" int4_ops,"leagueId" int4_ops,"year" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_960a28d375395804d5ce7a7a0f" ON "week" USING btree ("year" int4_ops,"seasontype" int4_ops,"week" int4_ops);--> statement-breakpoint
CREATE INDEX "IDX_1f2f5fed6227e9266b8e6f4040" ON "game" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "IDX_585dc8593e1c01b0f5e78477cf" ON "game" USING btree ("date" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_e3018c27fdac8174ca49115411" ON "betDoubler" USING btree ("weekId" uuid_ops,"userId" text_ops,"leagueId" text_ops);--> statement-breakpoint
CREATE INDEX "IDX_08897b166dee565859b7fb2fcc" ON "member" USING btree ("userId" uuid_ops);--> statement-breakpoint
CREATE INDEX "IDX_439998ed986bab5ccce25fb69d" ON "member" USING btree ("leagueId" uuid_ops);--> statement-breakpoint
CREATE INDEX "IDX_05c82c10f7c651b94c36370112" ON "admin" USING btree ("leagueId" uuid_ops);--> statement-breakpoint
CREATE INDEX "IDX_f8a889c4362d78f056960ca6da" ON "admin" USING btree ("userId" uuid_ops);
