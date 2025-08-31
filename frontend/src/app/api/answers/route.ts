import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const { userId, questionId, answerText, optionId } = await request.json();

        if (!userId || !questionId) {
            return NextResponse.json(
                { error: 'User ID and Question ID are required' },
                { status: 400 }
            );
        }

        if (!answerText && !optionId) {
            return NextResponse.json(
                { error: 'Either answer text or option ID must be provided' },
                { status: 400 }
            );
        }

        // Check if answer already exists for this user and question
        const { data: existingAnswer } = await supabase
            .from('user_answers')
            .select('answer_id')
            .eq('user_id', userId)
            .eq('question_id', questionId)
            .single();

        let result;
        if (existingAnswer) {
            // Update existing answer
            const { data, error } = await supabase
                .from('user_answers')
                .update({ answer_text: answerText, option_id: optionId })
                .eq('user_id', userId)
                .eq('question_id', questionId)
                .select()
                .single();

            if (error) {
                console.error('Error updating answer:', error);
                return NextResponse.json(
                    { error: 'Failed to update answer' },
                    { status: 500 }
                );
            }
            result = data;
        } else {
            // Create new answer
            const { data, error } = await supabase
                .from('user_answers')
                .insert([{ user_id: userId, question_id: questionId, answer_text: answerText, option_id: optionId }])
                .select()
                .single();

            if (error) {
                console.error('Error creating answer:', error);
                return NextResponse.json(
                    { error: 'Failed to create answer' },
                    { status: 500 }
                );
            }
            result = data;
        }

        return NextResponse.json({ answer: result }, { status: 201 });
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
            .from('user_answers')
            .select(`
        answer_id,
        question_id,
        answer_text,
        option_id,
        created_at,
        general_questions (
          question,
          question_type
        ),
        question_options (
          option_text
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user answers:', error);
            return NextResponse.json(
                { error: 'Failed to fetch user answers' },
                { status: 500 }
            );
        }

        return NextResponse.json({ answers: data || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
