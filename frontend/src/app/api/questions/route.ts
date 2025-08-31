import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const questionType = searchParams.get('type');

        if (!questionType) {
            return NextResponse.json(
                { error: 'Question type is required' },
                { status: 400 }
            );
        }

        if (questionType === 'general') {
            // First, get all question IDs that are linked to categories
            const { data: categoryQuestionIds, error: categoryError } = await supabase
                .from('category_questions')
                .select('question_id');

            if (categoryError) {
                console.error('Error fetching category question IDs:', categoryError);
                return NextResponse.json(
                    { error: 'Failed to fetch category question IDs' },
                    { status: 500 }
                );
            }

            const excludeIds = (categoryQuestionIds || []).map(item => item.question_id);

            // Then, fetch general questions that are NOT in the category questions
            let query = supabase
                .from('general_questions')
                .select(`
            question_id,
            question,
            question_type,
            question_options (
              option_id,
              option_text
            )
          `)
                .order('question_id', { ascending: true });

            // Only apply the filter if there are category questions to exclude
            if (excludeIds.length > 0) {
                query = query.not('question_id', 'in', `(${excludeIds.join(',')})`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching general questions:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch general questions' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ questions: data || [] });
        }

        // For other question types, you can add additional logic here
        return NextResponse.json(
            { error: 'Invalid question type' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
