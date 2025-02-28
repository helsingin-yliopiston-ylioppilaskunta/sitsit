from sqlmodel import SQLModel, Field
from typing import Optional


class BaseReservation(SQLModel):
    name: str = Field(default=None)


class DBReservation(BaseReservation, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="dbuser.id")
    org_id: Optional[int] = Field(default=None, foreign_key="dborg.id")
    description: Optional[str] = Field()
    active: bool = Field(default=True)


class CreateReservation(BaseReservation):
    user_id: int
    org_id: int
    contact_info: Optional[str]
    description: Optional[str]


class UpdateReservation(BaseReservation):
    user_id: int
    org_id: int
    contact_info: Optional[str]
    description: Optional[str]


class PublicReservation(BaseReservation):
    id: int
    user_id: int
    org_id: int
    contact_info: Optional[str]
    description: Optional[str]
