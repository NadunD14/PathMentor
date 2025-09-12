import { supabase } from '../../supabase-client';
import { PathService } from './pathService';
import { Database } from '../types/database';

// Local shapes matching the Progress store needs
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface CategoryProgress {
    category: string; // dynamic from DB categories.name
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

export interface TaskItem {
    id: string;
    title: string;
    category: string;
    dueDate: string; // ISO date string
    priority: PriorityLevel;
    completed: boolean;
}

export interface ProgressData {
    categories: CategoryProgress[];
    timeMetrics: TimeMetrics;
    upcomingTasks: TaskItem[];
}

type TaskRow = Database['public']['Tables']['tasks']['Row'];

function derivePriority(estimatedMin: number | null): PriorityLevel {
    if (!estimatedMin || estimatedMin < 60) return 'low';
    if (estimatedMin < 120) return 'medium';
    return 'high';
}

function toISODateOrToday(dateStr: string | null): string {
    try {
        if (dateStr) return new Date(dateStr).toISOString();
    } catch { }
    return new Date().toISOString();
}

export class ProgressService {
    static async getProgressData(): Promise<ProgressData> {
        // 1) Resolve current auth user
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;
        if (!authUser) {
            return {
                categories: [],
                timeMetrics: { weeklyHours: 0, totalHours: 0 },
                upcomingTasks: [],
            };
        }

        const userId = authUser.id;

        // 2) Get all paths for the user (with tasks and category join)
        const paths = await PathService.getUserPaths(userId);

        // Build helper maps
        const taskById = new Map<number, TaskRow>();
        const taskCategoryById = new Map<number, string>();

        for (const p of paths) {
            const categoryName = p.category?.name ?? 'Uncategorized';
            for (const t of p.tasks) {
                taskById.set(t.task_id, t);
                taskCategoryById.set(t.task_id, categoryName);
            }
        }

        // 3) Attempt to fetch user feedback (for time spent)
        const { data: feedback, error: feedbackErr } = await supabase
            .from('user_task_feedback')
            .select('task_id, time_spent_sec, created_at')
            .eq('user_id', userId);

        // Sum total and weekly time from feedback if available
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        let totalSeconds = 0;
        let weeklySeconds = 0;
        const timeSpentByCategory = new Map<string, number>(); // minutes

        if (!feedbackErr && feedback) {
            for (const f of feedback) {
                const seconds = f.time_spent_sec ?? 0;
                totalSeconds += seconds;
                const createdAt = f.created_at ? new Date(f.created_at) : null;
                if (createdAt && createdAt >= sevenDaysAgo) {
                    weeklySeconds += seconds;
                }
                const categoryName = taskCategoryById.get(f.task_id) ?? 'Uncategorized';
                timeSpentByCategory.set(
                    categoryName,
                    (timeSpentByCategory.get(categoryName) ?? 0) + Math.round(seconds / 60)
                );
            }
        }

        // 4) Build categories summary
        // Group tasks by category via paths
        const categoriesMap = new Map<string, { name: string; total: number; done: number; timeSpent: number }>();
        for (const p of paths) {
            const name = p.category?.name ?? 'Uncategorized';
            const key = name;
            if (!categoriesMap.has(key)) {
                categoriesMap.set(key, { name, total: 0, done: 0, timeSpent: 0 });
            }
            const entry = categoriesMap.get(key)!;
            const tasks = p.tasks ?? [];
            entry.total += tasks.length;
            entry.done += tasks.filter((t) => (t.status ?? '').toLowerCase() === 'completed').length;

            // If we don't have feedback time, estimate from completed tasks' estimated time
            if (feedbackErr || !feedback || feedback.length === 0) {
                entry.timeSpent += tasks
                    .filter((t) => (t.status ?? '').toLowerCase() === 'completed')
                    .reduce((acc, t) => acc + (t.estimated_duration_min ?? 0), 0);
            }
        }

        // If we had feedback time, prefer that per category
        if (!feedbackErr && feedback && feedback.length > 0) {
            for (const [cat, minutes] of timeSpentByCategory) {
                const entry = categoriesMap.get(cat) ?? { name: cat, total: 0, done: 0, timeSpent: 0 };
                entry.timeSpent = minutes;
                categoriesMap.set(cat, entry);
            }
        }

        const categories: CategoryProgress[] = Array.from(categoriesMap.values()).map((c) => ({
            category: c.name,
            name: c.name,
            completionPercentage: c.total > 0 ? Math.round((c.done / c.total) * 100) : 0,
            lessonsDone: c.done,
            totalLessons: c.total,
            timeSpent: c.timeSpent,
        }));

        // 5) Upcoming tasks (not completed), sorted by path/task_order
        const upcomingTasks: TaskItem[] = [];
        for (const p of paths) {
            const categoryName = p.category?.name ?? 'Uncategorized';
            const tasks = [...(p.tasks ?? [])].filter((t) => (t.status ?? '').toLowerCase() !== 'completed');
            tasks.sort((a, b) => (a.task_order ?? 0) - (b.task_order ?? 0));
            for (const t of tasks) {
                upcomingTasks.push({
                    id: String(t.task_id),
                    title: t.title,
                    category: categoryName,
                    dueDate: toISODateOrToday(t.created_at), // no due date in schema; fallback to created_at/today
                    priority: derivePriority(t.estimated_duration_min ?? null),
                    completed: (t.status ?? '').toLowerCase() === 'completed',
                });
            }
        }

        // 6) Time metrics: prefer feedback; fallback to estimates
        let totalHours = Math.round(totalSeconds / 360) / 10; // one decimal
        let weeklyHours = Math.round(weeklySeconds / 360) / 10;

        if (totalSeconds === 0) {
            // estimate total from completed tasks estimated_duration_min
            const totalMin = paths.reduce((acc, p) => acc + (p.tasks ?? []).filter(t => (t.status ?? '').toLowerCase() === 'completed').reduce((a, t) => a + (t.estimated_duration_min ?? 0), 0), 0);
            totalHours = Math.round((totalMin / 60) * 10) / 10;
            // rough weekly estimate: 25% of total as placeholder if unknown
            weeklyHours = Math.round(((totalMin / 60) * 0.25) * 10) / 10;
        }

        return {
            categories,
            timeMetrics: { weeklyHours, totalHours },
            upcomingTasks,
        };
    }
}
