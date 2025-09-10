from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class LearningStyle(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    HANDS_ON = "hands_on"
    READING = "reading"


class LearningGoal(str, Enum):
    SKILL_BUILDING = "skill_building"
    CAREER_CHANGE = "career_change"
    CERTIFICATION = "certification"
    HOBBY = "hobby"
    ACADEMIC = "academic"


class UserLearningProfile(BaseModel):
    goal: LearningGoal
    experience_level: ExperienceLevel
    topic: str = Field(..., description="The subject or technology to learn")
    learning_style: LearningStyle
    time_commitment: Optional[int] = Field(None, description="Hours per week")
    preferred_duration: Optional[str] = Field(None, description="Total course duration preference")
    user_id: Optional[str] = None


class LearningResource(BaseModel):
    title: str
    description: str
    url: str
    source: str  # youtube, udemy, reddit, etc.
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    rating: Optional[float] = None
    thumbnail: Optional[str] = None
    author: Optional[str] = None
    view_count: Optional[int] = None
    published_date: Optional[str] = None
    tags: List[str] = []


class LearningPathStep(BaseModel):
    step_number: int
    title: str
    description: str
    estimated_duration: str
    resources: List[LearningResource]
    prerequisites: List[str] = []
    learning_objectives: List[str] = []


class LearningPath(BaseModel):
    path_id: str
    user_profile: UserLearningProfile
    title: str
    description: str
    total_duration: str
    difficulty_level: str
    steps: List[LearningPathStep]
    created_at: str
    tags: List[str] = []


class LearningPathRequest(BaseModel):
    user_profile: UserLearningProfile


class LearningPathResponse(BaseModel):
    success: bool
    learning_path: Optional[LearningPath] = None
    message: str
    path_id: Optional[str] = None


class SearchQuery(BaseModel):
    query: str
    source: str
    difficulty: str
    content_type: str = "all"  # video, course, tutorial, etc.


class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str
    error: Optional[str] = None
