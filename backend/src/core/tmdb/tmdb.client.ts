import axios from "axios";


export const tmdbclient = axios.create({
    baseURL: process.env.TMDB_BASE_URL||'',
    params: {
        api_key: process.env.TMDB_API_KEY,
    },
    timeout: 5000,
})