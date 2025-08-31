'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '@/components/user/shared-authenticated/Navigation';
import { Suspense } from 'react';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Protect authenticated routes
    useEffect(() => {
        if (!loading && !isAuthenticated && pathname && !pathname.includes('login')) {
            router.push('/user/login');
        }
    }, [isAuthenticated, loading, router, pathname]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Render content only if authenticated
    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting to login
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Suspense fallback={<div>Loading...</div>}>
                        {children}
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
