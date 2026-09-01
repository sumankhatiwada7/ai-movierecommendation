import { watchservice } from "./watch.service";
import type { Request, Response } from "express"
import type { watchhistoryresponse, watchsourceresponse, watchprogressapiresponse, watchprogressresponse, watchprogressbatch, watchhistoryresponsemovie, Movie } from "./watch.type";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { TmdbService } from "../tmdb/tmdb.service";



export async function logwatch(Req: AuthenticatedRequest, Res: Response) {

    try {
        const userId = String(Req.user?.id);
        const rawTmdbId = Req.params.tmdbId ?? Req.body?.tmdbId ?? Req.query?.tmdbId;
        const tmdbId = Number(rawTmdbId);

        if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
            const payload: watchhistoryresponse = {
                message: "TMDB id is missing",
                sucess: false
            }
            return Res.status(400).json(payload);
        }

        const movie = await new TmdbService().getMovieDetails(tmdbId);

        await new watchservice().logwatch(userId, tmdbId, movie.title);
        const payload: watchhistoryresponse = {
            message: "Watch history logged successfully",
            sucess: true
        }
        return Res.status(200).json(payload);

    }
    catch (error) {
        console.error("Error logging watch history:", error);
        const payload: watchhistoryresponse = {
            message: "Error logging watch history",
            sucess: false
        }
        return Res.status(500).json(payload);
    }
}


export async function getwatchpogress(Req: AuthenticatedRequest, Res: Response) {
    try {
        const id = Req.user?.id;
        const tmdbId = Number(Req.params.tmdbId);
        if (!id) {
            const payload: watchprogressapiresponse = {
                message: "User id is missing",
                sucess: false
            }
            return Res.status(400).json(payload);
        }
        if (!tmdbId) {
            const payload: watchprogressapiresponse = {
                message: "TMDB id is missing",
                sucess: false
            }
            return Res.status(400).json(payload);
        }
        const watchpogress = await new watchservice().getwatchprogress(String(id), tmdbId);
        if (!watchpogress) {
            const payload: watchprogressapiresponse = {
                message: "No  watch progress found ",
                sucess: false
            }
            return Res.status(404).json(payload);
        }
        const payload: watchprogressresponse<number> = {
            message: "Watch progress retrieved successfully",
            sucess: true,
            time: watchpogress.time
        }
        return Res.status(200).json(payload);
    }
    catch (error) {
        const payload: watchprogressapiresponse = {
            message: "internal server error",
            sucess: false
        }
        return Res.status(500).json(payload);
    }
    console.error("Error retrieving watch progress:", Error);

}

export async function recordwatchprogress(Req: AuthenticatedRequest, Res: Response) {

    try {

        let { time, tmdbId } = Req.body;
        if (!tmdbId && Req.query.tmdbId) tmdbId = Number(Req.query.tmdbId);
        if (!tmdbId && Req.params.tmdbId) tmdbId = Number(Req.params.tmdbId);
        if (!time && Req.query.time) time = Number(Req.query.time);


        const id = Req.user?.id;
        if (!id) {
            const payload: watchprogressapiresponse = {
                message: "User id is missing",
                sucess: false
            }
            return Res.status(400).json(payload);
        }
        if (!tmdbId) {
            const payload: watchprogressapiresponse = {
                message: "TMDB id is missing",
                sucess: false
            }
            return Res.status(400).json(payload);
        }
        if (time === undefined || time === null) {
            const payload: watchprogressapiresponse = {
                message: "Time is missing",
                sucess: false
            }
            return Res.status(400).json(payload);
        }

        const watchpogress = await new watchservice().recordwatchprogress(String(id), Number(tmdbId), Number(time));
        if (!watchpogress) {
            const payload: watchprogressapiresponse = {
                message: "Failed to record watch progress",
                sucess: false
            }
            return Res.status(404).json(payload);
        }
        const payload: watchprogressapiresponse = {
            message: "Watch progress recorded successfully",
            sucess: true
        }
        return Res.status(201).json(payload);

    }
    catch (error) {

        const payload: watchprogressapiresponse = {
            message: "internal server error",
            sucess: false
        }
        return Res.status(500).json(payload);
    }


}


export async function watchpogressbatch(Req: AuthenticatedRequest, Res: Response) {
    try {

        const rawIds = Req.query.ids ?? Req.query["ids[]"];
        const normalizeIds = (value: unknown): number[] => {
            if (value === undefined || value === null) return [];

            if (Array.isArray(value)) {
                return value.flatMap(item => normalizeIds(item));
            }

            if (typeof value === "object") {
                return Object.values(value as Record<string, unknown>).flatMap(item => normalizeIds(item));
            }

            return String(value)
                .split(',')
                .map(item => Number(item.trim()))
                .filter(item => Number.isFinite(item));
        };

        const tmdbIds = normalizeIds(rawIds);
        const id = Req.user?.id;

        if (!id) {
            const payload: watchprogressapiresponse = {
                message: "User id is missing",
                sucess: false
            };
            return Res.status(400).json(payload);
        }

        const batchmovie = await new watchservice().watchpogressbatch(String(id), tmdbIds);
        if (!batchmovie) {
            const payload: watchprogressapiresponse = {
                message: "no movie found",
                sucess: true
            }
            return Res.status(404).json(payload);
        }


        const payload: watchprogressbatch<{ tmdbId: number, time: number }[]> = {
            message: "Watch progress retrieved successfully",
            sucess: true,
            movies: batchmovie.map(movie => ({ tmdbId: movie.tmdbId, time: movie.time }))
        }
        return Res.status(200).json(payload);

    }
    catch (error) {
        console.log('error:', error);
        const payload: watchprogressapiresponse = {
            message: "internal server error",
            sucess: false
        }
        return Res.status(500).json(payload);
    }


}

export async function watchhistory(Req: AuthenticatedRequest, Res: Response) {
    try {
        const id = Req.user?.id;
        const watchhistory = await new watchservice().watchhistory(String(id));
        if (!watchhistory) {
            const payload: watchprogressapiresponse = {
                message: "no watch history found",
                sucess: false
            }
            return Res.status(404).json(payload);
        }
        const moviePromises = watchhistory.map(entry =>
            new TmdbService().getMovieDetails(entry.tmdbId)
                .catch(err => {
                    console.warn(`Failed to fetch details for tmdbId ${entry.tmdbId}:`, err);
                    return null; // skip movies that fail
                })
        );

        const movies = (await Promise.all(moviePromises))
            .filter((movie): movie is NonNullable<typeof movie> => movie !== null)
            .filter(movie => movie !== null) as Movie[];


        const payload: watchhistoryresponsemovie<{ tmdbId: number, title: string, watchedAt: Date }[]> = {
            message: "Watch history retrieved successfully",
            sucess: true,
            movies,
        }
        return Res.status(200).json(payload);
    }
    catch (error) {
        const payload: watchprogressapiresponse = {
            message: "internal server error",
            sucess: false
        }
        return Res.status(500).json(payload);
        console.error("Error retrieving watch history:", Error);

    }
}

