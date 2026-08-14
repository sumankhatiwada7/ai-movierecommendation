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
