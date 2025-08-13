import { supabase } from '@/supabase-client';
import { User, UserCredentials, UserRegistration } from '@/lib/types/user';

/**
 * Sign in a user with email and password
 */
export const signIn = async ({ email, password }: UserCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * Sign up a new user
 */
export const signUp = async ({ name, email, password }: UserRegistration) => {
    // First, sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role: 'user',
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }

    return true;
};

/**
 * Get the current user session
 */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw new Error(error.message);
    }

    return data.session;
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        return null;
    }

    const { id, email, user_metadata } = data.user;

    return {
        id,
        email: email || '',
        name: user_metadata?.name,
        role: user_metadata?.role || 'user',
    };
};

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
        throw new Error(error.message);
    }

    return true;
};

/**
 * Update user password
 */
export const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return true;
};

/**
 * Update user profile
 */
export const updateProfile = async (profile: Partial<User>) => {
    const { error } = await supabase.auth.updateUser({
        data: profile,
    });

    if (error) {
        throw new Error(error.message);
    }

    return true;
};
