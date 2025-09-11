import { supabase } from '../../supabase-client';
import { Database } from '../types/database';

type Path = Database['public']['Tables']['paths']['Row'];
type PathInsert = Database['public']['Tables']['paths']['Insert'];
type PathUpdate = Database['public']['Tables']['paths']['Update'];
type Task = Database['public']['Tables']['tasks']['Row'];

export interface PathWithTasks extends Path {
    tasks: Task[];
    category?: Database['public']['Tables']['categories']['Row'];
}

export class PathService {
    /**
     * Get all paths for a user
     */
    static async getUserPaths(userId: string): Promise<PathWithTasks[]> {
        try {
            const { data, error } = await supabase
                .from('paths')
                .select(`
          *,
          tasks (*),
          categories (*)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user paths:', error);
                return [];
            }

            return data?.map(path => ({
                ...path,
                category: path.categories,
                tasks: path.tasks || []
            })) || [];
        } catch (error) {
            console.error('Error in getUserPaths:', error);
            return [];
        }
    }

    /**
     * Get path by ID with tasks
     */
    static async getPathById(pathId: number): Promise<PathWithTasks | null> {
        try {
            const { data, error } = await supabase
                .from('paths')
                .select(`
          *,
          tasks (*),
          categories (*)
        `)
                .eq('path_id', pathId)
                .single();

            if (error) {
                console.error('Error fetching path:', error);
                return null;
            }

            return {
                ...data,
                category: data.categories,
                tasks: data.tasks || []
            };
        } catch (error) {
            console.error('Error in getPathById:', error);
            return null;
        }
    }

    /**
     * Create a new learning path
     */
    static async createPath(pathData: PathInsert): Promise<Path | null> {
        try {
            const { data, error } = await supabase
                .from('paths')
                .insert(pathData)
                .select()
                .single();

            if (error) {
                console.error('Error creating path:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in createPath:', error);
            return null;
        }
    }

    /**
     * Update path
     */
    static async updatePath(pathId: number, updates: PathUpdate): Promise<Path | null> {
        try {
            const { data, error } = await supabase
                .from('paths')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('path_id', pathId)
                .select()
                .single();

            if (error) {
                console.error('Error updating path:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in updatePath:', error);
            return null;
        }
    }

    /**
     * Delete path
     */
    static async deletePath(pathId: number): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('paths')
                .delete()
                .eq('path_id', pathId);

            if (error) {
                console.error('Error deleting path:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deletePath:', error);
            return false;
        }
    }
}
