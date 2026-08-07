import axios from "axios";
// @ts-ignore
export const api = axios.create({
    baseURL:"http://localhost:3000/api/v1",
    withCredentials: true,
    headers:{
            "Content-Type": "application/json",

    }
})

