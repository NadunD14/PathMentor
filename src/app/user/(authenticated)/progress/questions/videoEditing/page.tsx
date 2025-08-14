'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import {
    useQuestionnaireStore,
    VideoEditingQuestions,
    VideoEditingGoal,
    VideoSoftware,
    VideoType,
    FocusArea,
    ExperienceLevel
} from '@/lib/store/useQuestionnaireStore';

export default function VideoEditingQuestionsPage() {
    const router = useRouter();
    const {
        selectedCategory,
        videoEditingAnswers,
        updateVideoEditingAnswers,
        setCurrentStep
    } = useQuestionnaireStore();

    const [formData, setFormData] = useState<Partial<VideoEditingQuestions>>({
        videoEditingGoal: videoEditingAnswers.videoEditingGoal || 'youtube',
        softwarePreference: videoEditingAnswers.softwarePreference || 'premiere',
        videoType: videoEditingAnswers.videoType || 'vlog',
        focusArea: videoEditingAnswers.focusArea || 'creative',
        difficultyLevel: videoEditingAnswers.difficultyLevel || 'beginner',
    });

    useEffect(() => {
        // Redirect if no category selected or wrong category
        if (!selectedCategory || selectedCategory !== 'videoEditing') {
            router.push('/user/progress/questions');
        }
    }, [selectedCategory, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Update the global state with the form data
        updateVideoEditingAnswers(formData);

        // Redirect to loading page
        setCurrentStep('loading');
        router.push('/user/progress/questions/loading');
    };

    const videoEditingGoalOptions: { value: VideoEditingGoal; label: string }[] = [
        { value: 'youtube', label: 'YouTube videos / content creation' },
        { value: 'film', label: 'Film production / movies' },
        { value: 'social', label: 'Social media content (Instagram, TikTok)' },
        { value: 'business', label: 'Editing for business/marketing purposes' },
    ];

    const videoSoftwareOptions: { value: VideoSoftware; label: string }[] = [
        { value: 'premiere', label: 'Adobe Premiere Pro' },
        { value: 'finalcut', label: 'Final Cut Pro' },
        { value: 'davinci', label: 'DaVinci Resolve' },
        { value: 'imovie', label: 'iMovie' },
        { value: 'other', label: 'Other' },
    ];

    const videoTypeOptions: { value: VideoType; label: string }[] = [
        { value: 'vlog', label: 'Vlogs / YouTube videos' },
        { value: 'short', label: 'Short-form content (e.g., Instagram, TikTok)' },
        { value: 'documentary', label: 'Documentaries or Films' },
        { value: 'corporate', label: 'Corporate or promotional videos' },
    ];

    const focusAreaOptions: { value: FocusArea; label: string }[] = [
        { value: 'creative', label: 'Creative (storytelling, pacing, visual style)' },
        { value: 'technical', label: 'Technical (learning software tools, effects, transitions)' },
    ];

    const difficultyOptions: { value: ExperienceLevel; label: string }[] = [
        { value: 'beginner', label: 'Beginner (learning the basics)' },
        { value: 'intermediate', label: 'Intermediate (working with effects, transitions)' },
        { value: 'advanced', label: 'Advanced (editing for professional films or high-level content)' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Video Editing Learning Path"
                subtitle="Tell us more about your video editing interests"
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-3xl mx-auto">
                {/* Video Editing Goal */}
                <div>
                    <label htmlFor="videoEditingGoal" className="block text-sm font-medium text-gray-700 mb-2">
                        What do you want to achieve with video editing?
                    </label>
                    <select
                        id="videoEditingGoal"
                        name="videoEditingGoal"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.videoEditingGoal}
                        onChange={handleInputChange}
                        required
                    >
                        {videoEditingGoalOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Software Preference */}
                <div>
                    <label htmlFor="softwarePreference" className="block text-sm font-medium text-gray-700 mb-2">
                        Do you have a preferred video editing software?
                    </label>
                    <select
                        id="softwarePreference"
                        name="softwarePreference"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.softwarePreference}
                        onChange={handleInputChange}
                        required
                    >
                        {videoSoftwareOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Video Type */}
                <div>
                    <label htmlFor="videoType" className="block text-sm font-medium text-gray-700 mb-2">
                        What type of videos do you want to focus on editing?
                    </label>
                    <select
                        id="videoType"
                        name="videoType"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.videoType}
                        onChange={handleInputChange}
                        required
                    >
                        {videoTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Focus Area */}
                <div>
                    <label htmlFor="focusArea" className="block text-sm font-medium text-gray-700 mb-2">
                        Would you like a focus on the creative side or the technical side?
                    </label>
                    <select
                        id="focusArea"
                        name="focusArea"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.focusArea}
                        onChange={handleInputChange}
                        required
                    >
                        {focusAreaOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Level */}
                <div>
                    <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                        How challenging do you want your video editing learning path to be?
                    </label>
                    <select
                        id="difficultyLevel"
                        name="difficultyLevel"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.difficultyLevel}
                        onChange={handleInputChange}
                        required
                    >
                        {difficultyOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => router.push('/user/progress/questions/general')}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}
