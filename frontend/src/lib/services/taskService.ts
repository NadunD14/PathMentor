import { supabase } from '../../supabase-client';
import { Database } from '../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export class TaskService {
    /**
     * Get all tasks for a path
     */
    static async getTasksByPath(pathId: number): Promise<Task[]> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('path_id', pathId)
                .order('task_order');

            if (error) {
                console.error('Error fetching tasks:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getTasksByPath:', error);
            return [];
        }
    }

    /**
     * Get task by ID
     */
    static async getTaskById(taskId: number): Promise<Task | null> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('task_id', taskId)
                .single();

            if (error) {
                console.error('Error fetching task:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getTaskById:', error);
            return null;
        }
    }

    /**
     * Create new task
     */
    static async createTask(taskData: TaskInsert): Promise<Task | null> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert(taskData)
                .select()
                .single();

            if (error) {
                console.error('Error creating task:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in createTask:', error);
            return null;
        }
    }

    /**
     * Create multiple tasks
     */
    static async createTasks(tasksData: TaskInsert[]): Promise<Task[]> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert(tasksData)
                .select();

            if (error) {
                console.error('Error creating tasks:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in createTasks:', error);
            return [];
        }
    }

    /**
     * Update task
     */
    static async updateTask(taskId: number, updates: TaskUpdate): Promise<Task | null> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('task_id', taskId)
                .select()
                .single();

            if (error) {
                console.error('Error updating task:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in updateTask:', error);
            return null;
        }
    }

    /**
     * Update task status
     */
    static async updateTaskStatus(taskId: number, status: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status })
                .eq('task_id', taskId);

            if (error) {
                console.error('Error updating task status:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateTaskStatus:', error);
            return false;
        }
    }

    /**
     * Delete task
     */
    static async deleteTask(taskId: number): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('task_id', taskId);

            if (error) {
                console.error('Error deleting task:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteTask:', error);
            return false;
        }
    }
}
