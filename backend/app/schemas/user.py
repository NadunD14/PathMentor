from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    email: EmailStr
    password: str
    name: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str
