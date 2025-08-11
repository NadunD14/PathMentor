'use client';

import UserProfileCard from '@/components/user/LearnMe/UserProfileCard';
import AITipCard from '@/components/user/LearnMe/AITipCard';
import AIChatBot from '@/components/user/LearnMe/AIChatBot';
import RecommendationCard from '@/components/user/LearnMe/RecommendationCard';
import PageHeader from '@/components/user/shared/PageHeader';

export default function LearnMePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader title="Learn Me" subtitle="Chat with your AI learning assistant and get personalized tips" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
