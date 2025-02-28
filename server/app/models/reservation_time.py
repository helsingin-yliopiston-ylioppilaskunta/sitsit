from sqlmodel import SQLModel, Field
from typing import Optional

from datetime import datetime


class BaseReservationTime(SQLModel):
    reservation_id: int = Field(
        default=None, index=True, foreign_key="dbreservation.id"
    )


class DBReservationTime(BaseReservationTime):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    active: bool = Field(default=True)


class CreateReservationTime(BaseReservationTime):
    timestamp: datetime


class ModifyReservationTime(BaseReservationTime):
    timestamp: datetime


class PublicReservationTime(BaseReservationTime):
    id: int
    timestamp: int
