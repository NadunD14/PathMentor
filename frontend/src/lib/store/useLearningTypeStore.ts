import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    LearningType,
    ActivityType,
    UserLearningProfile,
    ActivityResult,
    AssessmentState,
    LearningTypeScores
} from '@/lib/types/learningTypes';

interface LearningTypeStore {
    // State
    userProfile: UserLearningProfile | null;
    assessmentState: AssessmentState;
    currentActivityData: Partial<ActivityResult>;

    // Actions
    initializeAssessment: (userId: string) => void;
    startActivity: (activityType: ActivityType) => void;
    completeActivity: (result: ActivityResult) => void;
    updateCurrentActivityData: (data: Partial<ActivityResult>) => void;
    calculateLearningType: () => LearningType;
    resetAssessment: () => void;
    setUserProfile: (profile: UserLearningProfile) => void;

    // Getters
    getProgressPercentage: () => number;
    isActivityCompleted: (activityType: ActivityType) => boolean;
    canProceedToNextActivity: () => boolean;
    getRecommendedNextActivity: () => ActivityType | null;
}

const initialAssessmentState: AssessmentState = {
    currentActivity: null,
    completedActivities: [],
    currentResults: {},
    isAssessmentActive: false,
    progress: 0,
};

export const useLearningTypeStore = create<LearningTypeStore>()(
    persist(
        (set, get) => ({
            userProfile: null,
            assessmentState: initialAssessmentState,
            currentActivityData: {},

            initializeAssessment: (userId: string) => {
                set({
                    assessmentState: {
                        ...initialAssessmentState,
                        isAssessmentActive: true,
                    },
                    userProfile: {
                        userId,
                        primaryLearningType: LearningType.UNDETERMINED,
                        learningTypeScores: {
                            visual: 0,
                            auditory: 0,
                            kinesthetic: 0,
                            readingWriting: 0,
                        },
                        confidence: 0,
                        activitiesCompleted: [],
                        totalActivities: 4,
                        lastUpdated: new Date(),
                        assessmentComplete: false,
                    },
                });
            },

            startActivity: (activityType: ActivityType) => {
                set((state) => ({
                    assessmentState: {
                        ...state.assessmentState,
                        currentActivity: activityType,
                    },
                    currentActivityData: {
                        activityType,
                        startTime: new Date(),
                    },
                }));
            },

            completeActivity: (result: ActivityResult) => {
                set((state) => {
                    const newCompletedActivities = [
                        ...state.assessmentState.completedActivities,
                        result.activityType,
                    ];

                    const newProgress = (newCompletedActivities.length / 4) * 100;

                    // Calculate updated scores based on the activity result
                    const updatedScores = calculateScoresFromResult(
                        state.userProfile?.learningTypeScores || {
                            visual: 0,
                            auditory: 0,
                            kinesthetic: 0,
                            readingWriting: 0,
                        },
                        result
                    );

                    const newLearningType = newCompletedActivities.length === 4
                        ? determinePrimaryLearningType(updatedScores)
                        : LearningType.UNDETERMINED;

                    return {
                        assessmentState: {
                            ...state.assessmentState,
                            completedActivities: newCompletedActivities,
                            currentActivity: null,
                            progress: newProgress,
                            isAssessmentActive: newProgress < 100,
                        },
                        userProfile: state.userProfile ? {
                            ...state.userProfile,
                            learningTypeScores: updatedScores,
                            primaryLearningType: newLearningType,
                            activitiesCompleted: newCompletedActivities,
                            assessmentComplete: newProgress === 100,
                            confidence: newProgress === 100 ? calculateConfidence(updatedScores) : 0,
                            lastUpdated: new Date(),
                        } : null,
                        currentActivityData: {},
                    };
                });
            },

            updateCurrentActivityData: (data: Partial<ActivityResult>) => {
                set((state) => ({
                    currentActivityData: {
                        ...state.currentActivityData,
                        ...data,
                    },
                }));
            },

            calculateLearningType: () => {
                const { userProfile } = get();
                if (!userProfile) return LearningType.UNDETERMINED;

                return determinePrimaryLearningType(userProfile.learningTypeScores);
            },

            resetAssessment: () => {
                set({
                    assessmentState: initialAssessmentState,
                    currentActivityData: {},
                    userProfile: null,
                });
            },

            setUserProfile: (profile: UserLearningProfile) => {
                set({ userProfile: profile });
            },

            getProgressPercentage: () => {
                const { assessmentState } = get();
                return assessmentState.progress;
            },

            isActivityCompleted: (activityType: ActivityType) => {
                const { assessmentState } = get();
                return assessmentState.completedActivities.includes(activityType);
            },

            canProceedToNextActivity: () => {
                const { assessmentState } = get();
                return assessmentState.currentActivity === null && assessmentState.progress < 100;
            },

            getRecommendedNextActivity: () => {
                const { assessmentState } = get();
                const allActivities = [
                    ActivityType.MEMORY_CHALLENGE,
                    ActivityType.PROBLEM_SOLVING,
                    ActivityType.AUDIO_VISUAL,
                    ActivityType.READING_WRITING,
                ];

                return allActivities.find(
                    activity => !assessmentState.completedActivities.includes(activity)
                ) || null;
            },
        }),
        {
            name: 'learning-type-storage',
            partialize: (state) => ({
                userProfile: state.userProfile,
                assessmentState: state.assessmentState,
            }),
        }
    )
);

// Helper functions
function calculateScoresFromResult(
    currentScores: LearningTypeScores,
    result: ActivityResult
): LearningTypeScores {
    const newScores = { ...currentScores };

    switch (result.activityType) {
        case ActivityType.MEMORY_CHALLENGE:
            const memoryResult = result as any; // Type assertion for brevity
            newScores.visual += (memoryResult.recallAccuracy / 100) * 25;
            break;

        case ActivityType.PROBLEM_SOLVING:
            const problemResult = result as any;
            newScores.kinesthetic += (problemResult.interactionCount / 50) * 25; // Normalized
            break;

        case ActivityType.AUDIO_VISUAL:
            const audioResult = result as any;
            newScores.auditory += (audioResult.audioFocusRatio) * 25;
            newScores.visual += (1 - audioResult.audioFocusRatio) * 15;
            break;

        case ActivityType.READING_WRITING:
            const readingResult = result as any;
            newScores.readingWriting += (readingResult.responseAccuracy / 100) * 25;
            break;
    }

    return newScores;
}

function determinePrimaryLearningType(scores: LearningTypeScores): LearningType {
    const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic, scores.readingWriting);

    if (scores.visual === maxScore) return LearningType.VISUAL;
    if (scores.auditory === maxScore) return LearningType.AUDITORY;
    if (scores.kinesthetic === maxScore) return LearningType.KINESTHETIC;
    if (scores.readingWriting === maxScore) return LearningType.READING_WRITING;

    return LearningType.UNDETERMINED;
}

function calculateConfidence(scores: LearningTypeScores): number {
    const total = scores.visual + scores.auditory + scores.kinesthetic + scores.readingWriting;
    if (total === 0) return 0;

    const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic, scores.readingWriting);
    const secondMaxScore = Math.max(
        ...Object.values(scores).filter(score => score !== maxScore)
    );

    // Confidence is higher when there's a clear winner
    return Math.min((maxScore - secondMaxScore) / total, 1);
}
