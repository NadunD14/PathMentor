from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.category import Category, CategoryCreate

router = APIRouter()


@router.get("/", response_model=List[Category])
async def get_categories():
    """Get all categories"""
    # TODO: Implement get categories logic
    return []


@router.get("/{category_id}", response_model=Category)
async def get_category(category_id: int):
    """Get a specific category by ID"""
    # TODO: Implement get category logic
    return {"id": category_id, "name": "Sample Category", "description": "Description"}


@router.post("/", response_model=Category)
async def create_category(category: CategoryCreate):
    """Create a new category"""
    # TODO: Implement create category logic
    return {"id": 1, "name": category.name, "description": category.description}
