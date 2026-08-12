export interface Genre {
    id: string;
    name: string;
}
export interface Movie {
  id: number;
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
  genres: Genre[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export interface ListMoviesParams {
  page?: number;
  limit?: number;
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
    movieid:number
}