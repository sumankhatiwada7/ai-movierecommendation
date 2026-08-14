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
    async findPlayableMovie(title: string): Promise<archivematch | null> {
    const cacheKey = `archive:${title.toLowerCase()}`;
    return getOrSetCache(cacheKey, 60 * 60 * 24, async () => {
        const searchRes = await archiveClient.get("/advancedsearch.php", {
            params: {
                q: `title:("${title}") AND mediatype:(movies)`,
                fl: ["identifier", "title"],
                rows: 5,
                output: "json",
            },
        });

        const docs = searchRes.data?.response?.docs || [];
        if (docs.length === 0) return null;

        for (const doc of docs) {
            const identifier = doc.identifier;
            const metaRes = await archiveClient.get(`/metadata/${identifier}`);
            const files = metaRes.data?.files || [];

            const videoFiles = files.filter((f: any) => {
                const isVideoFormat = f.format === "MPEG4" || f.format === "h.264" || f.name?.endsWith(".mp4");
                const looksLikeClip = /trailer|preview|clip|sample|excerpt/i.test(f.name || "");
                return isVideoFormat && !looksLikeClip;
            });

            if (videoFiles.length === 0) continue;

            // pick the largest file — full movies are almost always the biggest video file on the item
            const fullMovieFile = videoFiles.reduce((largest: any, current: any) => {
                const currentSize = Number(current.size || 0);
                const largestSize = Number(largest.size || 0);
                return currentSize > largestSize ? current : largest;
            });

            // sanity check: a real feature film file should be reasonably large (avoid tiny leftover files)
            const MIN_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB floor — adjust if too strict/loose
            if (Number(fullMovieFile.size || 0) < MIN_FILE_SIZE_BYTES) continue;

            return {
                identifier,
                videoUrl: `https://archive.org/download/${identifier}/${fullMovieFile.name}`,
                title: doc.title,
            };
        }

        return null;
    });
}

}