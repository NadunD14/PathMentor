'use client';

import Card from '@/components/user/shared-authenticated/Card';
import { mockRecommendations } from '@/lib/mockData';

export default function RecommendedCard() {
    // Get only the first 2 recommendations for the dashboard
    const recommendations = mockRecommendations.slice(0, 2);

    return (
        <Card title="Recommended For You">
            <div className="space-y-3">
                {recommendations.map((rec) => (
                    <div
                        key={rec.id}
                        className="p-3 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-800">{rec.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${rec.difficulty === 'beginner'
                                ? 'bg-green-100 text-green-800'
                                : rec.difficulty === 'intermediate'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{rec.category}</span>
                            <span className="text-xs text-gray-500">
                                {rec.estimatedTime >= 60
                                    ? `${Math.floor(rec.estimatedTime / 60)}h ${rec.estimatedTime % 60}m`
                                    : `${rec.estimatedTime}m`
                                }
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3">
                <button className="w-full py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-md">
                    View More Recommendations
                </button>
            </div>
        </Card>
    );
}
