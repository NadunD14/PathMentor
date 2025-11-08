// Backend API service for communicating with PathMentor backend
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for backend API
export interface BackendUserProfile {
    goal: string;
    experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal';
}

export interface GeneratePathRequest {
    user_profile: BackendUserProfile;
    topic: string;
    duration_preference?: string;
    platform_preferences?: string[];
}

export interface BackendResource {
    id: string;
    title: string;
    description?: string;
    url: string;
    platform: string;
    duration?: string;
    difficulty?: string;
    rating?: number;
    tags?: string[];
}

export interface BackendPathStep {
    step_number: number;
    title: string;
    description: string;
    resources: BackendResource[];
    estimated_duration: string;
    prerequisites?: string[];
    learning_objectives: string[];
}

export interface BackendLearningPath {
    id?: string;
    title: string;
    description: string;
    total_duration: string;
    difficulty: string;
    steps: BackendPathStep[];
    created_at?: string;
}

export interface GeneratePathResponse {
    success: boolean;
    learning_path?: BackendLearningPath;
    message?: string;
    path_id?: string;
}

export interface SubmitFeedbackRequest {
    path_id: string;
    resource_id: string;
    interaction_type: 'completed' | 'skipped' | 'bookmarked' | 'started' | 'liked' | 'disliked';
    rating?: number;
    comment?: string;
}

export interface SubmitFeedbackResponse {
    success: boolean;
    message: string;
    feedback_id?: string;
}

export class BackendAPIService {
    private static baseURL = BACKEND_URL;

    /**
     * Generate a personalized learning path
     */
    static async generateLearningPath(request: GeneratePathRequest): Promise<GeneratePathResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/generate-path`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating learning path:', error);
            return {
                success: false,
                message: `Failed to generate learning path: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Submit user feedback for a learning resource
     */
    static async submitFeedback(request: SubmitFeedbackRequest): Promise<SubmitFeedbackResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/feedback/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            return {
                success: false,
                message: `Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get feedback for a learning path
     */
    static async getPathFeedback(pathId: string) {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/feedback/path/${pathId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching path feedback:', error);
            return [];
        }
    }

    /**
     * Get feedback for a specific resource
     */
    static async getResourceFeedback(resourceId: string) {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/feedback/resource/${resourceId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching resource feedback:', error);
            return [];
        }
    }

    /**
     * Check backend health
     */
    static async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
            });

            return response.ok;
        } catch (error) {
            console.error('Backend health check failed:', error);
            return false;
        }
    }

    /**
     * Convert Supabase learning path to backend format for path generation
     */
    static convertToBackendUserProfile(
        userAnswers: any[],
        learningStyles: any[]
    ): BackendUserProfile {
        // This is a helper function to convert Supabase data to backend format
        // You'll need to implement the logic based on your specific questionnaire structure

        // Default profile
        let profile: BackendUserProfile = {
            goal: 'General learning',
            experience_level: 'beginner',
            learning_style: 'multimodal'
        };

        // Extract goal from answers
        const goalAnswer = userAnswers.find(answer =>
            answer.question_type === 'goal' || answer.answer_text?.toLowerCase().includes('goal')
        );
        if (goalAnswer?.answer_text) {
            profile.goal = goalAnswer.answer_text;
        }

        // Extract experience level from answers
        const experienceAnswer = userAnswers.find(answer =>
            answer.question_type === 'experience' || answer.answer_text?.toLowerCase().includes('experience')
        );
        if (experienceAnswer?.answer_text) {
            const expLevel = experienceAnswer.answer_text.toLowerCase();
            if (expLevel.includes('beginner')) profile.experience_level = 'beginner';
            else if (expLevel.includes('intermediate')) profile.experience_level = 'intermediate';
            else if (expLevel.includes('advanced')) profile.experience_level = 'advanced';
            else if (expLevel.includes('expert')) profile.experience_level = 'expert';
        }

        // Extract learning style from learning_styles table
        const primaryStyle = learningStyles.find(style => style.preference_level >= 4);
        if (primaryStyle) {
            const styleName = primaryStyle.learning_style.toLowerCase();
            if (styleName.includes('visual')) profile.learning_style = 'visual';
            else if (styleName.includes('auditory')) profile.learning_style = 'auditory';
            else if (styleName.includes('kinesthetic')) profile.learning_style = 'kinesthetic';
            else if (styleName.includes('reading') || styleName.includes('writing')) profile.learning_style = 'reading_writing';
        }

        return profile;
    }

    /**
     * Convert backend learning path to Supabase format for storage
     */
    static convertBackendPathToSupabase(
        backendPath: BackendLearningPath,
        userId: string,
        categoryId?: number
    ) {
        const pathData = {
            user_id: userId,
            category_id: categoryId || null,
            title: backendPath.title,
            description: backendPath.description,
            status: 'in-progress' as const,
            ai_generated: true,
        };

        const tasksData = backendPath.steps.flatMap((step, stepIndex) =>
            step.resources.map((resource, resourceIndex) => ({
                title: resource.title,
                description: resource.description || step.description,
                task_type: 'resource',
                resource_url: resource.url,
                source_platform: resource.platform,
                estimated_duration_min: this.parseDurationToMinutes(resource.duration || step.estimated_duration),
                status: 'not-started' as const,
                task_order: stepIndex * 100 + resourceIndex, // Ensure proper ordering
            }))
        );

        return { pathData, tasksData };
    }

    /**
     * Parse duration string to minutes
     */
    private static parseDurationToMinutes(duration: string): number {
        const lowerDuration = duration.toLowerCase();

        // Extract numbers from the string
        const numbers = duration.match(/\d+/g);
        if (!numbers) return 60; // Default 1 hour

        const num = parseInt(numbers[0]);

        if (lowerDuration.includes('hour')) {
            return num * 60;
        } else if (lowerDuration.includes('minute')) {
            return num;
        } else if (lowerDuration.includes('day')) {
            return num * 8 * 60; // 8 hours per day
        } else if (lowerDuration.includes('week')) {
            return num * 5 * 8 * 60; // 5 days * 8 hours per week
        }

        return 60; // Default 1 hour
    }
}
