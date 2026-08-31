import { prisma } from "../../core/database/prisma";



export class watchlistservice {


    async addtowatchlist(userId: string, tmdbId: number, title: string) {
        const count = await prisma.watchlist.count({
            where: { userId },
        });

        if (count >= 5) {
            throw new Error("Watchlist limit reached (max 5 movies)");
        }

        return prisma.watchlist.upsert({
            where: {
                userId_tmdbId: { userId, tmdbId }
            },
            update: {
            },
            create: {
                userId, tmdbId, title
            },

        })
    }
    async removefromwatchlist(userId: string, tmdbId: number) {
        return prisma.watchlist.delete({
            where: {
                userId_tmdbId: { userId, tmdbId }
            },

        })
    }

    async getwatchlist(userId: string, limit = 5) {
        return prisma.watchlist.findMany({
            where: {
                userId
            },
            orderBy: { addedAt: 'desc' },
            take: limit,
            select: { tmdbId: true }

        })
    }
    async findwatchlistitem(userId: string, tmdbId: number) {
        return prisma.watchlist.findUnique({
            where: {
                userId_tmdbId: { userId, tmdbId }
            },

        })
    }
}