'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';

// Mock data for recent activities
const recentActivities = [
    {
        id: '1',
        type: 'completed',
        title: 'CSS Animations',
        category: 'Web Development',
        date: '2025-08-10T14:30:00',
    },
    {
        id: '2',
        type: 'started',
        title: 'Data Visualization with D3',
        category: 'Data Science',
        date: '2025-08-09T10:15:00',
    },
    {
        id: '3',
        type: 'achievement',
        title: 'Earned "Week Streak" Badge',
        category: 'Achievements',
        date: '2025-08-07T16:45:00',
    },
    {
        id: '4',
        type: 'completed',
        title: 'Introduction to TensorFlow',
        category: 'Machine Learning',
        date: '2025-08-05T09:30:00',
    },
];

export default function ActivityFeedCard() {
    const [activities] = useState(recentActivities);

    // Format relative time (e.g., "2 days ago")
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'completed':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'started':
                return (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'achievement':
                return (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <Card title="Recent Activities">
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}

                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.category}</p>
                        </div>

                        <div className="text-xs text-gray-500 whitespace-nowrap">
                            {getRelativeTime(activity.date)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Activities
                </button>
            </div>
        </Card>
    );
}
