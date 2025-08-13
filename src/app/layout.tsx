import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClientRootLayout } from './client-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'PathMentor - AI-Powered Personalized Learning',
    description: 'Master new skills through AI-powered personalized learning paths.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full`}>
                <ClientRootLayout>
                    {children}
                </ClientRootLayout>
            </body>
        </html>
    );
}
