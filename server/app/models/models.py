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


class CreateOrg(BaseOrg):
    pass


class UpdateOrg(BaseOrg):
    pass


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


## Collections ##


class BaseCollection(SQLModel):
    name: str = Field(default=None, index=True)


class DBCollection(BaseCollection):
    id: Optional[int] = Field(default=None, primary_key=True)
    active: bool = Field()


class CreateCollection(BaseCollection):
    pass


class UpdateCollection(BaseCollection):
    pass


class PublicCollection(BaseCollection):
    pass


class CollectionResponse(BaseResponse):
    collections: list[PublicCollection]


## Groups ##


class BaseGroup(SQLModel):
    name: str = Field(default=None, index=True)


class DBGroup(BaseGroup):
    id: Optional[int] = Field(default=None, primary_key=True)
    collection_id: Optional[int] = Field(default=None, foreign_key="dbcollection.id")
    active: bool = Field()


class CreateGroup(BaseGroup):
    pass


class UpdateGroup(BaseGroup):
    collection_id: int


class PublicGroup(BaseGroup):
    id: int
    collection_id: int


class GroupResponse(BaseResponse):
    collections: list[PublicGroup]


## Resources ##


class BaseResource(SQLModel):
    name: str = Field(default=None, index=True)


class DBResource(BaseResource):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: Optional[int] = Field(default=None, foreign_key="dbgroup.id")
    active: bool = Field()


class CreateResource(BaseResource):
    pass


class UpdateResource(BaseResource):
    group_id: int


class PublicResource(BaseResource):
    id: int
    group_id: int


class ResourceResponse(BaseResponse):
    collections: list[PublicResource]
