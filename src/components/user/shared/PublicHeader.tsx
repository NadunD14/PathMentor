'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicHeader() {
    // Simple client header; for a full mobile menu, wire state here if needed later
    const pathname = usePathname();
    const isActive = (href: string) => (pathname === href || pathname?.startsWith(href + '/'));
    const navLink = (href: string, label: string) => (
        <Link
            href={href}
            className={`nav-link font-medium ${isActive(href) ? 'text-blue-600' : ''}`}
        >
            {label}
        </Link>
    );
    return (
        <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-gray-200">
            <div className="container-custom flex justify-between items-center h-14">
                <div className="flex items-center">
                    <div className="bg-blue-600 text-white p-2 rounded-md mr-2 shadow-md transform hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <Link href="/" className="text-lg font-bold text-blue-600 tracking-tight hover:text-blue-700 transition-colors">PathMentor</Link>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                    {navLink('/user/about', 'About')}
                    {navLink('/user/faq', 'FAQ')}
                    {navLink('/user/pricing', 'Pricing')}
                    {navLink('/user/login', 'Login')}
                    <Link href="/user/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                        Register
                    </Link>
                </nav>
                <button className="md:hidden text-gray-600 hover:text-gray-900 transition-colors focus:outline-none" aria-label="Open menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
