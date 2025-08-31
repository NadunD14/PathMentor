import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const { userId, categoryId } = await request.json();

        if (!userId || !categoryId) {
            return NextResponse.json(
                { error: 'User ID and Category ID are required' },
                { status: 400 }
            );
        }

        // Check if selection already exists for this user
        const { data: existingSelection } = await supabase
            .from('user_category_selections')
            .select('selection_id')
            .eq('user_id', userId)
            .single();

        let result;
        if (existingSelection) {
            // Update existing selection
            const { data, error } = await supabase
                .from('user_category_selections')
                .update({ category_id: categoryId })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating category selection:', error);
                return NextResponse.json(
                    { error: 'Failed to update category selection' },
                    { status: 500 }
                );
            }
            result = data;
        } else {
            // Create new selection
            const { data, error } = await supabase
                .from('user_category_selections')
                .insert([{ user_id: userId, category_id: categoryId }])
                .select()
                .single();

            if (error) {
                console.error('Error creating category selection:', error);
                return NextResponse.json(
                    { error: 'Failed to create category selection' },
                    { status: 500 }
                );
            }
            result = data;
        }

        return NextResponse.json({ selection: result }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('user_category_selections')
            .select(`
        selection_id,
        category_id,
        created_at,
        categories (
          name,
          description,
          image_url
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user category selection:', error);
            return NextResponse.json(
                { error: 'Failed to fetch user category selection' },
                { status: 500 }
            );
        }

        return NextResponse.json({ selection: data || null });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
