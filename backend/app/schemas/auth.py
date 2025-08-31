from pydantic import BaseModel, EmailStr
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None
