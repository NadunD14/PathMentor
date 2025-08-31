/**
 * Cookie utilities for handling authentication cookies
 * Note: Supabase primarily uses localStorage by default, but we can also use cookies
 */

import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_EXPIRY = 7; // 7 days

/**
 * Set auth token in cookie
 */
export const setAuthCookie = (token: string) => {
    Cookies.set(AUTH_COOKIE_NAME, token, {
        expires: AUTH_COOKIE_EXPIRY,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
};

/**
 * Get auth token from cookie
 */
export const getAuthCookie = () => {
    return Cookies.get(AUTH_COOKIE_NAME);
};

/**
 * Remove auth token cookie
 */
export const removeAuthCookie = () => {
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
};

/**
 * Sync Supabase session token to cookies for SSR and middleware usage
 * This is important because Supabase uses localStorage by default,
 * but we need cookies for server-side authentication checks
 */
export const syncSupabaseSessionToCookie = (accessToken: string | null) => {
    if (accessToken) {
        setAuthCookie(accessToken);
    } else {
        removeAuthCookie();
    }
};
