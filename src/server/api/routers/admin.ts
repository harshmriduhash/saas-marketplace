import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getPayments: publicProcedure.query(async ({ ctx }) => {
    const payments = await ctx.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return payments;
  }),

  getFeaturedListings: publicProcedure.query(async ({ ctx }) => {
    const listings = await ctx.prisma.listing.findMany({
      where: { isFeatured: true },
      orderBy: { featuredUntil: 'desc' },
      take: 50,
    });
    return listings;
  }),
});
