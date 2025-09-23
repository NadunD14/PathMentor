import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LearningCategory = string;

// Database types
export interface Category {
    category_id: number;
    name: string;
    description?: string;
    image_url?: string;
    created_at?: string;
}

export interface Question {
    question_id: number;
    question: string;
    question_type: string;
    question_options?: QuestionOption[];
}

export interface CategoryQuestion {
    category_question_id: number;
    category_id: number;
    question_id?: number;
    question_type: string;
    context_for_ai?: string;
    category_options?: CategoryOption[];
}

export interface QuestionOption {
    option_id: number;
    option_text: string;
}

export interface CategoryOption {
    option_id: number;
    option_text: string;
}

export interface UserAnswer {
    answer_id?: number;
    user_id: string;
    question_id: number;
    category_id?: number;
    answer_text?: string;
    option_id?: number;
    assessment_id?: string;
}

export interface UserCategoryAnswer {
    answer_id?: number;
    user_id: string;
    category_question_id: number;
    answer_text?: string;
    option_id?: number;
    assessment_id?: string;
}

export interface QuestionnaireState {
    // Current state
    selectedCategory: LearningCategory | null;
    selectedCategoryId: number | null;
    currentStep: 'category' | 'general' | 'specific' | 'complete';
    assessmentId: string | null;

    // Questions and answers
    generalQuestions: Question[];
    categoryQuestions: CategoryQuestion[];
    userAnswers: Record<number, UserAnswer>;
    userCategoryAnswers: Record<number, UserCategoryAnswer>;

    // Actions
    selectCategory: (category: LearningCategory, categoryId: number) => void;
    setCurrentStep: (step: 'category' | 'general' | 'specific' | 'complete') => void;
    setGeneralQuestions: (questions: Question[]) => void;
    setCategoryQuestions: (questions: CategoryQuestion[]) => void;
    saveAnswer: (questionId: number, answer: Omit<UserAnswer, 'question_id'>) => void;
    saveCategoryAnswer: (categoryQuestionId: number, answer: Omit<UserCategoryAnswer, 'category_question_id'>) => void;
    resetQuestionnaire: () => void;
}

const initialState = {
    selectedCategory: null,
    selectedCategoryId: null,
    currentStep: 'category' as const,
    assessmentId: null as string | null,
    generalQuestions: [],
    categoryQuestions: [],
    userAnswers: {},
    userCategoryAnswers: {},
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
    persist(
        (set) => ({
            ...initialState,

            selectCategory: (category: LearningCategory, categoryId: number) => {
                // Start a new assessment/session when a category is selected
                const newAssessmentId = (globalThis as any)?.crypto?.randomUUID
                    ? (globalThis as any).crypto.randomUUID()
                    : Math.random().toString(36).slice(2) + Date.now().toString(36);
                set({
                    selectedCategory: category,
                    selectedCategoryId: categoryId,
                    currentStep: 'general',
                    assessmentId: newAssessmentId,
                });
            },

            setCurrentStep: (step) => {
                set({ currentStep: step });
            },

            setGeneralQuestions: (questions) => {
                set({ generalQuestions: questions });
            },

            setCategoryQuestions: (questions) => {
                set({ categoryQuestions: questions });
            },

            saveAnswer: (questionId, answer) => {
                set((state) => ({
                    userAnswers: {
                        ...state.userAnswers,
                        [questionId]: { ...answer, question_id: questionId }
                    }
                }));
            },

            saveCategoryAnswer: (categoryQuestionId, answer) => {
                set((state) => ({
                    userCategoryAnswers: {
                        ...state.userCategoryAnswers,
                        [categoryQuestionId]: { ...answer, category_question_id: categoryQuestionId }
                    }
                }));
            },

            resetQuestionnaire: () => {
                set(initialState);
            },
        }),
        {
            name: 'questionnaire-storage',
            partialize: (state) => ({
                selectedCategory: state.selectedCategory,
                selectedCategoryId: state.selectedCategoryId,
                currentStep: state.currentStep,
                assessmentId: state.assessmentId,
                userAnswers: state.userAnswers,
            }),
        }
    )
);
