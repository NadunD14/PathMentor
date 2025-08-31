import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user's answers from Supabase
        const { data: userAnswers, error: answersError } = await supabase
            .from('user_answers')
            .select(`
                answer_id,
                question_id,
                answer_text,
                option_id,
                category_id,
                created_at,
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
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (answersError) {
            console.error('Error fetching user answers:', answersError);
            return NextResponse.json(
                { error: 'Failed to fetch user answers' },
                { status: 500 }
            );
        }

        // Fetch user's selected categories
        const { data: userCategories, error: categoriesError } = await supabase
            .from('user_category_selections')
            .select(`
                selection_id,
                category_id,
                created_at,
                categories (
                    category_id,
                    name,
                    description,
                    image_url
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (categoriesError) {
            console.error('Error fetching user categories:', categoriesError);
            return NextResponse.json(
                { error: 'Failed to fetch user categories' },
                { status: 500 }
            );
        }

        // Prepare data for backend ML service
        const mlData = {
            user_id: userId,
            answers: userAnswers || [],
            selected_categories: userCategories || [],
            timestamp: new Date().toISOString()
        };

        // Call backend ML service
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const mlResponse = await fetch(`${backendUrl}/api/v1/ml/complete-setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mlData),
        });

        if (!mlResponse.ok) {
            const errorText = await mlResponse.text();
            console.error('Backend ML service error:', errorText);
            return NextResponse.json(
                { error: 'Failed to process ML analysis' },
                { status: 500 }
            );
        }

        const mlResult = await mlResponse.json();

        return NextResponse.json({
            success: true,
            analysis: mlResult,
            message: 'Setup completed and ML analysis performed successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in ML complete setup:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
