import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const { userId, categoryQuestionId, answerText, optionId } = await request.json();

        if (!userId || !categoryQuestionId) {
            return NextResponse.json(
                { error: 'User ID and category question ID are required' },
                { status: 400 }
            );
        }

        // Check if answer already exists for this user and category question
        const { data: existingAnswer, error: checkError } = await supabase
            .from('user_category_answers')
            .select('answer_id')
            .eq('user_id', userId)
            .eq('category_question_id', categoryQuestionId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error checking existing answer:', checkError);
            return NextResponse.json(
                { error: 'Failed to check existing answer' },
                { status: 500 }
            );
        }

        let result;
        if (existingAnswer) {
            // Update existing answer
            const { data, error } = await supabase
                .from('user_category_answers')
                .update({
                    answer_text: answerText,
                    option_id: optionId,
                })
                .eq('answer_id', existingAnswer.answer_id)
                .select()
                .single();

            if (error) {
                console.error('Error updating category answer:', error);
                return NextResponse.json(
                    { error: 'Failed to update category answer' },
                    { status: 500 }
                );
            }
            result = data;
        } else {
            // Create new answer
            const { data, error } = await supabase
                .from('user_category_answers')
                .insert({
                    user_id: userId,
                    category_question_id: categoryQuestionId,
                    answer_text: answerText,
                    option_id: optionId,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating category answer:', error);
                return NextResponse.json(
                    { error: 'Failed to save category answer' },
                    { status: 500 }
                );
            }
            result = data;
        }

        return NextResponse.json({
            success: true,
            answer: result,
            message: existingAnswer ? 'Answer updated successfully' : 'Answer saved successfully'
        });

    } catch (error) {
        console.error('Unexpected error in category answers:', error);
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
        const categoryId = searchParams.get('categoryId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        let query = supabase
            .from('user_category_answers')
            .select(`
                *,
                category_questions (
                    category_question_id,
                    category_id,
                    question_id,
                    general_questions (
                        question_id,
                        question,
                        question_type
                    )
                ),
                question_options (
                    option_id,
                    option_text
                )
            `)
            .eq('user_id', userId);

        // Filter by category if provided
        if (categoryId) {
            query = query.eq('category_questions.category_id', parseInt(categoryId));
        }

        const { data: categoryAnswers, error } = await query;

        if (error) {
            console.error('Error fetching category answers:', error);
            return NextResponse.json(
                { error: 'Failed to fetch category answers' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            user_id: userId,
            category_id: categoryId ? parseInt(categoryId) : null,
            answers: categoryAnswers || []
        });

    } catch (error) {
        console.error('Unexpected error in GET category answers:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}