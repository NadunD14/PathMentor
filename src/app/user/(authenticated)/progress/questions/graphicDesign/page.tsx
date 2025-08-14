'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/user/shared/PageHeader';
import {
    useQuestionnaireStore,
    GraphicDesignQuestions,
    DesignGoal,
    DesignSoftware,
    CreativeApproach,
    PortfolioBuilding,
    ExperienceLevel
} from '@/lib/store/useQuestionnaireStore';

export default function GraphicDesignQuestionsPage() {
    const router = useRouter();
    const {
        selectedCategory,
        graphicDesignAnswers,
        updateGraphicDesignAnswers,
        setCurrentStep
    } = useQuestionnaireStore();

    const [formData, setFormData] = useState<Partial<GraphicDesignQuestions>>({
        designGoal: graphicDesignAnswers.designGoal || 'web',
        softwarePreference: graphicDesignAnswers.softwarePreference || 'figma',
        creativeApproach: graphicDesignAnswers.creativeApproach || 'structured',
        portfolioBuilding: graphicDesignAnswers.portfolioBuilding || 'yes',
        difficultyLevel: graphicDesignAnswers.difficultyLevel || 'beginner',
    });

    useEffect(() => {
        // Redirect if no category selected or wrong category
        if (!selectedCategory || selectedCategory !== 'graphicDesign') {
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
        updateGraphicDesignAnswers(formData);

        // Redirect to loading page
        setCurrentStep('loading');
        router.push('/user/progress/questions/loading');
    };

    const designGoalOptions: { value: DesignGoal; label: string }[] = [
        { value: 'logo', label: 'Logo design' },
        { value: 'web', label: 'Web/UI design' },
        { value: 'print', label: 'Print design (posters, brochures)' },
        { value: 'branding', label: 'Branding' },
        { value: 'motion', label: 'Motion graphics/animations' },
    ];

    const softwareOptions: { value: DesignSoftware; label: string }[] = [
        { value: 'photoshop', label: 'Adobe Photoshop' },
        { value: 'illustrator', label: 'Adobe Illustrator' },
        { value: 'figma', label: 'Figma' },
        { value: 'canva', label: 'Canva' },
        { value: 'other', label: 'Other' },
    ];

    const creativeApproachOptions: { value: CreativeApproach; label: string }[] = [
        { value: 'structured', label: 'I prefer structured tutorials and guidance' },
        { value: 'experimental', label: 'I want to experiment and learn as I go' },
        { value: 'theory', label: 'I need help with design principles and theory' },
    ];

    const portfolioOptions: { value: PortfolioBuilding; label: string }[] = [
        { value: 'yes', label: "Yes, I'd like to create a portfolio as I learn" },
        { value: 'no', label: "No, I'm just learning for personal development" },
    ];

    const difficultyOptions: { value: ExperienceLevel; label: string }[] = [
        { value: 'beginner', label: 'Beginner (starting with basic design principles)' },
        { value: 'intermediate', label: 'Intermediate (learning advanced techniques)' },
        { value: 'advanced', label: 'Advanced (working with complex design projects)' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <PageHeader
                title="Graphic Design Learning Path"
                subtitle="Tell us more about your design interests"
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-3xl mx-auto">
                {/* Design Goal */}
                <div>
                    <label htmlFor="designGoal" className="block text-sm font-medium text-gray-700 mb-2">
                        What type of graphic design do you want to focus on?
                    </label>
                    <select
                        id="designGoal"
                        name="designGoal"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.designGoal}
                        onChange={handleInputChange}
                        required
                    >
                        {designGoalOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Software Preference */}
                <div>
                    <label htmlFor="softwarePreference" className="block text-sm font-medium text-gray-700 mb-2">
                        Which design software do you prefer or want to learn?
                    </label>
                    <select
                        id="softwarePreference"
                        name="softwarePreference"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.softwarePreference}
                        onChange={handleInputChange}
                        required
                    >
                        {softwareOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Creative Approach */}
                <div>
                    <label htmlFor="creativeApproach" className="block text-sm font-medium text-gray-700 mb-2">
                        How would you describe your creative process?
                    </label>
                    <select
                        id="creativeApproach"
                        name="creativeApproach"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.creativeApproach}
                        onChange={handleInputChange}
                        required
                    >
                        {creativeApproachOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Portfolio Building */}
                <div>
                    <label htmlFor="portfolioBuilding" className="block text-sm font-medium text-gray-700 mb-2">
                        Would you like to build a portfolio during your learning?
                    </label>
                    <select
                        id="portfolioBuilding"
                        name="portfolioBuilding"
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3"
                        value={formData.portfolioBuilding}
                        onChange={handleInputChange}
                        required
                    >
                        {portfolioOptions.map(option => (
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
