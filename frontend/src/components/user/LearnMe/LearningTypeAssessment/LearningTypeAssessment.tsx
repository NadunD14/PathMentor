'use client';

import React, { useState, useEffect } from 'react';
import { useLearningTypeStore } from '@/lib/store/useLearningTypeStore';
import { learningTypeService } from '@/lib/services/learningTypeService';
import { LearningType, ActivityType } from '@/lib/types/learningTypes';
import LearningTypeResult from './LearningTypeResult';
import AssessmentProgress from './AssessmentProgress';
import ActivitySelector from './ActivitySelector';
import MemoryChallengeActivity from './Activities/MemoryChallengeActivity';
import ProblemSolvingActivity from './Activities/ProblemSolvingActivity';
import AudioVisualActivity from './Activities/AudioVisualActivity';
import ReadingWritingActivity from './Activities/ReadingWritingActivity';

interface LearningTypeAssessmentProps {
    userId: string;
    onComplete?: (learningType: LearningType) => void;
}

export default function LearningTypeAssessment({ userId, onComplete }: LearningTypeAssessmentProps) {
    const {
        userProfile,
        assessmentState,
        initializeAssessment,
        startActivity,
        completeActivity,
        getProgressPercentage,
        isActivityCompleted,
        getRecommendedNextActivity,
    } = useLearningTypeStore();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserProfile = async () => {
            setIsLoading(true);
            try {
                const existingProfile = await learningTypeService.getUserLearningProfile(userId);
                if (existingProfile) {
                    // User already has a profile
                    if (existingProfile.assessmentComplete) {
                        // Assessment already completed
                        return;
                    }
                } else {
                    // Initialize new assessment
                    initializeAssessment(userId);
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                // Initialize assessment anyway
                initializeAssessment(userId);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserProfile();
    }, [userId, initializeAssessment]);

    useEffect(() => {
        if (userProfile?.assessmentComplete && onComplete) {
            onComplete(userProfile.primaryLearningType);
        }
    }, [userProfile?.assessmentComplete, userProfile?.primaryLearningType, onComplete]);

    const handleActivityComplete = async (activityType: ActivityType, result: any) => {
        try {
            // Save to backend
            await learningTypeService.saveActivityResult(result);

            // Update local store
            completeActivity(result);

            // If assessment is complete, update backend profile
            if (getProgressPercentage() === 100 && userProfile) {
                await learningTypeService.updateUserLearningProfile(userProfile);
            }
        } catch (error) {
            console.error('Error completing activity:', error);
            // Still update local store even if backend fails
            completeActivity(result);
        }
    };

    const handleStartActivity = (activityType: ActivityType) => {
        startActivity(activityType);
    };

    const renderCurrentActivity = () => {
        if (!assessmentState.currentActivity) return null;

        const commonProps = {
            userId,
            onComplete: (result: any) => handleActivityComplete(assessmentState.currentActivity!, result),
            onBack: () => startActivity(assessmentState.currentActivity!), // Reset current activity
        };

        switch (assessmentState.currentActivity) {
            case ActivityType.MEMORY_CHALLENGE:
                return <MemoryChallengeActivity {...commonProps} />;
            case ActivityType.PROBLEM_SOLVING:
                return <ProblemSolvingActivity {...commonProps} />;
            case ActivityType.AUDIO_VISUAL:
                return <AudioVisualActivity {...commonProps} />;
            case ActivityType.READING_WRITING:
                return <ReadingWritingActivity {...commonProps} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your learning profile...</p>
                </div>
            </div>
        );
    }

    // Show results if assessment is complete
    if (userProfile?.assessmentComplete) {
        return (
            <LearningTypeResult
                userProfile={userProfile}
                onRetakeAssessment={() => initializeAssessment(userId)}
            />
        );
    }

    // Show current activity if one is active
    if (assessmentState.currentActivity) {
        return (
            <div className="space-y-6">
                <AssessmentProgress
                    progress={getProgressPercentage()}
                    currentActivity={assessmentState.currentActivity}
                    completedActivities={assessmentState.completedActivities}
                />
                {renderCurrentActivity()}
            </div>
        );
    }

    // Show activity selector
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Discover Your Learning Type
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Complete these four activities to understand how you learn best.
                    Each activity takes about 5-10 minutes and helps us personalize your learning experience.
                </p>
            </div>

            <AssessmentProgress
                progress={getProgressPercentage()}
                currentActivity={null}
                completedActivities={assessmentState.completedActivities}
            />

            <ActivitySelector
                completedActivities={assessmentState.completedActivities}
                recommendedNext={getRecommendedNextActivity()}
                onSelectActivity={handleStartActivity}
                isActivityCompleted={isActivityCompleted}
            />

            {assessmentState.completedActivities.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Great Progress! 🎉
                    </h3>
                    <p className="text-blue-700">
                        You've completed {assessmentState.completedActivities.length} out of 4 activities.
                        {assessmentState.completedActivities.length === 4
                            ? " We're analyzing your results to determine your learning type!"
                            : ` Keep going to get your personalized learning type!`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}
