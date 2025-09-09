from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class LearningType(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING_WRITING = "reading_writing"
    UNDETERMINED = "undetermined"

class ActivityType(str, Enum):
    MEMORY_CHALLENGE = "memory_challenge"
    PROBLEM_SOLVING = "problem_solving"
    AUDIO_VISUAL = "audio_visual"
    READING_WRITING = "reading_writing"

# Base Activity Result Schema
class BaseActivityResult(BaseModel):
    activity_id: str
    activity_type: ActivityType
    user_id: str
    start_time: datetime
    end_time: datetime
    completion_time: int  # in milliseconds
    timestamp: datetime

# Specific Activity Results
class MemoryChallengeResult(BaseActivityResult):
    activity_type: ActivityType = ActivityType.MEMORY_CHALLENGE
    recall_accuracy: float  # percentage
    response_time: float  # average response time in ms
    engagement_level: float  # 1-10 scale
    correct_answers: int
    total_questions: int
    visual_elements_recalled: int

class ProblemSolvingResult(BaseActivityResult):
    activity_type: ActivityType = ActivityType.PROBLEM_SOLVING
    interaction_count: int
    steps_to_complete: int
    efficiency: float  # calculated metric
    drag_drop_actions: int
    click_actions: int
    task_completed: bool

class AudioVisualResult(BaseActivityResult):
    activity_type: ActivityType = ActivityType.AUDIO_VISUAL
    audio_preference: float  # 1-10 scale
    answer_accuracy: float  # percentage
    time_listening: int  # ms
    time_viewing: int  # ms
    video_muted: bool
    audio_focus_ratio: float  # time_listening / total_time

class ReadingWritingResult(BaseActivityResult):
    activity_type: ActivityType = ActivityType.READING_WRITING
    reading_speed: float  # words per minute
    text_interactions: int  # highlights, notes
    response_accuracy: float  # percentage
    summary_quality: float  # 1-10 scale
    words_written: int
    time_spent_reading: int  # ms

# Learning Type Scores
class LearningTypeScores(BaseModel):
    visual: float = 0.0
    auditory: float = 0.0
    kinesthetic: float = 0.0
    reading_writing: float = 0.0

# User Learning Profile
class UserLearningProfile(BaseModel):
    user_id: str
    primary_learning_type: LearningType
    learning_type_scores: LearningTypeScores
    confidence: float  # 0-1, confidence in classification
    activities_completed: List[ActivityType]
    total_activities: int
    last_updated: datetime
    assessment_complete: bool

class UserLearningProfileCreate(BaseModel):
    user_id: str
    
class UserLearningProfileUpdate(BaseModel):
    primary_learning_type: Optional[LearningType] = None
    learning_type_scores: Optional[LearningTypeScores] = None
    confidence: Optional[float] = None
    activities_completed: Optional[List[ActivityType]] = None
    assessment_complete: Optional[bool] = None

# Activity Config
class ActivityConfig(BaseModel):
    id: str
    type: ActivityType
    title: str
    description: str
    estimated_duration: int  # in minutes
    difficulty: int  # 1-5
    required_for_assessment: bool

# User Behavior Data for ML
class UserBehaviorData(BaseModel):
    user_id: str
    session_id: str
    activity_results: List[Dict[str, Any]]  # Flexible for different activity types
    aggregated_scores: LearningTypeScores
    behavior_patterns: Dict[str, Any]

# ML Prediction Response
class LearningTypePrediction(BaseModel):
    predicted_type: LearningType
    confidence: float
    scores: Dict[str, float]
    
# Personalized Recommendation
class ContentRecommendation(BaseModel):
    id: str
    title: str
    type: str  # 'video', 'article', 'interactive', 'audio'
    difficulty: int
    estimated_time: int
    learning_type_match: float

class PersonalizedRecommendations(BaseModel):
    recommendations: List[ContentRecommendation]

# Tracking Data
class BehaviorTrackingData(BaseModel):
    user_id: str
    session_id: str
    activity_type: ActivityType
    behavior_data: Dict[str, Any]
    timestamp: datetime
