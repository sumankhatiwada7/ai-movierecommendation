import {api} from './axios'
import type{Genre } from "../type/movie.type"

export const fetchGenres = async (): Promise<Genre[]> => {
    const response = await api.get('/genres');
    return response.data;
}