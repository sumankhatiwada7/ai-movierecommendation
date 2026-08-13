import { prisma } from "../../core/database/prisma";


export class watchservice{
    async logwatch(userId:string,tmdbId:number,title:string){
        return prisma.watchhistory.upsert({
            where:{
                userId_tmdbId:{userId,tmdbId}
            },
            update:{
                watchedAt: new Date()
            },
            create:{
                userId,tmdbId,title
            }
        })
    }
}