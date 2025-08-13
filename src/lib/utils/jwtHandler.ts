/**
 * JWT token utilities for Supabase authentication
 */

import { supabase } from '@/supabase-client';

/**
 * Get the current session's JWT token
 * @returns The JWT token or null if not authenticated
 */
export const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
};

/**
 * Check if the current JWT token is valid
 * @returns True if the token is valid, false otherwise
 */
export const isTokenValid = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
};

/**
 * Refresh the current JWT token
 * @returns The new JWT token or null if refresh failed
 */
export const refreshToken = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
        return null;
    }

    return data.session.access_token;
};

/**
 * Parse the JWT token to get user information
 * @param token The JWT token to parse
 * @returns The decoded JWT payload or null if invalid
 */
export const parseToken = (token: string): any | null => {
    try {
        // JWT token is made of 3 parts separated by dots
        const [, payloadBase64] = token.split('.');

        // Decode the Base64URL-encoded payload
        const payload = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8')
        );

        return payload;
    } catch (error) {
        console.error('Failed to parse JWT token:', error);
        return null;
    }
};
