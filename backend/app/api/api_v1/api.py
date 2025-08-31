from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, users, questions, categories, answers, ml, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(answers.router, prefix="/answers", tags=["answers"])
api_router.include_router(ml.router, prefix="/ml", tags=["machine-learning"])
