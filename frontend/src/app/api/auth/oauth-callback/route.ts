import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user } = body;

        if (!user || !user.id) {
            return NextResponse.json(
                { error: 'Invalid user data' },
                { status: 400 }
            );
        }

        // Check if user already exists in our users table
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking existing user:', checkError);
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            );
        }

        // If user doesn't exist, create them
        if (!existingUser) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert({
                    user_id: user.id,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
                    email: user.email,
                    role: 'user'
                })
                .select()
                .single();

            if (userError) {
                console.error('Error creating OAuth user profile:', userError);
                return NextResponse.json(
                    { error: 'Failed to create user profile' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'User profile created successfully',
                user: userData
            });
        }

        return NextResponse.json({
            success: true,
            message: 'User already exists',
            user: existingUser
        });

    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
