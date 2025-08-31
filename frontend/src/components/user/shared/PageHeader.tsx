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
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm sm:text-base text-gray-600">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
