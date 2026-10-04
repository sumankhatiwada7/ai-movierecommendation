import express from "express";
import {register,login,refresh,logout,forgotPassword,checkUserEmail} from "./auth.controller";
const router = express.Router();
 router.post("/register",register);
 router.post("/login",login);
 router.post("/forgot-password",forgotPassword);
 router.post("/check-email",checkUserEmail);
 router.post("/refresh-token",refresh);
 router.post("/logout",logout);

 export default router;


 