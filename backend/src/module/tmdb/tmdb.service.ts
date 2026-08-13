import{tmdbclient} from "../../core/tmdb/tmdb.client";
const IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL||'';


function mapmovie(tmdbmovie:any){
    return {
        tmdbId: tmdbmovie.id,
        title: tmdbmovie.title,
        description: tmdbmovie.overview || undefined,
        releaseYear: tmdbmovie.release_date ? Number(tmdbmovie.release_date.slice(0, 4)) : undefined,
        posterUrl: tmdbmovie.poster_path ? `${IMAGE_BASE}${tmdbmovie.poster_path}` : undefined,
        backdropUrl: tmdbmovie.backdrop_path ? `${IMAGE_BASE}${tmdbmovie.backdrop_path}` : undefined,
        averageRating: tmdbmovie.vote_average || 0,
        ratingCount: tmdbmovie.vote_count || 0,
        genreIds: tmdbmovie.genre_ids || [],
    }
}

export class TmdbService {
    async discoverMovies(page:number, genreId?:number, sortBy: "latest" | "rating" = "latest"){
        const {data}= await tmdbclient.get("/discover/movie",{
            params:{
                page,
                with_genres: genreId,
                sort_by: sortBy === "rating" ? "vote_average.desc" : "primary_release_date.desc",
                "vote_count.gte": sortBy === "rating" ? 100 : undefined,
            }
        });
        return{
            movie:data.results.map(mapmovie),
            totalPages:data.total_pages,
            totalResults:data.total_results,
        }

    }

    async searchMovies(query:string, page:number){
        const {data}= await tmdbclient.get("/search/movie",{
            params:{
                query,
                page,
            }
        });
        return {
            movie:data.results.map(mapmovie),
            totalPages:data.total_pages,
            totalResults:data.total_results,
        }
    }

        async getMovieDetails(tmdbId: number) {
        const { data } = await tmdbclient.get(`/movie/${tmdbId}`, {
            params: { append_to_response: "videos,credits" },
        });

        const trailer = data.videos?.results?.find((v: any) => v.site === "YouTube" && v.type === "Trailer");
        const director = data.credits?.crew?.find((c: any) => c.job === "Director");

        return {
            tmdbId: data.id,
            title: data.title,
            description: data.overview || undefined,
            releaseYear: data.release_date ? Number(data.release_date.slice(0, 4)) : undefined,
            durationMinutes: data.runtime || undefined,
            posterUrl: data.poster_path ? `${IMAGE_BASE}${data.poster_path}` : undefined,
            backdropUrl: data.backdrop_path ? `${IMAGE_BASE}${data.backdrop_path}` : undefined,
            trailerKey: trailer?.key,
            director: director?.name,
            averageRating: data.vote_average || 0,
            ratingCount: data.vote_count || 0,
            genres: data.genres.map((g: any) => ({ id: g.id, name: g.name })),
        };
    }

    async getGenres() {
        const { data } = await tmdbclient.get("/genre/movie/list");
        return data.genres as { id: number; name: string }[];
    }

    async getSimilarMovies(tmdbId: number, page = 1) {
        const { data } = await tmdbclient.get(`/movie/${tmdbId}/similar`, { params: { page } });
        return data.results.map(mapmovie);
    }

}