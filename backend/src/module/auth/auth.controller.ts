import { prisma } from "../../core/database/prisma.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import  type  { userrequest } from "./auth.type.js";
import  type  { Request,Response } from "express";
import type{error} from "./auth.type.js";
import type { userresponse,loginrequest,loginresponse } from "./auth.type.js";
import type { userapiresponse } from "./auth.type.js";
import {generateAccessToken,generateRefreshToken,verfiyrefreshToken} from "../../core/jwt/token.js"
import { AuthService } from "./auth.service.js";

function hashpassword(password: string): Promise<string> {
    return  bcrypt.hash(password, 10);
}

export async function register(req: Request, res: Response){
    try{
    const data= req.body as userrequest;
    const name = data.name;
    const email = data.email;
    const password = data.password;
    const role = data.role||"user";
    const errors: NonNullable<error<string>["errors"]> = [];
    const emailregix="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";


    if(!name) errors.push("Name is required");
    if(!new RegExp(emailregix).test(email)) errors.push("Email is invalid");
    if(!password) errors.push("Password is required");

    if(!role) errors.push("Role is required");

    if(errors.length>0){
        const payload: error<string> = {
            errors,
            message: "Validation failed"
        }
        return res.status(400).json(payload)
    }

    const user = await new AuthService().findUserByEmail(email);
    if(user){
        const payload:userapiresponse = {
            message:"User already exists",
            sucess:false
        }
        return res.status(400).json(payload)
    }

    const hashedPassword = hashpassword(password);
    const newuser= await new AuthService().createUser(name,email,await hashedPassword,role);
    const payload:userresponse<typeof newuser> = {
        message:"User created successfully",
        sucess:true,
        user:newuser
    }
    return res.status(201).json(payload)


}
catch(error){
    const payload={
        message:"Internal server error",
        sucess:false
    }
    return res.status(500).json(payload)
}
}

export async function login (req:Request,res:Response){
    try{
    const data = req.body as  loginrequest
    const email=data.email;
    const password=data.password;
    const errors: NonNullable<error<string>["errors"]> = [];
    const emailregix="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";


    if(!new RegExp(emailregix).test(email)) errors.push("Email is invalid");
    if(!password) errors.push("Password is required");
    if(errors.length>0){
        const payload:error<string>={
            errors,
            message:"validation failed"
        }
    }
    const existinguser= await new AuthService().findUserByEmail(email);
    if(!existinguser){
        const payload:userapiresponse={
            message:"User doesnt exist",
            sucess:false

        }
    }
   const matchpassword=  await bcrypt.compare(password,existinguser.password);
   if(!matchpassword){
    const payload:userapiresponse={
        message:"Password is incorrect",
        sucess:false
    }
    return res.status(400).json(payload)
}
    const accesstoken = generateAccessToken(existinguser.id,existinguser.email,existinguser.role);
   const refreshtoken = generateRefreshToken(existinguser.id,existinguser.email,existinguser.role);
   existinguser.refreshtoken=refreshtoken;
     await prisma.user.save(existinguser);
     res.cookie("refreshtoken",refreshtoken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     })
     const payload:loginresponse<typeof accesstoken> = {
        message:"Login successful",
        sucess:true,
        token:accesstoken
     }
    return res.status(200).json(payload);
    }
    catch(error){
      const payload:userapiresponse={
        message:"Internal server error",
        sucess:false
      }
      return res.status(500).json(payload);
    }
}

export async function refresh(req:Request,res:Response){
    try{
    const token =req.cookies.refreshtoken;
    if(!token){
        const payload:userapiresponse={
            message:"Refresh token is missing",
            sucess:false
        }
        return res.status(401).json(payload);
    
    }
    const verifiedtoken=verfiyrefreshToken(token);
    if(!verifiedtoken){
        const payload:userapiresponse={
            message:"Refresh token is invalid",
            sucess:false
        }
        return res.status(401).json(payload);
    }
    const user = await new AuthService().findUserById(verifiedtoken.id);
    if(!user){
        const payload:userapiresponse={
            message:"User not found",
            sucess:false
    }
    return res.status(404).json(payload);
    }
    const newaccesstoken = generateAccessToken(user.id,user.email,user.role);
    const payload:loginresponse<typeof newaccesstoken> = {
        message:"Access token refreshed successfully",
        sucess:true,
        token:newaccesstoken

    }
    return res.status(200).json(payload);
}
    catch(error){
       const payload:userapiresponse={
        message:"Internal server error",
        sucess:false
    }
    return res.status(500).json(payload);
}

}

