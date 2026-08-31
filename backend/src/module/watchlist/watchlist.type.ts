
import {Movie} from "../watch/watch.type"
export interface watchlistdata{
    userId:string,
    tmdbId:number,
    title:string
    createdAt:Date
}
export interface watchlistresponse{
    message:string,
    sucess:boolean,

}
export interface watchlistresponsewithdata extends watchlistresponse{
    data:Movie[]
}