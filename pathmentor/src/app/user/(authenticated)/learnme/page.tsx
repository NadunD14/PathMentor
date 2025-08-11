'use client';

import UserProfileCard from '@/components/user/LearnMe/UserProfileCard';
import AITipCard from '@/components/user/LearnMe/AITipCard';
import AIChatBot from '@/components/user/LearnMe/AIChatBot';
import RecommendationCard from '@/components/user/LearnMe/RecommendationCard';

export default function LearnMePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Learn Me</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        <UserProfileCard />
                        <AITipCard />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="space-y-6">
                        <AIChatBot />
                        <RecommendationCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
