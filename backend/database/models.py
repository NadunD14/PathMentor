"""
Database models for PathMentor backend using Pydantic and SQLAlchemy-like classes.
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


# Database Models (SQLAlchemy-like for Supabase)
class UserProfile(BaseModel):
    """User profile model for storing user information and learning preferences."""
    id: Optional[str] = None
    goal: str = Field(..., description="User's learning goal or objective")
    experience_level: ExperienceLevel = Field(..., description="User's current experience level")
    learning_style: LearningStyle = Field(..., description="User's preferred learning style")
    created_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


class GeneratedPath(BaseModel):
    """Model for storing generated learning paths."""
    id: Optional[str] = None
    user_id: str = Field(..., description="Foreign key to user profile")
    path_data: Dict[str, Any] = Field(..., description="JSON data containing the learning path")
    created_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


class UserFeedback(BaseModel):
    """Model for storing user feedback on learning resources."""
    id: Optional[str] = None
    path_id: str = Field(..., description="Foreign key to generated path")
    resource_id: str = Field(..., description="ID of the specific resource")
    interaction_type: InteractionType = Field(..., description="Type of user interaction")
    rating: Optional[int] = Field(None, ge=1, le=5, description="User rating (1-5 stars)")
    timestamp: Optional[datetime] = None
    
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
    """Request model for submitting user feedback."""
    path_id: str
    resource_id: str
    interaction_type: InteractionType
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, description="Optional user comment")
    
    class Config:
        use_enum_values = True


class FeedbackResponse(BaseModel):
    """Response model for feedback submission."""
    success: bool
    message: str
    feedback_id: Optional[str] = None
