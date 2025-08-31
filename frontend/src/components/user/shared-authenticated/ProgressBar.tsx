'use client';

import { useState } from 'react';

interface ProgressBarProps {
    percent: number;
    label?: string;
    color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    showPercentage?: boolean;
    height?: number;
    className?: string;
}

export default function ProgressBar({
    percent,
    label,
    color = 'primary',
    showPercentage = true,
    height = 8,
    className = '',
}: ProgressBarProps) {
    const [hovered, setHovered] = useState(false);

    const colorClasses = {
        primary: 'bg-blue-600',
        secondary: 'bg-purple-600',
        success: 'bg-green-600',
        danger: 'bg-red-600',
        warning: 'bg-yellow-500',
    };

    const colorClass = colorClasses[color];

    return (
        <div className={`w-full mb-2 ${className}`}>
            {label && <div className="text-sm font-medium mb-1 text-gray-700 flex justify-between">
                <span>{label}</span>
                {showPercentage && <span>{Math.round(percent)}%</span>}
            </div>}
            <div
                className="w-full bg-gray-200 rounded-full overflow-hidden"
                style={{ height: `${height}px` }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <div
                    className={`${colorClass} transition-all duration-300 ease-in-out ${hovered ? 'opacity-90' : 'opacity-100'}`}
                    style={{ width: `${percent}%`, height: '100%' }}
                />
            </div>
        </div>
    );
}
