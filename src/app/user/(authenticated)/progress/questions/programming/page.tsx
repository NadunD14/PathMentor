'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import {
    useQuestionnaireStore,
    ProgrammingQuestions,
    ProgrammingGoal,
    ProgrammingLanguage,
    ProjectPreference,
    ExperienceLevel
} from '@/lib/store/useQuestionnaireStore';

export default function ProgrammingQuestionsPage() {
    const router = useRouter();
    const {
        selectedCategory,
        programmingAnswers,
        updateProgrammingAnswers,
        setCurrentStep
    } = useQuestionnaireStore();

    const [formData, setFormData] = useState<Partial<ProgrammingQuestions>>({
        programmingGoal: programmingAnswers.programmingGoal || 'web',
        languagePreference: programmingAnswers.languagePreference || 'javascript',
        projectPreference: programmingAnswers.projectPreference || 'yes',
        difficultyLevel: programmingAnswers.difficultyLevel || 'beginner',
    });

    useEffect(() => {
        // Redirect if no category selected or wrong category
        if (!selectedCategory || selectedCategory !== 'programming') {
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
        updateProgrammingAnswers(formData);

        // Redirect to loading page
        setCurrentStep('loading');
        router.push('/user/progress/questions/loading');
    };

    const programmingGoalOptions: { value: ProgrammingGoal; label: string }[] = [
        { value: 'web', label: 'Build websites/web apps' },
        { value: 'mobile', label: 'Create mobile apps' },
        { value: 'datascience', label: 'Learn Data Science/Machine Learning' },
        { value: 'game', label: 'Game development' },
        { value: 'automation', label: 'Automation/Script writing' },
    ];

    const languageOptions: { value: ProgrammingLanguage; label: string }[] = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'csharp', label: 'C#' },
        { value: 'cpp', label: 'C++' },
        { value: 'other', label: 'Other' },
    ];

    const projectOptions: { value: ProjectPreference; label: string }[] = [
        { value: 'yes', label: 'Yes, I prefer hands-on projects' },
        { value: 'no', label: 'No, I prefer theoretical learning first' },
    ];

    const difficultyOptions: { value: ExperienceLevel; label: string }[] = [
        { value: 'beginner', label: 'Beginner-friendly (step-by-step)' },
        { value: 'intermediate', label: 'Balanced (mix of theory and projects)' },
        { value: 'advanced', label: 'Advanced (deep-dive into complex concepts)' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Programming Learning Path"
                subtitle="Tell us more about your programming interests"
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-3xl mx-auto">
                {/* Programming Goal */}
                <div>
                    <label htmlFor="programmingGoal" className="block text-sm font-medium text-gray-700 mb-2">
                        What do you want to do with programming?
                    </label>
                    <select
                        id="programmingGoal"
                        name="programmingGoal"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.programmingGoal}
                        onChange={handleInputChange}
                        required
                    >
                        {programmingGoalOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Language Preference */}
                <div>
                    <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700 mb-2">
                        Do you have a preferred programming language?
                    </label>
                    <select
                        id="languagePreference"
                        name="languagePreference"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.languagePreference}
                        onChange={handleInputChange}
                        required
                    >
                        {languageOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Project Preference */}
                <div>
                    <label htmlFor="projectPreference" className="block text-sm font-medium text-gray-700 mb-2">
                        Would you prefer to work on projects as you learn?
                    </label>
                    <select
                        id="projectPreference"
                        name="projectPreference"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.projectPreference}
                        onChange={handleInputChange}
                        required
                    >
                        {projectOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Level */}
                <div>
                    <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                        How challenging do you want your learning path to be?
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
