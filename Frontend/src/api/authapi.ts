import {api} from "./axios"

export interface registerdata{
    name:string;
    email:string;
    password:string;
    confirmpassword:string;
    role:string;
}
export interface logindata{
    email:string;
    password:string;

}

export interface forgotpassworddata {
    email: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const register= async (data:registerdata)=>{
    const response= await api.post("/auth/register",data);
    return response.data;
}

export const login= async (data:logindata)=>{
    const response = await api.post("/auth/login",data);
    return response.data;
}

export const forgotPassword = async (data: forgotpassworddata) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
}

export const checkUserEmail = async (email: string) => {
    const response = await api.post("/auth/check-email", { email });
    return response.data;
}

export const refresh = async ()=>{
    const response = await api.post("/auth/refresh-token");
    return response.data;
}

export const logout =async()=>{
    const response = await api.post("/auth/logout");
    return response.data;
}