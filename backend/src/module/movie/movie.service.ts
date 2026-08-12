import {prisma} from '../../core/database/prisma'
import type { movierequest } from './movie.type'


export class MovieService{
    getOrCacheByTmdbId(tmdbId: number): any {
        throw new Error("Method not implemented.");
    }
    async findall(page: number, limit: number, search?: string, genreId?: string, sortBy: "latest" | "rating" = "latest") {
    const where = {
        AND: [
            search ? { title: { contains: search, mode: 'insensitive' as const } } : {},
            genreId ? { genres: { some: { id: genreId } } } : {},
        ]
    }

    const orderBy = sortBy === "rating"
        ? { averageRating: 'desc' as const }
        : { createdAt: 'desc' as const };

    const movies = await prisma.movie.findMany({
        where,
        include: { genres: true },
        skip: (page - 1) * limit,
        orderBy,
        take: limit,
    })
    const total = await prisma.movie.count({ where });

    return { movies, total }
}
    async findById(id: number) {
        return prisma.movie.findUnique({
            where: { id },
            include: { genres: true },
        });
    }

    // modules/movie/movie.service.ts
async create(data: movierequest & { tmdbId: number }) {
    const { genreIds, ...rest } = data;
    return prisma.movie.create({
        data: {
            ...rest,
            ...(genreIds ? { genres: { connect: genreIds.map((id) => ({ id })) } } : {}),
        },
        include: { genres: true },
    });
}

async update(id: number, data: Partial<movierequest>) {
    const { genreIds, ...rest } = data;
    return prisma.movie.update({
        where: { id },
        data: {
            ...rest,
            ...(genreIds ? { genres: { set: genreIds.map((id) => ({ id })) } } : {}),
        },
        include: { genres: true },
    });
}
async delete(id: number) {
    return prisma.movie.delete({
        where:{id}
    })
}

}