'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import TaskItem from '@/components/user/shared-authenticated/TaskItem';
import { PriorityLevel, Task, LearningCategory, useProgressStore } from '@/lib/store/useProgressStore';

type FilterOptions = 'all' | LearningCategory | PriorityLevel;

export default function TasksCard() {
    const { upcomingTasks, completeTask } = useProgressStore();
    const [filter, setFilter] = useState<FilterOptions>('all');

    // Filter tasks based on the selected filter
    const filteredTasks = upcomingTasks.filter((task: Task) => {
        if (filter === 'all') return true;
        if (filter === 'high' || filter === 'medium' || filter === 'low') {
            return task.priority === filter;
        }
        return task.category === filter;
    });

    return (
        <Card title="Upcoming Tasks" className="h-full">
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`text-xs px-3 py-1 rounded-full ${filter === 'all'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('high')}
                    className={`text-xs px-3 py-1 rounded-full ${filter === 'high'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    High Priority
                </button>
                <button
                    onClick={() => setFilter('medium')}
                    className={`text-xs px-3 py-1 rounded-full ${filter === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Medium Priority
                </button>
                <button
                    onClick={() => setFilter('low')}
                    className={`text-xs px-3 py-1 rounded-full ${filter === 'low'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Low Priority
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task: Task) => (
                        <TaskItem
                            key={task.id}
                            id={task.id}
                            title={task.title}
                            dueDate={task.dueDate}
                            priority={task.priority}
                            completed={task.completed}
                            onToggleComplete={completeTask}
                        />
                    ))
                ) : (
                    <div className="py-6 text-center text-gray-500">
                        <p>No tasks found for the selected filter.</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-500">
                    {filteredTasks.filter((t: Task) => t.completed).length} of {filteredTasks.length} tasks completed
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Add New Task
                </button>
            </div>
        </Card>
    );
}
