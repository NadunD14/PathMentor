import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const { userId, questionId, answerText, optionId, assessmentId } = await request.json();

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

        // Always create new answer (no update/overwrite), include assessment_id when provided
        let insertPayload: any = { user_id: userId, question_id: questionId, answer_text: answerText, option_id: optionId };
        if (assessmentId) insertPayload.assessment_id = assessmentId;

        let { data, error } = await supabase
            .from('user_answers')
            .insert([insertPayload])
            .select()
            .single();

        // Fallback if assessment_id column doesn't exist
        if (error && (error.code === '42703' || (error.message && error.message.toLowerCase().includes('assessment_id')))) {
            console.warn('assessment_id column missing on user_answers; retrying insert without it');
            const { data: data2, error: err2 } = await supabase
                .from('user_answers')
                .insert([{ user_id: userId, question_id: questionId, answer_text: answerText, option_id: optionId }])
                .select()
                .single();
            data = data2; error = err2;
        }

        if (error) {
            console.error('Error creating answer:', error);
            const res = NextResponse.json(
                { error: 'Failed to create answer' },
                { status: 500 }
            );
            res.headers.set('Cache-Control', 'no-store');
            return res;
        }

        const res = NextResponse.json({ answer: data }, { status: 201 });
        res.headers.set('Cache-Control', 'no-store');
        return res;
    } catch (error) {
        console.error('Unexpected error:', error);
        const res = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        res.headers.set('Cache-Control', 'no-store');
        return res;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const assessmentId = searchParams.get('assessmentId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        let query = supabase
            .from('user_answers')
            .select('*')
            .eq('user_id', userId);

        if (assessmentId) {
            query = query.eq('assessment_id', assessmentId);
        }

        let { data, error } = await query.order('created_at', { ascending: false });

        // Fallback if assessment_id column doesn't exist
        if (error && (error.code === '42703' || (error.message && error.message.toLowerCase().includes('assessment_id')))) {
            console.warn('assessment_id column missing on user_answers; retrying fetch without it');
            const { data: data2, error: err2 } = await supabase
                .from('user_answers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            data = data2; error = err2;
        }

        if (error) {
            console.error('Error fetching user answers:', error);
            const res = NextResponse.json(
                { error: 'Failed to fetch user answers' },
                { status: 500 }
            );
            res.headers.set('Cache-Control', 'no-store');
            return res;
        }

        const res = NextResponse.json({ answers: data || [] });
        res.headers.set('Cache-Control', 'no-store');
        return res;
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
