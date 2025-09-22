import { supabase } from '@/supabase-client';
import { LearningType } from '@/lib/types/learningTypes';

interface LearningStyleData {
    user_id: string;
    learning_style: LearningType;
    preference_level?: number;
}

class LearningStyleService {
    /**
     * Save user's learning style to the backend table
     * Deletes existing entry for the user and inserts new one
     */
    async saveLearningStyle(userId: string, learningStyle: LearningType, preferenceLevel?: number): Promise<void> {
        try {
            // First, delete any existing learning style for this user
            const { error: deleteError } = await supabase
                .from('user_learning_styles')
                .delete()
                .eq('user_id', userId);

            if (deleteError) {
                console.error('Error deleting existing learning style:', deleteError);
                throw new Error('Failed to update learning style');
            }

            // Insert the new learning style
            const newLearningStyle: LearningStyleData = {
                user_id: userId,
                learning_style: learningStyle,
                ...(preferenceLevel && { preference_level: preferenceLevel })
            };

            const { error: insertError } = await supabase
                .from('user_learning_styles')
                .insert([newLearningStyle]);

            if (insertError) {
                console.error('Error inserting learning style:', insertError);
                throw new Error('Failed to save learning style');
            }

            console.log('Learning style saved successfully for user:', userId);
        } catch (error) {
            console.error('Error in saveLearningStyle:', error);
            throw error;
        }
    }

    /**
     * Get user's learning style from the backend
     */
    async getLearningStyle(userId: string): Promise<LearningStyleData | null> {
        try {
            const { data, error } = await supabase
                .from('user_learning_styles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No data found - this is normal for new users
                    return null;
                }
                console.error('Error fetching learning style:', error);
                throw new Error('Failed to fetch learning style');
            }

            return data;
        } catch (error) {
            console.error('Error in getLearningStyle:', error);
            throw error;
        }
    }
}

export const learningStyleService = new LearningStyleService();
