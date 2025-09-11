import { supabase } from '../../supabase-client';
import { Database } from '../types/database';

type Question = Database['public']['Tables']['general_questions']['Row'];
type QuestionOption = Database['public']['Tables']['question_options']['Row'];
type UserAnswer = Database['public']['Tables']['user_answers']['Row'];
type UserAnswerInsert = Database['public']['Tables']['user_answers']['Insert'];

export interface QuestionWithOptions extends Question {
    question_options: QuestionOption[];
}

export class QuestionService {
    /**
     * Get all questions with their options
     */
    static async getAllQuestions(): Promise<QuestionWithOptions[]> {
        try {
            const { data, error } = await supabase
                .from('general_questions')
                .select(`
          *,
          question_options (*)
        `)
                .order('question_id');

            if (error) {
                console.error('Error fetching questions:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllQuestions:', error);
            return [];
        }
    }

    /**
     * Get questions for a specific category
     */
    static async getQuestionsByCategory(categoryId: number): Promise<QuestionWithOptions[]> {
        try {
            const { data, error } = await supabase
                .from('category_questions')
                .select(`
          general_questions (
            *,
            question_options (*)
          )
        `)
                .eq('category_id', categoryId);

            if (error) {
                console.error('Error fetching category questions:', error);
                return [];
            }

            return (data?.map(item => item.general_questions).filter(Boolean) as unknown as QuestionWithOptions[]) || [];
        } catch (error) {
            console.error('Error in getQuestionsByCategory:', error);
            return [];
        }
    }

    /**
     * Submit user answer
     */
    static async submitAnswer(answerData: UserAnswerInsert): Promise<UserAnswer | null> {
        try {
            const { data, error } = await supabase
                .from('user_answers')
                .insert(answerData)
                .select()
                .single();

            if (error) {
                console.error('Error submitting answer:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in submitAnswer:', error);
            return null;
        }
    }

    /**
     * Submit multiple answers
     */
    static async submitAnswers(answersData: UserAnswerInsert[]): Promise<UserAnswer[]> {
        try {
            const { data, error } = await supabase
                .from('user_answers')
                .insert(answersData)
                .select();

            if (error) {
                console.error('Error submitting answers:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in submitAnswers:', error);
            return [];
        }
    }

    /**
     * Get user answers for a category
     */
    static async getUserAnswersByCategory(userId: string, categoryId: number): Promise<UserAnswer[]> {
        try {
            const { data, error } = await supabase
                .from('user_answers')
                .select('*')
                .eq('user_id', userId)
                .eq('category_id', categoryId);

            if (error) {
                console.error('Error fetching user answers:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getUserAnswersByCategory:', error);
            return [];
        }
    }

    /**
     * Get all user answers
     */
    static async getUserAnswers(userId: string): Promise<UserAnswer[]> {
        try {
            const { data, error } = await supabase
                .from('user_answers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user answers:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getUserAnswers:', error);
            return [];
        }
    }
}
