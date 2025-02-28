from sqlmodel import SQLModel, Field
from typing import Optional


class BaseReservationResource(SQLModel):
    reservation_id: int = Field(
        default=None, index=True, foreign_key="dbreservation.id"
    )


class DBReservationResource(BaseReservationResource):
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_id: int = Field(default=None, index=True, foreign_key="dbresource.id")
    active: bool = Field(default=True)


class CreateReservationResource(BaseReservationResource):
    resource_id: int


class ModifyReservationResource(BaseReservationResource):
    resource_id: int


class PublicReservationResource(BaseReservationResource):
    id: int
    resource_id: int
