import { watchservice } from "./watch.service";
import type{Request,Response} from "express"
import type { watchhistoryresponse } from "./watch.type";
import { AuthenticatedRequest } from "../auth/auth.middleware";


export async function logwatch(Req:AuthenticatedRequest,Res:Response){

try{
    const userId = String(Req.user?.id);
    const movieId =Number(Req.params.movieId);
    if(!movieId){
        const payload:watchhistoryresponse={
            message:"Movie id is missing",
            sucess:false
        }
       Res.status(400).json(payload);
    }
    const watchserviceres = await new watchservice().logwatch(userId,movieId);
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