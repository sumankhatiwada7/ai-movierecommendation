import { prisma } from "../../core/database/prisma";


export class watchservice{
    async logwatch(userId:string,movieId:number){
        return prisma.watchhistory.upsert({
            where:{
                userId_movieId:{userId,movieId}
            },
            update:{
                watchedAt: new Date()
            },
            create:{
                userId,movieId
            }
        })
    }
}