import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        const assessmentId: string | undefined = body.assessmentId ?? body.assessment_id;

        if (!userId || !categoryQuestionId) {
            return NextResponse.json(
                { error: 'User ID and category question ID are required' },
                { status: 400 }
            );
        }

        // Check if answer already exists for this user and category question
        let existingQuery = sb
            .from('user_category_answers')
            .select('answer_id')
            .eq('user_id', userId)
            .eq('category_question_id', categoryQuestionId);

        if (assessmentId) {
            existingQuery = existingQuery.eq('assessment_id', assessmentId);
        }

        const { data: existingAnswer, error: checkError } = await existingQuery.single();

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
            let { data, error } = await sb
                .from('user_category_answers')
                .update({
                    answer_text: finalAnswerText,
                    option_id: finalOptionId ?? null,
                    assessment_id: assessmentId ?? null,
                })
                .eq('answer_id', existingAnswer.answer_id)
                .select()
                .single();

            if (error && (error.code === '42703' || (error.message && error.message.toLowerCase().includes('assessment_id')))) {
                console.warn('assessment_id column missing on user_category_answers; retrying update without it');
                const { data: data2, error: err2 } = await sb
                    .from('user_category_answers')
                    .update({
                        answer_text: finalAnswerText,
                        option_id: finalOptionId ?? null,
                    })
                    .eq('answer_id', existingAnswer.answer_id)
                    .select()
                    .single();
                data = data2; error = err2;
            }

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
            let { data, error } = await sb
                .from('user_category_answers')
                .insert({
                    user_id: userId,
                    category_question_id: categoryQuestionId,
                    answer_text: finalAnswerText,
                    option_id: finalOptionId ?? null,
                    assessment_id: assessmentId ?? null,
                })
                .select()
                .single();

            if (error && (error.code === '42703' || (error.message && error.message.toLowerCase().includes('assessment_id')))) {
                console.warn('assessment_id column missing on user_category_answers; retrying insert without it');
                const { data: data2, error: err2 } = await sb
                    .from('user_category_answers')
                    .insert({
                        user_id: userId,
                        category_question_id: categoryQuestionId,
                        answer_text: finalAnswerText,
                        option_id: finalOptionId ?? null,
                    })
                    .select()
                    .single();
                data = data2; error = err2;
            }

            if (error) {
                console.error('Error creating category answer:', error);
                return NextResponse.json(
                    { error: 'Failed to save category answer' },
                    { status: 500 }
                );
            }
            result = data;
        }

        const res = NextResponse.json({
            success: true,
            answer: result,
            message: existingAnswer ? 'Answer updated successfully' : 'Answer saved successfully'
        });
        res.headers.set('Cache-Control', 'no-store');
        return res;

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
        const assessmentId = searchParams.get('assessmentId');

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

        if (assessmentId) {
            query = query.eq('assessment_id', assessmentId);
        }

        let { data: categoryAnswers, error } = await query;

        if (error && (error.code === '42703' || (error.message && error.message.toLowerCase().includes('assessment_id')))) {
            console.warn('assessment_id column missing on user_category_answers; retrying fetch without it');
            const { data: data2, error: err2 } = await sb
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
            categoryAnswers = data2; error = err2;
        }

        if (error) {
            console.error('Error fetching category answers:', error);
            const res = NextResponse.json(
                { error: 'Failed to fetch category answers' },
                { status: 500 }
            );
            res.headers.set('Cache-Control', 'no-store');
            return res;
        }

        const res = NextResponse.json({
            user_id: userId,
            category_id: categoryId ? parseInt(categoryId) : null,
            answers: categoryAnswers || []
        });
        res.headers.set('Cache-Control', 'no-store');
        return res;

    } catch (error) {
        console.error('Unexpected error in GET category answers:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}