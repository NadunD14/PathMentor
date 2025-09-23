import { supabase } from '../../supabase-client';

// Updated interfaces to match the new backend structure
export interface Question {
    question_id: number;
    question: string;
    question_type: string;
    context_for_ai?: string;
    question_options?: QuestionOption[];
}

export interface CategoryQuestion {
    category_question_id: number;
    category_id: number;
    question_id?: number;
    question_type: string;
    context_for_ai?: string;
    category_options?: CategoryOption[];
}

export interface QuestionOption {
    option_id: number;
    option_text: string;
}

export interface CategoryOption {
    option_id: number;
    option_text: string;
}

export interface UserAnswer {
    answer_id?: number;
    user_id: string;
    question_id: number;
    category_id?: number;
    answer_text?: string;
    option_id?: number;
    assessment_id?: string;
}

export interface UserCategoryAnswer {
    answer_id?: number;
    user_id: string;
    category_question_id: number;
    answer_text?: string;
    option_id?: number;
    assessment_id?: string;
}

export class QuestionService {
    private static readonly API_BASE_URL = '/api/v1';

    /**
     * Get all general questions with their options
     */
    static async getAllQuestions(): Promise<Question[]> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/questions/general`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error fetching general questions:', result);
                return [];
            }

            return result.questions || [];
        } catch (error) {
            console.error('Error in getAllQuestions:', error);
            return [];
        }
    }

    /**
     * Get questions for a specific category
     */
    static async getQuestionsByCategory(categoryId: number): Promise<CategoryQuestion[]> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/questions/category/${categoryId}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error fetching category questions:', result);
                return [];
            }

            return result.questions || [];
        } catch (error) {
            console.error('Error in getQuestionsByCategory:', error);
            return [];
        }
    }

    /**
     * Submit user answer to general question
     */
    static async submitAnswer(answerData: Omit<UserAnswer, 'answer_id'>): Promise<UserAnswer | null> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/answers/general`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answerData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error submitting answer:', result);
                return null;
            }

            return result.answer;
        } catch (error) {
            console.error('Error in submitAnswer:', error);
            return null;
        }
    }

    /**
     * Submit user answer to category question
     */
    static async submitCategoryAnswer(answerData: Omit<UserCategoryAnswer, 'answer_id'>): Promise<UserCategoryAnswer | null> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/answers/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answerData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error submitting category answer:', result);
                return null;
            }

            return result.answer;
        } catch (error) {
            console.error('Error in submitCategoryAnswer:', error);
            return null;
        }
    }

    /**
     * Submit multiple general answers
     */
    static async submitAnswers(answersData: Omit<UserAnswer, 'answer_id'>[]): Promise<UserAnswer[]> {
        try {
            const results = await Promise.all(
                answersData.map(answer => this.submitAnswer(answer))
            );

            return results.filter(Boolean) as UserAnswer[];
        } catch (error) {
            console.error('Error in submitAnswers:', error);
            return [];
        }
    }

    /**
     * Submit multiple category answers
     */
    static async submitCategoryAnswers(answersData: Omit<UserCategoryAnswer, 'answer_id'>[]): Promise<UserCategoryAnswer[]> {
        try {
            const results = await Promise.all(
                answersData.map(answer => this.submitCategoryAnswer(answer))
            );

            return results.filter(Boolean) as UserCategoryAnswer[];
        } catch (error) {
            console.error('Error in submitCategoryAnswers:', error);
            return [];
        }
    }

    /**
     * Get user general answers
     */
    static async getUserAnswers(userId: string): Promise<UserAnswer[]> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/${userId}/answers/general`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error fetching user answers:', result);
                return [];
            }

            return result.answers || [];
        } catch (error) {
            console.error('Error in getUserAnswers:', error);
            return [];
        }
    }

    /**
     * Get user category answers
     */
    static async getUserCategoryAnswers(userId: string, categoryId?: number): Promise<UserCategoryAnswer[]> {
        try {
            const url = categoryId
                ? `${this.API_BASE_URL}/users/${userId}/answers/category?category_id=${categoryId}`
                : `${this.API_BASE_URL}/users/${userId}/answers/category`;

            const response = await fetch(url);
            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error fetching user category answers:', result);
                return [];
            }

            return result.answers || [];
        } catch (error) {
            console.error('Error in getUserCategoryAnswers:', error);
            return [];
        }
    }

    /**
     * Save user category selection
     */
    static async saveCategorySelection(userId: string, categoryId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/category-selection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, category_id: categoryId }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error saving category selection:', result);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in saveCategorySelection:', error);
            return false;
        }
    }

    /**
     * Get user complete profile
     */
    static async getUserCompleteProfile(userId: string, categoryId: number): Promise<any> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/${userId}/profile/${categoryId}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error('Error fetching user profile:', result);
                return null;
            }

            return result.profile;
        } catch (error) {
            console.error('Error in getUserCompleteProfile:', error);
            return null;
        }
    }
}
