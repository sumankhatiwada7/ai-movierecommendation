
enum Role {
    ADMIN = "admin",
    USER = "user"
}

export interface userrequest{
    id :String ;
    name :string ;
    email :string ;
    password :string ;
    confirmpassword?: string;
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

export interface forgotpasswordrequest{
    email:string;
    oldPassword:string;
    newPassword:string;
    confirmPassword:string;
}

export interface loginresponse<T>{
    message :string ;
    sucess :boolean ;
    token:T ;
}

export interface error<T>{
    message:string;
    errors:T[];
    fieldErrors?: Record<string, string>;
}

export interface userapiresponse{
    message:string;
    sucess:boolean;
    fieldErrors?: Record<string, string>;
}
