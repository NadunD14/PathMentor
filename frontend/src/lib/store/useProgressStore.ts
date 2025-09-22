import { create } from 'zustand';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    title: string;
    category: string; // dynamic from DB category name
    dueDate: string;
    priority: PriorityLevel;
    completed: boolean;
}

export interface CategoryProgress {
    category: string; // dynamic from DB category name
    name: string;
    completionPercentage: number;
    lessonsDone: number;
    totalLessons: number;
    timeSpent: number; // minutes
    pathId?: number; // Add pathId to link to specific path
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
    updateCategoryProgress: (category: string, progress: Partial<CategoryProgress>) => void;
    setProgressData: (data: { categories: CategoryProgress[]; timeMetrics: TimeMetrics; upcomingTasks: Task[] }) => void;
}

export const useProgressStore = create<ProgressState>((set: any) => ({
    categories: [],
    timeMetrics: {
        weeklyHours: 0,
        totalHours: 0,
    },
    upcomingTasks: [],
    achievements: [
        {
            id: '1',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: '🏆',
            earned: false,
        },
        {
            id: '2',
            title: 'Week Streak',
            description: 'Complete lessons 7 days in a row',
            icon: '🔥',
            earned: false,
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
    updateCategoryProgress: (category: string, progress: Partial<CategoryProgress>) =>
        set((state: ProgressState) => ({
            categories: state.categories.map((cat: CategoryProgress) =>
                cat.category === category ? { ...cat, ...progress } : cat
            ),
        })),
    setProgressData: (data) =>
        set(() => ({
            categories: data.categories,
            timeMetrics: data.timeMetrics,
            upcomingTasks: data.upcomingTasks,
        })),
}));
