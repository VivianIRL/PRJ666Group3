
const ACCESS_TOKEN_KEY  = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function setAccessToken(token)  { localStorage.setItem(ACCESS_TOKEN_KEY, token); }
export function getAccessToken()       { return localStorage.getItem(ACCESS_TOKEN_KEY); }
export function removeAccessToken()    { localStorage.removeItem(ACCESS_TOKEN_KEY); }

export function setRefreshToken(token) { localStorage.setItem(REFRESH_TOKEN_KEY, token); }
export function getRefreshToken()      { return localStorage.getItem(REFRESH_TOKEN_KEY); }
export function removeRefreshToken()   { localStorage.removeItem(REFRESH_TOKEN_KEY); }