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
        setCurrentStep,
        assessmentId,
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
                    assessment_id: assessmentId ?? undefined,
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
                        assessmentId: assessmentId ?? undefined,
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
            <div className="container-custom py-6 sm:py-8">
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
            <div className="container-custom py-6 sm:py-8">
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
        <div className="container-custom py-6 sm:py-8">
            <PageHeader
                title="General Questions"
                subtitle={`Help us understand your learning preferences for ${selectedCategory}`}
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-3xl mx-auto">
                {generalQuestions.map((question: Question, idx: number) => (
                    <div key={question.question_id} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <label className="block text-base sm:text-lg font-semibold text-gray-900">
                                {idx + 1}. {question.question}
                            </label>
                        </div>

                        {question.question_options && question.question_options.length > 0 ? (
                            <div className="mt-4 grid grid-cols-1 gap-3">
                                {question.question_options.map((option) => {
                                    const checked = answers[question.question_id] === option.option_id;
                                    return (
                                        <label
                                            key={option.option_id}
                                            htmlFor={`q${question.question_id}_o${option.option_id}`}
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
                                                id={`q${question.question_id}_o${option.option_id}`}
                                                type="radio"
                                                name={`question_${question.question_id}`}
                                                value={option.option_id}
                                                className="sr-only"
                                                onChange={(e) => handleInputChange(question.question_id, parseInt(e.target.value))}
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
                                        value={answers[question.question_id] || ''}
                                        onChange={(e) => handleInputChange(question.question_id, e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Give as much detail as you like. This helps tailor your path.</p>
                            </div>
                        )}
                    </div>
                ))}

                {generalQuestions.length === 0 && (
                    <div className="text-gray-500">No general questions available.</div>
                )}

                <div className="flex justify-between pt-4">
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
