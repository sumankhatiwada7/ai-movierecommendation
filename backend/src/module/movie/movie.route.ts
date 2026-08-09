import {authorize,authenticate} from "../auth/auth.middleware";
import { Router } from "express";
import { listMovies, getMovieById, createMovie, updateMovie, deleteMovie } from "./movie.controller";


const router = Router();


router.get("/", listMovies);
router.get("/:id", getMovieById);
router.post("/", authenticate, authorize(["admin"]), createMovie);
router.put("/:id", authenticate, authorize(["admin"]), updateMovie);
router.delete("/:id", authenticate, authorize(["admin"]), deleteMovie);

export default router;