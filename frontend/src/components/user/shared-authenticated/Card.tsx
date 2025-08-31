'use client';

import { ReactNode } from 'react';

interface CardProps {
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
    footer?: ReactNode;
    onClick?: () => void;
}

export default function Card({
    title,
    icon,
    children,
    className = '',
    footer,
    onClick,
}: CardProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-md overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
            onClick={onClick}
        >
            {(title || icon) && (
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-gray-500">{icon}</span>}
                        {title && <h3 className="font-semibold text-gray-800">{title}</h3>}
                    </div>
                </div>
            )}
            <div className="px-6 py-4">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    {footer}
                </div>
            )}
        </div>
    );
}
