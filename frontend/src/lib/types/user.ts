// Define user types for Supabase authentication
export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    role?: 'user' | 'admin';
}

// Define user profile type for the custom users table
export interface UserProfile {
    user_id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    created_at?: string;
    updated_at?: string;
}

export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserRegistration extends UserCredentials {
    name: string;
}
