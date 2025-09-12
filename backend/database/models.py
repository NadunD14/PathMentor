"""
Database models for PathMentor backend using Pydantic and SQLAlchemy-like classes.
Updated to match the existing Supabase schema.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


# Enums for better type safety
class LearningStyle(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING_WRITING = "reading_writing"
    MULTIMODAL = "multimodal"


class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class InteractionType(str, Enum):
    COMPLETED = "completed"
    SKIPPED = "skipped"
    BOOKMARKED = "bookmarked"
    STARTED = "started"
    LIKED = "liked"
    DISLIKED = "disliked"


class Platform(str, Enum):
    YOUTUBE = "youtube"
    UDEMY = "udemy"
    COURSERA = "coursera"
    REDDIT = "reddit"
    GITHUB = "github"
    MEDIUM = "medium"


class TaskStatus(str, Enum):
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class PathStatus(str, Enum):
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    PAUSED = "paused"
    ARCHIVED = "archived"


# Database Models matching Supabase schema
class User(BaseModel):
    """User model matching the users table."""
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = "user"
    created_at: Optional[datetime] = None


class Category(BaseModel):
    """Category model matching the categories table."""
    category_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None


class GeneralQuestion(BaseModel):
    """General question model matching the general_questions table."""
    question_id: Optional[int] = None
    question: str
    question_type: str
    context_for_ai: Optional[str] = None
    created_at: Optional[datetime] = None


class QuestionOption(BaseModel):
    """Question option model matching the question_options table."""
    option_id: Optional[int] = None
    question_id: int
    option_text: str
    created_at: Optional[datetime] = None


class UserAnswer(BaseModel):
    """User answer model matching the user_answers table."""
    answer_id: Optional[int] = None
    user_id: str
    question_id: int
    category_id: Optional[int] = None
    answer_text: Optional[str] = None
    option_id: Optional[int] = None
    created_at: Optional[datetime] = None


class UserLearningStyle(BaseModel):
    """User learning style model matching the user_learning_styles table."""
    style_id: Optional[int] = None
    user_id: str
    learning_style: str
    preference_level: Optional[int] = Field(None, ge=1, le=5)
    created_at: Optional[datetime] = None


class Path(BaseModel):
    """Learning path model matching the paths table."""
    path_id: Optional[int] = None
    user_id: str
    category_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: Optional[str] = "in-progress"
    ai_generated: Optional[bool] = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Task(BaseModel):
    """Task model matching the tasks table."""
    task_id: Optional[int] = None
    path_id: int
    title: str
    description: Optional[str] = None
    task_type: str
    resource_url: str
    source_platform: str
    estimated_duration_min: Optional[int] = None
    status: Optional[str] = "not-started"
    task_order: int
    created_at: Optional[datetime] = None


class UserTaskFeedback(BaseModel):
    """User task feedback model matching the user_task_feedback table."""
    feedback_id: Optional[int] = None
    user_id: str
    task_id: int
    feedback_type: str
    rating: Optional[int] = Field(None, ge=1, le=5)
    time_spent_sec: Optional[int] = None
    comments: Optional[str] = None
    created_at: Optional[datetime] = None


class AIModelLog(BaseModel):
    """AI model log matching the ai_model_logs table."""
    log_id: Optional[int] = None
    user_id: Optional[str] = None
    input_prompt: Optional[str] = None
    output_response: Optional[str] = None
    model_name: Optional[str] = None
    endpoint: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        protected_namespaces = ()


# API Models for the backend service (original models for path generation)
class UserProfile(BaseModel):
    """User profile model for the path generation API."""
    id: Optional[str] = None
    goal: str = Field(..., description="User's learning goal or objective")
    experience_level: ExperienceLevel = Field(..., description="User's current experience level")
    learning_style: LearningStyle = Field(..., description="User's preferred learning style")
    created_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


class Resource(BaseModel):
    """Model for representing a learning resource."""
    id: str = Field(..., description="Unique identifier for the resource")
    title: str = Field(..., description="Title of the resource")
    description: Optional[str] = Field(None, description="Description of the resource")
    url: str = Field(..., description="URL to access the resource")
    platform: Platform = Field(..., description="Platform where the resource is hosted")
    duration: Optional[str] = Field(None, description="Estimated duration (e.g., '30 minutes', '2 hours')")
    difficulty: Optional[ExperienceLevel] = Field(None, description="Difficulty level of the resource")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Average rating of the resource")
    tags: Optional[List[str]] = Field(None, description="Tags or categories for the resource")
    
    class Config:
        use_enum_values = True


class PathStep(BaseModel):
    """Model for representing a single step in a learning path."""
    step_number: int = Field(..., description="Order of this step in the path")
    title: str = Field(..., description="Title of this learning step")
    description: str = Field(..., description="Description of what the user will learn")
    resources: List[Resource] = Field(..., description="List of resources for this step")
    estimated_duration: str = Field(..., description="Estimated time to complete this step")
    prerequisites: Optional[List[str]] = Field(None, description="Prerequisites for this step")
    learning_objectives: List[str] = Field(..., description="What the user should achieve in this step")
    
    class Config:
        use_enum_values = True


class LearningPath(BaseModel):
    """Model for representing a complete learning path."""
    id: Optional[str] = None
    title: str = Field(..., description="Title of the learning path")
    description: str = Field(..., description="Overview of the learning path")
    total_duration: str = Field(..., description="Total estimated duration")
    difficulty: ExperienceLevel = Field(..., description="Overall difficulty level")
    steps: List[PathStep] = Field(..., description="Ordered list of learning steps")
    created_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


# API Request/Response Models
class GeneratePathRequest(BaseModel):
    """Request model for the generate_path endpoint."""
    user_profile: UserProfile
    topic: str = Field(..., description="The topic or subject to learn")
    duration_preference: Optional[str] = Field(None, description="Preferred duration (e.g., '2 weeks', '1 month')")
    platform_preferences: Optional[List[Platform]] = Field(None, description="Preferred learning platforms")
    
    class Config:
        use_enum_values = True


class GeneratePathResponse(BaseModel):
    """Response model for the generate_path endpoint."""
    success: bool = Field(..., description="Whether the path generation was successful")
    learning_path: Optional[LearningPath] = Field(None, description="Generated learning path")
    message: Optional[str] = Field(None, description="Success or error message")
    path_id: Optional[str] = Field(None, description="ID of the saved path in database")
    
    class Config:
        use_enum_values = True


# Additional models for internal service communication
class PlatformRecommendation(BaseModel):
    """Model for platform recommendations from RL service."""
    platform: Platform
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence score for recommendation")
    reasoning: Optional[str] = Field(None, description="Explanation for the recommendation")
    
    class Config:
        use_enum_values = True


class SearchQuery(BaseModel):
    """Model for search queries generated by LLM service."""
    platform: Platform
    query: str = Field(..., description="Search query string")
    priority: int = Field(..., ge=1, description="Priority of this query (1 = highest)")
    
    class Config:
        use_enum_values = True


class FeedbackRequest(BaseModel):
    """Request model for submitting user task feedback (matches user_task_feedback schema)."""
    user_id: str = Field(..., description="ID of the user giving feedback")
    task_id: int = Field(..., description="ID of the task the feedback is for")
    feedback_type: Optional[str] = Field(None, description="Type of feedback (e.g., completion, helpful, etc.)")
    rating: Optional[int] = Field(None, ge=1, le=5)
    time_spent_sec: Optional[int] = Field(None, ge=0, description="Time spent in seconds")
    comments: Optional[str] = Field(None, description="Additional comments")


class FeedbackResponse(BaseModel):
    """Response model for feedback submission."""
    success: bool
    message: str
    feedback_id: Optional[str] = None
