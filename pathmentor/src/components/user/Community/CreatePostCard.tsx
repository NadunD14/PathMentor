'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';

export default function CreatePostCard() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');

    const categories = [
        'Web Development',
        'Data Science',
        'Machine Learning',
        'Design',
        'Marketing',
        'General Discussion',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ title, content, category });
        // Here you would typically send the post to your backend

        // Reset the form
        setTitle('');
        setContent('');
        setCategory('');
        setIsOpen(false);
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Post
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
