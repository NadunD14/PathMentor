import { supabase } from '../../supabase-client';
import { Database } from '../types/database';

type Category = Database['public']['Tables']['categories']['Row'];

export class CategoryService {
    /**
     * Get all categories
     */
    static async getAllCategories(): Promise<Category[]> {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching categories:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            return [];
        }
    }

    /**
     * Get category by ID
     */
    static async getCategoryById(categoryId: number): Promise<Category | null> {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('category_id', categoryId)
                .single();

            if (error) {
                console.error('Error fetching category:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getCategoryById:', error);
            return null;
        }
    }

    /**
     * Create a new category
     */
    static async createCategory(category: Database['public']['Tables']['categories']['Insert']): Promise<Category | null> {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert(category)
                .select()
                .single();

            if (error) {
                console.error('Error creating category:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in createCategory:', error);
            return null;
        }
    }
}
