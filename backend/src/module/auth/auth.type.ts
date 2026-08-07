
enum Role {
    ADMIN = "admin",
    USER = "user"
}

export interface userrequest{
    id :String ;
    name :string ;
    email :string ;
    password :string ;
    role :Role ;
}

export interface userresponse<T>{
    message :string ;
    sucess :boolean ;
    user:T ;


}

export interface loginrequest{
    email:string;
    password:string;
}

export interface loginresponse<T>{
    message :string ;
    sucess :boolean ;
    token:T ;
}

export interface error<T>{
    message:string;
    errors:T[];
}

export interface userapiresponse{
    message:string;
    sucess:boolean;
}
