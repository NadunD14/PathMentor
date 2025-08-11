'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

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

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // In a real app, you'd validate the token with your backend
                const token = localStorage.getItem('auth_token');

                if (token) {
                    // Mock user data - in a real app this would come from your API
                    const userData: User = {
                        id: '123',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'user'
                    };

                    setUser(userData);
                    setIsAuthenticated(true);

                    // Set cookie for middleware authentication check
                    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
                }
            } catch (err) {
                console.error('Authentication error:', err);
                setError('Failed to authenticate');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            // In a real app, this would be an API call to your backend
            // For demo purposes, we'll accept any email/password combination
            if (email && password) {
                // Mock successful login
                const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);

                // Store token
                localStorage.setItem('auth_token', token);
                document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

                // Set user
                const userData: User = {
                    id: '123',
                    name: 'John Doe',
                    email: email,
                    role: 'user'
                };

                setUser(userData);
                setIsAuthenticated(true);

                // Redirect to dashboard
                router.push('/user/dashboard');
            } else {
                throw new Error('Please provide both email and password');
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

        try {
            // In a real app, this would be an API call to your backend
            if (name && email && password) {
                // Mock successful registration
                const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);

                // Store token
                localStorage.setItem('auth_token', token);
                document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

                // Set user
                const userData: User = {
                    id: '123',
                    name: name,
                    email: email,
                    role: 'user'
                };

                setUser(userData);
                setIsAuthenticated(true);

                // Redirect to dashboard
                router.push('/user/dashboard');
            } else {
                throw new Error('Please provide all required fields');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Clear token
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; max-age=0';

        setUser(null);
        setIsAuthenticated(false);

        // Redirect to login
        router.push('/user/login');
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
