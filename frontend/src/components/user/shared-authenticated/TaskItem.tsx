'use client';

import { Fragment, useState } from 'react';
import { PriorityLevel } from '@/lib/store/useProgressStore';

interface TaskItemProps {
    id: string;
    title: string;
    dueDate: string;
    priority: PriorityLevel;
    completed: boolean;
    onToggleComplete: (id: string) => void;
}

export default function TaskItem({
    id,
    title,
    dueDate,
    priority,
    completed,
    onToggleComplete,
}: TaskItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    const priorityClasses = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800',
    };

    const priorityClass = priorityClasses[priority];

    // Format date to show "Today", "Tomorrow", or the date
    const formatDueDate = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (dueDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    return (
        <div
            className={`flex items-center justify-between py-3 px-4 border-b border-gray-100 
        ${isHovered ? 'bg-gray-50' : ''} 
        ${completed ? 'opacity-50' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id={`task-${id}`}
                    checked={completed}
                    onChange={() => onToggleComplete(id)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                    htmlFor={`task-${id}`}
                    className={`font-medium ${completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                >
                    {title}
                </label>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{formatDueDate(dueDate)}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${priorityClass}`}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
            </div>
        </div>
    );
}
