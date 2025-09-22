'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore, CategoryQuestion } from '@/lib/store/useQuestionnaireStore';
import { getSession } from '@/lib/auth';
import { Session } from '@supabase/supabase-js';

export default function CategoryQuestionsPage() {
    const router = useRouter();
    const {
        selectedCategory,
        selectedCategoryId,
        setCategoryQuestions,
        categoryQuestions,
        saveAnswer,
        setCurrentStep
    } = useQuestionnaireStore();

    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [questionToCategoryMap, setQuestionToCategoryMap] = useState<Record<number, number>>({});

    useEffect(() => {
        // Get session and redirect back to category selection if no category selected
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

        if (!selectedCategory || !selectedCategoryId) {
            router.push('/user/progress/questions');
            return;
        }

        // Fetch category-specific questions from API
        const fetchCategoryQuestions = async () => {
            try {
                // Ensure we have a session for userId param
                const sess = await getSession();
                if (!sess?.user?.id) {
                    throw new Error('Missing user session');
                }

                const response = await fetch(`/api/questions?type=category&userId=${sess.user.id}&categoryId=${selectedCategoryId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch category questions');
                }

                const { questions } = await response.json();
                setCategoryQuestions(questions as CategoryQuestion[]);
            } catch (error) {
                console.error('Error fetching category questions:', error);
                setError('Failed to load questions');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryQuestions();
    }, [selectedCategory, selectedCategoryId, router, setCategoryQuestions]);

    const handleInputChange = (categoryQuestionId: number, value: any) => {
        setAnswers(prev => ({ ...prev, [categoryQuestionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            setError('User session not found. Please log in again.');
            return;
        }

        try {
            // Save all answers to the backend
            for (const [categoryQuestionIdStr, value] of Object.entries(answers)) {
                const categoryQuestionId = parseInt(categoryQuestionIdStr);
                const answer = {
                    user_id: session.user.id,
                    answer_text: typeof value === 'string' ? value : undefined,
                    option_id: typeof value === 'number' ? value : undefined,
                };

                // Save in client store
                useQuestionnaireStore.getState().saveCategoryAnswer(categoryQuestionId, answer);

                // Save via Next.js API route
                await fetch('/api/category-answers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                    },
                    body: JSON.stringify({
                        user_id: session.user.id,
                        category_question_id: categoryQuestionId,
                        answer_text: answer.answer_text,
                        option_id: answer.option_id,
                    }),
                });
            }

            // Complete the questionnaire
            setCurrentStep('complete');
            router.push('/user/progress/questions/complete');
        } catch (error) {
            console.error('Error saving answers:', error);
            setError('Failed to save answers');
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-6 sm:py-8">
                <PageHeader
                    title="Category Specific Questions"
                    subtitle={`Questions specific to ${selectedCategory}`}
                />
                <div className="mt-8 text-gray-500">Loading questions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-custom py-6 sm:py-8">
                <PageHeader
                    title="Category Specific Questions"
                    subtitle={`Questions specific to ${selectedCategory}`}
                />
                <div className="mt-8 text-red-500">{error}</div>
                <button
                    onClick={() => router.push('/user/progress/questions/general')}
                    className="mt-4 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                    Back to General Questions
                </button>
            </div>
        );
    }

    return (
        <div className="container-custom py-6 sm:py-8">
            <PageHeader
                title="Category Specific Questions"
                subtitle={`Additional questions about ${selectedCategory}`}
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-3xl mx-auto">
                {categoryQuestions.map((question: CategoryQuestion, idx: number) => (
                    <div key={question.category_question_id} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <label className="block text-base sm:text-lg font-semibold text-gray-900">
                                {idx + 1}. {question.context_for_ai}
                            </label>
                        </div>

                        {question.category_options && question.category_options.length > 0 ? (
                            <div className="mt-4 grid grid-cols-1 gap-3">
                                {question.category_options.map((option) => {
                                    const checked = answers[question.category_question_id] === option.option_id;
                                    return (
                                        <label
                                            key={option.option_id}
                                            htmlFor={`cq${question.category_question_id}_o${option.option_id}`}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${checked
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="flex items-center gap-3 text-sm text-gray-900">
                                                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'
                                                    }`}>
                                                    <span className={`h-2.5 w-2.5 rounded-full ${checked ? 'bg-blue-600' : 'bg-transparent'
                                                        }`} />
                                                </span>
                                                {option.option_text}
                                            </span>
                                            <input
                                                id={`cq${question.category_question_id}_o${option.option_id}`}
                                                type="radio"
                                                name={`category_question_${question.category_question_id}`}
                                                value={option.option_id}
                                                className="sr-only"
                                                onChange={(e) => handleInputChange(question.category_question_id, parseInt(e.target.value))}
                                                checked={checked}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-4">
                                <div className="relative">
                                    <textarea
                                        rows={4}
                                        className="block w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="Type your answer here..."
                                        value={answers[question.category_question_id] || ''}
                                        onChange={(e) => handleInputChange(question.category_question_id, e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Share specifics related to {selectedCategory}.</p>
                            </div>
                        )}
                    </div>
                ))}

                {categoryQuestions.length === 0 && (
                    <div className="text-gray-500">
                        <p>No specific questions available for this category.</p>
                        <p className="mt-2">You can proceed to complete your learning path setup.</p>
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => router.push('/user/progress/questions/general')}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
                        disabled={!session?.user?.id}
                    >
                        Complete Setup
                    </button>
                </div>
            </form>
        </div>
    );
}
