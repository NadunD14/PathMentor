'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { mockRecommendations } from '@/lib/mockData';

export default function RecommendationCard() {
    const [recommendations] = useState(mockRecommendations);

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Beginner</span>;
            case 'intermediate':
                return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Intermediate</span>;
            case 'advanced':
                return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Advanced</span>;
            default:
                return null;
        }
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
        }
    };

    return (
        <Card title="Recommended For You" className="h-full">
            <div className="space-y-4">
                {recommendations.map((rec) => (
                    <div
                        key={rec.id}
                        className="p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800">{rec.title}</h4>
                            {getDifficultyBadge(rec.difficulty)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{rec.category}</span>
                            <span className="text-xs text-gray-500">{formatTime(rec.estimatedTime)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View More Recommendations
                </button>
            </div>
        </Card>
    );
}
