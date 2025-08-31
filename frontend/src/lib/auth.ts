import { supabase } from '@/supabase-client';
import { User, UserCredentials, UserRegistration, UserProfile } from '@/lib/types/user';

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
 * Sign in with a third-party provider (OAuth)
 */
export const signInWithProvider = async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/user`,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * Handle OAuth user creation in users table
 * This should be called after successful OAuth authentication
 */
export const handleOAuthUserCreation = async (user: any) => {
    try {
        // Check if user already exists in our users table
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking existing user:', checkError);
            throw new Error(checkError.message);
        }

        // If user doesn't exist, create them
        if (!existingUser) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert({
                    user_id: user.id,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
                    email: user.email,
                    role: 'user'
                })
                .select()
                .single();

            if (userError) {
                console.error('Error creating OAuth user profile:', userError);
                throw new Error(`Failed to create user profile: ${userError.message}`);
            }

            console.log('OAuth user profile created successfully:', userData);
            return userData;
        }

        console.log('OAuth user already exists in users table');
        return existingUser;
    } catch (err) {
        console.error('Error in handleOAuthUserCreation:', err);
        throw err;
    }
};

/**
 * Sign up a new user
 */
export const signUp = async ({ name, email, password }: UserRegistration) => {
    console.log('signUp called with:', { name, email, password });

    try {
        // First, sign up the user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'user',
                },
            },
        });

        if (authError) {
            console.error('Supabase auth signUp error:', authError);
            throw new Error(authError.message);
        }

        if (!authData.user) {
            throw new Error('User creation failed - no user data returned');
        }

        // Extract the user ID from the auth response
        const userId = authData.user.id;
        console.log('Auth user created with ID:', userId);

        // Insert user data into the custom users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                user_id: userId,
                name: name,
                email: email,
                role: 'user'
            })
            .select()
            .single();

        if (userError) {
            console.error('Error inserting user data:', userError);
            // If user table insertion fails, we should clean up the auth user
            // However, this might require admin privileges, so we'll just log the error
            throw new Error(`Failed to create user profile: ${userError.message}`);
        }

        console.log('User profile created successfully:', userData);
        console.log('signUp successful:', authData);

        return {
            ...authData,
            userProfile: userData
        };
    } catch (err) {
        console.error('Error during signUp:', err);
        throw err;
    }
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

    // Get additional user data from the users table
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', id)
        .single();

    if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Return basic user data if profile fetch fails
        return {
            id,
            email: email || '',
            name: user_metadata?.name,
            role: user_metadata?.role || 'user',
        };
    }

    return {
        id,
        email: email || '',
        name: userProfile?.name || user_metadata?.name,
        role: userProfile?.role || user_metadata?.role || 'user',
    };
};

/**
 * Get user profile from the users table
 */
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(error.message);
    }

    return data;
};

/**
 * Update user profile in the users table
 */
export const updateUserProfile = async (userId: string, updates: Partial<{ name: string; role: string }>) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        throw new Error(error.message);
    }

    return data;
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
