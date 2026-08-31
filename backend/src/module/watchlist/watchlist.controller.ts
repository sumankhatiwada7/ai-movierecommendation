import { AuthenticatedRequest } from "../auth/auth.middleware";
import { TmdbService } from "../tmdb/tmdb.service";
import { watchlistservice } from "./watchlist.service"
import { Response, Request } from "express"
import { watchlistresponse, watchlistresponsewithdata } from "./watchlist.type";
import { Movie } from "../watch/watch.type";



export async function addtowatchlist(Req: AuthenticatedRequest, Res: Response) {
    try {
        const userId = String(Req.user?.id);
        const tmdbId = Number(Req.params.tmdbId);
        const title = String(Req.body.title);
        if (!tmdbId) {
            const payload: watchlistresponse = {
                message: "invalid tmdbId",
                sucess: false
            }
            Res.status(400).json(payload);
        }
        const checkwatchlist = await new watchlistservice().findwatchlistitem(userId, tmdbId);
        if (checkwatchlist) {
            const payload: watchlistresponse = {
                message: "already in watchlist",
                sucess: false
            }
            Res.status(400).json(payload);
        }

        const watchlistadd = await new watchlistservice().addtowatchlist(userId, tmdbId, title);
        if (!watchlistadd) {
            const payload: watchlistresponse = {
                message: "failed to add to watchlist",
                sucess: false
            }
            Res.status(400).json(payload);
        }
        const payload: watchlistresponse = {
            message: "added to watchlist",
            sucess: true
        }
        Res.status(200).json(payload);
    }
    catch (error) {

        if (error instanceof Error && error.message === "Watchlist limit reached (max 5 movies)") {
            const payload: watchlistresponse = {
                message: " watchlist limit reached (max 5 movies)",
                sucess: false
            }
            Res.status(403).json(payload)

        }

        const payload: watchlistresponse = {
            message: "internal server error",
            sucess: false
        }
        Res.status(500).json(payload);
    }
}

export async function removefromwatchlist(Req: AuthenticatedRequest, Res: Response) {
    try {
        const userId = String(Req.user?.id);
        const tmdbId = Number(Req.params.tmdbId);
        if (!tmdbId) {
            const payload: watchlistresponse = {
                message: "invalid tmdbId",
                sucess: false
            }
            Res.status(400).json(payload);
        }
        const checkwatchlist = await new watchlistservice().findwatchlistitem(userId, tmdbId);
        if (!checkwatchlist) {
            const payload: watchlistresponse = {
                message: "not in watchlist",
                sucess: false
            }
            Res.status(400).json(payload);
        }
        const watchlistremove = await new watchlistservice().removefromwatchlist(userId, tmdbId);
        if (!watchlistremove) {
            const payload: watchlistresponse = {
                message: "failed to remove from watchlist",
                sucess: false
            }
            Res.status(400).json(payload);
        }
        const payload: watchlistresponse = {
            message: "removed from watchlist",
            sucess: true
        }
        Res.status(200).json(payload);
    }
    catch (error) {
        const payload: watchlistresponse = {
            message: "internal server error",
            sucess: false
        }
        Res.status(500).json(payload);
    }
}

export async function getwatchlist(Req: AuthenticatedRequest, Res: Response) {
    const userId = String(Req.user?.id);
    const watchlist = await new watchlistservice().getwatchlist(userId);
    if (!watchlist) {
        const payload: watchlistresponse = {
            message: "failed to get watchlist",
            sucess: false
        }
        Res.status(400).json(payload);
    }
    if (watchlist.length === 0) {
        const payload: watchlistresponsewithdata = {
            message: "Watchlist retrieved successfully",
            sucess: true,
            data: [],
        };
        return Res.status(200).json(payload);
    }
    const tmdbIds = watchlist.map((item: { tmdbId: number }) => item.tmdbId);
    const moviePromises: Promise<Movie | null>[] = tmdbIds.map((tmdbId: number) =>
        new TmdbService()
            .getMovieDetails(tmdbId)
            .catch((err: Error) => {
                console.warn(`Failed to fetch movie ${tmdbId}:`, err);
                return null;
            })
    );

    const movies = (await Promise.all(moviePromises)).filter(
        (movie): movie is Movie => movie !== null
    );

    const payload: watchlistresponsewithdata = {
        message: "watchlist retrieved successfully",
        sucess: true,
        data: movies
    }
    Res.status(200).json(payload);
}