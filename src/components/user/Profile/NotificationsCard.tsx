'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

export default function NotificationsCard() {
    const [settings, setSettings] = useState<NotificationSetting[]>([
        {
            id: 'learning-reminders',
            title: 'Learning Reminders',
            description: 'Receive reminders for scheduled learning sessions',
            enabled: true,
        },
        {
            id: 'progress-updates',
            title: 'Progress Updates',
            description: 'Get weekly summaries of your learning progress',
            enabled: true,
        },
        {
            id: 'achievement-notifications',
            title: 'Achievements',
            description: 'Be notified when you earn new badges or complete milestones',
            enabled: true,
        },
        {
            id: 'ai-recommendations',
            title: 'AI Recommendations',
            description: 'Receive personalized learning recommendations',
            enabled: false,
        },
        {
            id: 'community-activity',
            title: 'Community Activity',
            description: 'Get notified about discussions and replies',
            enabled: false,
        },
    ]);

    const toggleSetting = (id: string) => {
        setSettings((prevSettings) =>
            prevSettings.map((setting) =>
                setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
            )
        );
    };

    return (
        <Card title="Notification Preferences">
            <div className="space-y-4">
                {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between py-2">
                        <div>
                            <h4 className="font-medium text-gray-800">{setting.title}</h4>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                        <label htmlFor={`toggle-${setting.id}`} className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id={`toggle-${setting.id}`}
                                className="sr-only"
                                checked={setting.enabled}
                                onChange={() => toggleSetting(setting.id)}
                            />
                            <div className={`w-11 h-6 rounded-full transition ${setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}>
                                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition transform ${setting.enabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}></div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button className="w-full py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Save Preferences
                </button>
            </div>
        </Card>
    );
}
