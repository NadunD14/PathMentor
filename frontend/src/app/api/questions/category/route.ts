import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        if (!categoryId) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('category_questions')
            .select(`
        category_question_id,
        question_type,
        general_questions (
          question_id,
          question,
          question_type,
          question_options (
            option_id,
            option_text
          )
        )
      `)
            .eq('category_id', categoryId)
            .order('category_question_id', { ascending: true });

        if (error) {
            console.error('Error fetching category questions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch category questions' },
                { status: 500 }
            );
        }

        return NextResponse.json({ questions: data || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
