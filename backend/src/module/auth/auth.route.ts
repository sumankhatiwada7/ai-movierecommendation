import express from "express";
import {register,login,refresh} from "./auth.controller";

const router = express.Router();


 router.post("/register",register);
 router.post("/login",login);
 router.post("/refresh-token",refresh);

 export default router;