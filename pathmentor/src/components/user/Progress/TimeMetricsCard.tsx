'use client';

import Card from '@/components/user/shared-authenticated/Card';
import { useProgressStore } from '@/lib/store/useProgressStore';

export default function TimeMetricsCard() {
    const { timeMetrics } = useProgressStore();

    // Calculate hours per day based on weekly hours
    const hoursPerDay = (timeMetrics.weeklyHours / 7).toFixed(1);

    // Calculate total days spent learning
    const totalDays = Math.round((timeMetrics.totalHours / timeMetrics.weeklyHours) * 7);

    return (
        <Card title="Time Analytics" className="h-full">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Weekly Hours</p>
                    <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-blue-700">{timeMetrics.weeklyHours}</span>
                        <span className="text-sm text-gray-500 ml-1">hours</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">~{hoursPerDay} hours/day</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                    <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-green-700">{timeMetrics.totalHours}</span>
                        <span className="text-sm text-gray-500 ml-1">hours</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Over {totalDays} days</p>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3">Time Distribution</h4>
                <div className="bg-gray-100 h-8 rounded-lg overflow-hidden flex">
                    <div
                        className="bg-blue-500 h-full"
                        style={{ width: '45%' }}
                        title="Web Development: 45%"
                    ></div>
                    <div
                        className="bg-green-500 h-full"
                        style={{ width: '30%' }}
                        title="Data Science: 30%"
                    ></div>
                    <div
                        className="bg-purple-500 h-full"
                        style={{ width: '25%' }}
                        title="Machine Learning: 25%"
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span>Web Dev (45%)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span>Data Science (30%)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                        <span>ML (25%)</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
