from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Query

from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.db.session import SessionDep

from app.models import CreateUser, DBUser, PublicUser, PublicUserWithOrg
from app.models import Response

# Response[PublicUserWithOrg].model_rebuild()

router = APIRouter(prefix="/users")


@router.get("/", response_model=Response[PublicUserWithOrg])
async def read_users(
    session: SessionDep,
    org: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> Response[PublicUserWithOrg]:
    query = select(DBUser).where(DBUser.active).options(selectinload(DBUser.org))

    if org:
        query = query.where(DBUser.org_id == org)

    query = query.offset(offset).limit(limit + 1)
    result = await session.execute(query)
    users: list[PublicUserWithOrg] = result.scalars().all()

    more_available = len(users) > limit

    response = Response(status=True, more_available=more_available, items=users)

    return response
    # return users


@router.post("/", response_model=Response[PublicUserWithOrg])
async def create_user(
    session: SessionDep, user: CreateUser
) -> Response[PublicUserWithOrg]:
    db_user = DBUser(username=user.username, hash=user.hash, org_id=user.org_id)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    print(db_user)

    public_user = PublicUser.from_orm(db_user)

    print(public_user)

    response = Response(status=True, more_available=False, items=[public_user])
    return response


outer = APIRouter()
