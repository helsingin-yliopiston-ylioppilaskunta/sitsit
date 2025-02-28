from __future__ import annotations

from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import DBUser


class BaseOrg(SQLModel):
    name: str = Field(default=None, index=True)


class DBOrg(BaseOrg, table=True):
    id: int = Field(default=None, primary_key=True)
    active: bool = Field(default=True)
    users: list["DBUser"] = Relationship(back_populates="org")


class CreateOrg(BaseOrg):
    pass


class UpdateOrg(BaseOrg):
    pass


class PublicOrg(BaseOrg):
    id: int
    name: str


class PublicOrgWithUsers(BaseOrg):
    id: int
    name: str
    users: list["DBUser"]
