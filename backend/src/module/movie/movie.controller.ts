import type { Request, Response } from "express";
import { TmdbService } from "../tmdb/tmdb.service";
import type { movielistresponse, movieresponse, movieapiresponse } from "./movie.type";

export async function listMovies(req: Request, res: Response) {
    try {
        const query = req.query as { page?: string; genreId?: string; sortBy?: string; search?: string };
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const genreId = query.genreId ? Number(query.genreId) : undefined;
        const sortBy = query.sortBy === "rating" ? "rating" : "latest";

        const tmdb = new TmdbService();
        const result = query.search
            ? await tmdb.searchMovies(query.search, page)
            : await tmdb.discoverMovies(page, genreId, sortBy);

        const payload: movielistresponse<typeof result.movie[number]> = {
            message: "Movies fetched successfully",
            sucess: true,
            movies: result.movie,
            pagination: { page, totalPages: result.totalPages, totalResults: result.totalResults },
        };
        return res.status(200).json(payload);
    } catch (error) {
        console.error("List movies failed:", error);
        const payload: movieapiresponse = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}

export async function getMovieById(req: Request, res: Response) {
    try {
        const tmdbId = Number(req.params.tmdbId);
        if (isNaN(tmdbId)) {
            return res.status(400).json({ message: "Invalid movie id", sucess: false });
        }

        const movie = await new TmdbService().getMovieDetails(tmdbId);
        const payload: movieresponse<typeof movie> = {
            message: "Movie fetched successfully",
            sucess: true,
            movie,
        };
        return res.status(200).json(payload);
    } catch (error) {
        console.error("Get movie failed:", error);
        const payload: movieapiresponse = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}

export async function listGenres(_req: Request, res: Response) {
    try {
        const genres = await new TmdbService().getGenres();
        return res.status(200).json({ message: "Genres fetched successfully", sucess: true, genres });
    } catch (error) {
        console.error("List genres failed:", error);
        return res.status(500).json({ message: "Internal server error", sucess: false });
    }
}