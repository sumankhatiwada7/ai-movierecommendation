import {api} from './axios'
import type{watchdata} from "../type/movie.type"


export const logwatch= async (data:watchdata)=>{
    const response = await api.post(`/watch/${data.movieid}`);
    return response.data;

}