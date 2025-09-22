'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import ProgressBar from '@/components/user/shared-authenticated/ProgressBar';
import { CategoryProgress, useProgressStore } from '@/lib/store/useProgressStore';
import { useRouter } from 'next/navigation';

export default function CategoryProgressCard() {
    const { categories } = useProgressStore();
    const [selectedCategory, setSelectedCategory] = useState<CategoryProgress | null>(null);
    const router = useRouter();

    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            return `${hours}h ${minutes % 60}m`;
        }
    };

    const handleCategoryClick = (category: CategoryProgress) => {
        setSelectedCategory(category);
        // Navigate to the path page for this category
        if (category.pathId) {
            router.push(`/user/progress/path?pathId=${category.pathId}`);
        }
    };

    return (
        <Card title="Learning Categories" className="h-full">
            <div className="space-y-6">
                {categories.map((category: CategoryProgress) => (
                    <div
                        key={category.category}
                        className={`cursor-pointer p-4 rounded-xl transition-all duration-300 glass-card ${selectedCategory?.category === category.category
                            ? 'glass-card-blue border-blue-300 shadow-lg'
                            : 'hover:shadow-lg hover:scale-[1.02]'
                            } ${category.pathId ? 'hover:border-blue-300' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">{category.name}</h4>
                                {category.pathId && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm text-gray-500">
                                {category.lessonsDone}/{category.totalLessons} lessons
                            </span>
                        </div>
                        <ProgressBar
                            percent={category.completionPercentage}
                            color={
                                category.completionPercentage < 30
                                    ? 'danger'
                                    : category.completionPercentage < 70
                                        ? 'warning'
                                        : 'success'
                            }
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Time spent: {formatTime(category.timeSpent)}</span>
                            <span>{category.completionPercentage}% complete</span>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <div className="glass-card p-6 rounded-xl">
                        <p className="text-lg mb-3">No learning categories yet.</p>
                        <button className="btn-primary px-6 py-3 rounded-xl font-medium"
                            onClick={() => router.push('/user/progress/questions')}>
                            Start your first learning path
                        </button>
                    </div>
                </div>
            )}

            {categories.length > 0 && (
                <div className="mt-4 text-center">
                    <button
                        className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-300"
                        onClick={() => router.push('/user/progress/questions')}
                    >
                        Start New Path
                    </button>
                </div>
            )}
        </Card>
    );
}
