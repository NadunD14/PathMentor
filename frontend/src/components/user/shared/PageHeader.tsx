'use client';

import { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
};

export default function PageHeader({ title, subtitle, actions, className = '' }: PageHeaderProps) {
    return (
        <div className={`mb-6 sm:mb-8 ${className}`}>
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-indigo-600 to-blue-600 border border-white/30 shadow-xl px-5 sm:px-6 py-6 sm:py-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/5 pointer-events-none"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{title}</h1>
                        {subtitle && <p className="mt-2 text-sm sm:text-base text-gray-200">{subtitle}</p>}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
