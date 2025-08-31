from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnswerBase(BaseModel):
    question_id: int
    content: str
    is_correct: Optional[bool] = None


class AnswerCreate(AnswerBase):
    pass


class AnswerUpdate(AnswerBase):
    content: Optional[str] = None
    is_correct: Optional[bool] = None


class AnswerInDBBase(AnswerBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class Answer(AnswerInDBBase):
    pass
