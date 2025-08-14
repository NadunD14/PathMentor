'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore, LearningCategory } from '@/lib/store/useQuestionnaireStore';

interface CategoryCard {
    id: LearningCategory;
    title: string;
    description: string;
    icon: string;
}

export default function QuestionsPage() {
    const router = useRouter();
    const { selectCategory, resetQuestionnaire } = useQuestionnaireStore();
    const [selectedCategory, setSelectedCategory] = useState<LearningCategory | null>(null);

    // Reset the questionnaire state when first entering this flow
    useEffect(() => {
        resetQuestionnaire();
    }, []);

    const categories: CategoryCard[] = [
        {
            id: 'programming',
            title: 'Programming',
            description: 'Learn to code and build applications, websites, or data-driven solutions.',
            icon: '💻',
        },
        {
            id: 'graphicDesign',
            title: 'Graphic Design',
            description: 'Create visual content and designs for digital or print media.',
            icon: '🎨',
        },
        {
            id: 'videoEditing',
            title: 'Video Editing',
            description: 'Learn to edit videos for social media, films, or marketing content.',
            icon: '🎬',
        },
    ];

    const handleCategorySelect = (category: LearningCategory) => {
        setSelectedCategory(category);
    };

    const handleContinue = () => {
        if (!selectedCategory) return;

        selectCategory(selectedCategory);
        router.push('/user/progress/questions/general');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Create Your Learning Path"
                subtitle="Select a category you'd like to learn"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`cursor-pointer border rounded-xl p-6 hover:shadow-lg transition-all ${selectedCategory === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        onClick={() => handleCategorySelect(category.id)}
                    >
                        <div className="text-4xl mb-4">{category.icon}</div>
                        <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                        <p className="text-gray-600">{category.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-end">
                <button
                    className={`px-6 py-3 rounded-lg font-medium text-white ${selectedCategory
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    disabled={!selectedCategory}
                    onClick={handleContinue}
                >
                    Continue to Questions
                </button>
            </div>
        </div>
    );
}
