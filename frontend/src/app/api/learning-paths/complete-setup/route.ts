import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const { userId, assessmentId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Look up the user's most recent selected category from Supabase
        const { data: selection, error: selectionError } = await supabase
            .from('user_category_selections')
            .select('category_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (selectionError) {
            console.error('Error fetching user category selection:', selectionError);
            return NextResponse.json(
                { error: 'Failed to fetch user category selection' },
                { status: 500 }
            );
        }

        if (!selection?.category_id) {
            return NextResponse.json(
                { error: 'No category selected for this user' },
                { status: 400 }
            );
        }

        const mlData = {
            user_id: userId,
            category_id: selection.category_id,
            assessment_id: assessmentId ?? null,
        };

        console.log('ML Data (derived):', mlData);

        // Call backend endpoint (moved under learning-paths)
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const mlResponse = await fetch(`${backendUrl}/api/v1/learning-paths/complete-setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mlData),
        });

        if (!mlResponse.ok) {
            const errorText = await mlResponse.text();
            console.error('Backend complete-setup service error:', errorText);
            return NextResponse.json(
                { error: 'Failed to process ML analysis' },
                { status: 500 }
            );
        }

        const mlResult = await mlResponse.json();

        const res = NextResponse.json({
            success: true,
            analysis: mlResult,
            message: 'Setup completed and ML analysis performed successfully'
        }, { status: 200 });
        res.headers.set('Cache-Control', 'no-store');
        return res;

    } catch (error) {
        console.error('Unexpected error in complete setup:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
