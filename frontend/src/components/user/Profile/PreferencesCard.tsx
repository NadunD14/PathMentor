'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { useUserStore } from '@/lib/store/useUserStore';

interface PreferenceItem {
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    formatter: (value: number) => string;
}

export default function PreferencesCard() {
    const { preferences, updatePreferences } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempPreferences, setTempPreferences] = useState(preferences);

    const preferenceItems: PreferenceItem[] = [
        {
            label: 'Study Time',
            description: 'How long each study session should last',
            value: tempPreferences.studyTime,
            min: 5,
            max: 120,
            step: 5,
            formatter: (value) => `${value} minutes`,
        },
        {
            label: 'Break Frequency',
            description: 'Take a break every X minutes',
            value: tempPreferences.breakFrequency,
            min: 5,
            max: 60,
            step: 5,
            formatter: (value) => `${value} minutes`,
        },
    ];

    const handleSliderChange = (key: string, value: number) => {
        setTempPreferences((prev: typeof preferences) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleLearningModeChange = (mode: string) => {
        setTempPreferences((prev: typeof preferences) => ({
            ...prev,
            learningMode: mode as 'visual' | 'audio' | 'reading',
        }));
    };

    const handleSubmit = () => {
        updatePreferences(tempPreferences);
        setIsEditing(false);
    };

    return (
        <Card title="Learning Preferences">
            <div className="space-y-6">
                {isEditing ? (
                    <>
                        <div className="space-y-4">
                            {preferenceItems.map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor={item.label.replace(' ', '-').toLowerCase()} className="block text-sm font-medium text-gray-700">
                                            {item.label}
                                        </label>
                                        <span className="text-sm text-gray-500">{item.formatter(item.value)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                    <input
                                        type="range"
                                        id={item.label.replace(' ', '-').toLowerCase()}
                                        min={item.min}
                                        max={item.max}
                                        step={item.step}
                                        value={item.value}
                                        onChange={(e) => handleSliderChange(item.label === 'Study Time' ? 'studyTime' : 'breakFrequency', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            ))}

                            <div className="space-y-2 pt-2">
                                <label className="block text-sm font-medium text-gray-700">Preferred Learning Mode</label>
                                <p className="text-xs text-gray-500">How do you prefer to consume learning content?</p>
                                <div className="flex space-x-2">
                                    {['visual', 'audio', 'reading'].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => handleLearningModeChange(mode)}
                                            className={`flex-1 py-2 text-sm rounded-md ${tempPreferences.learningMode === mode
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setTempPreferences(preferences);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div>
                                    <h4 className="font-medium text-gray-800">Study Session Duration</h4>
                                    <p className="text-sm text-gray-500">How long each study session should last</p>
                                </div>
                                <span className="font-medium">{preferences.studyTime} min</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div>
                                    <h4 className="font-medium text-gray-800">Break Frequency</h4>
                                    <p className="text-sm text-gray-500">Take a break every X minutes</p>
                                </div>
                                <span className="font-medium">{preferences.breakFrequency} min</span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <h4 className="font-medium text-gray-800">Preferred Learning Mode</h4>
                                    <p className="text-sm text-gray-500">How you prefer to consume content</p>
                                </div>
                                <span className="font-medium capitalize">{preferences.learningMode}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Edit Preferences
                        </button>
                    </>
                )}
            </div>
        </Card>
    );
}
