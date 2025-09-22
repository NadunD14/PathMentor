'use client';

import { useEffect, useState } from 'react';
import CategoryProgressCard from '@/components/user/Progress/CategoryProgressCard';
import TimeMetricsCard from '@/components/user/Progress/TimeMetricsCard';
import TasksCard from '@/components/user/Progress/TasksCard';
import AchievementsCard from '@/components/user/Progress/AchievementsCard';
import PageHeader from '@/components/user/shared/PageHeader';
import { useProgressStore } from '@/lib/store/useProgressStore';
import { ProgressService } from '@/lib/services/progressService';

export default function ProgressPage() {
    const setProgressData = useProgressStore((s) => s.setProgressData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await ProgressService.getProgressData();
                if (mounted) setProgressData(data);
            } catch (e) {
                console.error('Failed to load progress data', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [setProgressData]);

    return (
        <div className="container-custom py-6 sm:py-8">
            {/* <PageHeader title="My Progress" subtitle="Track your learning across categories and tasks" /> */}

            {loading ? (
                <div className="py-10 text-center text-gray-500">Loading your progress…</div>
            ) : (
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
            )}
        </div>
    );
}
