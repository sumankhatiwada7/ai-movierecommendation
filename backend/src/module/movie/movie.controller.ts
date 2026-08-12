import type { Request, Response } from "express";
import type { movierequest, movieresponse, movielistresponse, movieapiresponse, error } from "./movie.type";
import { MovieService } from "./movie.service";

export async function listMovies(req: Request, res: Response) {
    try {
        const query = req.query as { page?: string; limit?: string; search?: string; genreId?: string; sortBy?: string };
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 && Number(query.limit) <= 50 ? Number(query.limit) : 20;
        const search = query.search;
        const genreId = query.genreId;
        const sortBy = query.sortBy === "rating" ? "rating" : "latest";

        const { movies, total } = await new MovieService().findall(page, limit, search, genreId, sortBy);

        const payload: movielistresponse<typeof movies[number]> = {
            message: "Movies fetched successfully",
            sucess: true,
            movies,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
        return res.status(200).json(payload);
    }
    catch (error) {
        console.error("List movies failed:", error);
        const payload: movieapiresponse = {
            message: "Internal server error",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}

export async function getMovieById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            const payload: movieapiresponse = {
                message: "Invalid movie id",    
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const movie = await new MovieService().findById(id);
        if (!movie) {
            const payload: movieapiresponse = {
                message: "Movie not found",
                sucess: false,
            };
            return res.status(404).json(payload);
        }

        const payload: movieresponse<typeof movie> = {
            message: "Movie fetched successfully",
            sucess: true,
            movie,
        };
        return res.status(200).json(payload);
    }
    catch (error) {
        console.error("Get movie failed:", error);
        const payload: movieapiresponse = {
            message: "Internal server error",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}

export async function createMovie(req: Request, res: Response) {
    try {
        const data = req.body as movierequest;
        const errors: NonNullable<error<string>["errors"]> = [];

        if (!data.title) errors.push("Title is required");
        if (typeof (data as movierequest & { tmdbId?: unknown }).tmdbId !== "number" || Number.isNaN((data as movierequest & { tmdbId?: unknown }).tmdbId)) {
            errors.push("TMDB ID is required");
        }
        if (data.releaseYear && (data.releaseYear < 1888 || data.releaseYear > new Date().getFullYear() + 1)) {
            errors.push("Release year is invalid");
        }

        if (errors.length > 0) {
            const payload: error<string> = {
                errors,
                message: "Validation failed",
            };
            return res.status(400).json(payload);
        }

        const movie = await new MovieService().create(data as movierequest & { tmdbId: number });
        const payload: movieresponse<typeof movie> = {
            message: "Movie created successfully",
            sucess: true,
            movie,
        };
        return res.status(201).json(payload);
    }
    catch (error) {
        console.error("Create movie failed:", error);
        const payload: movieapiresponse = {
            message: "Internal server error",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}

export async function updateMovie(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            const payload: movieapiresponse = {
                message: "Invalid movie id",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const data = req.body as Partial<movierequest>;
        const existing = await new MovieService().findById(id);
        if (!existing) {
            const payload: movieapiresponse = {
                message: "Movie not found",
                sucess: false,
            };
            return res.status(404).json(payload);
        }

        const movie = await new MovieService().update(id, data);
        const payload: movieresponse<typeof movie> = {
            message: "Movie updated successfully",
            sucess: true,
            movie,
        };
        return res.status(200).json(payload);
    }
    catch (error) {
        console.error("Update movie failed:", error);
        const payload: movieapiresponse = {
            message: "Internal server error",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}

export async function deleteMovie(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            const payload: movieapiresponse = {
                message: "Invalid movie id",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const existing = await new MovieService().findById(id);
        if (!existing) {
            const payload: movieapiresponse = {
                message: "Movie not found",
                sucess: false,
            };
            return res.status(404).json(payload);
        }

        await new MovieService().delete(id);
        const payload: movieapiresponse = {
            message: "Movie deleted successfully",
            sucess: true,
        };
        return res.status(200).json(payload);
    }
    catch (error) {
        console.error("Delete movie failed:", error);
        const payload: movieapiresponse = {
            message: "Internal server error",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}