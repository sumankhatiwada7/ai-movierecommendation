import {api} from './axios'
import type{watchdata} from "../type/movie.type"


export const logwatch= async (tmdbId: number)=>{
    const response = await api.post(`/watch/${tmdbId}`);
    return response.data;

}

export const getWatchSource= async (tmdbId: number)=>{
    const response = await api.get(`/watch/watch-source/${tmdbId}`);
    return response.data;
}