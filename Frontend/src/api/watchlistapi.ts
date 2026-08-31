import{api} from "./axios";
export const getwatchlist= async ()=>{
    const response = await api.get(`/watchlist`);
    return response.data;
}
export const addtowatchlist= async (tmdbId:number,title:string)=>{
    const response = await api.post(`/watchlist/${tmdbId}`,{title});
    return response.data;
}
export const removefromwatchlist= async (tmdbId:number)=>{
    const response = await api.delete(`/watchlist/delete/${tmdbId}`);
    return response.data;
}
