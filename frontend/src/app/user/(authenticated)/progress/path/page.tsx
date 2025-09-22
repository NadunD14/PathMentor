"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/user/shared/PageHeader";
import { getSession } from "@/lib/auth";
import { PathService } from "@/lib/services/pathService";
import { TaskService } from "@/lib/services/taskService";
import { FeedbackService } from "@/lib/services/feedbackService";

interface TaskItem {
  task_id: number;
  title: string | null;
  description: string | null;
  resource_url: string | null;
  status: string | null; // e.g., pending, in_progress, completed
  task_order: number | null;
}

export default function UserPathPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathIdParam = searchParams?.get('pathId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pathId, setPathId] = useState<number | null>(null);
  const [pathInfo, setPathInfo] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          router.push("/user/login");
          return;
        }
        setUserId(session.user.id);

        let targetPathId: number;

        // If pathId is provided in URL, use that specific path
        if (pathIdParam) {
          targetPathId = parseInt(pathIdParam, 10);
          if (isNaN(targetPathId)) {
            setError("Invalid path ID provided.");
            return;
          }

          // Get the specific path by ID
          const pathData = await PathService.getPathById(targetPathId);
          if (!pathData) {
            setError("Path not found or you don't have access to it.");
            return;
          }
          setPathInfo(pathData);
          setPathId(targetPathId);
        } else {
          // Load latest path for the user (fallback behavior)
          const paths = await PathService.getUserPaths(session.user.id);
          if (!paths || paths.length === 0) {
            setError("No learning path found. Complete the questionnaire to create one.");
            return;
          }
          const latest = paths[0];
          setPathInfo(latest);
          targetPathId = latest.path_id as number;
          setPathId(targetPathId);
        }

        const taskList = await TaskService.getTasksByPath(targetPathId);
        setTasks((taskList as TaskItem[]).sort((a, b) => (a.task_order ?? 0) - (b.task_order ?? 0)));
      } catch (e) {
        console.error(e);
        setError("Failed to load your path");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, pathIdParam]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.status === "completed").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const toggleComplete = async (task: TaskItem) => {
    if (!task.task_id) return;
    const newStatus = task.status === "completed" ? "pending" : "completed";
    // optimistic update
    setTasks((prev) => prev.map((t) => (t.task_id === task.task_id ? { ...t, status: newStatus } : t)));
    const ok = await TaskService.updateTaskStatus(task.task_id, newStatus);
    if (!ok) {
      // revert
      setTasks((prev) => prev.map((t) => (t.task_id === task.task_id ? { ...t, status: task.status } : t)));
    }
  };

  const submitFeedback = async (taskId: number) => {
    if (!userId) return;
    const text = (feedbackDraft[taskId] || "").trim();
    if (!text) return;
    try {
      setSubmitting(taskId);
      await FeedbackService.submitTaskFeedback({
        user_id: userId,
        task_id: taskId,
        feedback_text: text,
      } as any);
      setFeedbackDraft((prev) => ({ ...prev, [taskId]: "" }));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-6 sm:py-8">
        <PageHeader title="Your Path" subtitle="Loading your tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-6 sm:py-8">
        <PageHeader title="Your Path" subtitle="" />
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 sm:py-8">
      <PageHeader
        title={pathInfo?.category?.name ? `${pathInfo.category.name} Learning Path` : "Your Learning Path"}
        subtitle="Work through tasks and track your progress"
      />

      {/* Path Info */}
      {pathInfo && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{pathInfo.path_name || pathInfo.category?.name}</h3>
              {pathInfo.description && (
                <p className="mt-1 text-sm text-gray-600">{pathInfo.description}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>Created: {new Date(pathInfo.created_at).toLocaleDateString()}</span>
                {pathInfo.category?.name && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {pathInfo.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mt-6 rounded-2xl glass-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{progress}% complete</p>
          </div>
          <div className="w-40 h-3 rounded-full bg-gray-200/50 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <div key={task.task_id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{task.title || `Task #${task.task_id}`}</h3>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                )}
                {task.resource_url && (
                  <a
                    href={task.resource_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                  >
                    Open resource
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-7 7a1 1 0 01-.707.293H7a1 1 0 010-2h2.586l7-7-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      <path d="M5 10a1 1 0 011-1h3a1 1 0 110 2H6a1 1 0 01-1-1z" />
                    </svg>
                  </a>
                )}
              </div>
              <button
                onClick={() => toggleComplete(task)}
                className={`inline-flex items-center self-start rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${task.status === "completed"
                  ? "bg-gradient-to-r from-emerald-400/20 to-green-500/30 backdrop-blur-sm border border-emerald-300/50 text-emerald-800 hover:from-emerald-500/30 hover:to-green-600/40 shadow-lg"
                  : "glass-card hover:glass-card-blue text-gray-700 hover:text-blue-800"
                  }`}
              >
                {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
              </button>
            </div>

            {/* Feedback */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900">Feedback</label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <textarea
                  rows={2}
                  placeholder="Share your thoughts or difficulties with this task..."
                  className="flex-1 rounded-xl border border-gray-200 p-3 text-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={feedbackDraft[task.task_id] || ""}
                  onChange={(e) => setFeedbackDraft((prev) => ({ ...prev, [task.task_id]: e.target.value }))}
                />
                <button
                  onClick={() => submitFeedback(task.task_id)}
                  disabled={submitting === task.task_id}
                  className={`self-start rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${submitting === task.task_id
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "btn-primary"
                    }`}
                >
                  {submitting === task.task_id ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">No tasks found for this path.</div>
        )}
      </div>
    </div>
  );
}
