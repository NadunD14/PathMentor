'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore, Question } from '@/lib/store/useQuestionnaireStore';
import { getSession } from '@/lib/auth';
import { Session } from '@supabase/supabase-js';

export default function GeneralQuestionsPage() {
    const router = useRouter();
    const {
        selectedCategory,
        selectedCategoryId,
        setGeneralQuestions,
        generalQuestions,
        saveAnswer,
        setCurrentStep
    } = useQuestionnaireStore();

    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);

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

        // Fetch general questions from API
        const fetchGeneralQuestions = async () => {
            try {
                const response = await fetch('/api/questions?type=general');
                if (!response.ok) {
                    throw new Error('Failed to fetch general questions');
                }

                const { questions } = await response.json();
                console.log('Fetched general questions:', questions);
                setGeneralQuestions(questions || []);
            } catch (error) {
                console.error('Error fetching general questions:', error);
                setError('Failed to load questions');
            } finally {
                setLoading(false);
            }
        };

        fetchGeneralQuestions();
    }, [selectedCategory, selectedCategoryId, router, setGeneralQuestions]);

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
                const answer = {
                    user_id: session.user.id, // Use actual user ID from session
                    answer_text: typeof value === 'string' ? value : undefined,
                    option_id: typeof value === 'number' ? value : undefined,
                };

                saveAnswer(parseInt(questionId), answer);

                // Save to backend
                await fetch('/api/answers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: session.user.id, // Use actual user ID from session
                        questionId: parseInt(questionId),
                        answerText: answer.answer_text,
                        optionId: answer.option_id,
                    }),
                });
            }

            // Set the current step to specific and navigate to the category questions page
            setCurrentStep('specific');
            router.push('/user/progress/questions/category');
        } catch (error) {
            console.error('Error saving answers:', error);
            setError('Failed to save answers');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <PageHeader
                    title="General Questions"
                    subtitle="Help us understand your learning preferences"
                />
                <div className="mt-8 text-gray-500">Loading questions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <PageHeader
                    title="General Questions"
                    subtitle="Help us understand your learning preferences"
                />
                <div className="mt-8 text-red-500">{error}</div>
                <button
                    onClick={() => router.push('/user/progress/questions')}
                    className="mt-4 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                    Back to Categories
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="General Questions"
                subtitle={`Help us understand your learning preferences for ${selectedCategory}`}
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-3xl mx-auto">
                {generalQuestions.map((question: Question) => (
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

                {generalQuestions.length === 0 && (
                    <div className="text-gray-500"></div>
                )}

                <div className="flex justify-between pt-6">
                    <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => router.push('/user/progress/questions')}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
                        disabled={Object.keys(answers).length === 0}
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}
