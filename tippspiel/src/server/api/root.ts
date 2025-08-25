import { leagueRouter } from "~/server/api/routers/league";
import { syncRouter } from "~/server/api/routers/sync";
import { userRouter } from "~/server/api/routers/user";
import { weekRouter } from "~/server/api/routers/week";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  sync: syncRouter,
  league: leagueRouter,
  week: weekRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
