import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import { listMovies, getMovieById, listGenres} from "./movie.controller";


const router = Router();

router.get("/search", authenticate, listMovies);
router.get("/", authenticate, listMovies);
router.get("/genres", authenticate, listGenres);
router.get("/:tmdbId", authenticate, getMovieById);

export default router;