from sqlmodel import SQLModel, Field
from typing import Optional


class BaseGroup(SQLModel):
    name: str = Field(default=None, index=True)


class DBGroup(BaseGroup, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    collection_id: Optional[int] = Field(default=None, foreign_key="dbcollection.id")
    active: bool = Field(default=True)


class CreateGroup(BaseGroup):
    collection_id: int


class UpdateGroup(BaseGroup):
    collection_id: int


class PublicGroup(BaseGroup):
    id: int
    collection_id: int
