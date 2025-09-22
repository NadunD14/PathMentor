'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { supabase } from '@/supabase-client';

interface Post {
    id: string;
    author: {
        name: string;
        avatar?: string;
    };
    title: string;
    content: string;
    category: string;
    likes: number;
    comments: number;
    createdAt: string;
    isLiked: boolean;
}

const fetchPosts = async (): Promise<Post[]> => {
    // Fetch posts from the database
    const { data, error } = await supabase
        .from('community_post')
        .select(`
            user_id, 
            title, 
            content, 
            category,
            created_at
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    // Transform database data to match our Post interface
    return (data || []).map(post => ({
        id: post.user_id,
        author: {
            name: 'Anon',  // Placeholder name
            avatar: undefined, // Default no avatar
        },
        title: post.title || 'Untitled Post',
        content: post.content || '',
        category: post.category || 'General',
        likes: 0,
        comments: 0,
        createdAt: post.created_at || new Date().toISOString(),
        isLiked: false, // Default not liked
    }));
};

// Mock data for community posts
const mockPosts: Post[] = [
    {
        id: '1',
        author: {
            name: 'Jane Cooper',
            avatar: '/file.svg',
        },
        title: 'How I mastered React in 3 months',
        content: 'I wanted to share my learning journey with React. I started with the basics of components and props, then moved on to hooks and state management...',
        category: 'Web Development',
        likes: 24,
        comments: 8,
        createdAt: '2025-08-05T12:30:00',
        isLiked: false,
    },
    {
        id: '2',
        author: {
            name: 'Alex Johnson',
        },
        title: 'Looking for study partners for Data Science path',
        content: 'Hi everyone! I\'m working through the Data Science learning path and would love to connect with others who are on the same journey. We could discuss challenges, share resources, and maybe even work on some projects together.',
        category: 'Data Science',
        likes: 12,
        comments: 15,
        createdAt: '2025-08-08T09:15:00',
        isLiked: true,
    },
    {
        id: '3',
        author: {
            name: 'Michael Brown',
            avatar: '/file.svg',
        },
        title: 'Resources for Machine Learning beginners',
        content: 'I\'ve compiled a list of resources that really helped me when I was starting with Machine Learning. They include free courses, books, and practical projects to get hands-on experience.',
        category: 'Machine Learning',
        likes: 36,
        comments: 7,
        createdAt: '2025-08-09T16:45:00',
        isLiked: false,
    },
];

export default function CommunityFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch posts when component mounts
    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const fetchedPosts = await fetchPosts();

                // If we got posts from the database, use them
                // Otherwise fall back to mock data
                setPosts(fetchedPosts.length > 0 ? fetchedPosts : mockPosts);
                setError(null);
            } catch (err) {
                console.error('Error loading posts:', err);
                setError('Failed to load posts. Please try again later.');
                // Fallback to mock posts if API fails
                setPosts(mockPosts);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    // Format relative time (e.g., "2 days ago")
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    };

    const toggleLike = (postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    }
                    : post
            )
        );
    };

    // Filter posts by selected category
    const filteredPosts = selectedCategory
        ? posts.filter((post) => post.category === selectedCategory)
        : posts;

    // Get unique categories
    const categories = Array.from(new Set(posts.map((post) => post.category)));

    return (
        <Card>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Community Posts</h2>
                    {loading && <span className="text-sm text-gray-500">Loading posts...</span>}
                </div>
                <div className="flex overflow-x-auto pb-2 space-x-2">
                    <button
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${selectedCategory === null
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Posts
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${selectedCategory === category
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p>{error}</p>
                </div>
            )}

            {loading && posts.length === 0 ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((placeholder) => (
                        <div key={`placeholder-${placeholder}`} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                <div className="ml-3">
                                    <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
                            <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                        {post.author.avatar ? (
                                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-blue-600">
                                                {post.author.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-800">{post.author.name}</p>
                                        <p className="text-xs text-gray-500">{getRelativeTime(post.createdAt)}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                                <p className="text-gray-700 mb-4">{post.content}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            className={`flex items-center space-x-1 ${post.isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                                                }`}
                                            onClick={() => toggleLike(post.id)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill={post.isLiked ? 'currentColor' : 'none'}
                                                stroke="currentColor"
                                                strokeWidth={post.isLiked ? '0' : '1.5'}
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>{post.likes}</span>
                                        </button>

                                        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                />
                                            </svg>
                                            <span>{post.comments}</span>
                                        </button>
                                    </div>

                                    <button className="text-sm text-blue-600 hover:text-blue-800">
                                        View Discussion
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
