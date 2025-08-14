'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestionnaireStore, LearningPath } from '@/lib/store/useQuestionnaireStore';

export default function LoadingPage() {
    const router = useRouter();
    const {
        selectedCategory,
        generalAnswers,
        programmingAnswers,
        graphicDesignAnswers,
        videoEditingAnswers,
        setGeneratedPath
    } = useQuestionnaireStore();

    useEffect(() => {
        if (!selectedCategory) {
            router.push('/user/progress/questions');
            return;
        }

        // Simulate API call to generate a learning path
        const generateLearningPath = async () => {
            // In a real implementation, you would make an API call to your backend
            // to generate a personalized learning path based on user answers

            // For now, we'll create mock data based on the selected category
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

            const currentDate = new Date().toISOString();
            let pathId = '';
            let mockPath: LearningPath;

            switch (selectedCategory) {
                case 'programming':
                    pathId = 'programming-' + Date.now();
                    mockPath = {
                        id: pathId,
                        category: selectedCategory,
                        title: `${programmingAnswers.languagePreference?.toUpperCase() || 'General'} ${programmingAnswers.programmingGoal?.charAt(0).toUpperCase() + (programmingAnswers.programmingGoal?.slice(1) || '')} Learning Path`,
                        description: `A personalized learning path for ${programmingAnswers.difficultyLevel || 'beginner'} ${programmingAnswers.languagePreference || 'general'} developers focused on ${programmingAnswers.programmingGoal || 'coding'}.`,
                        resources: [
                            {
                                id: '1',
                                title: 'Getting Started with the Basics',
                                type: 'video',
                                url: 'https://example.com/course1',
                                description: 'Learn the fundamentals of programming and syntax.',
                                estimatedTime: 120,
                                completed: false,
                            },
                            {
                                id: '2',
                                title: 'Core Concepts and Best Practices',
                                type: 'article',
                                url: 'https://example.com/article2',
                                description: 'Understanding key programming concepts and patterns.',
                                estimatedTime: 60,
                                completed: false,
                            },
                            {
                                id: '3',
                                title: 'Building Your First Project',
                                type: 'project',
                                url: 'https://example.com/project1',
                                description: 'Apply what you have learned in a practical project.',
                                estimatedTime: 180,
                                completed: false,
                            },
                            {
                                id: '4',
                                title: 'Advanced Topics and Techniques',
                                type: 'course',
                                url: 'https://example.com/course3',
                                description: 'Dive deeper into more complex programming concepts.',
                                estimatedTime: 240,
                                completed: false,
                            },
                            {
                                id: '5',
                                title: 'Practice Exercises',
                                type: 'practice',
                                url: 'https://example.com/exercises',
                                description: 'Strengthen your skills with these coding challenges.',
                                estimatedTime: 90,
                                completed: false,
                            },
                        ],
                        totalEstimatedTime: 690, // minutes
                        createdAt: currentDate,
                    };
                    break;

                case 'graphicDesign':
                    pathId = 'design-' + Date.now();
                    mockPath = {
                        id: pathId,
                        category: selectedCategory,
                        title: `${(graphicDesignAnswers.designGoal ?? '').charAt(0).toUpperCase() + (graphicDesignAnswers.designGoal ?? '').slice(1)} Design with ${(graphicDesignAnswers.softwarePreference ?? '').charAt(0).toUpperCase() + (graphicDesignAnswers.softwarePreference ?? '').slice(1)}`,
                        description: `A personalized learning path for ${graphicDesignAnswers.difficultyLevel} designers focusing on ${graphicDesignAnswers.designGoal ?? ''} using ${graphicDesignAnswers.softwarePreference ?? ''}.`,
                        resources: [
                            {
                                id: '1',
                                title: 'Design Fundamentals and Principles',
                                type: 'course',
                                url: 'https://example.com/design/course1',
                                description: 'Learn the core principles of visual design.',
                                estimatedTime: 90,
                                completed: false,
                            },
                            {
                                id: '2',
                                title: 'Introduction to Your Design Software',
                                type: 'video',
                                url: 'https://example.com/design/tutorial1',
                                description: `Getting familiar with ${graphicDesignAnswers.softwarePreference} interface and tools.`,
                                estimatedTime: 60,
                                completed: false,
                            },
                            {
                                id: '3',
                                title: 'Your First Design Project',
                                type: 'project',
                                url: 'https://example.com/design/project1',
                                description: 'Apply what you have learned in a practical project.',
                                estimatedTime: 120,
                                completed: false,
                            },
                            {
                                id: '4',
                                title: 'Color Theory and Typography',
                                type: 'article',
                                url: 'https://example.com/design/article1',
                                description: 'Understanding the impact of color and type in design.',
                                estimatedTime: 45,
                                completed: false,
                            },
                            {
                                id: '5',
                                title: 'Advanced Design Techniques',
                                type: 'course',
                                url: 'https://example.com/design/course2',
                                description: 'Take your design skills to the next level.',
                                estimatedTime: 180,
                                completed: false,
                            },
                        ],
                        totalEstimatedTime: 495, // minutes
                        createdAt: currentDate,
                    };
                    break;

                case 'videoEditing':
                    pathId = 'video-' + Date.now();
                    mockPath = {
                        id: pathId,
                        category: selectedCategory,
                        title: `${(videoEditingAnswers.videoType ?? '').charAt(0).toUpperCase() + (videoEditingAnswers.videoType ?? '').slice(1)} Editing with ${(videoEditingAnswers.softwarePreference ?? '').charAt(0).toUpperCase() + (videoEditingAnswers.softwarePreference ?? '').slice(1)}`,
                        description: `A personalized learning path for ${videoEditingAnswers.difficultyLevel} video editors focusing on ${videoEditingAnswers.videoType} using ${videoEditingAnswers.softwarePreference}.`,
                        resources: [
                            {
                                id: '1',
                                title: 'Video Editing Basics',
                                type: 'course',
                                url: 'https://example.com/video/course1',
                                description: 'Learn the fundamentals of video editing.',
                                estimatedTime: 120,
                                completed: false,
                            },
                            {
                                id: '2',
                                title: 'Setting Up Your Software Environment',
                                type: 'video',
                                url: 'https://example.com/video/setup',
                                description: `Getting familiar with ${videoEditingAnswers.softwarePreference} interface and tools.`,
                                estimatedTime: 45,
                                completed: false,
                            },
                            {
                                id: '3',
                                title: 'Your First Editing Project',
                                type: 'project',
                                url: 'https://example.com/video/project1',
                                description: 'Edit a short video clip applying basic techniques.',
                                estimatedTime: 90,
                                completed: false,
                            },
                            {
                                id: '4',
                                title: 'Audio Editing and Sound Design',
                                type: 'course',
                                url: 'https://example.com/video/audio',
                                description: 'Learn how to enhance your videos with great audio.',
                                estimatedTime: 60,
                                completed: false,
                            },
                            {
                                id: '5',
                                title: 'Visual Effects and Transitions',
                                type: 'video',
                                url: 'https://example.com/video/effects',
                                description: 'Add professional transitions and visual effects to your videos.',
                                estimatedTime: 75,
                                completed: false,
                            },
                        ],
                        totalEstimatedTime: 390, // minutes
                        createdAt: currentDate,
                    };
                    break;

                default:
                    router.push('/user/progress/questions');
                    return;
            }

            // Set the generated path in the store
            setGeneratedPath(mockPath);

            // Redirect to the learning path page
            router.push(`/user/progress/currentlearning/${pathId}`);
        };

        generateLearningPath();
    }, [
        selectedCategory,
        router,
        generalAnswers,
        programmingAnswers,
        graphicDesignAnswers,
        videoEditingAnswers,
        setGeneratedPath
    ]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center">
                <div className="mb-8">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Generating Your Learning Path</h2>
                <p className="text-lg text-gray-600">
                    We're creating a personalized path based on your preferences. This may take a moment...
                </p>
            </div>
        </div>
    );
}
