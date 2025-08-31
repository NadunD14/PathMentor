'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.fullName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.agreeTerms) {
            setError('You must agree to the terms and conditions');
            return;
        }

        console.log('Attempting to register with:', formData);
        try {
            // Import and use the signUp function
            const { signUp } = await import('@/lib/auth');

            const result = await signUp({
                name: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            console.log('User registered successfully!', result);

            // Check if email confirmation is required
            if (result.user && !result.session) {
                setError('Please check your email and click the confirmation link to complete registration.');
            } else {
                // Redirect to dashboard or login page
                window.location.href = '/user/login';
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/user/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="agreeTerms"
                                name="agreeTerms"
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                                I agree to the{' '}
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Create account
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const { signInWithProvider } = await import('@/lib/auth');
                                            await signInWithProvider('google');
                                        } catch (err: any) {
                                            setError(err.message || 'Failed to sign up with Google');
                                        }
                                    }}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <span className="sr-only">Sign up with Google</span>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                    </svg>
                                </button>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const { signInWithProvider } = await import('@/lib/auth');
                                            await signInWithProvider('github');
                                        } catch (err: any) {
                                            setError(err.message || 'Failed to sign up with GitHub');
                                        }
                                    }}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <span className="sr-only">Sign up with GitHub</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
