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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {categories.map((category) => {
                        const selected = selectedCategoryId === category.category_id;
                        return (
                            <div
                                key={category.category_id}
                                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${selected
                                    ? 'border-blue-600 ring-2 ring-blue-500/60 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                onClick={() => handleCategorySelect(category.category_id)}
                                role="button"
                                aria-pressed={selected}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleCategorySelect(category.category_id);
                                    }
                                }}
                            >
                                <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                                    {category.image_url ? (
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-5xl sm:text-6xl text-white/90">
                                            <span className="drop-shadow-md">{category.icon}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-white drop-shadow-lg text-lg sm:text-xl font-semibold">
                                            {category.name}
                                        </h3>
                                    </div>
                                    {selected && (
                                        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                                            Selected
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 sm:p-5 bg-white">
                                    <p className="text-sm text-gray-600">
                                        {category.description}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-2 text-sm font-medium ${selected ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                                            }`}>
                                            Explore
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            >
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className={`h-3 w-3 rounded-full border ${selected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-gray-100 border-gray-300 group-hover:border-gray-400'
                                            }`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

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