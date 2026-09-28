import {authenticate, activeSubscription} from "../auth/auth.middleware";
import { Router } from "express";
import { listMovies, getMovieById, listGenres} from "./movie.controller";


const router = Router();

router.get("/search", authenticate, activeSubscription, listMovies);
router.get("/", authenticate, activeSubscription, listMovies);
router.get("/genres", authenticate, activeSubscription, listGenres);
router.get("/:tmdbId", authenticate, activeSubscription, getMovieById);

export default router;