'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore } from '@/lib/store/useQuestionnaireStore';
import { getSession } from '@/lib/auth';

export default function CompleteQuestionnairePage() {
    const router = useRouter();
    const { selectedCategory, currentStep, resetQuestionnaire } = useQuestionnaireStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if questionnaire not completed properly
        if (currentStep !== 'complete' || !selectedCategory) {
            router.push('/user/progress/questions');
            return;
        }

        // Trigger ML analysis when component mounts
        triggerMLAnalysis();
    }, [currentStep, selectedCategory, router]);

    const triggerMLAnalysis = async () => {
        if (isProcessing || analysisComplete) return;

        setIsProcessing(true);
        try {
            // Get current user session
            const session = await getSession();
            if (!session?.user?.id) {
                setAnalysisError('User session not found. Please log in again.');
                return;
            }

            // Call frontend API to trigger ML analysis
            const response = await fetch('/api/ml/complete-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process ML analysis');
            }

            const result = await response.json();
            console.log('ML Analysis completed:', result);
            setAnalysisComplete(true);
        } catch (error) {
            console.error('Error during ML analysis:', error);
            setAnalysisError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStartLearning = () => {
        // Reset questionnaire and navigate to dashboard
        resetQuestionnaire();
        router.push('/user/dashboard');
    };

    const handleRetakeQuestionnaire = () => {
        resetQuestionnaire();
        router.push('/user/progress/questions');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Questionnaire Complete!"
                subtitle="Thank you for completing your learning preferences"
            />

            <div className="mt-8 max-w-3xl mx-auto">
                {/* Processing Status */}
                {isProcessing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800">
                                    Processing Your Learning Profile
                                </h3>
                                <p className="text-blue-700 mt-1">
                                    We're analyzing your responses to create a personalized learning experience...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {analysisError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <div className="text-red-600 text-2xl mr-3">⚠️</div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">
                                    Analysis Error
                                </h3>
                                <p className="text-red-700 mt-1">
                                    {analysisError}
                                </p>
                                <button
                                    onClick={triggerMLAnalysis}
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                >
                                    Retry Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {analysisComplete && !analysisError && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="text-green-600 text-2xl mr-3">✅</div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">
                                    Questionnaire Completed Successfully!
                                </h3>
                                <p className="text-green-700 mt-1">
                                    We've analyzed your preferences for <strong>{selectedCategory}</strong> learning.
                                    Your personalized learning path has been created!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h4>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex items-start">
                            <div className="text-blue-600 text-lg mr-3">📚</div>
                            <div>
                                <p className="font-medium">Personalized Learning Path</p>
                                <p className="text-sm">Based on your answers, we've created a customized learning path with resources tailored to your needs.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="text-blue-600 text-lg mr-3">📊</div>
                            <div>
                                <p className="font-medium">Progress Tracking</p>
                                <p className="text-sm">Track your learning progress with detailed analytics and milestones.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="text-blue-600 text-lg mr-3">🎯</div>
                            <div>
                                <p className="font-medium">Adaptive Recommendations</p>
                                <p className="text-sm">Get recommendations that adapt to your learning style and progress.</p>
                            </div>
                        </div>
                        {analysisComplete && (
                            <div className="flex items-start">
                                <div className="text-green-600 text-lg mr-3">🤖</div>
                                <div>
                                    <p className="font-medium">AI-Powered Analysis Complete</p>
                                    <p className="text-sm">Our ML algorithms have analyzed your responses to optimize your learning experience.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleStartLearning}
                        disabled={isProcessing}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium text-white text-center ${isProcessing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Start Learning Journey'}
                    </button>
                    <button
                        onClick={handleRetakeQuestionnaire}
                        disabled={isProcessing}
                        className={`flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-center ${isProcessing
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Retake Questionnaire
                    </button>
                </div>
            </div>
        </div>
    );
}
