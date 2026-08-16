import {api} from './axios'
import type{watchpogressdata} from "../type/movie.type"


export const logwatch= async (tmdbId: number)=>{
    const response = await api.post(`/watch/${tmdbId}`);
    return response.data;

}

export const getWatchSource= async (tmdbId: number)=>{
    const response = await api.get(`/watch/watch-source/${tmdbId}`);
    return response.data;
}

export const getWatchProgress= async (tmdbId: number)=>{
    const response = await api.get(`/watch/watchprogress/${tmdbId}`);
    return response.data;
}
export const saveWatchProgress= async ( data: watchpogressdata)=>{
    const response = await api.post(`/watch/watchprogress`,data);
    return response.data;
}
export const getWatchProgressBatch= async (tmdbIds: number[])=>{
    const response = await api.get(`/watch/watchprogressbatch`,{params:{ids: tmdbIds}})
    return response.data;
}