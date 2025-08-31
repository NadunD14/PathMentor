'use client';

import { redirect } from 'next/navigation';

export default function RootRedirectPage() {
    // We add this redirect to ensure users are properly directed
    redirect('/user/login');

    // This won't be rendered, but it's required for the component
    return null;
}
