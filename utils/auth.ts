// utils/auth.ts
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

export const getAuthToken = (): string | undefined => {
  // Checks both client and server context safely
  if (typeof window === 'undefined') return undefined;
  return Cookies.get(TOKEN_KEY);
};

export const saveToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { 
    expires: 7, 
    secure: true, 
    sameSite: 'strict' 
  });
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};