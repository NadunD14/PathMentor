'use client';

import React from 'react';
import { ActivityType } from '@/lib/types/learningTypes';

interface AssessmentProgressProps {
    progress: number;
    currentActivity: ActivityType | null;
    completedActivities: ActivityType[];
}

const activityInfo = {
    [ActivityType.MEMORY_CHALLENGE]: {
        title: 'Memory Challenge',
        icon: '🧠',
        description: 'Visual memory test'
    },
    [ActivityType.PROBLEM_SOLVING]: {
        title: 'Problem Solving',
        icon: '🧩',
        description: 'Interactive puzzle'
    },
    [ActivityType.AUDIO_VISUAL]: {
        title: 'Audio-Visual',
        icon: '🎬',
        description: 'Multimedia learning'
    },
    [ActivityType.READING_WRITING]: {
        title: 'Reading & Writing',
        icon: '📚',
        description: 'Text-based challenge'
    }
};

export default function AssessmentProgress({
    progress,
    currentActivity,
    completedActivities
}: AssessmentProgressProps) {
    const allActivities = [
        ActivityType.MEMORY_CHALLENGE,
        ActivityType.PROBLEM_SOLVING,
        ActivityType.AUDIO_VISUAL,
        ActivityType.READING_WRITING
    ];

    const getActivityStatus = (activity: ActivityType) => {
        if (completedActivities.includes(activity)) return 'completed';
        if (currentActivity === activity) return 'current';
        return 'pending';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 text-white';
            case 'current': return 'bg-blue-500 text-white animate-pulse';
            case 'pending': return 'bg-gray-200 text-gray-600';
            default: return 'bg-gray-200 text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return '✓';
            case 'current': return '⏳';
            case 'pending': return '○';
            default: return '○';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">Assessment Progress</h3>
                    <span className="text-sm font-medium text-gray-600">
                        {Math.round(progress)}% Complete
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Activity Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {allActivities.map((activity, index) => {
                    const status = getActivityStatus(activity);
                    const info = activityInfo[activity];

                    return (
                        <div key={activity} className="relative">
                            {/* Connector Line */}
                            {index < allActivities.length - 1 && (
                                <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gray-200 transform translate-x-2">
                                    <div
                                        className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ${completedActivities.includes(activity) ? 'w-full' : 'w-0'
                                            }`}
                                    ></div>
                                </div>
                            )}

                            {/* Activity Card */}
                            <div className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${status === 'completed'
                                    ? 'border-green-500 bg-green-50'
                                    : status === 'current'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50'
                                }`}>
                                {/* Status Badge */}
                                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getStatusColor(status)}`}>
                                    {getStatusIcon(status)}
                                </div>

                                {/* Content */}
                                <div className="text-center">
                                    <div className="text-2xl mb-2">{info.icon}</div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                        {info.title}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        {info.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Current Activity Indicator */}
            {currentActivity && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">{activityInfo[currentActivity].icon}</div>
                        <div>
                            <h4 className="font-semibold text-blue-900">
                                Currently: {activityInfo[currentActivity].title}
                            </h4>
                            <p className="text-sm text-blue-700">
                                {activityInfo[currentActivity].description}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
