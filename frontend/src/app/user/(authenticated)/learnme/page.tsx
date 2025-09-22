'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import LearningTypeAssessment from '@/components/user/LearnMe/LearningTypeAssessment/LearningTypeAssessment';
import LearningTypeResult from '@/components/user/LearnMe/LearningTypeAssessment/LearningTypeResult';
import { useLearningTypeStore } from '@/lib/store/useLearningTypeStore';
import { learningTypeService } from '@/lib/services/learningTypeService';
import { learningStyleService } from '@/lib/services/learningStyleService';
import { useAuth } from '@/contexts/AuthContext';
import { LearningType } from '@/lib/types/learningTypes';

export default function LearnMePage() {
    const searchParams = useSearchParams();
    const explainId = searchParams?.get('explain');
    const [currentView, setCurrentView] = useState<'intro' | 'assessment' | 'result'>('intro');
    const { user } = useAuth();

    const { userProfile } = useLearningTypeStore();

    useEffect(() => {
        // Check if user has completed assessment
        if (userProfile?.assessmentComplete) {
            setCurrentView('result');
        }
    }, [userProfile]);

    const handleStartAssessment = () => {
        setCurrentView('assessment');
    };

    const handleAssessmentComplete = async (learningType: LearningType) => {
        try {
            // Save learning style to backend if user is authenticated
            if (user?.id) {
                await learningStyleService.saveLearningStyle(user.id, learningType);
                console.log('Learning style saved successfully');
            }
        } catch (error) {
            console.error('Failed to save learning style:', error);
            // Don't prevent showing results even if saving fails
        }

        setCurrentView('result');
    };

    const renderIntroView = () => {
        const typeInfo = userProfile?.primaryLearningType
            ? learningTypeService.getLearningTypeDescription(userProfile.primaryLearningType)
            : null;

        return (
            <div className="space-y-8">
                {/* Learning Type Display */}
                {userProfile?.assessmentComplete ? (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
                        <div className="text-6xl mb-4">{typeInfo?.icon}</div>
                        <h2 className="text-3xl font-bold mb-2">Your Learning Type</h2>
                        <h3 className="text-2xl font-semibold mb-3">{typeInfo?.title}</h3>
                        <p className="text-lg opacity-90 mb-4">{typeInfo?.description}</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setCurrentView('result')}
                                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                View Full Results
                            </button>
                            <button
                                onClick={handleStartAssessment}
                                className="px-6 py-2 bg-white/20 text-white border border-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                            >
                                Retake Assessment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-8 text-white text-center">
                        <div className="text-6xl mb-4">🧠</div>
                        <h2 className="text-3xl font-bold mb-2">Discover Your Learning Type</h2>
                        <p className="text-lg opacity-90 mb-6">
                            Take our comprehensive assessment to understand how you learn best and get personalized recommendations.
                        </p>
                        <button
                            onClick={handleStartAssessment}
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
                        >
                            Take Learning Assessment
                        </button>
                    </div>
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">🧠</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Memory Challenge</h3>
                        <p className="text-sm text-gray-600">Test your visual memory and recall abilities</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">🧩</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Solving</h3>
                        <p className="text-sm text-gray-600">Interactive puzzles for hands-on learners</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">🎬</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio-Visual</h3>
                        <p className="text-sm text-gray-600">Multimedia content for different preferences</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">📚</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reading & Writing</h3>
                        <p className="text-sm text-gray-600">Text-based learning assessment</p>
                    </div>
                </div>

                {/* Learning Types Overview */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        The Four Learning Types
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-l-4 border-purple-500 pl-4">
                            <h4 className="text-lg font-semibold text-purple-600 mb-2">👁️ Visual Learners</h4>
                            <p className="text-gray-700 text-sm">
                                Learn best through seeing and observing. Prefer charts, diagrams, and visual aids.
                            </p>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="text-lg font-semibold text-blue-600 mb-2">👂 Auditory Learners</h4>
                            <p className="text-gray-700 text-sm">
                                Process information best through listening and speaking. Benefit from discussions and audio content.
                            </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="text-lg font-semibold text-green-600 mb-2">🤲 Kinesthetic Learners</h4>
                            <p className="text-gray-700 text-sm">
                                Learn through hands-on activities and physical engagement. Need movement and touch.
                            </p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4">
                            <h4 className="text-lg font-semibold text-orange-600 mb-2">📝 Reading/Writing Learners</h4>
                            <p className="text-gray-700 text-sm">
                                Excel with text-based information. Prefer reading and writing activities.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                {!userProfile?.assessmentComplete && (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to Discover Your Learning Type?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Our assessment takes about 20-30 minutes and provides personalized insights into how you learn best.
                        </p>
                        <button
                            onClick={handleStartAssessment}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Start Assessment Now
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="py-6 sm:py-8">
            {/* <PageHeader
                title="Learn Me"
                subtitle={
                    currentView === 'assessment'
                        ? "Complete the assessment to discover your learning type"
                        : currentView === 'result'
                            ? "Your personalized learning type results"
                            : "Discover how you learn best with our comprehensive assessment"
                }
            /> */}

            {currentView === 'intro' && renderIntroView()}
            {currentView === 'assessment' && (
                <LearningTypeAssessment
                    userId={user?.id || 'anonymous'}
                    onComplete={handleAssessmentComplete}
                />
            )}
            {currentView === 'result' && userProfile && (
                <LearningTypeResult
                    userProfile={userProfile}
                    onRetakeAssessment={() => setCurrentView('assessment')}
                />
            )}
        </div>
    );
}
