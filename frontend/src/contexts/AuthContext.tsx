'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase-client';
import { User } from '@/lib/types/user';
import { syncSupabaseSessionToCookie } from '@/lib/utils/cookieUtils';
import { signIn, signUp, signOut, getCurrentUser, handleOAuthUserCreation } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    // Check if user is already logged in on mount and set up auth state listener
    useEffect(() => {
        // Initial session check
        const checkAuth = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (currentUser) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Authentication error:', err);
                setError('Failed to authenticate');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Set up auth state listener for when auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    // User is signed in
                    try {
                        // For OAuth signups, ensure user exists in users table
                        if (event === 'SIGNED_IN' && session.user.app_metadata.provider) {
                            await handleOAuthUserCreation(session.user);
                        }

                        const currentUser = await getCurrentUser();
                        setUser(currentUser);
                        setIsAuthenticated(true);

                        // Sync the session to cookies for SSR and middleware
                        syncSupabaseSessionToCookie(session.access_token);
                    } catch (error) {
                        console.error('Error handling OAuth user creation:', error);
                        // Continue with authentication even if user profile creation fails
                        const currentUser = await getCurrentUser();
                        setUser(currentUser);
                        setIsAuthenticated(true);
                        syncSupabaseSessionToCookie(session.access_token);
                    }
                } else {
                    // User is signed out
                    setUser(null);
                    setIsAuthenticated(false);
                    syncSupabaseSessionToCookie(null);
                }

                setLoading(false);
            }
        );

        // Cleanup subscription when component unmounts
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            if (!email || !password) {
                throw new Error('Please provide both email and password');
            }

            // Sign in with Supabase
            const { session } = await signIn({ email, password });

            if (!session) {
                throw new Error('Login failed. Please check your credentials.');
            }

            // Get user data
            const userData = await getCurrentUser();

            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);

                // Redirect to dashboard
                router.push('/user');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError(null);

        console.log('About to call signUp with:', { name, email });

        try {
            if (!name || !email || !password) {
                throw new Error('Please provide all required fields');
            }

            // Sign up with Supabase (this now handles both auth and users table)
            const result = await signUp({ name, email, password });

            if (!result.session) {
                // In case of email confirmation flow
                setError('Please check your email for a confirmation link to complete your registration');
                return;
            }

            // Get user data
            const userData = await getCurrentUser();

            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);

                // Redirect to dashboard
                router.push('/user/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Sign out with Supabase
            await signOut();

            setUser(null);
            setIsAuthenticated(false);

            // Redirect to login
            router.push('/user/login');
        } catch (err: any) {
            console.error('Logout error:', err);
            setError(err.message || 'Failed to logout');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
