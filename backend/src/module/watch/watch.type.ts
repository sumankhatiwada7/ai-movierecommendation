
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
  genres: { id: number; name: string }[];
}
export type watchhistoryresponse = {
    message: string;
    sucess: boolean;
}

export interface archivematch {
    identifier: string;
    videoUrl: string;
    title: string;
}

export interface watchsourceresponse {
    message: string;
    sucess: boolean;
    source: archivematch | null;
}
export interface watchprogressapiresponse {
    message: string;
    sucess: boolean;
   
}
export interface watchprogressresponse<t> extends watchprogressapiresponse {
    time: t;
}
export interface watchprogressbatch <t> extends watchprogressapiresponse {
    movies:t;
}
export interface watchhistoryresponsemovie<t> extends watchprogressapiresponse {
    movies:Movie[];
}