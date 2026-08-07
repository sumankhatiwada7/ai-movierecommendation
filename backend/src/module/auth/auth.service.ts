import {prisma} from "../../core/database/prisma.js";

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

async createUser(name: string, email: string, password: string, role: string) {
    return await prisma.user.create({
        data:{
            name:name,
            email:email,
            password:password,
            role:role
        }
    })
}

}