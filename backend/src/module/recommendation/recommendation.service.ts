import { prisma } from "../../core/database/prisma";
import type{mlResponse} from "./recommendation.type"
import {MovieService} from "../movie/movie.service"
import axios from "axios";

export class RecommendationService{

    async  getrecommendations(userId:string,topK:10){
        const watchedMovies  = await prisma.watchhistory.findMany({
            where:{
                userId
            },
            include:{
                movie:{
                    select:{
                        tmdbId:true
                    }
                }
            },
            take:20
        })
        const watchedtmdbIds = watchedMovies.map(watch => watch.movie.tmdbId);
        if(watchedtmdbIds.length===0){
            return prisma.movie.findMany({
                orderBy:{averageRating:"desc"},
                take:topK,
                include:{genres:true}

            })
        }
        let mldata:mlResponse;
        try{
          const {data}= await axios.post<mlResponse>(
            `${process.env.ML_API_URL}/recommendations`,
            {tmdb_ids:watchedtmdbIds,topK},
            {timeout:5000},
          );
          mldata=data;
          const movieService = new MovieService();
          const movies = await Promise.all(mldata.tmdb_ids.map((tmdbId) => movieService.getOrCacheByTmdbId(tmdbId)));        
          return movies 
        }catch(error){
            console.error(error);
        }
    }

async getsimilarMovies(movieId:number,topk:10){
        const movie = await prisma.movie.findUnique({
        where: { id: movieId },
        select: { tmdbId: true, genres: { select: { id: true } } },
    });

    if(!movie) {
        throw new Error("Movie not found")
    }
    let mldata:mlResponse;

    try{
    const {data} = await axios.post<mlResponse>(
        `${process.env.ML_API_URL}/similar`,
        {tmdb_id: movie.tmdbId, topK: topk},
        {timeout: 5000}
    );
    mldata = data;
    const movieService= new MovieService();

  const movies = await Promise.all(mldata.tmdb_ids.map((tmdbId) => movieService.getOrCacheByTmdbId(tmdbId)));   
  return movies;
    }
    catch(error){
         console.error("faild to load similar movie ");
    }
}

}