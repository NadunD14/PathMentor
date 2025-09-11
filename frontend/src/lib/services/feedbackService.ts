import { supabase } from '../../supabase-client';
import { Database } from '../types/database';

type UserTaskFeedback = Database['public']['Tables']['user_task_feedback']['Row'];
type UserTaskFeedbackInsert = Database['public']['Tables']['user_task_feedback']['Insert'];

export class FeedbackService {
    /**
     * Submit task feedback
     */
    static async submitTaskFeedback(feedbackData: UserTaskFeedbackInsert): Promise<UserTaskFeedback | null> {
        try {
            const { data, error } = await supabase
                .from('user_task_feedback')
                .insert(feedbackData)
                .select()
                .single();

            if (error) {
                console.error('Error submitting feedback:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in submitTaskFeedback:', error);
            return null;
        }
    }

    /**
     * Get feedback for a task
     */
    static async getTaskFeedback(taskId: number): Promise<UserTaskFeedback[]> {
        try {
            const { data, error } = await supabase
                .from('user_task_feedback')
                .select('*')
                .eq('task_id', taskId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching task feedback:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getTaskFeedback:', error);
            return [];
        }
    }

    /**
     * Get user's feedback for a specific task
     */
    static async getUserTaskFeedback(userId: string, taskId: number): Promise<UserTaskFeedback | null> {
        try {
            const { data, error } = await supabase
                .from('user_task_feedback')
                .select('*')
                .eq('user_id', userId)
                .eq('task_id', taskId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.error('Error fetching user task feedback:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserTaskFeedback:', error);
            return null;
        }
    }

    /**
     * Get all feedback by user
     */
    static async getUserFeedback(userId: string): Promise<UserTaskFeedback[]> {
        try {
            const { data, error } = await supabase
                .from('user_task_feedback')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user feedback:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getUserFeedback:', error);
            return [];
        }
    }
}
