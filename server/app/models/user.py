from __future__ import annotations

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.org import DBOrg


class BaseUser(SQLModel):
    username: str = Field(default=None, index=True)


class DBUser(BaseUser, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hash: str = Field(default=None)
    active: bool = Field(default=True)
    org_id: Optional[int] = Field(default=None, foreign_key="dborg.id")
    org: "DBOrg" = Relationship(back_populates="users")


class CreateUser(BaseUser):
    hash: str
    org_id: int


class UpdateUser(BaseUser):
    id: int
    hash: str
    organization_id: int | None


class PublicUser(BaseUser):
    id: int
    active: bool
    org_id: Optional[int]


class PublicUserWithOrg(BaseUser):
    id: int
    org: Optional["DBOrg"]
