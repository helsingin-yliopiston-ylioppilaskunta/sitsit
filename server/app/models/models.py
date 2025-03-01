# from sqlalchemy import Column, Integer, String
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, DateTime, func
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional


class Response[T](BaseModel):
    status: bool
    more_available: bool
    items: list[T]


class BaseResponse(BaseModel):
    status: bool
    more_available: bool


## Organizations ##


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
    name: str
    users: list["PublicUser"]


class OrgResponse(BaseResponse):
    organizations: list[PublicOrg | PublicOrgWithUsers]


## Users ##


class BaseUser(SQLModel):
    username: str = Field(default=None, index=True)


class DBUser(BaseUser, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hash: str = Field(default=None)
    active: bool = Field(default=True)
    org_id: Optional[int] = Field(default=None, foreign_key="dborg.id")
    org: DBOrg = Relationship(back_populates="users")


class CreateUser(BaseUser):
    hash: str
    org_id: int


class UpdateUser(BaseUser):
    hash: str
    org_id: int | None


class PublicUser(BaseUser):
    id: int
    org_id: Optional[int]


class PublicUserWithOrg(BaseUser):
    id: int
    org: PublicOrg | None


class UserResponse(BaseResponse):
    users: list[PublicUser | PublicUserWithOrg]


## Collections ##


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


class CollectionResponse(BaseResponse):
    collections: list[PublicCollection]


## Groups ##


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


class GroupResponse(BaseResponse):
    groups: list[PublicGroup]


## ResourceTypes ##


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


class ResourceTypeResponse(BaseResponse):
    resourceTypes: list[PublicResourceType]


## Resources ##


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


class ResourceResponse(BaseResponse):
    resources: list[PublicResource]


## Reservations ##


class BaseReservation(SQLModel):
    name: str = Field(default=None)


class DBReservation(BaseReservation, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="dbuser.id")
    contact_info: Optional[str] = Field()
    description: Optional[str] = Field()
    active: bool = Field(default=True)


class CreateReservation(BaseReservation):
    user_id: int
    contact_info: Optional[str]
    description: Optional[str]


class UpdateReservation(BaseReservation):
    user_id: int
    contact_info: Optional[str]
    description: Optional[str]


class PublicReservation(BaseReservation):
    id: int
    user_id: int
    contact_info: Optional[str]
    description: Optional[str]


class ReservationResponse(BaseResponse):
    reservations: list[PublicReservation]


## ReservationInfo ##


class BaseReservationInfo(SQLModel):
    reservation_id: int = Field(
        default=None, index=True, foreign_key="dbreservation.id"
    )


class DBReservationInfo(BaseReservationInfo, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    reserver: Optional[str] = Field(index=True)
    contact: Optional[str] = Field()
    participants: Optional[int] = Field(default=0)
    description: Optional[str] = Field()
    notes: Optional[str] = Field()
    active: bool = Field(default=True)


class CreateReservationInfo(BaseReservationInfo):
    reservation_id: int
    reserver: Optional[str]
    contact: Optional[str]
    participants: Optional[str]
    description: Optional[str]
    notes: Optional[str]


class UpdateReservationInfo(BaseReservationInfo):
    reserver: Optional[str]
    contact: Optional[str]
    participants: Optional[str]
    description: Optional[str]
    notes: Optional[str]


class PublicReservationInfo(BaseReservationInfo):
    id: int


class PrivateReservationInfo(BaseReservationInfo):
    id: int
    reserver: Optional[str]
    contact: Optional[str]
    participants: Optional[str]
    description: Optional[str]
    notes: Optional[str]


class ReservationInfoResponse(BaseResponse):
    reservations: list[PublicReservationInfo | PrivateReservationInfo]


## ReservationTime ##


class BaseReservationTime(SQLModel):
    reservation_id: int = Field(
        default=None, index=True, foreign_key="dbreservation.id"
    )


class DBReservationTime(BaseReservationTime, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    active: bool = Field(default=True)


class CreateReservationTime(BaseReservationTime):
    timestamp: datetime


class UpdateReservationTime(BaseReservationTime):
    timestamp: datetime


class PublicReservationTime(BaseReservationTime):
    id: int
    timestamp: datetime


class ReservationTimeResponse(BaseResponse):
    times: list[PublicReservationTime]


## ReservationPlace ##


class BaseReservationResource(SQLModel):
    reservation_id: int = Field(
        default=None, index=True, foreign_key="dbreservation.id"
    )


class DBReservationResource(BaseReservationResource, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_id: int = Field(default=None, index=True, foreign_key="dbresource.id")
    active: bool = Field(default=True)


class CreateReservationResource(BaseReservationResource):
    resource_id: int


class UpdateReservationResource(BaseReservationResource):
    resource_id: int


class PublicReservationResource(BaseReservationResource):
    id: int
    resource_id: int


class ReservationResourceResponse(BaseResponse):
    resources: list[PublicReservationResource]
