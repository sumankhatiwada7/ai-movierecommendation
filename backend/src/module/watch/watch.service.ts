import { prisma } from "../../core/database/prisma";
import {archiveClient} from "../../core/player/player.client"
import { getOrSetCache } from "../../core/redis/cache";
import type{archivematch} from './watch.type';

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
    async getwatchprogress(userId:string,tmdbId:number,){
        return prisma.watchProgress.findUnique({
            where:{
                userId_tmdbId:{userId,tmdbId:tmdbId}
            },
            select:{time:true},
        })

    }
    async  recordwatchprogress(userId:string,tmdbId:number,time:number){
        return prisma.watchProgress.upsert({
            where:{
                userId_tmdbId:{userId,tmdbId}
            },
            update:{
                time,updatedAt:new Date()
            },
            create:{
                userId,tmdbId,time
            }
        })
    }
    async watchpogressbatch(userId:string,tmdbIds: number[]){
        return prisma.watchProgress.findMany({
            where:{
                userId,
                tmdbId:{ in: tmdbIds },
            },
            select:{
                tmdbId:true,time:true
            },
        })
    }

    async watchhistory(userId:string,limit=10){
        return prisma.watchhistory.findMany({
            where:{userId},
            orderBy:{watchedAt:'desc'},
            take:limit,
            select:{tmdbId:true,title:true,watchedAt:true}
        })
    }
    
}