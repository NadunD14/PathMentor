'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore, Question } from '@/lib/store/useQuestionnaireStore';
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
                const response = await fetch(`/api/questions/category?categoryId=${selectedCategoryId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch category questions');
                }

                const { questions } = await response.json();

                // Extract the general_questions from the nested structure
                const formattedQuestions = questions.map((item: any) => item.general_questions).filter(Boolean);
                setCategoryQuestions(formattedQuestions);

                // Build a map from general question_id -> category_question_id for saving answers
                const map: Record<number, number> = {};
                questions.forEach((item: any) => {
                    const qid = item?.general_questions?.question_id;
                    const cqid = item?.category_question_id;
                    if (qid && cqid) {
                        map[qid] = cqid;
                    }
                });
                setQuestionToCategoryMap(map);
            } catch (error) {
                console.error('Error fetching category questions:', error);
                setError('Failed to load questions');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryQuestions();
    }, [selectedCategory, selectedCategoryId, router, setCategoryQuestions]);

    const handleInputChange = (questionId: number, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            setError('User session not found. Please log in again.');
            return;
        }

        try {
            // Save all answers to the backend
            for (const [questionId, value] of Object.entries(answers)) {
                const numericQuestionId = parseInt(questionId);
                const categoryQuestionId = questionToCategoryMap[numericQuestionId];
                if (!categoryQuestionId) {
                    console.warn('Missing category_question_id mapping for general question id:', numericQuestionId);
                    continue; // Skip if mapping isn't available
                }
                const answer = {
                    user_id: session.user.id, // Use actual user ID from session
                    answer_text: typeof value === 'string' ? value : undefined,
                    option_id: typeof value === 'number' ? value : undefined,
                };

                saveAnswer(numericQuestionId, answer);

                // Save to backend
                await fetch('/api/category-answers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: session.user.id, // Use actual user ID from session
                        categoryQuestionId,
                        answerText: answer.answer_text,
                        optionId: answer.option_id,
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Category Specific Questions"
                subtitle={`Additional questions about ${selectedCategory}`}
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-3xl mx-auto">
                {categoryQuestions.map((question: Question) => (
                    <div key={question.question_id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {question.question}
                        </label>

                        {question.question_options && question.question_options.length > 0 ? (
                            // Multiple choice question
                            <div className="space-y-2">
                                {question.question_options.map((option) => (
                                    <div key={option.option_id} className="flex items-center">
                                        <input
                                            id={`q${question.question_id}_o${option.option_id}`}
                                            type="radio"
                                            name={`question_${question.question_id}`}
                                            value={option.option_id}
                                            className="h-4 w-4 text-blue-600 border-gray-300"
                                            onChange={(e) => handleInputChange(question.question_id, parseInt(e.target.value))}
                                            checked={answers[question.question_id] === option.option_id}
                                        />
                                        <label htmlFor={`q${question.question_id}_o${option.option_id}`} className="ml-2 text-sm text-gray-700">
                                            {option.option_text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Text input question
                            <textarea
                                rows={3}
                                className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                                placeholder="Enter your answer..."
                                value={answers[question.question_id] || ''}
                                onChange={(e) => handleInputChange(question.question_id, e.target.value)}
                                required
                            />
                        )}
                    </div>
                ))}

                {categoryQuestions.length === 0 && (
                    <div className="text-gray-500">
                        <p>No specific questions available for this category.</p>
                        <p className="mt-2">You can proceed to complete your learning path setup.</p>
                    </div>
                )}

                <div className="flex justify-between pt-6">
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
