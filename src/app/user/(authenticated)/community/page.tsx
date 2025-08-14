'use client';

import { useState, useEffect } from 'react';
import CommunityFeed from '@/components/user/Community/CommunityFeed';
import StudyGroupsCard from '@/components/user/Community/StudyGroupsCard';
import CreatePostCard from '@/components/user/Community/CreatePostCard';
import PageHeader from '@/components/user/shared/PageHeader';
import { getSession } from '@/lib/auth'; // Import getSession directly from auth.ts
import { Session } from '@supabase/supabase-js';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState('feed');
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch session when component mounts
    useEffect(() => {
        async function fetchSession() {
            try {
                const sessionData = await getSession();
                setSession(sessionData);
            } catch (error) {
                console.error('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchSession();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader title="Community" subtitle="Connect with other learners and share progress" />

            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feed'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Discussion Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'groups'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Study Groups
                    </button>
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                    {activeTab === 'feed' && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="p-4 text-center">Loading...</div>
                            ) : (
                                <CreatePostCard session={session} />
                            )}
                            <CommunityFeed />
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <StudyGroupsCard />
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-3">Community Guidelines</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Be respectful and supportive of other learners</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Share knowledge and resources that help others</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Give constructive feedback, not criticism</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>No promotion of unrelated products or services</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-3">Active Members</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                        <img src="/file.svg" alt="User" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-800">Jane Cooper</p>
                                        <p className="text-xs text-gray-500">Web Development</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="font-bold text-blue-600">A</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-800">Alex Johnson</p>
                                        <p className="text-xs text-gray-500">Data Science</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                        <img src="/file.svg" alt="User" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-800">Michael Brown</p>
                                        <p className="text-xs text-gray-500">Machine Learning</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="font-bold text-blue-600">S</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-800">Sarah Wilson</p>
                                        <p className="text-xs text-gray-500">Design</p>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800">
                                View All Members
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
