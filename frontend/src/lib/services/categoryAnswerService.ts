import { supabase } from '../../supabase-client';

// Define interfaces for the new table since it might not be in the generated types yet
interface CategoryAnswer {
    answer_id: number;
    user_id: string;
    category_question_id: number;
    answer_text: string | null;
    option_id: number | null;
    created_at: string;
}

interface CategoryAnswerInsert {
    user_id: string;
    category_question_id: number;
    answer_text?: string | null;
    option_id?: number | null;
}

export class CategoryAnswerService {
    /**
     * Save or update category answer
     */
    static async saveCategoryAnswer(answerData: {
        userId: string;
        categoryQuestionId: number;
        answerText?: string;
        optionId?: number;
    }): Promise<CategoryAnswer | null> {
        try {
            const response = await fetch('/api/category-answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: answerData.userId,
                    categoryQuestionId: answerData.categoryQuestionId,
                    answerText: answerData.answerText,
                    optionId: answerData.optionId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save category answer');
            }

            const result = await response.json();
            return result.answer;
        } catch (error) {
            console.error('Error in saveCategoryAnswer:', error);
            return null;
        }
    }

    /**
     * Get category answers for a user
     */
    static async getCategoryAnswers(userId: string, categoryId?: number): Promise<any[]> {
        try {
            const params = new URLSearchParams({ userId });
            if (categoryId) {
                params.append('categoryId', categoryId.toString());
            }

            const response = await fetch(`/api/category-answers?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch category answers');
            }

            const result = await response.json();
            return result.answers || [];
        } catch (error) {
            console.error('Error in getCategoryAnswers:', error);
            return [];
        }
    }

    /**
     * Get category questions for a specific category
     */
    static async getCategoryQuestions(categoryId: number): Promise<any[]> {
        try {
            const response = await fetch(`/api/questions?type=category&categoryId=${categoryId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch category questions');
            }

            const result = await response.json();
            return result.questions || [];
        } catch (error) {
            console.error('Error in getCategoryQuestions:', error);
            return [];
        }
    }

    /**
     * Get comprehensive user data for ML processing
     */
    static async getUserComprehensiveData(userId: string): Promise<any | null> {
        try {
            const response = await fetch(`/api/questions?type=user-data&userId=${userId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch user comprehensive data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getUserComprehensiveData:', error);
            return null;
        }
    }

    /**
     * Batch save multiple category answers
     */
    static async batchSaveCategoryAnswers(answers: Array<{
        userId: string;
        categoryQuestionId: number;
        answerText?: string;
        optionId?: number;
    }>): Promise<boolean> {
        try {
            const savePromises = answers.map(answer => this.saveCategoryAnswer(answer));
            const results = await Promise.all(savePromises);

            // Check if all saves were successful
            return results.every((result: CategoryAnswer | null) => result !== null);
        } catch (error) {
            console.error('Error in batchSaveCategoryAnswers:', error);
            return false;
        }
    }
}