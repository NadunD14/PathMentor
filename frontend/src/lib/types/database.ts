// Database types based on Supabase schema
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    user_id: string;
                    name: string | null;
                    email: string | null;
                    role: string | null;
                    created_at: string | null;
                };
                Insert: {
                    user_id: string;
                    name?: string | null;
                    email?: string | null;
                    role?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    user_id?: string;
                    name?: string | null;
                    email?: string | null;
                    role?: string | null;
                    created_at?: string | null;
                };
            };
            categories: {
                Row: {
                    category_id: number;
                    name: string;
                    description: string | null;
                    image_url: string | null;
                    created_at: string | null;
                };
                Insert: {
                    category_id?: number;
                    name: string;
                    description?: string | null;
                    image_url?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    category_id?: number;
                    name?: string;
                    description?: string | null;
                    image_url?: string | null;
                    created_at?: string | null;
                };
            };
            paths: {
                Row: {
                    path_id: number;
                    user_id: string;
                    category_id: number | null;
                    title: string;
                    description: string | null;
                    status: string | null;
                    ai_generated: boolean | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    path_id?: number;
                    user_id: string;
                    category_id?: number | null;
                    title: string;
                    description?: string | null;
                    status?: string | null;
                    ai_generated?: boolean | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    path_id?: number;
                    user_id?: string;
                    category_id?: number | null;
                    title?: string;
                    description?: string | null;
                    status?: string | null;
                    ai_generated?: boolean | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            tasks: {
                Row: {
                    task_id: number;
                    path_id: number;
                    title: string;
                    description: string | null;
                    task_type: string;
                    resource_url: string;
                    source_platform: string;
                    estimated_duration_min: number | null;
                    status: string | null;
                    task_order: number;
                    created_at: string | null;
                    task_link: string | null;
                };
                Insert: {
                    task_id?: number;
                    path_id: number;
                    title: string;
                    description?: string | null;
                    task_type: string;
                    resource_url: string;
                    source_platform: string;
                    estimated_duration_min?: number | null;
                    status?: string | null;
                    task_order: number;
                    created_at?: string | null;
                    task_link?: string | null;
                };
                Update: {
                    task_id?: number;
                    path_id?: number;
                    title?: string;
                    description?: string | null;
                    task_type?: string;
                    resource_url?: string;
                    source_platform?: string;
                    estimated_duration_min?: number | null;
                    status?: string | null;
                    task_order?: number;
                    created_at?: string | null;
                    task_link?: string | null;
                };
            };
            general_questions: {
                Row: {
                    question_id: number;
                    question: string;
                    question_type: string;
                    context_for_ai: string | null;
                    created_at: string | null;
                };
                Insert: {
                    question_id?: number;
                    question: string;
                    question_type: string;
                    context_for_ai?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    question_id?: number;
                    question?: string;
                    question_type?: string;
                    context_for_ai?: string | null;
                    created_at?: string | null;
                };
            };
            question_options: {
                Row: {
                    option_id: number;
                    question_id: number;
                    option_text: string;
                    created_at: string | null;
                };
                Insert: {
                    option_id?: number;
                    question_id: number;
                    option_text: string;
                    created_at?: string | null;
                };
                Update: {
                    option_id?: number;
                    question_id?: number;
                    option_text?: string;
                    created_at?: string | null;
                };
            };
            user_answers: {
                Row: {
                    answer_id: number;
                    user_id: string;
                    question_id: number;
                    category_id: number | null;
                    answer_text: string | null;
                    option_id: number | null;
                    created_at: string | null;
                };
                Insert: {
                    answer_id?: number;
                    user_id: string;
                    question_id: number;
                    category_id?: number | null;
                    answer_text?: string | null;
                    option_id?: number | null;
                    created_at?: string | null;
                };
                Update: {
                    answer_id?: number;
                    user_id?: string;
                    question_id?: number;
                    category_id?: number | null;
                    answer_text?: string | null;
                    option_id?: number | null;
                    created_at?: string | null;
                };
            };
            user_learning_styles: {
                Row: {
                    style_id: number;
                    user_id: string;
                    learning_style: string;
                    preference_level: number | null;
                    created_at: string | null;
                };
                Insert: {
                    style_id?: number;
                    user_id: string;
                    learning_style: string;
                    preference_level?: number | null;
                    created_at?: string | null;
                };
                Update: {
                    style_id?: number;
                    user_id?: string;
                    learning_style?: string;
                    preference_level?: number | null;
                    created_at?: string | null;
                };
            };
            user_task_feedback: {
                Row: {
                    feedback_id: number;
                    user_id: string;
                    task_id: number;
                    feedback_type: string;
                    rating: number | null;
                    time_spent_sec: number | null;
                    comments: string | null;
                    created_at: string | null;
                };
                Insert: {
                    feedback_id?: number;
                    user_id: string;
                    task_id: number;
                    feedback_type: string;
                    rating?: number | null;
                    time_spent_sec?: number | null;
                    comments?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    feedback_id?: number;
                    user_id?: string;
                    task_id?: number;
                    feedback_type?: string;
                    rating?: number | null;
                    time_spent_sec?: number | null;
                    comments?: string | null;
                    created_at?: string | null;
                };
            };
            category_questions: {
                Row: {
                    category_question_id: number;
                    category_id: number;
                    question_id: number | null;
                    question_type: string;
                    context_for_ai: string | null;
                    created_at: string | null;
                };
                Insert: {
                    category_question_id?: number;
                    category_id: number;
                    question_id?: number | null;
                    question_type: string;
                    context_for_ai?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    category_question_id?: number;
                    category_id?: number;
                    question_id?: number | null;
                    question_type?: string;
                    context_for_ai?: string | null;
                    created_at?: string | null;
                };
            };
            category_options: {
                Row: {
                    option_id: number;
                    category_question_id: number;
                    option_text: string;
                    created_at: string | null;
                };
                Insert: {
                    option_id?: number;
                    category_question_id: number;
                    option_text: string;
                    created_at?: string | null;
                };
                Update: {
                    option_id?: number;
                    category_question_id?: number;
                    option_text?: string;
                    created_at?: string | null;
                };
            };
            user_category_answers: {
                Row: {
                    answer_id: number;
                    user_id: string;
                    category_question_id: number;
                    answer_text: string | null;
                    option_id: number | null;
                    created_at: string | null;
                };
                Insert: {
                    answer_id?: number;
                    user_id: string;
                    category_question_id: number;
                    answer_text?: string | null;
                    option_id?: number | null;
                    created_at?: string | null;
                };
                Update: {
                    answer_id?: number;
                    user_id?: string;
                    category_question_id?: number;
                    answer_text?: string | null;
                    option_id?: number | null;
                    created_at?: string | null;
                };
            };
            user_category_selections: {
                Row: {
                    selection_id: number;
                    user_id: string;
                    category_id: number;
                    created_at: string | null;
                };
                Insert: {
                    selection_id?: number;
                    user_id: string;
                    category_id: number;
                    created_at?: string | null;
                };
                Update: {
                    selection_id?: number;
                    user_id?: string;
                    category_id?: number;
                    created_at?: string | null;
                };
            };
            community_post: {
                Row: {
                    post_id: number;
                    user_id: string;
                    title: string;
                    content: string;
                    category: string;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    post_id?: number;
                    user_id: string;
                    title: string;
                    content: string;
                    category: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    post_id?: number;
                    user_id?: string;
                    title?: string;
                    content?: string;
                    category?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            ai_model_logs: {
                Row: {
                    log_id: number;
                    user_id: string | null;
                    input_prompt: string | null;
                    output_response: string | null;
                    model_name: string | null;
                    endpoint: string | null;
                    created_at: string | null;
                };
                Insert: {
                    log_id?: number;
                    user_id?: string | null;
                    input_prompt?: string | null;
                    output_response?: string | null;
                    model_name?: string | null;
                    endpoint?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    log_id?: number;
                    user_id?: string | null;
                    input_prompt?: string | null;
                    output_response?: string | null;
                    model_name?: string | null;
                    endpoint?: string | null;
                    created_at?: string | null;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
