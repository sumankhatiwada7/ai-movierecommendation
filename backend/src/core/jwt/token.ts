import "dotenv/config";
import jwt from "jsonwebtoken";
interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

const accesstoken =process.env.JWT_SECRET||'ajsjhsjssjjsjh';
const accesstoken_expiresin=process.env.JWT_SECRET_EXPIRESIN as jwt.SignOptions["expiresIn"] | undefined;

const refreshtoken =process.env.JWT_REFRESH_SECRET||'jjkjkjnkjnknjn';
const refreshtoken_expiresin=process.env.JWT_REFRESH_SECRET_EXPIRESIN as jwt.SignOptions["expiresIn"] | undefined;


if(!accesstoken ){
    throw new Error('accesstoken is not set in env');
}

if(!refreshtoken){
    throw new Error('refreshtoken is not set in env ')
}

const access:jwt.Secret = accesstoken;
const refresh:jwt.Secret = refreshtoken;

export const generateAccessToken = (payload: TokenPayload): string => {
    const options: jwt.SignOptions = {};
    if (accesstoken_expiresin !== undefined) options.expiresIn = accesstoken_expiresin;
    return jwt.sign(payload, access, options);
}

export const generateRefreshToken = (payload: TokenPayload): string => {
    const options: jwt.SignOptions = {};
    if (refreshtoken_expiresin !== undefined) options.expiresIn = refreshtoken_expiresin;
    return jwt.sign(payload, refresh, options);
}
export const verfiyrefreshToken = (token: string): TokenPayload | null => {
    try{
      const secret = refreshtoken;
      if(!secret){
        throw new Error('Refresh token secret is not set in env');
      }
      const verfiy= jwt.verify(token, secret) as TokenPayload;
      return verfiy;
    }
    catch(error){
      return null;
    }
}

export const verfiyaccessToken = (token: string): TokenPayload | null => {
    try{
     const secret = accesstoken;
      const verfiy= jwt.verify(token, secret) as TokenPayload;
      return verfiy;
    }
    catch(error){
        return null;
    }
}

