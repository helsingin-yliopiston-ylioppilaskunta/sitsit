from sqlmodel import SQLModel, Field
from typing import Optional


class BaseResource(SQLModel):
    name: str = Field(default=None, index=True)


class DBResource(BaseResource, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: Optional[int] = Field(default=None, foreign_key="dbgroup.id")
    resource_type_id: Optional[int] = Field(
        default=None, foreign_key="dbresourcetype.id"
    )
    active: bool = Field(default=True)


class CreateResource(BaseResource):
    group_id: int
    resource_type_id: int


class UpdateResource(BaseResource):
    group_id: int
    resource_type_id: int


class PublicResource(BaseResource):
    id: int
    group_id: int
    resource_type_id: int
