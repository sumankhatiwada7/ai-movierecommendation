import { api } from './axios';
import type { recommendationresponse } from "../type/movie.type";

export const getrecommendations = async () => {
    const response = await api.get(`/recommendations/`);
    return response.data as recommendationresponse<any>;
};

export const similarMovies = async (title: string) => {
    const response = await api.get(`/recommendations/similar`, { params: { title } });
    return response.data as recommendationresponse<any>;
};