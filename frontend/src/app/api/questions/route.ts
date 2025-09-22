import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const questionType = searchParams.get('type');
        const userId = searchParams.get('userId');

        if (!questionType) {
            return NextResponse.json(
                { error: 'Question type is required' },
                { status: 400 }
            );
        }

        if (questionType === 'user-data' && userId) {
            // Return comprehensive user data for ML processing
            return await getUserComprehensiveData(userId);
        }

        if (questionType === 'general') {
            // Fetch all general questions with their options (no category linkage filtering)
            const { data, error } = await supabase
                .from('general_questions')
                .select(`
                    question_id,
                    question,
                    question_type,
                    context_for_ai,
                    question_options (
                        option_id,
                        option_text
                    )
                `)
                .order('question_id', { ascending: true });

            if (error) {
                console.error('Error fetching general questions:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch general questions' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ questions: data || [] });
        }

        if (questionType === 'category' && userId) {
            const categoryId = searchParams.get('categoryId');
            if (!categoryId) {
                return NextResponse.json(
                    { error: 'Category ID is required for category questions' },
                    { status: 400 }
                );
            }
            return await getCategoryQuestions(parseInt(categoryId));
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

async function getUserComprehensiveData(userId: string) {
    try {
        // Get user's selected category
        const { data: categorySelection, error: categoryError } = await supabase
            .from('user_category_selections')
            .select(`
                category_id,
                categories (
                    category_id,
                    name,
                    description
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (categoryError || !categorySelection) {
            return NextResponse.json(
                { error: 'User category selection not found' },
                { status: 404 }
            );
        }

        const categoryId = categorySelection.category_id;
        const categoryInfo = categorySelection.categories;

        // Get user learning styles
        const { data: learningStyles, error: stylesError } = await supabase
            .from('user_learning_styles')
            .select('*')
            .eq('user_id', userId);

        if (stylesError) {
            console.error('Error fetching learning styles:', stylesError);
        }

        // Get user answers (general questions) with question text
        const { data: userAnswers, error: answersError } = await supabase
            .from('user_answers')
            .select(`
                *,
                general_questions (
                    question_id,
                    question,
                    question_type
                ),
                question_options (
                    option_id,
                    option_text
                )
            `)
            .eq('user_id', userId);

        if (answersError) {
            console.error('Error fetching user answers:', answersError);
        }

        // Get user category answers with question text
        const { data: categoryAnswers, error: categoryAnswersError } = await supabase
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

        if (categoryAnswersError) {
            console.error('Error fetching category answers:', categoryAnswersError);
        }

        return NextResponse.json({
            user_id: userId,
            category_id: categoryId,
            category_name: (categoryInfo as any)?.name || '',
            category_info: categoryInfo,
            learning_styles: learningStyles || [],
            user_answers: userAnswers || [],
            user_category_answers: categoryAnswers || []
        });

    } catch (error) {
        console.error('Error in getUserComprehensiveData:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user comprehensive data' },
            { status: 500 }
        );
    }
}

async function getCategoryQuestions(categoryId: number) {
    try {
        const { data: categoryQuestions, error } = await supabase
            .from('category_questions')
            .select(`
                category_question_id,
                category_id,
                question_id,
                question_type,
                context_for_ai,
                category_options (
                    option_id,
                    option_text
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

        return NextResponse.json({
            category_id: categoryId,
            questions: categoryQuestions || []
        });

    } catch (error) {
        console.error('Error in getCategoryQuestions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category questions' },
            { status: 500 }
        );
    }
}
