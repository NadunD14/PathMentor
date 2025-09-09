import {
    ActivityResult,
    UserLearningProfile,
    LearningType,
    ActivityType,
    UserBehaviorData
} from '@/lib/types/learningTypes';

class LearningTypeService {
    private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Save activity result to backend
    async saveActivityResult(result: ActivityResult): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/learning/activity-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(result),
            });

            if (!response.ok) {
                throw new Error('Failed to save activity result');
            }
        } catch (error) {
            console.error('Error saving activity result:', error);
            throw error;
        }
    }

    // Get user learning profile from backend
    async getUserLearningProfile(userId: string): Promise<UserLearningProfile | null> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/learning/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch learning profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching learning profile:', error);
            return null;
        }
    }

    // Update user learning profile
    async updateUserLearningProfile(profile: UserLearningProfile): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/learning/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error('Failed to update learning profile');
            }
        } catch (error) {
            console.error('Error updating learning profile:', error);
            throw error;
        }
    }

    // Get ML model prediction for learning type
    async predictLearningType(behaviorData: UserBehaviorData): Promise<{
        predictedType: LearningType;
        confidence: number;
        scores: { [key in LearningType]: number };
    }> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/ml/predict-learning-type`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(behaviorData),
            });

            if (!response.ok) {
                throw new Error('Failed to get ML prediction');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting ML prediction:', error);
            throw error;
        }
    }

    // Send training data to ML model
    async sendTrainingData(data: UserBehaviorData[]): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/ml/training-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify({ trainingData: data }),
            });

            if (!response.ok) {
                throw new Error('Failed to send training data');
            }
        } catch (error) {
            console.error('Error sending training data:', error);
            throw error;
        }
    }

    // Get personalized content recommendations based on learning type
    async getPersonalizedRecommendations(
        userId: string,
        learningType: LearningType,
        currentPath?: string
    ): Promise<{
        recommendations: Array<{
            id: string;
            title: string;
            type: 'video' | 'article' | 'interactive' | 'audio';
            difficulty: number;
            estimatedTime: number;
            learningTypeMatch: number;
        }>;
    }> {
        try {
            const params = new URLSearchParams({
                userId,
                learningType,
                ...(currentPath && { currentPath }),
            });

            const response = await fetch(
                `${this.API_BASE_URL}/api/v1/learning/recommendations?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.getAuthToken()}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return { recommendations: [] };
        }
    }

    // Track user engagement and behavior
    async trackUserBehavior(data: {
        userId: string;
        sessionId: string;
        activityType: ActivityType;
        behaviorData: Record<string, any>;
        timestamp: Date;
    }): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/learning/track-behavior`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to track behavior');
            }
        } catch (error) {
            console.error('Error tracking behavior:', error);
            // Don't throw here as tracking is non-critical
        }
    }

    // Get learning type description and characteristics
    getLearningTypeDescription(type: LearningType): {
        title: string;
        description: string;
        characteristics: string[];
        recommendedStrategies: string[];
        icon: string;
    } {
        const descriptions = {
            [LearningType.VISUAL]: {
                title: 'Visual Learner',
                description: 'You learn best through seeing and observing. Visual aids, diagrams, and imagery help you understand and remember information.',
                characteristics: [
                    'Prefers charts, diagrams, and visual aids',
                    'Thinks in pictures and mental images',
                    'Notices visual details and patterns',
                    'Benefits from color-coding and highlighting',
                    'Remembers faces better than names'
                ],
                recommendedStrategies: [
                    'Use mind maps and flowcharts',
                    'Watch educational videos and tutorials',
                    'Create visual study notes with diagrams',
                    'Use color-coding for organization',
                    'Practice with interactive visual tools'
                ],
                icon: '👁️'
            },
            [LearningType.AUDITORY]: {
                title: 'Auditory Learner',
                description: 'You learn best through listening and speaking. Discussions, lectures, and audio content are most effective for you.',
                characteristics: [
                    'Prefers lectures and discussions',
                    'Learns through listening and talking',
                    'Remembers spoken instructions well',
                    'Benefits from reading aloud',
                    'Enjoys music and sound patterns'
                ],
                recommendedStrategies: [
                    'Listen to podcasts and audio books',
                    'Participate in study groups and discussions',
                    'Read material aloud',
                    'Use mnemonic devices and rhymes',
                    'Record and replay lessons'
                ],
                icon: '👂'
            },
            [LearningType.KINESTHETIC]: {
                title: 'Kinesthetic Learner',
                description: 'You learn best through hands-on activities and physical engagement. Movement and touch help you understand concepts.',
                characteristics: [
                    'Prefers hands-on activities',
                    'Learns through movement and touch',
                    'Needs frequent breaks and activity',
                    'Benefits from practical application',
                    'Remembers through muscle memory'
                ],
                recommendedStrategies: [
                    'Use interactive simulations and tools',
                    'Take frequent study breaks with movement',
                    'Practice with real-world applications',
                    'Use manipulatives and models',
                    'Engage in project-based learning'
                ],
                icon: '🤲'
            },
            [LearningType.READING_WRITING]: {
                title: 'Reading/Writing Learner',
                description: 'You learn best through reading and writing activities. Text-based information and note-taking are your preferred methods.',
                characteristics: [
                    'Prefers reading and writing',
                    'Learns through text-based information',
                    'Enjoys taking detailed notes',
                    'Benefits from lists and written instructions',
                    'Likes to research and read extensively'
                ],
                recommendedStrategies: [
                    'Take comprehensive written notes',
                    'Read extensively on topics',
                    'Write summaries and outlines',
                    'Use written practice exercises',
                    'Create glossaries and word lists'
                ],
                icon: '📝'
            },
            [LearningType.UNDETERMINED]: {
                title: 'Assessment Needed',
                description: 'Complete the learning style assessment to discover your optimal learning approach.',
                characteristics: ['Assessment not completed'],
                recommendedStrategies: ['Complete the learning type assessment'],
                icon: '❓'
            }
        };

        return descriptions[type];
    }

    private getAuthToken(): string {
        // In a real app, get this from your auth context/store
        return localStorage.getItem('authToken') || '';
    }
}

export const learningTypeService = new LearningTypeService();
