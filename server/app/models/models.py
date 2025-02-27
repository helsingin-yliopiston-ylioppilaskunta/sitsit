# from sqlalchemy import Column, Integer, String
from sqlmodel import Field, SQLModel
from pydantic import BaseModel

from typing import Optional


class BaseResponse(BaseModel):
    status: bool
    more_available: bool


## Organizations ##


class BaseOrg(SQLModel):
    name: str = Field(default=None, index=True)


class DBOrg(BaseOrg, table=True):
    id: int = Field(default=None, primary_key=True)
    active: bool = Field(default=True)


class PublicOrg(BaseOrg):
    id: int
    name: str
    active: bool


class OrgResponse(BaseResponse):
    orgs: list[PublicOrg]


## Users ##


class BaseUser(SQLModel):
    username: str = Field(default=None, index=True)


class DBUser(BaseUser, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hash: str = Field(default=None)
    active: bool = Field(default=True)
    org_id: Optional[int] = Field(default=None, foreign_key="dborg.id")


class CreateUser(BaseUser):
    hash: str


class UpdateUser(BaseUser):
    id: int
    hash: str
    organization_id: int | None


class PublicUser(BaseUser):
    id: int
    active: bool


class UserResponse(BaseResponse):
    users: list[PublicUser]
