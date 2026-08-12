import {prisma} from "../../core/database/prisma";
import type { userrole } from "@prisma/client";

export class AuthService {
  
async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where:{
            email:email
        }
    })
}

async findUserById(id: string) {
    return await prisma.user.findUnique({
        where:{
            id:id
        }
    })
}

async createUser(name: string, email: string, password: string, role: userrole) {
    return await prisma.user.create({
        data:{
            name:name,
            email:email,
            password:password,
            role:role,
            refreshtoken: ""
        }
    })
}

async updateRefreshToken(id: string, refreshtoken: string) {
    return await prisma.user.update({
        where: {
            id,
        },
        data: {
            refreshtoken,
        },
    });
}
async removeRefreshToken(id: string) {
    return await prisma.user.update({
        where: {
            id,
        },
        data: {
            refreshtoken: "",
        },
    });
}

}