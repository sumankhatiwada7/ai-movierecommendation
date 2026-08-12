
export interface movierequest {
    title: string;
    description?: string | undefined;
    releaseYear?: number | undefined;
    durationMinutes?: number | undefined;
    posterUrl?: string | undefined;
    director?: string | undefined;
    genreIds?: string[] | undefined;
}

export interface moviequery {
    page?: string;
    limit?: string;
    search?: string;
    genreId?: string;
    sortBy?: "latest" | "rating";

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

