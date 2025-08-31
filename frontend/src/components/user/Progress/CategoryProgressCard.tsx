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
    };

    return (
        <Card title="Learning Categories" className="h-full">
            <div className="space-y-6">
                {categories.map((category: CategoryProgress) => (
                    <div
                        key={category.category}
                        className={`cursor-pointer p-3 rounded-lg ${selectedCategory?.category === category.category
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                            }`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{category.name}</h4>
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
                <div className="text-center py-6 text-gray-500">
                    <p>No learning categories yet.</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-800">
                        Start a new learning path
                    </button>
                </div>
            )}

            {categories.length > 0 && (
                <div className="mt-4 text-center">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                        onClick={() => router.push('/user/progress/questions')}
                    >
                        Start New
                    </button>
                </div>
            )}
        </Card>
    );
}
