'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { supabase } from '@/supabase-client';
import { Session } from '@supabase/supabase-js';

export default function CreatePostCard({ session }: { session: Session | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        'Web Development',
        'Data Science',
        'Machine Learning',
        'Design',
        'Marketing',
        'General Discussion',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content || !category) {
            return;
        }

        // Check if session exists and has a user property
        if (!session || !session.user) {
            console.error('No valid session or user found');
            alert('You must be logged in to create a post');
            return;
        }

        console.log('Session:', session.user.id);

        setIsSubmitting(true);

        try {
            // Create the post data object with current values
            const postData = {
                title,
                content,
                category,
                user_id: session.user.id // Add the user ID to the post data
            };

            // Insert the post to Supabase
            const { error } = await supabase
                .from('community_post')
                .insert(postData);

            if (error) {
                console.error('Error creating post:', error);
                alert('Failed to create post. Please try again.');
            } else {
                // Reset form on success
                setTitle('');
                setContent('');
                setCategory('');
                setIsOpen(false);
            }
        } catch (err) {
            console.error('Error in post submission:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            {isOpen ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="post-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your post a title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <textarea
                            id="post-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts, questions, or insights..."
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="post-category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            id="post-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            ) : (
                <div
                    className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-grow">
                        <p className="text-gray-500">Share something with the community...</p>
                    </div>
                    <button className="ml-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Create Post
                    </button>
                </div>
            )}
        </Card>
    );
}