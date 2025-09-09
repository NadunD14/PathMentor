'use client';

import React from 'react';
import { ActivityType } from '@/lib/types/learningTypes';

interface ActivitySelectorProps {
    completedActivities: ActivityType[];
    recommendedNext: ActivityType | null;
    onSelectActivity: (activity: ActivityType) => void;
    isActivityCompleted: (activity: ActivityType) => boolean;
}

const activityDetails = {
    [ActivityType.MEMORY_CHALLENGE]: {
        title: 'Memory Challenge',
        icon: '🧠',
        description: 'Test your visual memory with images and patterns',
        duration: '5-7 minutes',
        difficulty: 'Easy',
        focusArea: 'Visual Learning',
        color: 'bg-purple-500'
    },
    [ActivityType.PROBLEM_SOLVING]: {
        title: 'Interactive Puzzle',
        icon: '🧩',
        description: 'Solve problems using hands-on interaction',
        duration: '8-10 minutes',
        difficulty: 'Medium',
        focusArea: 'Kinesthetic Learning',
        color: 'bg-green-500'
    },
    [ActivityType.AUDIO_VISUAL]: {
        title: 'Audio-Visual Learning',
        icon: '🎬',
        description: 'Learn from multimedia content and audio',
        duration: '6-8 minutes',
        difficulty: 'Easy',
        focusArea: 'Auditory Learning',
        color: 'bg-blue-500'
    },
    [ActivityType.READING_WRITING]: {
        title: 'Reading & Writing',
        icon: '📚',
        description: 'Engage with text-based learning materials',
        duration: '7-9 minutes',
        difficulty: 'Medium',
        focusArea: 'Reading/Writing Learning',
        color: 'bg-orange-500'
    }
};

export default function ActivitySelector({
    completedActivities,
    recommendedNext,
    onSelectActivity,
    isActivityCompleted
}: ActivitySelectorProps) {
    const allActivities = [
        ActivityType.MEMORY_CHALLENGE,
        ActivityType.PROBLEM_SOLVING,
        ActivityType.AUDIO_VISUAL,
        ActivityType.READING_WRITING
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'Hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Next Activity</h3>
                <p className="text-gray-600">
                    Each activity helps us understand how you learn best. Complete all four for the most accurate results.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allActivities.map((activity) => {
                    const details = activityDetails[activity];
                    const isCompleted = isActivityCompleted(activity);
                    const isRecommended = recommendedNext === activity;

                    return (
                        <div
                            key={activity}
                            className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${isCompleted
                                    ? 'border-green-500 bg-green-50 opacity-75'
                                    : isRecommended
                                        ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            onClick={() => !isCompleted && onSelectActivity(activity)}
                        >
                            {/* Completed Badge */}
                            {isCompleted && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    ✓
                                </div>
                            )}

                            {/* Recommended Badge */}
                            {isRecommended && !isCompleted && (
                                <div className="absolute -top-2 -left-2 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                                    Recommended
                                </div>
                            )}

                            {/* Content */}
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-3">{details.icon}</div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">
                                    {details.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    {details.description}
                                </p>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium text-gray-900">{details.duration}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Difficulty:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(details.difficulty)}`}>
                                        {details.difficulty}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Focus Area:</span>
                                    <span className="font-medium text-gray-900">{details.focusArea}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-6">
                                {isCompleted ? (
                                    <button
                                        disabled
                                        className="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-medium cursor-not-allowed"
                                    >
                                        Completed ✓
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectActivity(activity);
                                        }}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isRecommended
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                                            }`}
                                    >
                                        {isRecommended ? 'Start Recommended' : 'Start Activity'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-gray-900">Progress Summary</h4>
                        <p className="text-sm text-gray-600">
                            {completedActivities.length} of 4 activities completed
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            {Math.round((completedActivities.length / 4) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                    </div>
                </div>

                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(completedActivities.length / 4) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
