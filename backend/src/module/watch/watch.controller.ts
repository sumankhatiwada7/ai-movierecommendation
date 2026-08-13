import { watchservice } from "./watch.service";
import type{Request,Response} from "express"
import type { watchhistoryresponse } from "./watch.type";
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