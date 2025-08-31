'use client';

import { AuthProvider } from '@/contexts/AuthContext';

export function ClientRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
