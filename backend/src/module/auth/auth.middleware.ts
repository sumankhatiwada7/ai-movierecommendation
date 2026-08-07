import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { verfiyaccessToken } from "../../core/jwt/token.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export type tokenerror={
    message:string;
    sucess:boolean;
}

export function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try{
    const authheader= req.headers.authorization;
    if(!authheader || !authheader.startsWith('Bearer ')){
        const payload:tokenerror={
            message:"Authorization header is missing or invalid",
            sucess:false
        }
        return res.status(401).json(payload);

    }
    const token = authheader.split(' ')[1];
    if(!token){
        const payload:tokenerror={
            message:"Token is missing",
            sucess:false
        }
        return res.status(401).json(payload);



    }
    const verfiytoken=verfiyaccessToken(token);
    if(!verfiytoken){
        const payload:tokenerror={
            message:"Invalid token",
            sucess:false
        }
        return res.status(401).json(payload);
    }
    req.user=verfiytoken;
    next();
}
catch(error){
    const payload:tokenerror={
        message:"Internal server error",
        sucess:false
}
return res.status(500).json(payload);
}
}