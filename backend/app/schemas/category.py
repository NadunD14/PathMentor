from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    name: Optional[str] = None


class CategoryInDBBase(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class Category(CategoryInDBBase):
    pass
