import {RecommendationService} from './recommendation.service';
import type{Request,Response} from "express";
import type { recommendationapiResponse,recommendationresponse } from './recommendation.type';
import { AuthenticatedRequest } from "../auth/auth.middleware";


export async function recommendation(Req:AuthenticatedRequest,Res:Response){
    try{
    const userId = String(Req.user?.id);
    const movies = await new RecommendationService().getrecommendations(userId,10);
    const payload:recommendationresponse<NonNullable<typeof movies>[number]> = {
        message:"Recommendations fetched successfully",
        sucess:true,
        movies:movies ?? []
    }
    return Res.status(200).json(payload);
    }
    catch(error){
        console.error("Error fetching recommendations:", error);
        const payload:recommendationapiResponse={
            message:"Error fetching recommendations",
            sucess:false
        }
        return Res.status(500).json(payload);
    }
}

export async function similarMovies(Req:AuthenticatedRequest,Res:Response){
    try{
        const movieId= Number(Req.params.movieId);
        if(isNaN(movieId)){
            const payload:recommendationapiResponse={
                message:"Invalid movie ID",
                sucess:false
            };
            return Res.status(400).json(payload);
        }
        const movies = await new RecommendationService().getsimilarMovies(movieId,10);
        const payload:recommendationresponse<NonNullable<typeof movies>[number]> = {
            message:"Similar movies fetched successfully",
            sucess:true,
            movies:movies ?? []
        };
        return Res.status(200).json(payload);

    }
    catch(error){
        console.error("error fetching similiar movie ", error);
        const payload:recommendationapiResponse={
            message:"Error fetching similiar movies",
            sucess:false    
        }
        return Res.status(500).json(payload);
    }

}
