'use client';

import React from 'react';
import { UserLearningProfile } from '@/lib/types/learningTypes';
import { learningTypeService } from '@/lib/services/learningTypeService';

interface LearningTypeResultProps {
    userProfile: UserLearningProfile;
    onRetakeAssessment: () => void;
}

export default function LearningTypeResult({ userProfile, onRetakeAssessment }: LearningTypeResultProps) {
    const typeInfo = learningTypeService.getLearningTypeDescription(userProfile.primaryLearningType);

    const getScorePercentage = (score: number) => {
        const total = Object.values(userProfile.learningTypeScores).reduce((sum, s) => sum + s, 0);
        return total > 0 ? Math.round((score / total) * 100) : 0;
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceText = (confidence: number) => {
        if (confidence >= 0.8) return 'High Confidence';
        if (confidence >= 0.6) return 'Moderate Confidence';
        return 'Low Confidence';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Result Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
                <div className="text-center">
                    <div className="text-6xl mb-4">{typeInfo.icon}</div>
                    <h2 className="text-3xl font-bold mb-2">{typeInfo.title}</h2>
                    <p className="text-xl opacity-90 mb-4">{typeInfo.description}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20`}>
                        <span className="mr-2">Confidence:</span>
                        <span className={getConfidenceColor(userProfile.confidence)}>
                            {getConfidenceText(userProfile.confidence)} ({Math.round(userProfile.confidence * 100)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Detailed Scores */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Type Breakdown</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(userProfile.learningTypeScores).map(([type, score]) => {
                        const percentage = getScorePercentage(score);
                        const isHighest = score === Math.max(...Object.values(userProfile.learningTypeScores));

                        return (
                            <div key={type} className={`p-4 rounded-lg border-2 ${isHighest ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold capitalize text-gray-900">
                                        {type.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${isHighest ? 'bg-blue-500' : 'bg-gray-400'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Characteristics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Characteristics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Traits</h4>
                        <ul className="space-y-2">
                            {typeInfo.characteristics.map((trait, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">{trait}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Recommended Strategies</h4>
                        <ul className="space-y-2">
                            {typeInfo.recommendedStrategies.map((strategy, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 mr-2">💡</span>
                                    <span className="text-gray-700">{strategy}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Assessment Details */}
            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {userProfile.activitiesCompleted.length}
                        </div>
                        <div className="text-sm text-gray-600">Activities Completed</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round(userProfile.confidence * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Confidence Level</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600">
                            {userProfile.totalActivities}
                        </div>
                        <div className="text-sm text-gray-600">Total Activities</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-orange-600">
                            {new Date(userProfile.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">Last Updated</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onRetakeAssessment}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Retake Assessment
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Continue Learning
                </button>
            </div>
        </div>
    );
}
