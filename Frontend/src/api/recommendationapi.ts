import {api} from './axios';
import type{recommendationdata,recommendationresponse} from "../type/movie.type";


export const getrecommendations= async (data:recommendationdata)=>{
    const response = await api.get(`/recommendation/${data.userId}`);
    return response.data as recommendationresponse<any>;
}
export const similarMovies= async (movieid:number)=>{
    const response = await api.get(`/recommendation/similar/${movieid}`);
    return response.data as recommendationresponse<any>;
}