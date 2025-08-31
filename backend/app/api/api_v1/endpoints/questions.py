from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.schemas.question import Question, QuestionCreate, QuestionResponse

router = APIRouter()


@router.get("/", response_model=List[Question])
async def get_questions(
    category_id: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    skip: int = Query(0, ge=0)
):
    """Get questions with optional filtering"""
    # TODO: Implement get questions logic
    return []


@router.get("/{question_id}", response_model=Question)
async def get_question(question_id: int):
    """Get a specific question by ID"""
    # TODO: Implement get question logic
    return {"id": question_id, "text": "Sample question", "category_id": 1}


@router.post("/", response_model=Question)
async def create_question(question: QuestionCreate):
    """Create a new question"""
    # TODO: Implement create question logic
    return {"id": 1, "text": question.text, "category_id": question.category_id}


@router.get("/category/{category_id}", response_model=List[Question])
async def get_questions_by_category(category_id: int):
    """Get questions by category"""
    # TODO: Implement get questions by category logic
    return []
