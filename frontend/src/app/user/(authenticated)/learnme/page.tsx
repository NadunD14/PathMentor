'use client';

import UserProfileCard from '@/components/user/LearnMe/UserProfileCard';
import AITipCard from '@/components/user/LearnMe/AITipCard';
import AIChatBot from '@/components/user/LearnMe/AIChatBot';
import RecommendationCard from '@/components/user/LearnMe/RecommendationCard';
import PageHeader from '@/components/user/shared/PageHeader';
import { useSearchParams } from 'next/navigation';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';

// Helper to build context string for AI based on current learning path state
function useLearningContext() {
    const { generatedPath } = useQuestionnaireStore();

    if (!generatedPath) return '';

    const nextResource = generatedPath.resources.find(r => !r.completed);
    const progressCount = generatedPath.resources.filter(r => r.completed).length;
    const total = generatedPath.resources.length;
    return `LearningPath: ${generatedPath.title}. Progress: ${progressCount}/${total}. Next: ${nextResource ? nextResource.title : 'All resources completed'}. `;
}

export default function LearnMePage() {
    const searchParams = useSearchParams();
    const explainId = searchParams.get('explain');
    const learningContext = useLearningContext();

    // If an explain resource id is present, craft an initial system/user seed prompt
    const initialPrompt = explainId
        ? `${learningContext}Explain the resource with id "${explainId}" in simple terms. Provide: 1) concise overview 2) why it's important in the path 3) key concepts 4) a quick practice task.`
        : '';
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
                        <AIChatBot initialPrompt={initialPrompt} learningContext={learningContext} />
                        <RecommendationCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
