export interface movieapiresponse {
    message: string;
    sucess: boolean;
}

export interface movielistresponse<T> extends movieapiresponse {
    movies: T[];
    pagination: { page: number; totalPages: number; totalResults: number };
}

export interface movieresponse<T> extends movieapiresponse {
    movie: T;
}