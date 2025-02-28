from sqlmodel import SQLModel, Field
from typing import Optional


class BaseResourceType(SQLModel):
    name: str = Field(default=None, index=True)


class DBResourceType(BaseResourceType, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    active: bool = Field(default=True)


class CreateResourceType(BaseResourceType):
    pass


class UpdateResourceType(BaseResourceType):
    pass


class PublicResourceType(BaseResourceType):
    id: int
