from sqlmodel import SQLModel, Field
from typing import Optional


class BaseCollection(SQLModel):
    name: str = Field(default=None, index=True)


class DBCollection(BaseCollection, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    active: bool = Field(default=True)


class CreateCollection(BaseCollection):
    pass


class UpdateCollection(BaseCollection):
    pass


class PublicCollection(BaseCollection):
    id: int
