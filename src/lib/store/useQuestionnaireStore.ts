import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LearningCategory = 'programming' | 'graphicDesign' | 'videoEditing';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TimeCommitment = '1-3 hours' | '3-5 hours' | '5+ hours';
export type LearningStyle = 'video' | 'reading' | 'handson' | 'interactive' | 'audio' | 'mentoring';
export type Motivation = 'careerGrowth' | 'personalDevelopment' | 'creativeExpression' | 'jobChange';
export type ResourcePreference = 'paid' | 'free' | 'both';

// Programming specific types
export type ProgrammingGoal = 'web' | 'mobile' | 'datascience' | 'game' | 'automation';
export type ProgrammingLanguage = 'python' | 'javascript' | 'java' | 'csharp' | 'cpp' | 'other';
export type ProjectPreference = 'yes' | 'no';

// Graphic Design specific types
export type DesignGoal = 'logo' | 'web' | 'print' | 'branding' | 'motion';
export type DesignSoftware = 'photoshop' | 'illustrator' | 'figma' | 'canva' | 'other';
export type CreativeApproach = 'structured' | 'experimental' | 'theory';
export type PortfolioBuilding = 'yes' | 'no';

// Video Editing specific types
export type VideoEditingGoal = 'youtube' | 'film' | 'social' | 'business';
export type VideoSoftware = 'premiere' | 'finalcut' | 'davinci' | 'imovie' | 'other';
export type VideoType = 'vlog' | 'short' | 'documentary' | 'corporate';
export type FocusArea = 'creative' | 'technical';

export interface GeneralQuestions {
    learningGoal: string;
    timeCommitment: TimeCommitment;
    experienceLevel: ExperienceLevel;
    learningStyles: LearningStyle[];
    motivation: Motivation;
    resourcePreference: ResourcePreference;
    age?: number;
}

export interface ProgrammingQuestions {
    programmingGoal: ProgrammingGoal;
    languagePreference: ProgrammingLanguage;
    projectPreference: ProjectPreference;
    difficultyLevel: ExperienceLevel;
}

export interface GraphicDesignQuestions {
    designGoal: DesignGoal;
    softwarePreference: DesignSoftware;
    creativeApproach: CreativeApproach;
    portfolioBuilding: PortfolioBuilding;
    difficultyLevel: ExperienceLevel;
}

export interface VideoEditingQuestions {
    videoEditingGoal: VideoEditingGoal;
    softwarePreference: VideoSoftware;
    videoType: VideoType;
    focusArea: FocusArea;
    difficultyLevel: ExperienceLevel;
}

export interface LearningPathResource {
    id: string;
    title: string;
    type: 'video' | 'article' | 'course' | 'project' | 'practice';
    url: string;
    description: string;
    estimatedTime: number; // minutes
    completed: boolean;
}

export interface LearningPath {
    id: string;
    category: LearningCategory;
    title: string;
    description: string;
    resources: LearningPathResource[];
    totalEstimatedTime: number; // minutes
    createdAt: string;
}

interface QuestionnaireState {
    currentStep: 'category' | 'general' | 'specific' | 'loading' | 'complete';
    selectedCategory: LearningCategory | null;
    generalAnswers: Partial<GeneralQuestions>;
    programmingAnswers: Partial<ProgrammingQuestions>;
    graphicDesignAnswers: Partial<GraphicDesignQuestions>;
    videoEditingAnswers: Partial<VideoEditingQuestions>;
    generatedPath: LearningPath | null;

    // Actions
    setCurrentStep: (step: QuestionnaireState['currentStep']) => void;
    selectCategory: (category: LearningCategory) => void;
    updateGeneralAnswers: (answers: Partial<GeneralQuestions>) => void;
    updateProgrammingAnswers: (answers: Partial<ProgrammingQuestions>) => void;
    updateGraphicDesignAnswers: (answers: Partial<GraphicDesignQuestions>) => void;
    updateVideoEditingAnswers: (answers: Partial<VideoEditingQuestions>) => void;
    setGeneratedPath: (path: LearningPath) => void;
    resetQuestionnaire: () => void;
    markResourceComplete: (resourceId: string) => void;
    uploadProof: (resourceId: string, proofUrl: string) => void;
}

const initialState: Omit<QuestionnaireState,
    'setCurrentStep' |
    'selectCategory' |
    'updateGeneralAnswers' |
    'updateProgrammingAnswers' |
    'updateGraphicDesignAnswers' |
    'updateVideoEditingAnswers' |
    'setGeneratedPath' |
    'resetQuestionnaire' |
    'markResourceComplete' |
    'uploadProof'
> = {
    currentStep: 'category' as const,
    selectedCategory: null,
    generalAnswers: {},
    programmingAnswers: {},
    graphicDesignAnswers: {},
    videoEditingAnswers: {},
    generatedPath: null,
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
    persist(
        (set) => ({
            ...initialState,

            setCurrentStep: (step) => set({ currentStep: step }),

            selectCategory: (category) => set({
                selectedCategory: category,
                currentStep: 'general'
            }),

            updateGeneralAnswers: (answers) => set((state) => ({
                generalAnswers: { ...state.generalAnswers, ...answers }
            })),

            updateProgrammingAnswers: (answers) => set((state) => ({
                programmingAnswers: { ...state.programmingAnswers, ...answers }
            })),

            updateGraphicDesignAnswers: (answers) => set((state) => ({
                graphicDesignAnswers: { ...state.graphicDesignAnswers, ...answers }
            })),

            updateVideoEditingAnswers: (answers) => set((state) => ({
                videoEditingAnswers: { ...state.videoEditingAnswers, ...answers }
            })),

            setGeneratedPath: (path) => set({
                generatedPath: path,
                currentStep: 'complete'
            }),

            resetQuestionnaire: () => set({
                currentStep: 'category',
                selectedCategory: null,
                generalAnswers: {},
                programmingAnswers: {},
                graphicDesignAnswers: {},
                videoEditingAnswers: {},
                generatedPath: null,
            }),

            markResourceComplete: (resourceId) => set((state) => {
                if (!state.generatedPath) return state;

                return {
                    generatedPath: {
                        ...state.generatedPath,
                        resources: state.generatedPath.resources.map(resource =>
                            resource.id === resourceId
                                ? { ...resource, completed: true }
                                : resource
                        )
                    }
                };
            }),

            uploadProof: (resourceId, proofUrl) => set((state) => {
                if (!state.generatedPath) return state;

                return {
                    generatedPath: {
                        ...state.generatedPath,
                        resources: state.generatedPath.resources.map(resource =>
                            resource.id === resourceId
                                ? { ...resource, proofUrl }
                                : resource
                        )
                    }
                };
            }),
        }),
        {
            name: 'questionnaire-storage',
        }
    )
);
