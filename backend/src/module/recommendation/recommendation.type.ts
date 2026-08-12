export interface mlResponse{
    tmdb_ids:number[];
    score: number;
}

export interface recommendationapiResponse{
    message: string;
    sucess: boolean;
}
export interface recommendationresponse <t> extends recommendationapiResponse{
    movies:t[];
}

