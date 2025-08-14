'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import {
    useQuestionnaireStore,
    GeneralQuestions,
    TimeCommitment,
    ExperienceLevel,
    LearningStyle,
    Motivation,
    ResourcePreference
} from '@/lib/store/useQuestionnaireStore';

export default function GeneralQuestionsPage() {
    const router = useRouter();
    const {
        selectedCategory,
        generalAnswers,
        updateGeneralAnswers,
        setCurrentStep
    } = useQuestionnaireStore();

    const [formData, setFormData] = useState<Partial<GeneralQuestions>>({
        learningGoal: generalAnswers.learningGoal || '',
        timeCommitment: generalAnswers.timeCommitment || '1-3 hours',
        experienceLevel: generalAnswers.experienceLevel || 'beginner',
        learningStyles: generalAnswers.learningStyles || [],
        motivation: generalAnswers.motivation || 'careerGrowth',
        resourcePreference: generalAnswers.resourcePreference || 'both',
        age: generalAnswers.age || undefined,
    });

    useEffect(() => {
        // Redirect back to category selection if no category selected
        if (!selectedCategory) {
            router.push('/user/progress/questions');
        }
    }, [selectedCategory, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLearningStyleChange = (style: LearningStyle) => {
        setFormData(prev => {
            const currentStyles = prev.learningStyles || [];
            if (currentStyles.includes(style)) {
                return { ...prev, learningStyles: currentStyles.filter(s => s !== style) };
            } else {
                return { ...prev, learningStyles: [...currentStyles, style] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Update the global state with the form data
        updateGeneralAnswers(formData);

        // Set the current step to specific and navigate to the specific questions page
        setCurrentStep('specific');
        router.push(`/user/progress/questions/${selectedCategory}`);
    };

    const timeOptions: TimeCommitment[] = ['1-3 hours', '3-5 hours', '5+ hours'];
    const experienceOptions: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];
    const learningStyleOptions: { value: LearningStyle; label: string }[] = [
        { value: 'video', label: 'Video tutorials' },
        { value: 'reading', label: 'Reading articles/books' },
        { value: 'handson', label: 'Hands-on practice/projects' },
        { value: 'interactive', label: 'Interactive exercises' },
        { value: 'audio', label: 'Audio lessons (podcasts, etc.)' },
        { value: 'mentoring', label: 'One-on-one mentoring' },
    ];
    const motivationOptions: { value: Motivation; label: string }[] = [
        { value: 'careerGrowth', label: 'Career growth' },
        { value: 'personalDevelopment', label: 'Personal development' },
        { value: 'creativeExpression', label: 'Creative expression' },
        { value: 'jobChange', label: 'Job change' },
    ];
    const resourceOptions: { value: ResourcePreference; label: string }[] = [
        { value: 'free', label: 'Free resources only' },
        { value: 'paid', label: 'Paid resources only' },
        { value: 'both', label: 'Both paid and free resources' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="General Questions"
                subtitle="Help us understand your learning preferences"
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-3xl mx-auto">
                {/* Learning Goal */}
                <div>
                    <label htmlFor="learningGoal" className="block text-sm font-medium text-gray-700 mb-2">
                        What is your main goal for learning this topic?
                    </label>
                    <textarea
                        id="learningGoal"
                        name="learningGoal"
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        placeholder="e.g., Become a professional, Learn as a hobby, Prepare for a job"
                        value={formData.learningGoal}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Time Commitment */}
                <div>
                    <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-2">
                        How much time can you dedicate to learning each week?
                    </label>
                    <select
                        id="timeCommitment"
                        name="timeCommitment"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.timeCommitment}
                        onChange={handleInputChange}
                        required
                    >
                        {timeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Experience Level */}
                <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                        What is your current level of experience with this topic?
                    </label>
                    <select
                        id="experienceLevel"
                        name="experienceLevel"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        required
                    >
                        {experienceOptions.map(option => (
                            <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Learning Style */}
                <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                        How do you prefer to learn? (Select all that apply)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {learningStyleOptions.map(option => (
                            <div key={option.value} className="flex items-center">
                                <input
                                    id={`style-${option.value}`}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    checked={formData.learningStyles?.includes(option.value) || false}
                                    onChange={() => handleLearningStyleChange(option.value)}
                                />
                                <label htmlFor={`style-${option.value}`} className="ml-2 text-sm text-gray-700">
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Motivation */}
                <div>
                    <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                        Why are you interested in learning this topic?
                    </label>
                    <select
                        id="motivation"
                        name="motivation"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        required
                    >
                        {motivationOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Resource Preference */}
                <div>
                    <label htmlFor="resourcePreference" className="block text-sm font-medium text-gray-700 mb-2">
                        Are you open to paid resources or prefer free ones?
                    </label>
                    <select
                        id="resourcePreference"
                        name="resourcePreference"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.resourcePreference}
                        onChange={handleInputChange}
                        required
                    >
                        {resourceOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Age */}
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                        Age (Optional)
                    </label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        placeholder="Your age"
                        value={formData.age || ''}
                        onChange={handleInputChange}
                        min={1}
                        max={120}
                    />
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => router.push('/user/progress/questions')}
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
