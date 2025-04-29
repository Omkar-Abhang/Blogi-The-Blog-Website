from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str

class PostCreate(BaseModel):
    title: str
    content: str
    image: Optional[str] = None

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    image: Optional[str]
    created_at: datetime
    updated_at: datetime
    author: UserOut
    model_config = {
        "from_attributes": True
    }

