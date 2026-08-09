
export interface movierequest {
    title: string;
    description?: string;
    releaseYear?: number;
    durationMinutes?: number;
    posterUrl?: string;
    director?: string;
    genreIds?: string[];
}

export interface moviequery {
    page?: string;
    limit?: string;
    search?: string;
    genreId?: string;
}

export interface error<T> {
    message: string;
    errors?: T[];
}

export interface movieapiresponse {
    message: string;
    sucess: boolean;
}

export interface movieresponse<T> extends movieapiresponse {
    movie: T;
}

export interface movielistresponse<T> extends movieapiresponse {
    movies: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

