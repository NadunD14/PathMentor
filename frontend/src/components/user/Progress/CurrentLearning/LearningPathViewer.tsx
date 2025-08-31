'use client';

import { useState } from 'react';
import { LearningPath } from '@/lib/store/useQuestionnaireStore';

interface LearningPathViewerProps {
    path: LearningPath;
}

export default function LearningPathViewer({ path }: LearningPathViewerProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'visualization'>('overview');

    return (
        <div className="bg-white rounded-xl shadow">
            <div className="border-b">
                <nav className="flex">
                    <button
                        className={`py-4 px-6 text-sm font-medium ${activeTab === 'overview'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`py-4 px-6 text-sm font-medium ${activeTab === 'visualization'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('visualization')}
                    >
                        Path Visualization
                    </button>
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'overview' ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">About This Learning Path</h3>
                            <p className="text-gray-600">{path.description}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">What You'll Learn</h3>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600">
                                {path.resources.map((resource) => (
                                    <li key={resource.id}>{resource.title}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">How to Use This Path</h3>
                            <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                                <li>Follow the resources in the recommended order for best results.</li>
                                <li>Complete each resource and mark it as done.</li>
                                <li>Upload proof of completion when available (screenshots, project links, etc.).</li>
                                <li>Track your progress and revisit resources as needed.</li>
                            </ol>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2 text-blue-800">Need Help?</h3>
                            <p className="text-blue-700">
                                If you're having trouble with any part of this learning path, visit the Community section to connect with others or use LearnMe for AI-powered assistance.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-32 w-32 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-full w-full text-blue-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Interactive Path Visualization</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                A visual representation of your learning path will be displayed here, showing dependencies and progression through the different resources.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
