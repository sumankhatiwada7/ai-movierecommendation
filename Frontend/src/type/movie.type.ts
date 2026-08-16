export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  tmdbId: number;
  title: string;
  description?: string;
  releaseYear?: number;
  durationMinutes?: number;
  posterUrl?: string;
  backdropUrl?: string;
  trailerKey?: string;
  director?: string;
  averageRating: number;
  ratingCount: number;
  genres?: Genre[];      
  genreIds?: number[];   
}

export interface Pagination {
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface MovieListResponse {
  message: string;
  sucess: boolean;
  movies: Movie[];
  pagination: Pagination;
}

export interface MovieResponse {
  message: string;
  sucess: boolean;
  movie: Movie;
}

export interface RecommendationResponse {
  message: string;
  sucess: boolean;
  movies: Movie[];
}

export interface ListMoviesParams {
  page?: number;
   search?: string;
  genreId?: string;
  sortBy?: "latest" | "rating";

}
export interface recommendationdata{
    userId:string;
    movieid:number;
}
export interface recommendationresponse<T>{
    message:string;
    sucess:boolean;
    movies:T[];
}
export interface watchdata{
    tmdbId:number
}
export interface WatchSource {
    identifier: string;
    videoUrl: string;
    title: string;
}

export interface watchpogressdata{
    tmdbId:number;
    time:number;
}
