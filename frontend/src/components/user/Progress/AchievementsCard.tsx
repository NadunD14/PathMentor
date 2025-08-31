'use client';

import Card from '@/components/user/shared-authenticated/Card';
import { useProgressStore } from '@/lib/store/useProgressStore';

export default function AchievementsCard() {
    const { achievements } = useProgressStore();

    const earnedAchievements = achievements.filter((achievement: any) => achievement.earned);
    const pendingAchievements = achievements.filter((achievement: any) => !achievement.earned);

    return (
        <Card title="Achievements" className="h-full">
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Earned ({earnedAchievements.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {earnedAchievements.map((achievement: any) => (
                            <div
                                key={achievement.id}
                                className="border border-green-200 bg-green-50 rounded-lg p-3 flex items-center gap-3"
                            >
                                <div className="text-2xl" role="img" aria-label={achievement.title}>
                                    {achievement.icon}
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-800">{achievement.title}</h5>
                                    <p className="text-xs text-gray-500">{achievement.description}</p>
                                    {achievement.earnedDate && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Next Achievements ({pendingAchievements.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {pendingAchievements.map((achievement: any) => (
                            <div
                                key={achievement.id}
                                className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                            >
                                <div className="text-2xl opacity-50" role="img" aria-label={achievement.title}>
                                    {achievement.icon}
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-700">{achievement.title}</h5>
                                    <p className="text-xs text-gray-500">{achievement.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
