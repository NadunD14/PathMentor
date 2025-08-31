'use client';

import Card from '@/components/user/shared-authenticated/Card';
import { useProgressStore, Task } from '@/lib/store/useProgressStore';

export default function UpcomingTasksCard() {
    const { upcomingTasks, completeTask } = useProgressStore();

    // Get only the first 3 uncompleted tasks
    const tasks = upcomingTasks
        .filter((task: Task) => !task.completed)
        .slice(0, 3);

    // Format date to show "Today", "Tomorrow", or the date
    const formatDueDate = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (dueDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">High</span>;
            case 'medium':
                return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
            case 'low':
                return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Low</span>;
            default:
                return null;
        }
    };

    return (
        <Card title="Upcoming Tasks">
            {tasks.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {tasks.map((task: Task) => (
                        <div key={task.id} className="py-3 flex items-center">
                            <input
                                type="checkbox"
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onChange={() => completeTask(task.id)}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
                            />
                            <div className="flex-1 min-w-0">
                                <label htmlFor={`task-${task.id}`} className="font-medium text-gray-800 cursor-pointer">
                                    {task.title}
                                </label>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-gray-500">Due: {formatDueDate(task.dueDate)}</span>
                                    <span className="mx-2">•</span>
                                    {getPriorityBadge(task.priority)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-6 text-center text-gray-500">
                    <p>No upcoming tasks.</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                        Create a new task
                    </button>
                </div>
            )}

            {tasks.length > 0 && (
                <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All Tasks
                    </button>
                </div>
            )}
        </Card>
    );
}
