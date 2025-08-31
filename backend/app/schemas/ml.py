from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class RecommendationRequest(BaseModel):
    user_id: int
    learning_goals: Optional[List[str]] = []
    current_skill_level: Optional[str] = "beginner"
    preferred_difficulty: Optional[str] = "medium"


class RecommendationResponse(BaseModel):
    category_id: int
    category_name: str
    confidence_score: float
    reason: str
    estimated_time: Optional[int] = None  # in minutes


class ProgressAnalysis(BaseModel):
    user_id: int
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    learning_velocity: Optional[float] = None
    completion_prediction: Optional[int] = None  # days to complete current path


class EmbeddingRequest(BaseModel):
    text: str
    model: Optional[str] = "default"


class EmbeddingResponse(BaseModel):
    embeddings: List[float]
    dimension: int
    model_used: str


class UserAnswer(BaseModel):
    answer_id: Optional[int] = None
    question_id: int
    answer_text: Optional[str] = None
    option_id: Optional[int] = None
    category_id: Optional[int] = None
    created_at: Optional[str] = None
    general_questions: Optional[Dict[str, Any]] = None
    question_options: Optional[Dict[str, Any]] = None


class UserCategory(BaseModel):
    selection_id: Optional[int] = None
    category_id: int
    created_at: Optional[str] = None
    categories: Optional[Dict[str, Any]] = None


class CompleteSetupRequest(BaseModel):
    user_id: str
    answers: List[UserAnswer]
    selected_categories: List[UserCategory]
    timestamp: str


class CompleteSetupResponse(BaseModel):
    success: bool
    user_id: str
    analysis: ProgressAnalysis
    recommendations: List[RecommendationResponse]
    learning_path_created: bool
    message: str
