import {api} from './axios'

import type{Movie,MovieListResponse,MovieResponse,ListMoviesParams} from '../type/movie.type'



export const fetchmovies=async (params: ListMoviesParams): Promise<MovieListResponse> => {
    const response = await api.get('/movies', { params });
    return response.data;
}
export const fetchMovieById=async (id: number): Promise<MovieResponse> => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
}
export const fetchmoviebytmdbid=async (tmdbId: number): Promise<MovieResponse> => {
    const response = await api.get(`/movies/tmdb/${tmdbId}`);
    return response.data;
}
export const searchtmdbmovies=async (query: string): Promise<Movie[]> => {
    const response = await api.get(`/movies/search`, { params: { query } });
    return response.data;
}