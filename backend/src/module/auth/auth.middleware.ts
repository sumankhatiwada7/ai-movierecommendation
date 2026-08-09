import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { verfiyaccessToken } from "../../core/jwt/token";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export type roleresponse={
    message:string;
    sucess:boolean;
}


export type tokenerror={
    message:string;
    sucess:boolean;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

export function authorize(roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !roles.includes(req.user.role)) {
                const payload: roleresponse = {
                    message: "Forbidden: You don't have permission to access this resource",
                    sucess: false
                };
                return res.status(403).json(payload);
            }

            return next();
        } catch (error) {
            const payload: roleresponse = {
                message: "Internal server error",
                sucess: false
            };
            return res.status(500).json(payload);
        }
    };
}