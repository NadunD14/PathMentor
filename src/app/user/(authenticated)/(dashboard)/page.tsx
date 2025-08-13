'use client';

import SummaryCard from '@/components/user/Dashboard/SummaryCard';
import ActivityFeedCard from '@/components/user/Dashboard/ActivityFeedCard';
import RecommendedCard from '@/components/user/Dashboard/RecommendedCard';
import UpcomingTasksCard from '@/components/user/Dashboard/UpcomingTasksCard';
import PageHeader from '@/components/user/shared/PageHeader';

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your learning journey"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <SummaryCard />
                    <ActivityFeedCard />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        <UpcomingTasksCard />
                        <RecommendedCard />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Weekly Learning Challenge</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Complete 5 more hours of learning this week to earn the "Weekly Achiever" badge.
                                </p>
                                <div className="mt-3 flex items-center">
                                    <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600" style={{ width: '60%' }}></div>
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-blue-700">3/5 hrs</span>
                                </div>
                                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                    Start Learning
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
