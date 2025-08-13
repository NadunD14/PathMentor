'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/user/shared-authenticated/Navigation';
import PublicHeader from '@/components/user/shared/PublicHeader';
import PublicFooter from '@/components/user/shared/PublicFooter';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const pathname = usePathname();

    // Check if we're in a public user path like login, register, about, etc.
    const isPublicPath =
        pathname === '/user/login' ||
        pathname === '/user/register' ||
        pathname === '/user/about' ||
        pathname === '/user/faq' ||
        pathname === '/user/pricing';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Only render public header/footer here; authenticated routes handle their own header in nested layout */}
            {isPublicPath && <PublicHeader />}

            <main className="flex-1">{children}</main>

            {isPublicPath && <PublicFooter />}
        </div>
    );
}
