'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { useUserStore } from '@/lib/store/useUserStore';

export default function UserProfileCard() {
    // Get user data from store
    const {
        name,
        learningType,
        subscriptionStatus,
        preferences,
        setName,
        setLearningType,
        updatePreferences
    } = useUserStore();

    // State for editing mode
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editLearningType, setEditLearningType] = useState(learningType);
    const [editPreferences, setEditPreferences] = useState({ ...preferences });

    const handleSave = () => {
        setName(editName);
        setLearningType(editLearningType as any);
        updatePreferences(editPreferences);
        setIsEditing(false);
    };

    const getSubscriptionBadge = () => {
        switch (subscriptionStatus) {
            case 'premium':
                return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Premium</span>;
            case 'basic':
                return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Basic</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Free</span>;
        }
    };

    return (
        <Card className="h-full">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`text-sm px-3 py-1 rounded-md ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {name.substring(0, 1)}
                </div>
                <div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 mb-1 w-full"
                        />
                    ) : (
                        <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
                    )}
                    <div className="flex items-center gap-2">
                        {getSubscriptionBadge()}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Learning Type</p>
                    {isEditing ? (
                        <select
                            value={editLearningType}
                            onChange={(e) => setEditLearningType(e.target.value as any)}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        >
                            <option value="visual">Visual</option>
                            <option value="audio">Audio</option>
                            <option value="reading">Reading</option>
                        </select>
                    ) : (
                        <p className="capitalize bg-gray-100 inline-block px-3 py-1 rounded-full text-gray-700">
                            {learningType}
                        </p>
                    )}
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Study Time (minutes)</p>
                    {isEditing ? (
                        <input
                            type="number"
                            min={5}
                            max={120}
                            value={editPreferences.studyTime}
                            onChange={(e) => setEditPreferences({ ...editPreferences, studyTime: parseInt(e.target.value) })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                    ) : (
                        <p className="bg-gray-100 inline-block px-3 py-1 rounded-full text-gray-700">
                            {preferences.studyTime} minutes
                        </p>
                    )}
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Break Frequency (minutes)</p>
                    {isEditing ? (
                        <input
                            type="number"
                            min={1}
                            max={30}
                            value={editPreferences.breakFrequency}
                            onChange={(e) => setEditPreferences({ ...editPreferences, breakFrequency: parseInt(e.target.value) })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                    ) : (
                        <p className="bg-gray-100 inline-block px-3 py-1 rounded-full text-gray-700">
                            Every {preferences.breakFrequency} minutes
                        </p>
                    )}
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Learning Mode</p>
                    {isEditing ? (
                        <select
                            value={editPreferences.learningMode}
                            onChange={(e) => setEditPreferences({ ...editPreferences, learningMode: e.target.value as any })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        >
                            <option value="visual">Visual</option>
                            <option value="audio">Audio</option>
                            <option value="reading">Reading</option>
                        </select>
                    ) : (
                        <p className="capitalize bg-gray-100 inline-block px-3 py-1 rounded-full text-gray-700">
                            {preferences.learningMode}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}
