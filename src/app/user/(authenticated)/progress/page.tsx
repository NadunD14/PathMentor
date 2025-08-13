'use client';

import CategoryProgressCard from '@/components/user/Progress/CategoryProgressCard';
import TimeMetricsCard from '@/components/user/Progress/TimeMetricsCard';
import TasksCard from '@/components/user/Progress/TasksCard';
import AchievementsCard from '@/components/user/Progress/AchievementsCard';
import PageHeader from '@/components/user/shared/PageHeader';

export default function ProgressPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader title="My Progress" subtitle="Track your learning across categories and tasks" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
