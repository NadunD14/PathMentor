'use client';

import CategoryProgressCard from '@/components/user/Progress/CategoryProgressCard';
import TimeMetricsCard from '@/components/user/Progress/TimeMetricsCard';
import TasksCard from '@/components/user/Progress/TasksCard';
import AchievementsCard from '@/components/user/Progress/AchievementsCard';

export default function ProgressPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Progress</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="space-y-6">
                        <CategoryProgressCard />
                        <TasksCard />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        <TimeMetricsCard />
                        <AchievementsCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
