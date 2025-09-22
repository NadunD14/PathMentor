'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
    { name: 'Dashboard', href: '/user/' },
    { name: 'Learn Me', href: '/user/learnme' },
    { name: 'Progress', href: '/user/progress' },
    { name: 'Community', href: '/user/community' },
];

export default function Navigation() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg">
            <div className="container-custom">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/user" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                                PathMentor
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${isActive
                                            ? 'text-gray-900 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                                            } inline-flex items-center px-1 pt-1 text-base font-medium transition-colors`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    type="button"
                                    className="bg-white/0 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    id="user-menu"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-9 w-9 rounded-full backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-blue-100/60 border border-blue-200/50 flex items-center justify-center text-blue-700 hover:from-blue-100/80 hover:to-blue-200/60 transition-all duration-200">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            </div>

                            {isProfileMenuOpen && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 backdrop-blur-md bg-white/90 border border-white/20 focus:outline-none"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu"
                                >
                                    <Link
                                        href="/user/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/50 rounded-lg mx-1 transition-colors"
                                        role="menuitem"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        Your Profile
                                    </Link>
                                    <button
                                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/50 rounded-lg mx-1 transition-colors"
                                        role="menuitem"
                                        onClick={async () => {
                                            await logout();
                                            setIsProfileMenuOpen(false);
                                        }}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`sm:hidden transition-all ${mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`} id="mobile-menu">
                <div className="pt-2 pb-3 space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    } block px-3 py-2 rounded-md text-base font-medium`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="flex items-center px-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium text-gray-800">{user?.name || 'User'}</div>
                            <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        <Link
                            href="/user/profile"
                            className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => setMobileOpen(false)}
                        >
                            Your Profile
                        </Link>
                        <button
                            onClick={async () => {
                                await logout();
                                setMobileOpen(false);
                            }}
                            className="w-full text-left block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
