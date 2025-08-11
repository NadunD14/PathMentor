import { create } from 'zustand';

export type LearningCategory =
    | 'webDevelopment'
    | 'dataScience'
    | 'machineLearning'
    | 'design'
    | 'marketing';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    title: string;
    category: LearningCategory;
    dueDate: string;
    priority: PriorityLevel;
    completed: boolean;
}

export interface CategoryProgress {
    category: LearningCategory;
    name: string;
    completionPercentage: number;
    lessonsDone: number;
    totalLessons: number;
    timeSpent: number; // minutes
}

export interface TimeMetrics {
    weeklyHours: number;
    totalHours: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
}

interface ProgressState {
    categories: CategoryProgress[];
    timeMetrics: TimeMetrics;
    upcomingTasks: Task[];
    achievements: Achievement[];
    completeTask: (taskId: string) => void;
    updateCategoryProgress: (category: LearningCategory, progress: Partial<CategoryProgress>) => void;
}

export const useProgressStore = create<ProgressState>((set: any) => ({
    categories: [
        {
            category: 'webDevelopment',
            name: 'Web Development',
            completionPercentage: 45,
            lessonsDone: 9,
            totalLessons: 20,
            timeSpent: 720, // 12 hours
        },
        {
            category: 'dataScience',
            name: 'Data Science',
            completionPercentage: 30,
            lessonsDone: 6,
            totalLessons: 20,
            timeSpent: 480, // 8 hours
        },
        {
            category: 'machineLearning',
            name: 'Machine Learning',
            completionPercentage: 15,
            lessonsDone: 3,
            totalLessons: 20,
            timeSpent: 240, // 4 hours
        },
    ],
    timeMetrics: {
        weeklyHours: 8,
        totalHours: 24,
    },
    upcomingTasks: [
        {
            id: '1',
            title: 'Complete React Components Module',
            category: 'webDevelopment',
            dueDate: '2025-08-15',
            priority: 'high',
            completed: false,
        },
        {
            id: '2',
            title: 'Finish Python Data Analysis Assignment',
            category: 'dataScience',
            dueDate: '2025-08-18',
            priority: 'medium',
            completed: false,
        },
        {
            id: '3',
            title: 'Start TensorFlow Introduction',
            category: 'machineLearning',
            dueDate: '2025-08-20',
            priority: 'low',
            completed: false,
        },
    ],
    achievements: [
        {
            id: '1',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: '🏆',
            earned: true,
            earnedDate: '2025-07-15',
        },
        {
            id: '2',
            title: 'Week Streak',
            description: 'Complete lessons 7 days in a row',
            icon: '🔥',
            earned: true,
            earnedDate: '2025-07-30',
        },
        {
            id: '3',
            title: 'Module Master',
            description: 'Complete an entire module',
            icon: '🧠',
            earned: false,
        },
    ],
    completeTask: (taskId: string) =>
        set((state: ProgressState) => ({
            upcomingTasks: state.upcomingTasks.map((task: Task) =>
                task.id === taskId ? { ...task, completed: true } : task
            ),
        })),
    updateCategoryProgress: (category: LearningCategory, progress: Partial<CategoryProgress>) =>
        set((state: ProgressState) => ({
            categories: state.categories.map((cat: CategoryProgress) =>
                cat.category === category ? { ...cat, ...progress } : cat
            ),
        })),
}));
