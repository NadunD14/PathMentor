// Learning Type Definitions
export enum LearningType {
    VISUAL = 'visual',
    AUDITORY = 'auditory',
    KINESTHETIC = 'kinesthetic',
    READING_WRITING = 'reading_writing',
    UNDETERMINED = 'undetermined'
}

export enum ActivityType {
    MEMORY_CHALLENGE = 'memory_challenge',
    PROBLEM_SOLVING = 'problem_solving',
    AUDIO_VISUAL = 'audio_visual',
    READING_WRITING = 'reading_writing'
}

// Activity Result Interfaces
export interface BaseActivityResult {
    activityId: string;
    activityType: ActivityType;
    userId: string;
    startTime: Date;
    endTime: Date;
    completionTime: number; // in milliseconds
    timestamp: Date;
}

export interface MemoryChallengeResult extends BaseActivityResult {
    activityType: ActivityType.MEMORY_CHALLENGE;
    recallAccuracy: number; // percentage
    responseTime: number; // average response time in ms
    engagementLevel: number; // 1-10 scale
    correctAnswers: number;
    totalQuestions: number;
    visualElementsRecalled: number;
}

export interface ProblemSolvingResult extends BaseActivityResult {
    activityType: ActivityType.PROBLEM_SOLVING;
    interactionCount: number;
    stepsToComplete: number;
    efficiency: number; // calculated metric
    dragDropActions: number;
    clickActions: number;
    taskCompleted: boolean;
}

export interface AudioVisualResult extends BaseActivityResult {
    activityType: ActivityType.AUDIO_VISUAL;
    audioPreference: number; // 1-10 scale
    answerAccuracy: number; // percentage
    timeListening: number; // ms
    timeViewing: number; // ms
    videoMuted: boolean;
    audioFocusRatio: number; // timeListening / totalTime
}

export interface ReadingWritingResult extends BaseActivityResult {
    activityType: ActivityType.READING_WRITING;
    readingSpeed: number; // words per minute
    textInteractions: number; // highlights, notes
    responseAccuracy: number; // percentage
    summaryQuality: number; // 1-10 scale
    wordsWritten: number;
    timeSpentReading: number; // ms
}

export type ActivityResult =
    | MemoryChallengeResult
    | ProblemSolvingResult
    | AudioVisualResult
    | ReadingWritingResult;

// Learning Type Scores
export interface LearningTypeScores {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
}

// User Learning Profile
export interface UserLearningProfile {
    userId: string;
    primaryLearningType: LearningType;
    learningTypeScores: LearningTypeScores;
    confidence: number; // 0-1, how confident we are in the classification
    activitiesCompleted: ActivityType[];
    totalActivities: number;
    lastUpdated: Date;
    assessmentComplete: boolean;
}

// Activity Configuration
export interface ActivityConfig {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    estimatedDuration: number; // in minutes
    difficulty: number; // 1-5
    requiredForAssessment: boolean;
}

// Tracking Data for ML Model
export interface UserBehaviorData {
    userId: string;
    sessionId: string;
    activityResults: ActivityResult[];
    aggregatedScores: LearningTypeScores;
    behaviorPatterns: {
        preferredInteractionType: string;
        averageEngagementTime: number;
        taskCompletionRate: number;
        accuracyTrend: number[];
    };
}

// Assessment State
export interface AssessmentState {
    currentActivity: ActivityType | null;
    completedActivities: ActivityType[];
    currentResults: Partial<ActivityResult>;
    isAssessmentActive: boolean;
    progress: number; // 0-100
}
