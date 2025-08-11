import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public and protected paths
const PUBLIC_PATHS = [
    '/user/login',
    '/user/register',
    '/user/about',
    '/user/faq',
    '/user/pricing'
];

const PROTECTED_PATHS = [
    '/user/dashboard',
    '/user/learnme',
    '/user/progress',
    '/user/community',
    '/user/profile'
];

export function middleware(request: NextRequest) {
    // Get the pathname from the request URL
    const pathname = request.nextUrl.pathname;

    // Root path shows the home page
    if (pathname === '/') {
        return NextResponse.next();
    }

    // Check if current path is protected
    const isProtectedPath = PROTECTED_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isProtectedPath) {
        // Check if user is authenticated via cookies
        const authToken = request.cookies.get('auth_token');

        if (!authToken || authToken.value === 'undefined') {
            // Redirect to login if not authenticated
            const url = new URL('/user/login', request.url);
            // Add the original URL as a query param to redirect back after login
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
    }

    // Handle authenticated users trying to access login/register
    if ((pathname === '/user/login' || pathname === '/user/register')) {
        const authToken = request.cookies.get('auth_token');

        if (authToken && authToken.value !== 'undefined') {
            // Redirect to dashboard if already authenticated
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
    }

    // Continue to the requested page
    return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
    matcher: [
        // Match root path
        '/',
        // Match all paths under /user/
        '/user/:path*',
    ],
};