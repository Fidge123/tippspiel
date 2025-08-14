CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league" uuid NOT NULL,
	"user" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team" integer NOT NULL,
	"value" integer NOT NULL,
	"game" integer NOT NULL,
	"user" uuid NOT NULL,
	"league" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bet_game_user_league_unique" UNIQUE("game","user","league")
);
--> statement-breakpoint
CREATE TABLE "betDoubler" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bet" uuid NOT NULL,
	"user" uuid NOT NULL,
	"league" uuid NOT NULL,
	"week" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "betDoubler_user_league_week_unique" UNIQUE("user","league","week")
);
--> statement-breakpoint
CREATE TABLE "bye" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team" integer NOT NULL,
	"week" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "division" (
	"id" varchar PRIMARY KEY NOT NULL,
	"conference" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divisionBet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"division" varchar NOT NULL,
	"user" uuid NOT NULL,
	"league" uuid NOT NULL,
	"first" integer NOT NULL,
	"second" integer NOT NULL,
	"third" integer NOT NULL,
	"fourth" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "divisionBet_division_user_league_unique" UNIQUE("division","user","league")
);
--> statement-breakpoint
CREATE TABLE "failedLoginAttempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" integer PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"awayTeam" integer,
	"homeTeam" integer,
	"week" varchar NOT NULL,
	"status" varchar NOT NULL,
	"awayScore" integer,
	"awayScoreQ1" integer,
	"awayScoreQ2" integer,
	"awayScoreQ3" integer,
	"awayScoreQ4" integer,
	"awayScoreOT" integer,
	"homeScore" integer,
	"homeScoreQ1" integer,
	"homeScoreQ2" integer,
	"homeScoreQ3" integer,
	"homeScoreQ4" integer,
	"homeScoreOT" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"season" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league" uuid NOT NULL,
	"user" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar NOT NULL,
	"user" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season" (
	"id" integer PRIMARY KEY NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"current" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "superbowlBet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team" integer NOT NULL,
	"user" uuid NOT NULL,
	"league" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "superbowlBet_user_league_unique" UNIQUE("user","league")
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" integer PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"shortName" varchar NOT NULL,
	"name" varchar NOT NULL,
	"wins" integer,
	"losses" integer,
	"ties" integer,
	"season" integer NOT NULL,
	"logo" varchar NOT NULL,
	"color1" varchar,
	"color2" varchar,
	"division" varchar NOT NULL,
	"position" integer,
	"pointsFor" integer,
	"pointsAgainst" integer,
	"streak" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"salt" varchar NOT NULL,
	"name" varchar NOT NULL,
	"settings" jsonb NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"consentedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifyToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar NOT NULL,
	"user" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "week" (
	"id" varchar PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"stage" varchar NOT NULL,
	"week" varchar NOT NULL,
	"start" timestamp,
	"end" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_league_league_id_fk" FOREIGN KEY ("league") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_team_team_id_fk" FOREIGN KEY ("team") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_game_game_id_fk" FOREIGN KEY ("game") REFERENCES "public"."game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_league_league_id_fk" FOREIGN KEY ("league") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "betDoubler_bet_bet_id_fk" FOREIGN KEY ("bet") REFERENCES "public"."bet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "betDoubler_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "betDoubler_league_league_id_fk" FOREIGN KEY ("league") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "betDoubler" ADD CONSTRAINT "betDoubler_week_week_id_fk" FOREIGN KEY ("week") REFERENCES "public"."week"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bye" ADD CONSTRAINT "bye_team_team_id_fk" FOREIGN KEY ("team") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bye" ADD CONSTRAINT "bye_week_week_id_fk" FOREIGN KEY ("week") REFERENCES "public"."week"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_division_division_id_fk" FOREIGN KEY ("division") REFERENCES "public"."division"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_league_league_id_fk" FOREIGN KEY ("league") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_first_team_id_fk" FOREIGN KEY ("first") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_second_team_id_fk" FOREIGN KEY ("second") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_third_team_id_fk" FOREIGN KEY ("third") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisionBet" ADD CONSTRAINT "divisionBet_fourth_team_id_fk" FOREIGN KEY ("fourth") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_awayTeam_team_id_fk" FOREIGN KEY ("awayTeam") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_homeTeam_team_id_fk" FOREIGN KEY ("homeTeam") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_week_week_id_fk" FOREIGN KEY ("week") REFERENCES "public"."week"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league" ADD CONSTRAINT "league_season_season_id_fk" FOREIGN KEY ("season") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_league_league_id_fk" FOREIGN KEY ("league") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resetToken" ADD CONSTRAINT "resetToken_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superbowlBet" ADD CONSTRAINT "superbowlBet_team_team_id_fk" FOREIGN KEY ("team") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superbowlBet" ADD CONSTRAINT "superbowlBet_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "superbowlBet" ADD CONSTRAINT "superbowlBet_league_league_id_fk" FOREIGN KEY ("league") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_season_season_id_fk" FOREIGN KEY ("season") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_division_division_id_fk" FOREIGN KEY ("division") REFERENCES "public"."division"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifyToken" ADD CONSTRAINT "verifyToken_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "week" ADD CONSTRAINT "week_season_season_id_fk" FOREIGN KEY ("season") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;