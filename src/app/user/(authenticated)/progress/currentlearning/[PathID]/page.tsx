'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import { useQuestionnaireStore, LearningPathResource } from '@/lib/store/useQuestionnaireStore';
import LearningPathViewer from '@/components/user/Progress/CurrentLearning/LearningPathViewer';
import ResourceCard from '@/components/user/Progress/CurrentLearning/ResourceCard';

export default function CurrentLearningPage({ params }: { params: { PathID: string } }) {
    const router = useRouter();
    const { generatedPath } = useQuestionnaireStore();
    const [selectedResource, setSelectedResource] = useState<LearningPathResource | null>(null);

    useEffect(() => {
        // If no path is generated, redirect to the questions page
        if (!generatedPath) {
            router.push('/user/progress/questions');
        }
    }, [generatedPath, router]);

    // Ensure the URL parameter matches the generated path ID
    useEffect(() => {
        if (generatedPath && generatedPath.id !== params.PathID) {
            router.push(`/user/progress/currentlearning/${generatedPath.id}`);
        }
    }, [generatedPath, params.PathID, router]);

    const handleResourceSelect = (resource: LearningPathResource) => {
        setSelectedResource(resource);
    };

    if (!generatedPath) {
        return <div className="p-8 text-center">Loading your learning path...</div>;
    }

    // Calculate completion percentage
    const completedResources = generatedPath.resources.filter(r => r.completed).length;
    const completionPercentage = (completedResources / generatedPath.resources.length) * 100;

    // Format time function
    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            return `${hours}h ${minutes % 60}m`;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title={generatedPath.title}
                subtitle={generatedPath.description}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Learning Path</h3>
                            <span className="text-sm text-gray-500">
                                {completionPercentage.toFixed(0)}% Complete
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between text-sm text-gray-500 mb-6">
                            <span>Total time: {formatTime(generatedPath.totalEstimatedTime)}</span>
                            <span>{completedResources}/{generatedPath.resources.length} resources</span>
                        </div>

                        <div className="space-y-4">
                            {generatedPath.resources.map((resource, index) => (
                                <div
                                    key={resource.id}
                                    onClick={() => handleResourceSelect(resource)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedResource?.id === resource.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        } ${resource.completed ? 'bg-green-50' : ''}`}
                                >
                                    <div className="flex items-start">
                                        <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${resource.completed ? 'line-through text-gray-500' : ''}`}>
                                                {resource.title}
                                            </h4>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <span className="capitalize">{resource.type}</span>
                                                <span className="mx-2">•</span>
                                                <span>{formatTime(resource.estimatedTime)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedResource ? (
                        <ResourceCard resource={selectedResource} />
                    ) : (
                        <LearningPathViewer path={generatedPath} />
                    )}
                </div>
            </div>
        </div>
    );
}
