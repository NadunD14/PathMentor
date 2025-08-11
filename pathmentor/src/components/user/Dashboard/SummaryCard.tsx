'use client';

import Card from '@/components/user/shared-authenticated/Card';
import ProgressBar from '@/components/user/shared-authenticated/ProgressBar';
import { useProgressStore, CategoryProgress } from '@/lib/store/useProgressStore';

export default function SummaryCard() {
    const { categories, timeMetrics } = useProgressStore();

    // Calculate overall completion percentage
    const overallCompletion = categories.length > 0
        ? categories.reduce((sum: number, cat: CategoryProgress) => sum + cat.completionPercentage, 0) / categories.length
        : 0;

    return (
        <Card title="Your Learning Progress">
            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Overall Completion</h4>
                    <span className="text-sm font-medium text-gray-600">{Math.round(overallCompletion)}%</span>
                </div>
                <ProgressBar percent={overallCompletion} height={10} color="primary" showPercentage={false} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Weekly Hours</p>
                    <p className="text-2xl font-bold text-blue-700">{timeMetrics.weeklyHours}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                    <p className="text-2xl font-bold text-green-700">{timeMetrics.totalHours}</p>
                </div>
            </div>

            <div className="mt-6">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                    Continue Learning
                </button>
            </div>
        </Card>
    );
}
