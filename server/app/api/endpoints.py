from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select

from app.db.session import SessionDep
from app.models.models import UserBase, User, PublicUser

router = APIRouter()


@router.get("/users/", response_model=list[PublicUser])
async def read_users(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[PublicUser]:
    query = select(UserBase).offset(offset).limit(limit)
    result = await session.execute(query)
    users = result.scalars().all()

    return users
