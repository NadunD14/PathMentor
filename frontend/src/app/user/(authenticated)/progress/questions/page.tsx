'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore, Category } from '@/lib/store/useQuestionnaireStore';
import { getSession } from '@/lib/auth'; // Import getSession directly from auth.ts
import { Session } from '@supabase/supabase-js';

interface CategoryCard {
    category_id: number;
    name: string;
    description: string;
    icon: string;
    image_url?: string;
}

// Fetch categories from the new API endpoint
const fetchCategories = async (): Promise<CategoryCard[]> => {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const { categories } = await response.json();

        const iconFallback: Record<string, string> = {
            'programming': '💻',
            'graphic design': '🎨',
            'video editing': '🎬',
            'data science': '📊',
            'marketing': '📢',
        };

        return (categories || []).map((category: Category) => ({
            category_id: category.category_id,
            name: category.name,
            description: category.description || 'Start learning today.',
            icon: category.image_url ? '' : iconFallback[category.name.toLowerCase()] || '📚',
            image_url: category.image_url || undefined
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export default function QuestionsPage() {
    const router = useRouter();
    const { selectCategory, resetQuestionnaire } = useQuestionnaireStore();
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<CategoryCard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    // Reset the questionnaire state when first entering this flow
    useEffect(() => {
        const initializeSession = async () => {
            try {
                const currentSession = await getSession();
                setSession(currentSession);

                if (!currentSession) {
                    router.push('/user/login');
                    return;
                }
            } catch (error) {
                console.error('Error getting session:', error);
                router.push('/user/login');
                return;
            }
        };

        initializeSession();
        resetQuestionnaire();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchCategories();
                setCategories(result);
            } catch (e: any) {
                setError('Failed to load categories');
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [resetQuestionnaire, router]);

    const handleCategorySelect = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
    };

    const handleContinue = async () => {
        if (!selectedCategoryId || !session?.user?.id) return;

        const selectedCategory = categories.find(cat => cat.category_id === selectedCategoryId);
        if (!selectedCategory) return;

        // Save category selection to backend
        try {
            const response = await fetch('/api/user-category-selection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id, // Use actual user ID from session
                    categoryId: selectedCategoryId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save category selection');
            }

            selectCategory(selectedCategory.name, selectedCategoryId);
            router.push('/user/progress/questions/general');
        } catch (error) {
            console.error('Error saving category selection:', error);
            setError('Failed to save category selection');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Create Your Learning Path"
                subtitle="Select a category you'd like to learn"
            />

            {loading && (
                <div className="mt-8 text-gray-500">Loading categories...</div>
            )}
            {error && (
                <div className="mt-8 text-red-500">{error}</div>
            )}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {categories.map((category) => (
                        <div
                            key={category.category_id}
                            className={`cursor-pointer border rounded-xl p-6 hover:shadow-lg transition-all ${selectedCategoryId === category.category_id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                                }`}
                            onClick={() => handleCategorySelect(category.category_id)}
                        >
                            {/* Render image if available, otherwise use emoji icon */}
                            {category.image_url ? (
                                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="text-4xl mb-4">{category.icon}</div>
                            )}
                            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                            <p className="text-gray-600">{category.description}</p>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full text-gray-500">No categories available.</div>
                    )}
                </div>
            )}

            <div className="mt-10 flex justify-end">
                <button
                    className={`px-6 py-3 rounded-lg font-medium text-white ${selectedCategoryId && session?.user?.id
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    disabled={!selectedCategoryId || !session?.user?.id}
                    onClick={handleContinue}
                >
                    Continue to Questions
                </button>
            </div>
        </div>
    );
}