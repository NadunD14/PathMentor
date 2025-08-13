// Define user types for Supabase authentication
export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    role?: 'user' | 'admin';
}

export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserRegistration extends UserCredentials {
    name: string;
}
