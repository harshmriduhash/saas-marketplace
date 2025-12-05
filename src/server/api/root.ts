import { createTRPCRouter } from "~/server/api/trpc";
import { listingsRouter } from "~/server/api/routers/listings";
import { adminRouter } from "~/server/api/routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  listings: listingsRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
