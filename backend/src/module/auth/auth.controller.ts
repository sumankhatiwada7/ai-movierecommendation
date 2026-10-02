import { prisma } from "../../core/database/prisma";
import bcrypt from "bcrypt"
import  type  { userrequest } from "./auth.type";
import  type  { Request,Response } from "express";
import type{error} from "./auth.type";
import type { userresponse,loginrequest,loginresponse } from "./auth.type";
import type { userapiresponse } from "./auth.type";
import type { userrole } from "@prisma/client";
import {generateAccessToken,generateRefreshToken,verfiyrefreshToken} from "../../core/jwt/token"
import { AuthService } from "./auth.service";

function hashpassword(password: string): Promise<string> {
    return  bcrypt.hash(password, 10);
}

export async function register(req: Request, res: Response){
    try{
    const data= req.body as userrequest;
    const name = data.name;
    const email = data.email;
    const password = data.password;
    const confirmpassword = data.confirmpassword;
    const role: userrole = data.role === "admin" ? "admin" : "user";
    const errors: NonNullable<error<string>["errors"]> = [];
    const fieldErrors: Record<string, string> = {};
    const emailregix="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
    const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;


    if(!name) {
        const message = "Name is required";
        errors.push(message);
        fieldErrors.name = message;
    }
    if(!new RegExp(emailregix).test(email)) {
        const message = "Email is invalid";
        errors.push(message);
        fieldErrors.email = message;
    }
    if(!password) {
        const message = "Password is required";
        errors.push(message);
        fieldErrors.password = message;
    } else if(!passwordregex.test(password)) {
        const message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
        errors.push(message);
        fieldErrors.password = message;
    }
    if(!confirmpassword) {
        const message = "Please confirm your password";
        errors.push(message);
        fieldErrors.confirmpassword = message;
    } else if(password !== confirmpassword) {
        const message = "Password and confirm password do not match";
        errors.push(message);
        fieldErrors.confirmpassword = message;
    }

    if(!role) errors.push("Role is required");
    

    if(errors.length>0){
        const payload: error<string> = {
            errors,
            message: "Validation failed",
            fieldErrors,
        }
        return res.status(400).json(payload)
    }

    const user = await new AuthService().findUserByEmail(email);
    if(user){
        const payload:userapiresponse = {
            message:"User already exists",
            sucess:false,
            fieldErrors: { email: "User already exists" }
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
    console.error("Register failed:", error);
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
    const fieldErrors: Record<string, string> = {};
    const emailregix="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
    const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if(!new RegExp(emailregix).test(email)) {
        const message = "Email is invalid";
        errors.push(message);
        fieldErrors.email = message;
    }
    if(!password) {
        const message = "Password is required";
        errors.push(message);
        fieldErrors.password = message;
    } else if(!passwordregex.test(password)) {
        const message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
        errors.push(message);
        fieldErrors.password = message;
    }
    if(errors.length>0){
        const payload:error<string>={
            errors,
            message:"validation failed",
            fieldErrors
        }
        return res.status(400).json(payload)
    }
    const existinguser= await new AuthService().findUserByEmail(email);
    if(!existinguser){
        const payload:userapiresponse={
            message:"User doesnt exist",
            sucess:false,
            fieldErrors: { email: "User doesnt exist" }

        }
        return res.status(404).json(payload)
    }
   const matchpassword=  await bcrypt.compare(password,existinguser.password);
   if(!matchpassword){
    const payload:userapiresponse={
        message:"Password is incorrect",
        sucess:false,
        fieldErrors: { password: "Password is incorrect" }
    }
    return res.status(400).json(payload)
}
    const tokenPayload = {
        id: existinguser.id,
        email: existinguser.email,
        role: existinguser.role,
    };
    const accesstoken = generateAccessToken(tokenPayload);
   const refreshtoken = generateRefreshToken(tokenPayload);
         await new AuthService().updateRefreshToken(existinguser.id, refreshtoken);
     res.cookie("refreshtoken",refreshtoken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     })
     const payload:loginresponse<typeof accesstoken> & { accessToken: string; user: { id: string; name: string; email: string; role: string } } = {
        message:"Login successful",
        sucess:true,
        token:accesstoken,
        accessToken: accesstoken,
        user: {
            id: existinguser.id,
            name: existinguser.name,
            email: existinguser.email,
            role: existinguser.role,
        }
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
    const token =req.cookies?.refreshtoken;
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
    const newaccesstoken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const payload:loginresponse<typeof newaccesstoken> & { accessToken: string; user: { id: string; name: string; email: string; role: string } } = {
        message:"Access token refreshed successfully",
        sucess:true,
        token:newaccesstoken,
        accessToken: newaccesstoken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }

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

export async function logout(Req:Request,Res:Response){
    try{
    const token = Req.cookies?.refreshtoken;
    if(token){
        const verifiedtoken = verfiyrefreshToken(token);
        if(verifiedtoken){
            await new AuthService().removeRefreshToken(verifiedtoken.id);
        }
    }
    Res.clearCookie("refreshtoken");
    const payload:userapiresponse={
        message:"Logout successful",
        sucess:true
    }
    return Res.status(200).json(payload);
    }
    catch(error){
        const payload:userapiresponse={
            message:"Internal server error",
            sucess:false
        }
        return Res.status(500).json(payload);
    }
}

