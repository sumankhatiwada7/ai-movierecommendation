import { watchservice } from "./watch.service";
import type{Request,Response} from "express"
import type { watchhistoryresponse,watchsourceresponse } from "./watch.type";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { TmdbService } from "../tmdb/tmdb.service";


export async function logwatch(Req:AuthenticatedRequest,Res:Response){

try{
    const userId = String(Req.user?.id);
    const tmdbId = Number(Req.params.tmdbId);
    if(!tmdbId){
        const payload:watchhistoryresponse={
            message:"TMDB id is missing",
            sucess:false
        }
       return Res.status(400).json(payload);
    }
    const movie = await new TmdbService().getMovieDetails(tmdbId);

    const watchserviceres = await new watchservice().logwatch(userId,tmdbId,movie.title);
    const payload:watchhistoryresponse={
        message:"Watch history logged successfully",
        sucess:true
    }
    return Res.status(200).json(payload);

}
catch(error){
    console.error("Error logging watch history:", error);
    const payload:watchhistoryresponse={
        message:"Error logging watch history",
        sucess:false
    }
    return Res.status(500).json(payload);
}
}
export async function getWatchSource(req: Request, res: Response) {
    try {
        const tmdbId = Number(req.params.tmdbId);
        if (isNaN(tmdbId)) {
            return res.status(400).json({ message: "Invalid movie id", sucess: false });
        }

        const movie = await new TmdbService().getMovieDetails(tmdbId);
        const source = await new watchservice().findPlayableMovie(movie.title);

        const payload: watchsourceresponse = {
            message: source ? "Playable source found" : "No playable source available",
            sucess: true,
            source,
        };
        return res.status(200).json(payload);
    } catch (error) {
        console.error("Get watch source failed:", error);
        return res.status(500).json({ message: "Internal server error", sucess: false, source: null });
    }
}