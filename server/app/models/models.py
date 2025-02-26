# from sqlalchemy import Column, Integer, String
from typing import Optional
from sqlmodel import SQLModel, Field


class UserBase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class User(UserBase):
    id: int
    name: str


class PublicUser(UserBase):
    name: str
