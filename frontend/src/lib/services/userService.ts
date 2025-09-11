import { supabase } from '../../supabase-client';
import { Database } from '../types/database';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
    /**
     * Get current user profile
     */
    static async getCurrentUser(): Promise<User | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return null;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Create or update user profile
     */
    static async upsertUser(userData: UserInsert): Promise<User | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert(userData, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) {
                console.error('Error upserting user:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in upsertUser:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    static async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating user:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in updateUser:', error);
            return null;
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching user by ID:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserById:', error);
            return null;
        }
    }
}
