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

export interface QuestionOption {
    option_id: number;
    option_text: string;
}

export interface UserAnswer {
    answer_id?: number;
    user_id: string; // Changed to string to match Supabase auth user IDs
    question_id: number;
    answer_text?: string;
    option_id?: number;
}

export interface QuestionnaireState {
    // Current state
    selectedCategory: LearningCategory | null;
    selectedCategoryId: number | null;
    currentStep: 'category' | 'general' | 'specific' | 'complete';

    // Questions and answers
    generalQuestions: Question[];
    categoryQuestions: Question[];
    userAnswers: Record<number, UserAnswer>;

    // Actions
    selectCategory: (category: LearningCategory, categoryId: number) => void;
    setCurrentStep: (step: 'category' | 'general' | 'specific' | 'complete') => void;
    setGeneralQuestions: (questions: Question[]) => void;
    setCategoryQuestions: (questions: Question[]) => void;
    saveAnswer: (questionId: number, answer: Omit<UserAnswer, 'question_id'>) => void;
    resetQuestionnaire: () => void;
}

const initialState = {
    selectedCategory: null,
    selectedCategoryId: null,
    currentStep: 'category' as const,
    generalQuestions: [],
    categoryQuestions: [],
    userAnswers: {},
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
    persist(
        (set) => ({
            ...initialState,

            selectCategory: (category: LearningCategory, categoryId: number) => {
                set({
                    selectedCategory: category,
                    selectedCategoryId: categoryId,
                    currentStep: 'general'
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
                userAnswers: state.userAnswers,
            }),
        }
    )
);
