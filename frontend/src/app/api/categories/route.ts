import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase-client';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('category_id, name, description, image_url, created_at')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json(
                { error: 'Failed to fetch categories' },
                { status: 500 }
            );
        }

        return NextResponse.json({ categories: data || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description, image_url } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('categories')
            .insert([{ name, description, image_url }])
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            return NextResponse.json(
                { error: 'Failed to create category' },
                { status: 500 }
            );
        }

        return NextResponse.json({ category: data }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
