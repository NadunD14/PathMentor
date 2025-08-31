from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuestionBase(BaseModel):
    text: str
    category_id: int
    difficulty: Optional[str] = "medium"
    explanation: Optional[str] = None


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(QuestionBase):
    text: Optional[str] = None
    category_id: Optional[int] = None


class QuestionInDBBase(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class Question(QuestionInDBBase):
    pass


class QuestionResponse(QuestionInDBBase):
    user_answer: Optional[str] = None
    is_correct: Optional[bool] = None
