import axios from "axios";
import { prisma } from "../../core/database/prisma";
import { getOrSetCache } from "../../core/redis/cache";
import { TmdbService } from "../tmdb/tmdb.service";

interface mlListResponse {
    titles: string[];
}

const mlServiceTimeout = Number(process.env.ML_SERVICE_TIMEOUT_MS ?? 5000);

export function recommendationsCacheKey(userId: string, topK: number) {
    return `recommendations:${userId}:${topK}`;
}

export class RecommendationService {
    async getRecommendationsForUser(userId: string, topK = 10) {
        return getOrSetCache(recommendationsCacheKey(userId, topK), 60 * 15, async () => {
        const watched = await prisma.watchhistory.findMany({
            where: { userId },
            orderBy: { watchedAt: "desc" },
            take: 50,
        });
        const watchedTitles = watched.map((w) => w.title);
        const tmdb = new TmdbService();

        if (watchedTitles.length === 0) {
            const { movie:movies } = await tmdb.discoverMovies(1, undefined, "rating");
            return movies.slice(0, topK);
        }

        let mlData: mlListResponse;
        try {
            const { data } = await axios.post<mlListResponse>(
                `${process.env.ML_SERVICE_URL}/recommend`,
                { titles: watchedTitles, top_k: topK },
                { timeout: mlServiceTimeout }
            );
            mlData = data;
        } catch (error) {
            console.error("ML service call failed:", error instanceof Error ? error.message : error);
            const { movie:movies } = await tmdb.discoverMovies(1, undefined, "rating");
            return movies.slice(0, topK);
        }

        return this.resolveTitlesToMovies(mlData.titles, tmdb);
        });
    }

    async getSimilarMovies(title: string, topK = 10) {
        const normalizedTitle = title.trim().toLowerCase();
        const cacheKey = `recommendations:similar:${normalizedTitle}:${topK}`;
        return getOrSetCache(cacheKey, 60 * 60 * 6, async () => {
        const tmdb = new TmdbService();

        let mlData: mlListResponse;
        try {
            const { data } = await axios.post<mlListResponse>(
                `${process.env.ML_SERVICE_URL}/recommend/similar`,
                { title, top_k: topK },
                { timeout: mlServiceTimeout }
            );
            mlData = data;
        } catch (error) {
            console.error("ML similar-movies call failed:", error instanceof Error ? error.message : error);
            const searchResult = await tmdb.searchMovies(title, 1);
            const match = searchResult.movie[0];
            if (!match) return [];
            return tmdb.getSimilarMovies(match.tmdbId);
        }

        return this.resolveTitlesToMovies(mlData.titles, tmdb);
        });
    }

    private async resolveTitlesToMovies(titles: string[], tmdb: TmdbService) {
        const results = await Promise.all(
            titles.map(async (title) => {
                const searchResult = await tmdb.searchMovies(title, 1);
                return searchResult.movie[0]; // best match, or undefined if not found
            })
        );
        return results.filter((m): m is NonNullable<typeof m> => m !== undefined);
    }
}