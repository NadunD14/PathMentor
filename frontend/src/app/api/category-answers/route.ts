import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

        // Create a per-request Supabase client with the caller's session to satisfy RLS
        const sb = createClient<Database>(supabaseUrl, supabaseAnonKey, {
            global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        });
        // Accept both camelCase and snake_case keys for flexibility
        const userId: string | undefined = body.userId ?? body.user_id;
        const categoryQuestionId: number | undefined = body.categoryQuestionId ?? body.category_question_id;
        const answerText: string | undefined = body.answerText ?? body.answer_text;
        const optionId: number | undefined = body.optionId ?? body.option_id;

        if (!userId || !categoryQuestionId) {
            return NextResponse.json(
                { error: 'User ID and category question ID are required' },
                { status: 400 }
            );
        }

        // Check if answer already exists for this user and category question
        const { data: existingAnswer, error: checkError } = await sb
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

        // Determine safe payload considering potential FK constraints
        let finalAnswerText = answerText;
        let finalOptionId = optionId as number | null | undefined;

        // If an optionId was provided, check if it's a category option. If so, store as text to avoid FK mismatch.
        if (finalOptionId && !finalAnswerText) {
            const { data: catOpt, error: catOptErr } = await sb
                .from('category_options')
                .select('option_text')
                .eq('option_id', finalOptionId)
                .single();

            if (!catOptErr && catOpt) {
                // Likely a category option; persist the text and clear option_id to satisfy older FKs
                finalAnswerText = catOpt.option_text as string;
                finalOptionId = null;
            }
        }

        let result;
        if (existingAnswer) {
            // Update existing answer
            const { data, error } = await sb
                .from('user_category_answers')
                .update({
                    answer_text: finalAnswerText,
                    option_id: finalOptionId ?? null,
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
            const { data, error } = await sb
                .from('user_category_answers')
                .insert({
                    user_id: userId,
                    category_question_id: categoryQuestionId,
                    answer_text: finalAnswerText,
                    option_id: finalOptionId ?? null,
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

    } catch (error: any) {
        console.error('Unexpected error in category answers:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error?.message || String(error) },
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

        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        const sb = createClient<Database>(supabaseUrl, supabaseAnonKey, {
            global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        });

        let query = sb
            .from('user_category_answers')
            .select(`
                *,
                category_questions (
                    category_question_id,
                    category_id,
                    question_id,
                    question_type,
                    context_for_ai
                ),
                category_options (
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