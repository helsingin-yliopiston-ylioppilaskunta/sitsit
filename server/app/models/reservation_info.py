from sqlmodel import SQLModel, Field
from typing import Optional


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
